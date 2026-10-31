import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface CartLine {
  productId: number
  name: string
  price: number
  stock: number
  qty: number
}

interface CartValue {
  lines: CartLine[]
  count: number
  total: number
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void
  setQty: (productId: number, qty: number) => void
  remove: (productId: number) => void
  clear: () => void
}

const STORAGE_KEY = 'kamco_cart'
const CartContext = createContext<CartValue | null>(null)

function load(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartLine[]
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const add = useCallback((line: Omit<CartLine, 'qty'>, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === line.productId)
      if (existing) {
        return prev.map((l) =>
          l.productId === line.productId
            ? { ...l, qty: Math.min(l.qty + qty, l.stock) }
            : l,
        )
      }
      return [...prev, { ...line, qty: Math.min(qty, Math.max(line.stock, 1)) }]
    })
  }, [])

  const setQty = useCallback((productId: number, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, qty: Math.min(qty, l.stock) } : l)),
    )
  }, [])

  const remove = useCallback((productId: number) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: lines.reduce((s, l) => s + l.qty * l.price, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, add, setQty, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
