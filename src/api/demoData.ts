import type { Category, Order, Product } from '../types'

/**
 * Sample data mirroring the KamCo API seed (see the KamCo repository).
 * Used when the API is unreachable so the PWA still works — e.g. when hosted
 * on GitHub Pages without a backend.
 */

export const demoCategories: Category[] = [
  { id: 1, name: 'Electronics', description: 'Gadgets, accessories and devices', productCount: 3 },
  { id: 2, name: 'Books', description: 'Printed and digital books', productCount: 1 },
  { id: 3, name: 'Home & Kitchen', description: 'Everything for a smarter home', productCount: 2 },
]

export const demoProducts: Product[] = [
  {
    id: 1, name: 'Wireless Mechanical Keyboard',
    description: '87-key mechanical keyboard with hot-swappable switches, 2.4GHz + Bluetooth + USB-C.',
    price: 89.99, stockQuantity: 25, imageUrl: null, isActive: true, categoryId: 1,
    categoryName: 'Electronics', createdAt: '2026-10-31T10:00:00Z',
  },
  {
    id: 2, name: 'USB-C Fast Charger 65W',
    description: 'GaN fast charger with dual USB-C ports. Charges a laptop and a phone at once.',
    price: 34.5, stockQuantity: 120, imageUrl: null, isActive: true, categoryId: 1,
    categoryName: 'Electronics', createdAt: '2026-10-31T10:01:00Z',
  },
  {
    id: 3, name: 'Noise Cancelling Headphones',
    description: 'Over-ear Bluetooth headphones with 40h battery life and active noise cancelling.',
    price: 149.0, stockQuantity: 40, imageUrl: null, isActive: true, categoryId: 1,
    categoryName: 'Electronics', createdAt: '2026-10-31T10:02:00Z',
  },
  {
    id: 4, name: 'Clean Code - Robert C. Martin',
    description: 'A handbook of agile software craftsmanship. Classic must-read for developers.',
    price: 32.99, stockQuantity: 60, imageUrl: null, isActive: true, categoryId: 2,
    categoryName: 'Books', createdAt: '2026-10-31T10:03:00Z',
  },
  {
    id: 5, name: 'Smart LED Desk Lamp',
    description: 'App-controlled LED lamp, 5 color temperatures, USB charging port on the base.',
    price: 27.9, stockQuantity: 80, imageUrl: null, isActive: true, categoryId: 3,
    categoryName: 'Home & Kitchen', createdAt: '2026-10-31T10:04:00Z',
  },
  {
    id: 6, name: 'Stainless Steel Water Bottle 1L',
    description: 'Double-wall vacuum insulated bottle. Keeps drinks cold 24h / hot 12h.',
    price: 19.95, stockQuantity: 200, imageUrl: null, isActive: true, categoryId: 3,
    categoryName: 'Home & Kitchen', createdAt: '2026-10-31T10:05:00Z',
  },
]

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** In-memory demo state so demo orders also behave realistically. */
const demoOrders: Order[] = []
let demoOrderSeq = 1000

export const demo = {
  async categories(): Promise<Category[]> {
    await wait(250)
    return demoCategories
  },

  async products(params: {
    search?: string
    categoryId?: number
    page?: number
    pageSize?: number
    sortBy?: string
  }) {
    await wait(300)
    let items = [...demoProducts]
    if (params.search) {
      const s = params.search.toLowerCase()
      items = items.filter(
        (p) => p.name.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s),
      )
    }
    if (params.categoryId) items = items.filter((p) => p.categoryId === params.categoryId)
    switch (params.sortBy) {
      case 'price_asc': items.sort((a, b) => a.price - b.price); break
      case 'price_desc': items.sort((a, b) => b.price - a.price); break
      case 'name': items.sort((a, b) => a.name.localeCompare(b.name)); break
      default: items.sort((a, b) => b.id - a.id)
    }
    const page = Math.max(params.page ?? 1, 1)
    const pageSize = params.pageSize ?? 8
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalCount: items.length,
      totalPages: Math.max(Math.ceil(items.length / pageSize), 1),
    }
  },

  async product(id: number): Promise<Product | null> {
    await wait(200)
    return demoProducts.find((p) => p.id === id) ?? null
  },

  async login(): Promise<{ id: number; fullName: string; email: string; role: string; token: string; expiresAt: string }> {
    await wait(400)
    return {
      id: 42,
      fullName: 'Demo User',
      email: 'demo@kamco.app',
      role: 'User',
      token: 'demo-token',
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    }
  },

  async register(fullName: string, email: string) {
    await wait(400)
    return {
      id: 43,
      fullName,
      email,
      role: 'User',
      token: 'demo-token',
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    }
  },

  async createOrder(items: { productId: number; quantity: number }[], customerName: string): Promise<Order> {
    await wait(500)
    const lines = items.map((i) => {
      const p = demoProducts.find((x) => x.id === i.productId)!
      return { productId: p.id, productName: p.name, quantity: i.quantity, unitPrice: p.price }
    })
    const order: Order = {
      id: ++demoOrderSeq,
      status: 'Pending',
      totalAmount: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
      createdAt: new Date().toISOString(),
      userId: 42,
      customerName,
      items: lines,
    }
    demoOrders.unshift(order)
    return order
  },

  async myOrders(): Promise<Order[]> {
    await wait(350)
    return demoOrders
  },
}
