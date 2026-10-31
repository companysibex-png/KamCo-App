/** Types mirroring the KamCo API (ASP.NET Core) contracts. */

export interface Category {
  id: number
  name: string
  description: string | null
  productCount: number
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stockQuantity: number
  imageUrl: string | null
  isActive: boolean
  categoryId: number
  categoryName: string | null
  createdAt: string
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface AuthResponse {
  id: number
  fullName: string
  email: string
  role: string
  token: string
  expiresAt: string
}

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: number
  status: 'Pending' | 'Paid' | 'Shipped' | 'Cancelled' | string
  totalAmount: number
  createdAt: string
  userId: number
  customerName: string | null
  items: OrderItem[]
}

export interface ProductQuery {
  search?: string
  categoryId?: number
  page?: number
  pageSize?: number
  sortBy?: 'price_asc' | 'price_desc' | 'name'
}
