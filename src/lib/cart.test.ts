import { describe, expect, it } from 'vitest'
import { getProduct } from '../data/products'
import { addLine, computeTotals, lineKey, removeLine, sanitizeLines, setLineQty } from './cart'

const dress = getProduct('vestido-midi-branco-bordado')! // R$ 419,90
const pants = getProduct('calca-wide-leg-marrom')! // R$ 149,00 (preço divulgado)

const line = (p = dress, qty = 1, size = 'M') => ({ productId: p.id, size, color: p.colors[0], qty })

describe('sacola', () => {
  it('adiciona e soma linhas iguais', () => {
    const a = addLine([], line())
    expect(a.ok).toBe(true)
    if (!a.ok) return
    const b = addLine(a.lines, line(dress, 2))
    expect(b.ok && b.lines).toHaveLength(1)
    expect(b.ok && b.lines[0].qty).toBe(3)
  })

  it('separa tamanhos diferentes em linhas diferentes', () => {
    const a = addLine([], line(dress, 1, 'P'))
    const b = a.ok ? addLine(a.lines, line(dress, 1, 'G')) : a
    expect(b.ok && b.lines).toHaveLength(2)
  })

  it('rejeita variação inexistente, produto inexistente e quantidade inválida', () => {
    expect(addLine([], { ...line(), size: 'XGG' }).ok).toBe(false)
    expect(addLine([], { ...line(), color: 'Roxo' }).ok).toBe(false)
    expect(addLine([], { ...line(), productId: 'nao-existe' }).ok).toBe(false)
    expect(addLine([], { ...line(), qty: 0 }).ok).toBe(false)
    expect(addLine([], { ...line(), qty: 1.5 }).ok).toBe(false)
    expect(addLine([], { ...line(), qty: -2 }).ok).toBe(false)
  })

  it('limita a quantidade ao máximo por pedido', () => {
    const a = addLine([], line(dress, 4))
    const b = a.ok ? addLine(a.lines, line(dress, 4)) : a
    expect(b.ok && b.lines[0].qty).toBe(dress.maxQty)
    expect(b.ok && b.capped).toBe(true)
  })

  it('altera e remove quantidades sem sair dos limites', () => {
    const a = addLine([], line())
    if (!a.ok) throw new Error()
    const key = lineKey(a.lines[0])
    expect(setLineQty(a.lines, key, 0)[0].qty).toBe(1)
    expect(setLineQty(a.lines, key, 99)[0].qty).toBe(dress.maxQty)
    expect(setLineQty(a.lines, key, Number.NaN)[0].qty).toBe(1)
    expect(removeLine(a.lines, key)).toHaveLength(0)
  })

  it('calcula subtotal, frete e total a partir do catálogo', () => {
    const lines = [line(dress, 2), line(pants, 1, 'P')]
    const t = computeTotals(lines, 2490)
    expect(t.itemCount).toBe(3)
    expect(t.subtotal).toBe(41990 * 2 + 14900)
    expect(t.discount).toBe(0)
    expect(t.total).toBe(41990 * 2 + 14900 + 2490)
    expect(computeTotals(lines, -50).shipping).toBe(0)
  })

  it('limpa dados adulterados vindos do armazenamento', () => {
    const raw = [
      { ...line(), qty: 3 },
      { productId: 'x', size: 'M', color: 'Azul', qty: 1 },
      { ...line(), size: 'GG' },
      { ...line(), qty: 500 },
      'lixo',
      null,
    ]
    const clean = sanitizeLines(raw)
    expect(clean).toHaveLength(1)
    expect(clean[0].qty).toBe(dress.maxQty)
    expect(sanitizeLines('nao é lista')).toEqual([])
  })
})
