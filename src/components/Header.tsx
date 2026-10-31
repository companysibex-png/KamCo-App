import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { Lang } from '../i18n/translations'

export function Header() {
  const { t, lang, setLang } = useI18n()
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const toggleLang = () => setLang((lang === 'fa' ? 'en' : 'fa') as Lang)

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-logo">K</span>
          <span className="brand-name">{t('appName')}</span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">{t('nav.products')}</Link>
          <Link to="/orders" className="nav-link">{t('nav.orders')}</Link>
          <Link to="/cart" className="nav-link cart-link">
            {t('nav.cart')}
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          {user?.role === 'Admin' && (
            <Link to="/admin" className="nav-link admin-link">{t('nav.admin')}</Link>
          )}
          {user ? (
            <button
              className="nav-link as-button"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              {t('welcome', { name: user.fullName.split(' ')[0] })} · {t('nav.logout')}
            </button>
          ) : (
            <Link to="/login" className="nav-link">{t('nav.login')}</Link>
          )}
          <button className="lang-toggle" onClick={toggleLang} aria-label="Switch language">
            {lang === 'fa' ? 'EN' : 'فا'}
          </button>
        </nav>
      </div>
    </header>
  )
}
