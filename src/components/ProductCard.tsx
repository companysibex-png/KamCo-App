import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { useCart } from '../context/CartContext'
import { ProductImage } from './ProductImage'
import type { Product } from '../types'

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useI18n()
  const { add } = useCart()
  const out = product.stockQuantity <= 0

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <ProductImage product={product} />
        <div className="product-card-body">
          <span className="chip">{product.categoryName ?? t('category')}</span>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-desc">{product.description}</p>
        </div>
      </Link>
      <div className="product-card-footer">
        <span className="price">
          {product.price.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { style: 'currency', currency: 'USD' })}
        </span>
        <button className="btn btn-primary btn-sm" disabled={out} onClick={() => add({
          productId: product.id,
          name: product.name,
          price: product.price,
          stock: product.stockQuantity,
        })}>
          {out ? t('outOfStock') : t('addToCart')}
        </button>
      </div>
    </article>
  )
}
