import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../context/AuthContext'
import type { Category, CategoryInput } from '../../types'

const EMPTY_FORM: CategoryInput = { name: '', description: '' }

/** Category CRUD for admins: list with product counts + inline create/edit. */
export default function AdminCategories() {
  const { t } = useI18n()
  const { user } = useAuth()
  const token = user?.token ?? null

  const [categories, setCategories] = useState<Category[] | null>(null)
  const [error, setError] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CategoryInput>(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = () => {
    api
      .categories(token)
      .then(setCategories)
      .catch(() => setError(true))
  }

  useEffect(load, [token])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  const openEdit = (c: Category) => {
    setEditingId(c.id)
    setForm({ name: c.name, description: c.description ?? '' })
    setFormError(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    setFormError(null)
    try {
      const payload: CategoryInput = { name: form.name.trim(), description: (form.description ?? '').trim() || null }
      if (editingId === null) await api.createCategory(token, payload)
      else await api.updateCategory(token, editingId, payload)
      setEditingId(null)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('error'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (c: Category) => {
    if (!window.confirm(t('admin.deleteCategoryConfirm', { name: c.name }))) return
    try {
      await api.deleteCategory(token, c.id)
      load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t('error'))
    }
  }

  if (error) return <div className="state error-state">{t('error')}</div>

  return (
    <section>
      <form className="admin-form-panel" onSubmit={(e) => void submit(e)}>
        <h3>{editingId === null ? t('admin.addCategory') : t('admin.editCategory')}</h3>
        <div className="admin-form-row">
          <div className="field">
            <label htmlFor="ac-name">{t('admin.name')}</label>
            <input
              id="ac-name"
              className="input"
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field grow">
            <label htmlFor="ac-desc">{t('admin.description')}</label>
            <input
              id="ac-desc"
              className="input"
              maxLength={500}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        {formError && <p className="error-text">{formError}</p>}
        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {editingId === null ? `+ ${t('admin.addCategory')}` : t('admin.save')}
          </button>
          {editingId !== null && (
            <button className="btn btn-ghost" type="button" onClick={openCreate}>{t('admin.cancel')}</button>
          )}
        </div>
      </form>

      {!categories ? (
        <div className="state"><span className="spinner" /> {t('loading')}</div>
      ) : categories.length === 0 ? (
        <div className="state">{t('admin.empty')}</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.name')}</th>
                <th>{t('admin.description')}</th>
                <th>{t('admin.products')}</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="cell-name">{c.name}</td>
                  <td className="cell-muted">{c.description ?? '—'}</td>
                  <td>{c.productCount}</td>
                  <td className="cell-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>{t('admin.edit')}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => void remove(c)}>{t('admin.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
