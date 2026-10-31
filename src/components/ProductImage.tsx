import { useI18n } from '../i18n/I18nContext'
import type { Product } from '../types'

const palettes = [
  ['#ccfbf1', '#14b8a6'],
  ['#dbeafe', '#3b82f6'],
  ['#fef3c7', '#f59e0b'],
  ['#fce7f3', '#ec4899'],
  ['#ede9fe', '#8b5cf6'],
  ['#dcfce7', '#22c55e'],
]

/**
 * Self-contained SVG product artwork: a soft gradient tile with the product
 * initial. Keeps the app fully offline-capable (no external image hosts).
 */
export function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const { lang } = useI18n()
  const [from, to] = palettes[product.id % palettes.length]
  const initial = product.name.trim().charAt(0).toUpperCase()

  return (
    <div className={`product-image ${large ? 'large' : ''}`} role="img" aria-label={product.name}>
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`g${product.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill={`url(#g${product.id})`} rx="28" />
        <circle cx="160" cy="44" r="26" fill="#ffffff" opacity="0.25" />
        <circle cx="36" cy="160" r="40" fill="#ffffff" opacity="0.18" />
        <text
          x="100"
          y="100"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="72"
          fontWeight="700"
          fill="#ffffff"
          fontFamily={lang === 'fa' ? 'Vazirmatn, sans-serif' : 'system-ui, sans-serif'}
        >
          {initial}
        </text>
      </svg>
    </div>
  )
}
