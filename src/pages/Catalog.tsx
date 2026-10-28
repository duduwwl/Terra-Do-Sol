import { AnimatePresence, motion } from 'motion/react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatedBackground } from '../components/motion/animated-background'
import { ProductCard } from '../components/ProductCard'
import { Sheet } from '../components/Sheet'
import { categories, seasons, type CategoryId, type Season } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'
import { colorFamilies, queryCatalog, sortOptions, type ColorFamily, type SortKey } from '../lib/catalog'
import { cn } from '../lib/utils'

const PAGE = 12

function useCatalogParams() {
  const [params, setParams] = useSearchParams()
  const category = (categories.find((c) => c.id === params.get('categoria'))?.id ?? null) as CategoryId | null
  const season = (seasons.find((s) => s.id === params.get('estacao'))?.id ?? null) as Season | null
  const colors = (params.get('cor') ?? '')
    .split(',')
    .filter((c): c is ColorFamily => colorFamilies.some((f) => f.id === c))
  const onlyNew = params.get('novidades') === '1'
  const sort = (sortOptions.find((s) => s.id === params.get('ordem'))?.id ?? 'relevancia') as SortKey
  const q = params.get('q') ?? ''

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === '') next.delete(k)
            else next.set(k, v)
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return { category, season, colors, onlyNew, sort, q, update, clear: () => setParams({}, { replace: true }) }
}

function Filters({ p, idPrefix }: { p: ReturnType<typeof useCatalogParams>; idPrefix: string }) {
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Estação</legend>
        <div className="space-y-1">
          {[{ id: '', label: 'Todas' }, ...seasons].map((s) => (
            <label key={s.id || 'todas'} className="flex min-h-10 cursor-pointer items-center gap-3 text-[0.95rem]">
              <input
                type="radio"
                name={`${idPrefix}-estacao`}
                checked={(p.season ?? '') === s.id}
                onChange={() => p.update({ estacao: s.id || null })}
                className="h-4 w-4 accent-palmeira"
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Cor</legend>
        <div className="space-y-1">
          {colorFamilies.map((c) => {
            const checked = p.colors.includes(c.id)
            return (
              <label key={c.id} className="flex min-h-10 cursor-pointer items-center gap-3 text-[0.95rem]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? p.colors.filter((x) => x !== c.id) : [...p.colors, c.id]
                    p.update({ cor: next.join(',') || null })
                  }}
                  className="h-4 w-4 accent-palmeira"
                />
                <span className="h-4 w-4 rounded-full border border-palmeira/20" style={{ background: c.swatch }} aria-hidden="true" />
                {c.label}
              </label>
            )
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Chegada</legend>
        <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[0.95rem]">
          <input type="checkbox" checked={p.onlyNew} onChange={() => p.update({ novidades: p.onlyNew ? null : '1' })} className="h-4 w-4 accent-palmeira" />
          Só novidades (set–out)
        </label>
      </fieldset>
    </div>
  )
}

export function CatalogPage() {
  const p = useCatalogParams()
  const [searchInput, setSearchInput] = useState(p.q)
  const deferredQ = useDeferredValue(p.q)
  const [limit, setLimit] = useState(PAGE)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const closeFilters = useCallback(() => setFiltersOpen(false), [])

  // mantém o campo em sincronia quando a busca vem do cabeçalho
  useEffect(() => setSearchInput(p.q), [p.q])

  const results = useMemo(
    () => queryCatalog({ q: deferredQ, category: p.category, season: p.season, colors: p.colors, onlyNew: p.onlyNew, sort: p.sort }),
    [deferredQ, p.category, p.season, p.colors, p.onlyNew, p.sort],
  )

  const filterKey = `${deferredQ}|${p.category}|${p.season}|${p.colors.join()}|${p.onlyNew}|${p.sort}`
  useEffect(() => setLimit(PAGE), [filterKey])

  const title = p.q ? `Busca: ${p.q}` : p.onlyNew ? 'Novidades' : p.category ? categories.find((c) => c.id === p.category)!.label : 'Todas as peças'
  usePageMeta(title, 'Catálogo da Terra do Sol: vestidos, conjuntos, blusas, calças, blazers e tricôs. Filtre por categoria, estação e cor.')

  const activeCount = (p.season ? 1 : 0) + p.colors.length + (p.onlyNew ? 1 : 0)
  const anyFilter = activeCount > 0 || !!p.category || !!p.q

  const chips = [{ id: '', label: 'Tudo' }, ...categories.map((c) => ({ id: c.id, label: c.short }))]

  return (
    <div className="wrap pt-10 pb-4">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <nav aria-label="Trilha" className="text-sm text-palmeira-2">
            <Link to="/" className="link">
              Início
            </Link>{' '}
            / <span aria-current="page">Produtos</span>
          </nav>
          <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
        </div>
        <form
          role="search"
          className="w-full lg:max-w-sm"
          onSubmit={(e) => {
            e.preventDefault()
            p.update({ q: searchInput.trim() || null })
          }}
        >
          <label htmlFor="busca-catalogo" className="field-label">
            Buscar no catálogo
          </label>
          <div className="flex gap-2">
            <input
              id="busca-catalogo"
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                p.update({ q: e.target.value.trim() || null })
              }}
              placeholder="Ex.: linho, tricô, azul"
              className="field rounded-full"
            />
          </div>
        </form>
      </div>

      {/* categorias */}
      <div className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" role="group" aria-label="Categorias">
        <div className="flex w-max gap-1 rounded-full border border-linha bg-white p-1">
          <AnimatedBackground
            defaultValue={p.category ?? ''}
            className="rounded-full bg-palmeira"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            onValueChange={(id) => p.update({ categoria: id || null })}
          >
            {chips.map((c) => (
              <button
                key={c.id || 'tudo'}
                data-id={c.id}
                type="button"
                aria-pressed={(p.category ?? '') === c.id}
                className="h-10 items-center justify-center rounded-full px-4 text-sm font-medium whitespace-nowrap text-palmeira-2 transition-colors aria-pressed:text-nuvem"
              >
                {c.label}
              </button>
            ))}
          </AnimatedBackground>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[13rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <Filters p={p} idPrefix="lateral" />
          {anyFilter && (
            <button type="button" onClick={p.clear} className="mt-8 text-sm font-semibold link">
              Limpar filtros
            </button>
          )}
        </aside>

        <section aria-label="Resultados">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha pb-4">
            <p className="text-sm text-palmeira-2" aria-live="polite" data-testid="contagem">
              {results.length} {results.length === 1 ? 'peça' : 'peças'}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setFiltersOpen(true)} className="btn btn-ghost min-h-10 px-4 text-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filtros{activeCount ? ` (${activeCount})` : ''}
              </button>
              <label htmlFor="ordem" className="sr-only">
                Ordenar por
              </label>
              <select
                id="ordem"
                value={p.sort}
                onChange={(e) => p.update({ ordem: e.target.value === 'relevancia' ? null : e.target.value })}
                className="h-10 rounded-full border border-linha bg-white pr-8 pl-4 text-sm"
              >
                {sortOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* filtros ativos */}
          {(activeCount > 0 || p.q) && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Filtros ativos">
              {p.q && <ActiveChip label={`Busca: ${p.q}`} onRemove={() => p.update({ q: null })} />}
              {p.season && <ActiveChip label={seasons.find((s) => s.id === p.season)!.label} onRemove={() => p.update({ estacao: null })} />}
              {p.colors.map((c) => (
                <ActiveChip key={c} label={colorFamilies.find((f) => f.id === c)!.label} onRemove={() => p.update({ cor: p.colors.filter((x) => x !== c).join(',') || null })} />
              ))}
              {p.onlyNew && <ActiveChip label="Novidades" onRemove={() => p.update({ novidades: null })} />}
            </ul>
          )}

          {results.length === 0 ? (
            <div className="flex flex-col items-start py-16" data-testid="sem-resultados">
              <p className="font-display text-3xl">Nenhuma peça encontrada</p>
              <p className="mt-3 max-w-[48ch] text-palmeira-2">
                {p.q ? `Não há peças com “${p.q}” nesses filtros. ` : 'Nenhuma peça combina com todos esses filtros. '}
                Tente outra palavra ou remova algum filtro.
              </p>
              <button type="button" onClick={p.clear} className="btn btn-primary mt-6">
                Limpar busca e filtros
              </button>
            </div>
          ) : (
            <>
              <motion.div layout className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.slice(0, limit).map((prod, i) => (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={prod} priority={i < 4} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              {results.length > limit && (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <p className="text-sm text-palmeira-2">
                    Mostrando {Math.min(limit, results.length)} de {results.length}
                  </p>
                  <button type="button" className="btn btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>
                    Mostrar mais peças
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Sheet
        open={filtersOpen}
        onClose={closeFilters}
        title="Filtros"
        side="bottom"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={p.clear} className="btn btn-ghost flex-1">
              Limpar
            </button>
            <button type="button" onClick={closeFilters} className="btn btn-primary flex-[2]">
              Ver {results.length} {results.length === 1 ? 'peça' : 'peças'}
            </button>
          </div>
        }
      >
        <div className="px-5 py-5">
          <Filters p={p} idPrefix="movel" />
        </div>
      </Sheet>
    </div>
  )
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        className={cn('inline-flex h-9 items-center gap-1.5 rounded-full bg-ceu pr-2.5 pl-3.5 text-sm text-palmeira hover:bg-ceu-escuro')}
        aria-label={`Remover filtro ${label}`}
      >
        {label}
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </li>
  )
}
