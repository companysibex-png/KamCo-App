import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations, type Dict, type Lang } from './translations'

interface I18nValue {
  lang: Lang
  dir: 'rtl' | 'ltr'
  t: (key: string, vars?: Record<string, string | number>) => string
  setLang: (lang: Lang) => void
  /** Localized status labels for order states. */
  status: (status: string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

const STORAGE_KEY = 'kamco_lang'

function resolve(dict: unknown, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], dict) as
    | string
    | undefined
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'en' || saved === 'fa' ? saved : 'fa'
  })

  const dir: 'rtl' | 'ltr' = lang === 'fa' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    // NOTE: <title> is owned by the per-route SEO helper (src/seo.ts) so each
    // page can set its own title/description.
  }, [lang, dir])

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict: Dict = translations[lang]
      let value = resolve(dict, key) ?? resolve(translations.en, key) ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) value = value.replace(`{${k}}`, String(v))
      }
      return value
    },
    [lang],
  )

  const status = useCallback(
    (s: string) => {
      const dict = translations[lang]
      const table = dict.status as Record<string, string>
      return table[s] ?? s
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, dir, t, setLang, status }), [lang, dir, t, setLang, status])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
