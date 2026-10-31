import { useEffect, useState } from 'react'
import { demoState } from '../api/client'
import { useI18n } from '../i18n/I18nContext'

/** Shows a strip when the app is running on sample data (API unreachable). */
export function DemoBanner() {
  const { t } = useI18n()
  const [active, setActive] = useState(demoState.active)

  useEffect(() => demoState.subscribe(setActive), [])

  if (!active) return null
  return <div className="demo-banner">{t('demoBanner')}</div>
}
