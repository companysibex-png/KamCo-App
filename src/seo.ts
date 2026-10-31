/**
 * Lightweight per-route SEO helper.
 *
 * Chat/social scrapers only read the static tags in index.html, but Googlebot
 * renders JavaScript — so updating <title>, meta description, robots and the
 * page-level JSON-LD per route improves how each screen appears in search
 * results and in browser history / bookmarks.
 */

const SITE_NAME = 'KamCo Store'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setPageJsonLd(data: object | null) {
  const ID = 'ld-page'
  let script = document.getElementById(ID) as HTMLScriptElement | null
  if (!data) {
    script?.remove()
    return
  }
  if (!script) {
    script = document.createElement('script')
    script.id = ID
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

export interface PageSeo {
  title: string
  description: string
  /** Utility pages (cart, login, orders) should stay out of search indexes. */
  noindex?: boolean
  /** Extra JSON-LD node rendered for this route (e.g. a Product). */
  jsonLd?: object
}

export function setPageSeo({ title, description, noindex = false, jsonLd }: PageSeo) {
  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  setPageJsonLd(jsonLd ?? null)
}

/** Product page JSON-LD (schema.org/Product with an offer). */
export function productJsonLd(opts: {
  name: string
  description: string
  price: number
  inStock: boolean
  category?: string | null
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    ...(opts.category ? { category: opts.category } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      price: opts.price.toFixed(2),
      priceCurrency: 'USD',
      availability: `https://schema.org/${opts.inStock ? 'InStock' : 'OutOfStock'}`,
      url: opts.url,
    },
  }
}
