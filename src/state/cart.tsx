import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  addLine,
  computeTotals,
  lineKey,
  priceLines,
  removeLine,
  sanitizeLines,
  setLineQty,
  type CartLine,
} from '../lib/cart'

const STORAGE_KEY = 'terradosol:sacola:v1'

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeLines(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

function save(lines: CartLine[]) {
  try {
    // somente dados não sensíveis: id do produto, variação e quantidade
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    /* armazenamento indisponível: a sacola segue funcionando nesta aba */
  }
}

export interface Notice {
  id: number
  productId: string
  message: string
}

interface CartContextValue {
  lines: CartLine[]
  priced: ReturnType<typeof priceLines>
  totals: ReturnType<typeof computeTotals>
  add: (line: CartLine) => { ok: boolean; error?: string; capped?: boolean }
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  notice: Notice | null
  lastRemoved: CartLine | null
  undoRemove: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [removed, setRemoved] = useState<{ line: CartLine; index: number } | null>(null)

  useEffect(() => save(lines), [lines])

  useEffect(() => {
    if (!removed) return
    const t = window.setTimeout(() => setRemoved(null), 8000)
    return () => window.clearTimeout(t)
  }, [removed])

  // mantém abas diferentes sincronizadas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback(
    (line: CartLine) => {
      const res = addLine(lines, line)
      if (!res.ok) return { ok: false, error: res.error }
      setLines(res.lines)
      setNotice({
        id: Date.now(),
        productId: line.productId,
        message: res.capped ? 'Quantidade ajustada ao limite por pedido.' : 'Adicionado à sacola.',
      })
      return { ok: true, capped: res.capped }
    },
    [lines],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      priced: priceLines(lines),
      totals: computeTotals(lines),
      add,
      setQty: (key, qty) => setLines((l) => setLineQty(l, key, qty)),
      remove: (key) => {
        const index = lines.findIndex((x) => lineKey(x) === key)
        if (index >= 0) setRemoved({ line: lines[index], index })
        setLines(removeLine(lines, key))
      },
      lastRemoved: removed?.line ?? null,
      undoRemove: () => {
        if (!removed) return
        setLines((l) => {
          const next = [...l]
          next.splice(Math.min(removed.index, next.length), 0, removed.line)
          return sanitizeLines(next)
        })
        setRemoved(null)
      },
      clear: () => setLines([]),
      drawerOpen,
      setDrawerOpen,
      notice,
    }),
    [lines, add, drawerOpen, notice, removed],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de CartProvider')
  return ctx
}
