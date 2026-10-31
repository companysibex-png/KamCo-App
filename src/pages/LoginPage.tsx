import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, demoState } from '../api/client'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { setPageSeo } from '../seo'

export function LoginPage() {
  const { t } = useI18n()
  const { login, user, logout } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/'

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPageSeo({ title: t('seo.loginTitle'), description: t('loginHint'), noindex: true })
  }, [t])

  if (user) {
    return (
      <main className="container page">
        <div className="state">
          <p>{t('welcome', { name: user.fullName })}</p>
          <p className="muted">{user.email} · {user.role}</p>
          <button className="btn btn-ghost" onClick={logout}>{t('nav.logout')}</button>
        </div>
      </main>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res =
        mode === 'login'
          ? await api.login(email.trim(), password)
          : await api.register(fullName.trim(), email.trim(), password)
      login(res)
      navigate(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container page page-narrow">
      <div className="tabs">
        <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
          {t('tabLogin')}
        </button>
        <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
          {t('tabRegister')}
        </button>
      </div>

      <h1 className="page-title">{mode === 'login' ? t('loginTitle') : t('registerTitle')}</h1>
      {demoState.active && <p className="muted">{t('loginHint')}</p>}

      <form className="form" onSubmit={(e) => void submit(e)}>
        {mode === 'register' && (
          <label className="field">
            <span>{t('fullName')}</span>
            <input className="input" required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
        )}
        <label className="field">
          <span>{t('email')}</span>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>{t('password')}</span>
          <input
            className="input"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? t('loading') : mode === 'login' ? t('loginBtn') : t('registerBtn')}
        </button>
      </form>
    </main>
  )
}
