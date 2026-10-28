/**
 * Pedidos de demonstração. Ficam apenas na sessão do navegador e
 * NUNCA guardam dados de cartão (número, validade ou código).
 */
import type { CartLine, Totals } from './cart'

export type OrderStatus = 'aguardando-pix' | 'pago-simulado' | 'aprovado-simulado' | 'recusado-simulado' | 'falha'

export interface DemoOrder {
  id: string
  createdAt: string
  lines: CartLine[]
  totals: Totals
  method: 'pix' | 'credito' | 'debito'
  /** últimos 4 dígitos, apenas para exibição */
  cardLast4?: string
  status: OrderStatus
  customerFirstName: string
  delivery: { mode: 'entrega'; city: string; state: string } | { mode: 'retirada'; store: string }
}

const KEY = 'terradosol:pedidos'

function readAll(): Record<string, DemoOrder> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function saveOrder(o: DemoOrder) {
  const all = readAll()
  all[o.id] = o
  try {
    sessionStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* sessão indisponível */
  }
}

export function getOrder(id: string): DemoOrder | undefined {
  return readAll()[id]
}

export function updateOrder(id: string, patch: Partial<DemoOrder>) {
  const o = getOrder(id)
  if (o) saveOrder({ ...o, ...patch })
}
