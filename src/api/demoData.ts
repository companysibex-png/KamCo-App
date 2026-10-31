import type { Category, CategoryInput, Order, Product, ProductInput } from '../types'

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
let demoProductSeq = Math.max(...demoProducts.map((p) => p.id))
let demoCategorySeq = Math.max(...demoCategories.map((c) => c.id))

// Seed a few historical orders (from "other customers") so the admin dashboard
// has something meaningful to show in demo mode.
function seedOrders() {
  const mk = (
    id: number,
    status: Order['status'],
    daysAgo: number,
    customer: string,
    lines: { productId: number; quantity: number }[],
  ): Order => {
    const items = lines.map((l) => {
      const p = demoProducts.find((x) => x.id === l.productId)!
      return { productId: p.id, productName: p.name, quantity: l.quantity, unitPrice: p.price }
    })
    return {
      id,
      status,
      totalAmount: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      userId: 7,
      customerName: customer,
      items,
    }
  }
  demoOrders.push(
    mk(1001, 'Shipped', 6, 'Neda Ahmadi', [{ productId: 3, quantity: 1 }, { productId: 2, quantity: 2 }]),
    mk(1002, 'Paid', 3, 'Reza Karimi', [{ productId: 1, quantity: 1 }]),
    mk(1003, 'Pending', 1, 'Mina Sadeghi', [{ productId: 5, quantity: 2 }, { productId: 6, quantity: 1 }]),
  )
  demoOrderSeq = 1003
}
seedOrders()

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

  async login(email = ''): Promise<{ id: number; fullName: string; email: string; role: string; token: string; expiresAt: string }> {
    await wait(400)
    // In demo mode any credentials work. An email containing "admin" logs in
    // as an Admin so the admin panel can be tried without the real API.
    const isAdmin = email.toLowerCase().includes('admin')
    return {
      id: 42,
      fullName: isAdmin ? 'Demo Admin' : 'Demo User',
      email: email || 'demo@kamco.app',
      role: isAdmin ? 'Admin' : 'User',
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
    return demoOrders.filter((o) => o.userId === 42)
  },

  // ===== Admin operations (demo implementations) =====

  async allOrders(): Promise<Order[]> {
    await wait(350)
    return [...demoOrders].sort((a, b) => b.id - a.id)
  },

  async updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
    await wait(300)
    const order = demoOrders.find((o) => o.id === id)
    if (!order) throw new Error('Order not found')
    order.status = status
    return order
  },

  async createProduct(input: ProductInput): Promise<Product> {
    await wait(350)
    const category = demoCategories.find((c) => c.id === input.categoryId)
    const product: Product = {
      id: ++demoProductSeq,
      name: input.name,
      description: input.description,
      price: input.price,
      stockQuantity: input.stockQuantity,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
      categoryId: input.categoryId,
      categoryName: category?.name ?? null,
      createdAt: new Date().toISOString(),
    }
    demoProducts.unshift(product)
    if (category) category.productCount += 1
    return product
  },

  async updateProduct(id: number, input: ProductInput): Promise<Product> {
    await wait(350)
    const product = demoProducts.find((p) => p.id === id)
    if (!product) throw new Error('Product not found')
    const category = demoCategories.find((c) => c.id === input.categoryId)
    Object.assign(product, {
      name: input.name,
      description: input.description,
      price: input.price,
      stockQuantity: input.stockQuantity,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
      categoryId: input.categoryId,
      categoryName: category?.name ?? null,
    })
    return product
  },

  async deleteProduct(id: number): Promise<void> {
    await wait(300)
    const idx = demoProducts.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Product not found')
    const [removed] = demoProducts.splice(idx, 1)
    const category = demoCategories.find((c) => c.id === removed.categoryId)
    if (category && category.productCount > 0) category.productCount -= 1
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    await wait(300)
    const category: Category = { id: ++demoCategorySeq, name: input.name, description: input.description, productCount: 0 }
    demoCategories.push(category)
    return category
  },

  async updateCategory(id: number, input: CategoryInput): Promise<Category> {
    await wait(300)
    const category = demoCategories.find((c) => c.id === id)
    if (!category) throw new Error('Category not found')
    Object.assign(category, { name: input.name, description: input.description })
    return category
  },

  async deleteCategory(id: number): Promise<void> {
    await wait(300)
    const category = demoCategories.find((c) => c.id === id)
    if (!category) throw new Error('Category not found')
    if (category.productCount > 0) {
      throw new Error(`Category "${category.name}" still has ${category.productCount} product(s).`)
    }
    const idx = demoCategories.indexOf(category)
    demoCategories.splice(idx, 1)
  },
}
