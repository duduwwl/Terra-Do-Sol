import { Menu, Search, ShoppingBag } from 'lucide-react'
import { useCallback, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { categories, products } from '../data/products'
import { STORE } from '../data/store'
import { cn } from '../lib/utils'
import { useCart } from '../state/cart'
import { SlidingNumber } from './motion/sliding-number'
import { Logo } from './Logo'
import { Sheet } from './Sheet'

const NAV = [
  { to: '/produtos?novidades=1', label: 'Novidades', match: 'novidades=1' },
  { to: '/produtos?categoria=vestidos', label: 'Vestidos', match: 'categoria=vestidos' },
  { to: '/produtos?categoria=conjuntos', label: 'Conjuntos', match: 'categoria=conjuntos' },
  { to: '/produtos?categoria=blusas', label: 'Blusas', match: 'categoria=blusas' },
  { to: '/produtos', label: 'Todas as peças', match: '' },
]

function SearchForm({ onDone, autoFocus, id }: { onDone?: () => void; autoFocus?: boolean; id: string }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/produtos?q=${encodeURIComponent(term)}` : '/produtos')
    onDone?.()
  }
  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Buscar peças
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-palmeira-2" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar vestido, linho, tricô…"
        autoFocus={autoFocus}
        data-autofocus={autoFocus ? '' : undefined}
        className="h-11 w-full rounded-full border border-linha bg-white pr-4 pl-10 text-[0.95rem] outline-none placeholder:text-palmeira-2/70 focus:border-palmeira focus:ring-2 focus:ring-palmeira/15"
      />
    </form>
  )
}

export function Header() {
  const { totals, setDrawerOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  const isActive = (match: string) => {
    if (location.pathname !== '/produtos') return false
    if (!match) return location.search === ''
    return location.search.includes(match)
  }

  return (
    <>
      <div className="bg-palmeira text-nuvem">
        <p className="wrap py-2 text-center text-[0.8rem] leading-snug">
          Loja demonstrativa: preços, frete e pagamentos são simulados. Para comprar de verdade, fale com a loja{' '}
          <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
            pelo WhatsApp
          </a>
          .
        </p>
      </div>
      <header className="sticky top-0 z-40 border-b border-linha bg-nuvem/95 backdrop-blur supports-[backdrop-filter]:bg-nuvem/85">
        <div className="wrap flex h-[4.5rem] items-center gap-3 lg:gap-8">
          <button type="button" className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-ceu lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link to="/" aria-label="Terra do Sol, página inicial" className="shrink-0 rounded-sm">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    aria-current={isActive(item.match) ? 'page' : undefined}
                    className={cn(
                      'relative inline-flex h-11 items-center rounded-full px-3.5 text-[0.95rem] text-palmeira-2 transition-colors hover:text-palmeira',
                      isActive(item.match) && 'text-palmeira after:absolute after:inset-x-3.5 after:bottom-2 after:h-[2px] after:rounded-full after:bg-manteiga',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden w-64 xl:block">
              <SearchForm id="busca-topo" />
            </div>
            <button type="button" onClick={() => setSearchOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-ceu xl:hidden" aria-label="Buscar peças">
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative inline-flex h-11 items-center gap-2 rounded-full pr-3 pl-3 hover:bg-ceu"
              aria-label={`Abrir sacola, ${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'itens'}`}
              data-testid="abrir-sacola"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span className="hidden text-[0.95rem] sm:inline">Sacola</span>
              <span
                className={cn(
                  'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold transition-colors',
                  totals.itemCount ? 'bg-manteiga text-palmeira' : 'bg-linho text-palmeira-2',
                )}
                aria-hidden="true"
              >
                <SlidingNumber value={totals.itemCount} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onClose={closeMenu} title="Menu" side="left">
        <nav aria-label="Menu móvel" className="px-5 py-4">
          <ul className="flex flex-col">
            <li>
              <Link to="/produtos?novidades=1" onClick={closeMenu} className="flex min-h-12 items-center border-b border-linha font-display text-xl">
                Novidades
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/produtos?categoria=${c.id}`} onClick={closeMenu} className="flex min-h-12 items-center justify-between border-b border-linha font-display text-xl">
                  {c.label}
                  <span className="font-sans text-sm text-palmeira-2">{products.filter((p) => p.category === c.id).length}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/produtos" onClick={closeMenu} className="flex min-h-12 items-center border-b border-linha font-display text-xl">
                Todas as peças
              </Link>
            </li>
          </ul>
          <div className="mt-6 space-y-2 text-sm text-palmeira-2">
            <p>Loja física em Lavras, MG. Enviamos para todo o Brasil.</p>
            <p>
              <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="link text-palmeira">
                WhatsApp da loja
              </a>{' '}
              ou telefone <a href={STORE.landlineHref} className="link text-palmeira">{STORE.landline}</a>
            </p>
          </div>
        </nav>
      </Sheet>

      <Sheet open={searchOpen} onClose={closeSearch} title="Buscar" side="bottom">
        <div className="px-5 pt-4 pb-8">
          <SearchForm id="busca-movel" autoFocus onDone={closeSearch} />
          <p className="mt-4 text-sm text-palmeira-2">Busque pelo nome da peça, tecido ou cor.</p>
        </div>
      </Sheet>
    </>
  )
}
