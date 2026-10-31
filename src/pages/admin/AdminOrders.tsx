import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../context/AuthContext'
import type { Order } from '../../types'

const STATUSES = ['Pending', 'Paid', 'Shipped', 'Cancelled'] as const

/** All customer orders for admins, with inline status changes (PATCH /orders/{id}/status). */
export default function AdminOrders() {
  const { t, lang, status } = useI18n()
  const { user } = useAuth()
  const token = user?.token ?? null

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)

  const load = () => {
    api
      .allOrders(token)
      .then(setOrders)
      .catch(() => setError(true))
  }

  useEffect(load, [token])

  const changeStatus = async (id: number, next: string) => {
    setSavingId(id)
    try {
      const updated = await api.updateOrderStatus(token, id, next)
      setOrders((prev) => prev?.map((o) => (o.id === id ? updated : o)) ?? prev)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t('error'))
    } finally {
      setSavingId(null)
    }
  }

  const fmtMoney = (n: number) =>
    n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { style: 'currency', currency: 'USD' })

  if (error) return <div className="state error-state">{t('error')}</div>

  return (
    <section>
      {!orders ? (
        <div className="state"><span className="spinner" /> {t('loading')}</div>
      ) : orders.length === 0 ? (
        <div className="state">{t('admin.noOrders')}</div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <article key={o.id} className="order-card admin-order-card">
              <div className="order-head">
                <span className="order-id">#{o.id.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
                <span className={`status-badge st-${o.status.toLowerCase()}`}>{status(o.status)}</span>
                <span className="muted">
                  {new Date(o.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                </span>
                <span className="order-total">{fmtMoney(o.totalAmount)}</span>
              </div>
              <div className="order-items">
                {o.items.map((i) => (
                  <div key={i.productId} className="muted">
                    {i.productName} × {i.quantity.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                  </div>
                ))}
              </div>
              <div className="admin-order-footer">
                <span className="muted">{t('admin.customer')}: {o.customerName ?? '—'}</span>
                <label className="admin-status-select">
                  <span className="muted">{t('admin.changeStatus')}:</span>
                  <select
                    className="input select"
                    value={o.status}
                    disabled={savingId === o.id}
                    onChange={(e) => void changeStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{status(s)}</option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
