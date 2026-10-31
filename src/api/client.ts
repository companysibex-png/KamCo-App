import type {
  AuthResponse,
  Category,
  CategoryInput,
  Order,
  PagedResult,
  Product,
  ProductInput,
  ProductQuery,
} from '../types'
import { demo } from './demoData'

/**
 * API client for the KamCo ASP.NET Core backend.
 *
 * If the API is unreachable, the client transparently falls back to Demo Mode:
 * every call resolves with sample data and `demoState.active` flips to true,
 * which the UI shows as a banner.
 */

const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000'
const REQUEST_TIMEOUT_MS = 4000

/** Tiny pub/sub so React components can react to demo-mode activation. */
export const demoState = {
  active: false,
  listeners: new Set<(active: boolean) => void>(),
  set(active: boolean) {
    if (this.active !== active) {
      this.active = active
      this.listeners.forEach((fn) => fn(active))
    }
  },
  subscribe(fn: (active: boolean) => void) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  },
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })

    if (!res.ok) {
      let detail = res.statusText
      try {
        const body = await res.json()
        detail = body.detail ?? body.title ?? detail
      } catch {
        /* ignore body parse errors */
      }
      throw new ApiError(detail, res.status)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  } catch (err) {
    // Network failure / timeout → switch to demo mode for the whole session.
    if (err instanceof ApiError) throw err
    demoState.set(true)
    throw err
  } finally {
    clearTimeout(timer)
  }
}

function authHeaders(token: string | null): Record<string, string> {
  return token && token !== 'demo-token' ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  async categories(token: string | null): Promise<Category[]> {
    try {
      return await request<Category[]>('/api/categories', { headers: authHeaders(token) })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.categories()
    }
  },

  async products(token: string | null, query: ProductQuery): Promise<PagedResult<Product>> {
    const qs = new URLSearchParams()
    if (query.search) qs.set('search', query.search)
    if (query.categoryId) qs.set('categoryId', String(query.categoryId))
    if (query.page) qs.set('page', String(query.page))
    if (query.pageSize) qs.set('pageSize', String(query.pageSize))
    if (query.sortBy) qs.set('sortBy', query.sortBy)

    try {
      return await request<PagedResult<Product>>(`/api/products?${qs}`, { headers: authHeaders(token) })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.products(query)
    }
  },

  async product(token: string | null, id: number): Promise<Product> {
    try {
      return await request<Product>(`/api/products/${id}`, { headers: authHeaders(token) })
    } catch (err) {
      if (err instanceof ApiError) throw err
      const p = await demo.product(id)
      if (!p) throw new ApiError('Not found', 404)
      return p
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      return await request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.login(email)
    }
  },

  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    try {
      return await request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.register(fullName, email)
    }
  },

  async createOrder(token: string | null, customerName: string, items: { productId: number; quantity: number }[]): Promise<Order> {
    try {
      return await request<Order>('/api/orders', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ items }),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.createOrder(items, customerName)
    }
  },

  async myOrders(token: string | null): Promise<Order[]> {
    try {
      return await request<Order[]>('/api/orders/my', { headers: authHeaders(token) })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.myOrders()
    }
  },

  // ===== Admin endpoints (Admin role required by the API) =====

  async allOrders(token: string | null): Promise<Order[]> {
    try {
      return await request<Order[]>('/api/orders', { headers: authHeaders(token) })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.allOrders()
    }
  },

  async updateOrderStatus(token: string | null, id: number, status: string): Promise<Order> {
    try {
      return await request<Order>(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.updateOrderStatus(id, status)
    }
  },

  async createProduct(token: string | null, input: ProductInput): Promise<Product> {
    try {
      return await request<Product>('/api/products', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(input),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.createProduct(input)
    }
  },

  async updateProduct(token: string | null, id: number, input: ProductInput): Promise<Product> {
    try {
      return await request<Product>(`/api/products/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(input),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.updateProduct(id, input)
    }
  },

  async deleteProduct(token: string | null, id: number): Promise<void> {
    try {
      await request<void>(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders(token) })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.deleteProduct(id)
    }
  },

  async createCategory(token: string | null, input: CategoryInput): Promise<Category> {
    try {
      return await request<Category>('/api/categories', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(input),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.createCategory(input)
    }
  },

  async updateCategory(token: string | null, id: number, input: CategoryInput): Promise<Category> {
    try {
      return await request<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(input),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.updateCategory(id, input)
    }
  },

  async deleteCategory(token: string | null, id: number): Promise<void> {
    try {
      await request<void>(`/api/categories/${id}`, { method: 'DELETE', headers: authHeaders(token) })
    } catch (err) {
      if (err instanceof ApiError) throw err
      return demo.deleteCategory(id)
    }
  },
}
