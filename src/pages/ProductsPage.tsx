import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../context/AuthContext'
import { ProductCard } from '../components/ProductCard'
import type { Category, PagedResult, Product } from '../types'

export function ProductsPage() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const token = user?.token ?? null

  const [categories, setCategories] = useState<Category[]>([])
  const [result, setResult] = useState<PagedResult<Product> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<string>()
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [cats, prods] = await Promise.all([
        api.categories(token),
        api.products(token, { search: search || undefined, categoryId, sortBy: sortBy as never, page, pageSize: 8 }),
      ])
      setCategories(cats)
      setResult(prods)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [token, search, categoryId, sortBy, page])

  useEffect(() => {
    void load()
  }, [load])

  const fmt = (n: number) => n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')

  return (
    <main className="container page">
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault()
          setPage(1)
          void load()
        }}
      >
        <input
          className="input search"
          type="search"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input select"
          value={sortBy ?? ''}
          onChange={(e) => {
            setSortBy(e.target.value || undefined)
            setPage(1)
          }}
        >
          <option value="">{t('sortDefault')}</option>
          <option value="price_asc">{t('sortPriceAsc')}</option>
          <option value="price_desc">{t('sortPriceDesc')}</option>
          <option value="name">{t('sortName')}</option>
        </select>
        <button className="btn btn-primary" type="submit">{t('searchBtn')}</button>
      </form>

      <div className="chips-row">
        <button
          className={`chip selectable ${categoryId === undefined ? 'active' : ''}`}
          onClick={() => {
            setCategoryId(undefined)
            setPage(1)
          }}
        >
          {t('allCategories')}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip selectable ${categoryId === c.id ? 'active' : ''}`}
            onClick={() => {
              setCategoryId(c.id)
              setPage(1)
            }}
          >
            {c.name} ({fmt(c.productCount)})
          </button>
        ))}
      </div>

      {loading && <div className="state"><span className="spinner" /> {t('loading')}</div>}

      {!loading && error && <div className="state error-state">{t('error')}</div>}

      {!loading && !error && result && (
        <>
          <p className="count-line">{t('productsCount', { n: fmt(result.totalCount) })}</p>
          {result.items.length === 0 ? (
            <div className="state">{t('emptyProducts')}</div>
          ) : (
            <div className="grid">
              {result.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ‹
              </button>
              <span className="page-info">
                {fmt(page)} / {fmt(result.totalPages)}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page >= result.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
