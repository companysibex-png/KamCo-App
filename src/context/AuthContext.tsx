import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse } from '../types'

interface AuthUser {
  id: number
  fullName: string
  email: string
  role: string
  token: string
  expiresAt: string
}

interface AuthValue {
  user: AuthUser | null
  login: (res: AuthResponse) => void
  logout: () => void
}

const STORAGE_KEY = 'kamco_auth'
const AuthContext = createContext<AuthValue | null>(null)

function load(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const user = JSON.parse(raw) as AuthUser
    if (new Date(user.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return user
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(load)

  const login = useCallback((res: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res))
    setUser(res)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
