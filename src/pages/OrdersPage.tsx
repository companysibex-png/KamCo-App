import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../context/AuthContext'
import { setPageSeo } from '../seo'
import type { Order } from '../types'

const statusClass: Record<string, string> = {
  Pending: 'st-pending',
  Paid: 'st-paid',
  Shipped: 'st-shipped',
  Cancelled: 'st-cancelled',
}

export function OrdersPage() {
  const { t, lang, status } = useI18n()
  const { user } = useAuth()
  const token = user?.token ?? null

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setPageSeo({ title: t('seo.ordersTitle'), description: t('ordersEmpty'), noindex: true })
  }, [t])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    api
      .myOrders(token)
      .then((o) => {
        if (!cancelled) setOrders(o)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (!user) {
    return (
      <main className="container page">
        <div className="state">
          <p>{t('needLogin')}</p>
          <Link to="/login?next=/orders" className="btn btn-primary">{t('nav.login')}</Link>
        </div>
      </main>
    )
  }

  const fmt = (n: number) =>
    n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { style: 'currency', currency: 'USD' })
  const fmtDate = (s: string) => new Date(s).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')

  return (
    <main className="container page">
      <h1 className="page-title">{t('ordersTitle')}</h1>

      {!orders && !error && <div className="state"><span className="spinner" /> {t('loading')}</div>}
      {error && <div className="state error-state">{t('error')}</div>}

      {orders && orders.length === 0 && <div className="state">{t('ordersEmpty')}</div>}

      {orders && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((o) => (
            <article key={o.id} className="order-card">
              <div className="order-head">
                <span className="order-id">#{o.id.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
                <span className={`status-badge ${statusClass[o.status] ?? ''}`}>{status(o.status)}</span>
                <span className="muted">{fmtDate(o.createdAt)}</span>
              </div>
              <ul className="order-items">
                {o.items.map((i) => (
                  <li key={i.productId}>
                    {i.productName} × {i.quantity.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                  </li>
                ))}
              </ul>
              <div className="order-total">{fmt(o.totalAmount)}</div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
