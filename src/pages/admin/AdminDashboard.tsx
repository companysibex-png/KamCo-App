import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../context/AuthContext'
import type { Category, Order } from '../../types'

/**
 * Admin dashboard: headline stats + the latest orders.
 * All figures come from the same endpoints the storefront uses, so demo mode
 * works identically.
 */
export default function AdminDashboard() {
  const { t, lang, status } = useI18n()
  const { user } = useAuth()
  const token = user?.token ?? null

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [productCount, setProductCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.allOrders(token),
      api.products(token, { page: 1, pageSize: 200 }),
      api.categories(token),
    ])
      .then(([all, products, cats]) => {
        if (cancelled) return
        setOrders(all)
        setProductCount(products.totalCount)
        setActiveCount(products.items.filter((p) => p.isActive).length)
        setCategories(cats)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const fmtMoney = (n: number) =>
    n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { style: 'currency', currency: 'USD' })
  const fmtNum = (n: number) => n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')

  if (error) return <div className="state error-state">{t('error')}</div>

  const revenue = orders?.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.totalAmount, 0) ?? 0
  const pending = orders?.filter((o) => o.status === 'Pending').length ?? 0
  const recent = orders?.slice(0, 5) ?? []

  return (
    <section>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{fmtNum(productCount)}</span>
          <span className="stat-label">{t('admin.statProducts')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{fmtNum(activeCount)}</span>
          <span className="stat-label">{t('admin.statActive')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{fmtNum(orders?.length ?? 0)}</span>
          <span className="stat-label">{t('admin.statOrders')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{fmtMoney(revenue)}</span>
          <span className="stat-label">{t('admin.statRevenue')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{fmtNum(pending)}</span>
          <span className="stat-label">{t('admin.statPending')}</span>
        </div>
      </div>

      <h2 className="admin-section-title">{t('admin.recentOrders')}</h2>
      {!orders ? (
        <div className="state"><span className="spinner" /> {t('loading')}</div>
      ) : recent.length === 0 ? (
        <div className="state">{t('admin.noOrders')}</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('admin.customer')}</th>
                <th>{t('admin.date')}</th>
                <th>{t('admin.total')}</th>
                <th>{t('status.Pending')}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>{fmtNum(o.id)}</td>
                  <td>{o.customerName ?? '—'}</td>
                  <td>
                    {new Date(o.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                  </td>
                  <td>{fmtMoney(o.totalAmount)}</td>
                  <td><span className={`status-badge st-${o.status.toLowerCase()}`}>{status(o.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="muted admin-hint">
        {t('admin.categories')}: {categories.map((c) => c.name).join(' · ')} —{' '}
        <Link to="/admin/categories" className="admin-inline-link">{t('admin.edit')}</Link>
      </p>
    </section>
  )
}
