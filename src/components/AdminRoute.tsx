import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n/I18nContext'

/**
 * Route guard for the admin panel: unauthenticated visitors go to the login
 * page (with ?next=/admin so they land back here), non-admin users get a
 * clear "forbidden" message. The real security boundary is always the API
 * (its [Authorize(Roles = "Admin")] attributes) — this guard is UX only.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { t } = useI18n()

  if (!user) return <Navigate to="/login?next=/admin" replace />
  if (user.role !== 'Admin') {
    return <main className="container page state">{t('admin.forbidden')}</main>
  }
  return <>{children}</>
}
