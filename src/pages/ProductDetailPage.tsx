import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useI18n } from '../i18n/I18nContext'
import { useCart } from '../context/CartContext'
import { setPageSeo, productJsonLd } from '../seo'
import { ProductImage } from '../components/ProductImage'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { id } = useParams()
  const { t, lang } = useI18n()
  const { add } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .product(null, Number(id))
      .then((p) => {
        if (!cancelled) setProduct(p)
      })
      .catch(() => {
        if (!cancelled) setProduct(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Keep title/description/Product JSON-LD in sync with the loaded product.
  // (Declared before any early return — Rules of Hooks.)
  useEffect(() => {
    if (!product) return
    const { name, description, price, stockQuantity, categoryName, id } = product
    setPageSeo({
      title: `${name} | ${t('appName')}`,
      description: (description ?? name).slice(0, 160),
      jsonLd: productJsonLd({
        name,
        description: description ?? name,
        price,
        inStock: stockQuantity > 0,
        category: categoryName,
        url: `https://companysibex-png.github.io/KamCo-App/#/product/${id}`,
      }),
    })
  }, [product, t])

  if (loading) return <main className="container page state"><span className="spinner" /> {t('loading')}</main>
  if (!product) return <main className="container page state">{t('emptyProducts')}</main>

  const out = product.stockQuantity <= 0
  const fmtPrice = (n: number) =>
    n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { style: 'currency', currency: 'USD' })

  return (
    <main className="container page">
      <Link to="/" className="back-link">‹ {t('backToProducts')}</Link>

      <div className="detail">
        <ProductImage product={product} large />

        <div className="detail-body">
          <span className="chip">{product.categoryName ?? t('category')}</span>
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-price">{fmtPrice(product.price)}</p>
          <p className={`stock ${out ? 'stock-out' : ''}`}>
            {out ? t('outOfStock') : t('stockLeft', { n: product.stockQuantity.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US') })}
          </p>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-actions">
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-">−</button>
              <span>{qty.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
              <button onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))} aria-label="+">+</button>
            </div>
            <button
              className="btn btn-primary"
              disabled={out}
              onClick={() =>
                add({ productId: product.id, name: product.name, price: product.price, stock: product.stockQuantity }, qty)
              }
            >
              {t('addToCart')}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
