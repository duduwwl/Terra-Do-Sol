import { products, type CategoryId, type Product, type Season } from '../data/products'
import { normalize } from './utils'

/** Famílias de cor, derivadas das cores reais de cada peça. */
export const colorFamilies = [
  { id: 'azul', label: 'Azuis', swatch: '#8fb3cf', match: ['azul'] },
  { id: 'claros', label: 'Branco e off-white', swatch: '#f3f0e8', match: ['branco', 'off-white'] },
  { id: 'preto', label: 'Preto', swatch: '#1d1d1b', match: ['preto'] },
  { id: 'terrosos', label: 'Terrosos', swatch: '#9a7454', match: ['marrom', 'cafe', 'camel', 'bege', 'areia', 'nude'] },
  { id: 'verde', label: 'Verdes', swatch: '#6e7f45', match: ['verde'] },
  { id: 'amarelo', label: 'Amarelo-manteiga', swatch: '#efd98b', match: ['amarelo'] },
  { id: 'vinho', label: 'Vinho e vermelho', swatch: '#7c2733', match: ['vinho', 'vermelho'] },
] as const

export type ColorFamily = (typeof colorFamilies)[number]['id']

export function productFamilies(p: Product): ColorFamily[] {
  const names = p.colors.map(normalize)
  return colorFamilies.filter((f) => names.some((n) => f.match.some((m) => n.includes(m)))).map((f) => f.id)
}

export type SortKey = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome'

export const sortOptions: { id: SortKey; label: string }[] = [
  { id: 'relevancia', label: 'Mais recentes' },
  { id: 'menor-preco', label: 'Menor preço' },
  { id: 'maior-preco', label: 'Maior preço' },
  { id: 'nome', label: 'Nome (A–Z)' },
]

export interface CatalogQuery {
  q?: string
  category?: CategoryId | null
  season?: Season | null
  colors?: ColorFamily[]
  onlyNew?: boolean
  sort?: SortKey
}

export function searchScore(p: Product, q: string): number {
  const terms = normalize(q).split(/\s+/).filter(Boolean)
  if (!terms.length) return 1
  const name = normalize(p.name)
  const rest = normalize(`${p.description} ${p.colors.join(' ')} ${p.brand ?? ''}`)
  let score = 0
  for (const t of terms) {
    if (name.includes(t)) score += 3
    else if (rest.includes(t)) score += 1
    else return 0
  }
  return score
}

export function queryCatalog(query: CatalogQuery, list: Product[] = products): Product[] {
  const { q = '', category, season, colors = [], onlyNew, sort = 'relevancia' } = query
  const scored = list
    .map((p, index) => ({ p, index, score: searchScore(p, q) }))
    .filter(({ p, score }) => {
      if (score === 0) return false
      if (category && p.category !== category) return false
      if (season && p.season !== season) return false
      if (onlyNew && !p.isNew) return false
      if (colors.length) {
        const fams = productFamilies(p)
        if (!colors.some((c) => fams.includes(c))) return false
      }
      return true
    })

  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, 'pt-BR')
  scored.sort((a, b) => {
    switch (sort) {
      case 'menor-preco':
        return a.p.price - b.p.price || byName(a.p, b.p)
      case 'maior-preco':
        return b.p.price - a.p.price || byName(a.p, b.p)
      case 'nome':
        return byName(a.p, b.p)
      default:
        return q ? b.score - a.score || a.index - b.index : a.index - b.index
    }
  })
  return scored.map((s) => s.p)
}
