/**
 * Regras da sacola — funções puras, sem dependência de React.
 * Todos os valores são calculados a partir do catálogo, nunca a partir
 * do que foi salvo no navegador.
 */
import { getProductById, type Product } from '../data/products'

export interface CartLine {
  productId: string
  size: string
  color: string
  qty: number
}

export interface PricedLine extends CartLine {
  key: string
  product: Product
  unitPrice: number
  lineTotal: number
}

export const MIN_QTY = 1

export function lineKey(l: Pick<CartLine, 'productId' | 'size' | 'color'>) {
  return `${l.productId}|${l.size}|${l.color}`
}

export function clampQty(qty: number, product: Product): number {
  if (!Number.isFinite(qty)) return MIN_QTY
  return Math.min(product.maxQty, Math.max(MIN_QTY, Math.trunc(qty)))
}

export type AddResult =
  | { ok: true; lines: CartLine[]; capped: boolean }
  | { ok: false; error: string }

/** Valida a variação escolhida e adiciona (ou soma) na sacola. */
export function addLine(lines: CartLine[], input: CartLine): AddResult {
  const product = getProductById(input.productId)
  if (!product) return { ok: false, error: 'Produto não encontrado no catálogo.' }
  if (!product.sizes.includes(input.size)) return { ok: false, error: 'Escolha um tamanho.' }
  if (!product.colors.includes(input.color)) return { ok: false, error: 'Escolha uma cor.' }
  if (!Number.isInteger(input.qty) || input.qty < MIN_QTY)
    return { ok: false, error: 'Quantidade inválida.' }

  const key = lineKey(input)
  const existing = lines.find((l) => lineKey(l) === key)
  const desired = (existing?.qty ?? 0) + input.qty
  const qty = clampQty(desired, product)
  const capped = qty < desired
  const next = existing
    ? lines.map((l) => (lineKey(l) === key ? { ...l, qty } : l))
    : [...lines, { ...input, qty }]
  return { ok: true, lines: next, capped }
}

export function setLineQty(lines: CartLine[], key: string, qty: number): CartLine[] {
  return lines.map((l) => {
    if (lineKey(l) !== key) return l
    const product = getProductById(l.productId)
    if (!product) return l
    return { ...l, qty: clampQty(qty, product) }
  })
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
  return lines.filter((l) => lineKey(l) !== key)
}

/** Remove linhas inválidas (produto inexistente, variação inválida) e normaliza quantidades. */
export function sanitizeLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return []
  const out: CartLine[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const { productId, size, color, qty } = item as Record<string, unknown>
    if (typeof productId !== 'string' || typeof size !== 'string' || typeof color !== 'string') continue
    const product = getProductById(productId)
    if (!product || !product.sizes.includes(size) || !product.colors.includes(color)) continue
    const n = typeof qty === 'number' ? qty : Number(qty)
    const line = { productId, size, color, qty: clampQty(n, product) }
    const res = addLine(out, line)
    if (res.ok) out.splice(0, out.length, ...res.lines)
  }
  return out
}

export function priceLines(lines: CartLine[]): PricedLine[] {
  return lines.flatMap((l) => {
    const product = getProductById(l.productId)
    if (!product) return []
    return [{ ...l, key: lineKey(l), product, unitPrice: product.price, lineTotal: product.price * l.qty }]
  })
}

export interface Totals {
  itemCount: number
  subtotal: number
  discount: number
  shipping: number
  total: number
}

/** Não há cupons ou promoções confirmadas pela loja: desconto é sempre 0. */
export function computeTotals(lines: CartLine[], shipping = 0): Totals {
  const priced = priceLines(lines)
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0)
  const itemCount = priced.reduce((s, l) => s + l.qty, 0)
  const discount = 0
  const safeShipping = Math.max(0, Math.round(shipping))
  return { itemCount, subtotal, discount, shipping: safeShipping, total: subtotal - discount + safeShipping }
}
