import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../context/AuthContext'
import { demoState } from '../../api/client'
import { setPageSeo } from '../../seo'

/**
 * Shared shell for the admin panel: title, sub-navigation and a demo note.
 * Rendered inside <AdminRoute> so it only ever mounts for Admin users.
 */
export default function AdminLayout() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const isDemo = demoState.active

  useEffect(() => {
    setPageSeo({ title: `${t('admin.title')} | ${t('appName')}`, description: t('admin.forbidden'), noindex: true })
  }, [t])

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <main className="container page">
      <div className="admin-head">
        <h1 className="page-title">{t('admin.title')}</h1>
        <p className="muted">
          {user?.email} · {fmtDate(new Date().toISOString())}
        </p>
        {isDemo && <p className="admin-demo-note">{t('admin.demoNote')}</p>}
      </div>

      <nav className="admin-nav">
        <NavLink to="/admin" end className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
          {t('admin.dashboard')}
        </NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
          {t('admin.products')}
        </NavLink>
        <NavLink to="/admin/categories" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
          {t('admin.categories')}
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
          {t('admin.orders')}
        </NavLink>
      </nav>

      <Outlet />
    </main>
  )
}
