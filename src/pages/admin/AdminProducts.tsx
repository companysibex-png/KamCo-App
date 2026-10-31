import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../context/AuthContext'
import type { Category, Product, ProductInput } from '../../types'

const EMPTY_FORM: ProductInput = {
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  imageUrl: null,
  isActive: true,
  categoryId: 0,
}

/** Product CRUD for admins: searchable list + inline create/edit form. */
export default function AdminProducts() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const token = user?.token ?? null

  const [products, setProducts] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = () => {
    Promise.all([
      api.products(token, { page: 1, pageSize: 200 }),
      api.categories(token),
    ])
      .then(([prods, cats]) => {
        setProducts(prods.items)
        setCategories(cats)
      })
      .catch(() => setError(true))
  }

  useEffect(load, [token])

  const fmtMoney = (n: number) =>
    n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { style: 'currency', currency: 'USD' })
  const fmtNum = (n: number) => n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? 0 })
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      stockQuantity: p.stockQuantity,
      imageUrl: p.imageUrl,
      isActive: p.isActive,
      categoryId: p.categoryId,
    })
    setFormError(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setFormError(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || form.price <= 0 || !form.categoryId) {
      setFormError(t('error'))
      return
    }
    setBusy(true)
    setFormError(null)
    try {
      const payload: ProductInput = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() ? form.description.trim() : null,
        imageUrl: form.imageUrl?.trim() ? form.imageUrl.trim() : null,
      }
      if (editingId === null) await api.createProduct(token, payload)
      else await api.updateProduct(token, editingId, payload)
      closeForm()
      load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('error'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (p: Product) => {
    if (!window.confirm(t('admin.deleteProductConfirm', { name: p.name }))) return
    try {
      await api.deleteProduct(token, p.id)
      load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t('error'))
    }
  }

  const visible = products?.filter((p) =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true,
  )

  if (error) return <div className="state error-state">{t('error')}</div>

  return (
    <section>
      <div className="admin-toolbar">
        <input
          className="input search"
          type="search"
          placeholder={t('admin.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={openCreate}>+ {t('admin.addProduct')}</button>
      </div>

      {formOpen && (
        <form className="admin-form-panel" onSubmit={(e) => void submit(e)}>
          <h3>{editingId === null ? t('admin.addProduct') : t('admin.editProduct')}</h3>
          <div className="field">
            <label htmlFor="ap-name">{t('admin.name')}</label>
            <input
              id="ap-name"
              className="input"
              required
              maxLength={200}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="ap-desc">{t('admin.description')}</label>
            <textarea
              id="ap-desc"
              className="input"
              rows={3}
              maxLength={2000}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="admin-form-row">
            <div className="field">
              <label htmlFor="ap-price">{t('admin.price')}</label>
              <input
                id="ap-price"
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label htmlFor="ap-stock">{t('admin.stock')}</label>
              <input
                id="ap-stock"
                className="input"
                type="number"
                min="0"
                step="1"
                required
                value={form.stockQuantity || ''}
                onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label htmlFor="ap-cat">{t('admin.category')}</label>
              <select
                id="ap-cat"
                className="input select"
                required
                value={form.categoryId || ''}
                onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="ap-img">{t('admin.imageUrl')}</label>
            <input
              id="ap-img"
              className="input"
              type="url"
              value={form.imageUrl ?? ''}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            {t('admin.active')}
          </label>
          {formError && <p className="error-text">{formError}</p>}
          <div className="admin-form-actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>{t('admin.save')}</button>
            <button className="btn btn-ghost" type="button" onClick={closeForm}>{t('admin.cancel')}</button>
          </div>
        </form>
      )}

      {!products ? (
        <div className="state"><span className="spinner" /> {t('loading')}</div>
      ) : !visible || visible.length === 0 ? (
        <div className="state">{t('admin.empty')}</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.name')}</th>
                <th>{t('admin.category')}</th>
                <th>{t('admin.price')}</th>
                <th>{t('admin.stock')}</th>
                <th>{t('admin.active')}</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className={p.isActive ? '' : 'row-inactive'}>
                  <td className="cell-name">{p.name}</td>
                  <td>{p.categoryName ?? '—'}</td>
                  <td>{fmtMoney(p.price)}</td>
                  <td>{fmtNum(p.stockQuantity)}</td>
                  <td>{p.isActive ? '✓' : '—'}</td>
                  <td className="cell-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>{t('admin.edit')}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => void remove(p)}>{t('admin.delete')}</button>
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
