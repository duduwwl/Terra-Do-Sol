import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import { queryCatalog } from './catalog'

describe('catálogo', () => {
  it('tem ids e slugs únicos e dados coerentes', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length)
    for (const p of products) {
      expect(p.price).toBeGreaterThan(0)
      expect(p.images).toBeGreaterThan(0)
      expect(p.colors.length).toBeGreaterThan(0)
      expect(p.sizes.length).toBeGreaterThan(0)
    }
  })

  it('busca sem acento e por várias palavras', () => {
    const r = queryCatalog({ q: 'trico' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((p) => /tric[oô]/i.test(p.name + p.description))).toBe(true)
    expect(queryCatalog({ q: 'vestido linho' }).length).toBeGreaterThanOrEqual(0)
    expect(queryCatalog({ q: 'xyzzy' })).toHaveLength(0)
  })

  it('filtra por categoria, estação, cor e novidades', () => {
    expect(queryCatalog({ category: 'vestidos' }).every((p) => p.category === 'vestidos')).toBe(true)
    expect(queryCatalog({ season: 'outono-inverno' }).every((p) => p.season === 'outono-inverno')).toBe(true)
    expect(queryCatalog({ colors: ['amarelo'] }).every((p) => p.colors.join().toLowerCase().includes('amarelo'))).toBe(true)
    expect(queryCatalog({ onlyNew: true }).every((p) => p.isNew)).toBe(true)
  })

  it('ordena por preço e nome', () => {
    const asc = queryCatalog({ sort: 'menor-preco' }).map((p) => p.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    const desc = queryCatalog({ sort: 'maior-preco' }).map((p) => p.price)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
    const names = queryCatalog({ sort: 'nome' }).map((p) => p.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR')))
  })
})
