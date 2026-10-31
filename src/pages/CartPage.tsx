import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { api } from '../api/client'
import { demoState } from '../api/client'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { setPageSeo } from '../seo'

export function CartPage() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const { lines, total, setQty, remove, clear } = useCart()
  const navigate = useNavigate()

  const [placing, setPlacing] = useState(false)
  const [placedId, setPlacedId] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setPageSeo({ title: t('seo.cartTitle'), description: t('cartEmpty'), noindex: true })
  }, [t])

  const fmt = (n: number) =>
    n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { style: 'currency', currency: 'USD' })

  const checkout = async () => {
    if (!user) {
      navigate('/login?next=/cart')
      return
    }
    setPlacing(true)
    setError(false)
    try {
      const order = await api.createOrder(
        user.token,
        user.fullName,
        lines.map((l) => ({ productId: l.productId, quantity: l.qty })),
      )
      setPlacedId(order.id)
      clear()
    } catch {
      setError(true)
    } finally {
      setPlacing(false)
    }
  }

  if (placedId !== null) {
    return (
      <main className="container page">
        <div className="state success">
          <div className="success-icon">✓</div>
          <p>{t('orderSuccess')}</p>
          <p className="muted">{t('orderNumber')}: #{placedId.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</p>
          <Link className="btn btn-primary" to="/orders">{t('nav.orders')}</Link>
        </div>
      </main>
    )
  }

  if (lines.length === 0) {
    return (
      <main className="container page">
        <h1 className="page-title">{t('cartTitle')}</h1>
        <div className="state">
          <p>{t('cartEmpty')}</p>
          <Link to="/" className="btn btn-primary">{t('continueShopping')}</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container page">
      <h1 className="page-title">{t('cartTitle')}</h1>
      {demoState.active && <p className="muted">{t('demoCheckoutNote')}</p>}

      <div className="cart-list">
        {lines.map((l) => (
          <div key={l.productId} className="cart-line">
            <div className="cart-line-info">
              <Link to={`/product/${l.productId}`} className="cart-line-name">{l.name}</Link>
              <span className="muted">{fmt(l.price)}</span>
            </div>
            <div className="qty-stepper">
              <button onClick={() => setQty(l.productId, l.qty - 1)} aria-label="-">−</button>
              <span>{l.qty.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
              <button onClick={() => setQty(l.productId, Math.min(l.stock, l.qty + 1))} aria-label="+">+</button>
            </div>
            <span className="cart-line-total">{fmt(l.price * l.qty)}</span>
            <button className="icon-btn" onClick={() => remove(l.productId)} aria-label={t('remove')}>✕</button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <span>{t('total')}</span>
        <strong className="cart-total">{fmt(total)}</strong>
      </div>

      {error && <p className="error-text">{t('error')}</p>}

      <button className="btn btn-primary btn-block" onClick={() => void checkout()} disabled={placing}>
        {placing ? t('loading') : t('checkout')}
      </button>
    </main>
  )
}
