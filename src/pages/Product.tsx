import { AnimatePresence, motion } from 'motion/react'
import { Check, ExternalLink, Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatedBackground } from '../components/motion/animated-background'
import { ProductCard } from '../components/ProductCard'
import { ProductImage } from '../components/ProductImage'
import { QtyStepper } from '../components/QtyStepper'
import { categoryLabel, getProduct, instagramPostUrl, products } from '../data/products'
import { STORE } from '../data/store'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn, formatBRL } from '../lib/utils'
import { useCart } from '../state/cart'
import NotFoundPage from './NotFound'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const product = getProduct(slug)
  if (!product) return <NotFoundPage message="Esta peça não está no catálogo." />
  return <ProductView key={product.id} slug={slug} />
}

function ProductView({ slug }: { slug: string }) {
  const product = getProduct(slug)!
  const { add } = useCart()
  const [active, setActive] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(product.colors.length === 1 ? product.colors[0] : null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  usePageMeta(product.name, `${product.name} na Terra do Sol, Lavras-MG. ${product.description}`)

  useEffect(() => {
    if (!added) return
    const t = window.setTimeout(() => setAdded(false), 2200)
    return () => window.clearTimeout(t)
  }, [added])

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  const images = Array.from({ length: product.images }, (_, i) => i + 1)

  const goTo = (i: number) => {
    setActive(i)
    const el = scroller.current
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' })
  }

  const submit = () => {
    if (!color) return fail('Escolha uma cor para continuar.')
    if (!size) return fail('Escolha um tamanho para continuar.')
    const res = add({ productId: product.id, size, color, qty })
    if (!res.ok) return fail(res.error ?? 'Não foi possível adicionar.')
    setError(null)
    setAdded(true)
    setQty(1)
  }
  function fail(msg: string) {
    setError(msg)
    window.setTimeout(() => errorRef.current?.focus(), 0)
  }

  return (
    <div className="wrap pt-8">
      <nav aria-label="Trilha" className="text-sm text-palmeira-2">
        <Link to="/" className="link">
          Início
        </Link>{' '}
        /{' '}
        <Link to={`/produtos?categoria=${product.category}`} className="link">
          {categoryLabel(product.category)}
        </Link>{' '}
        / <span aria-current="page">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* galeria */}
        <div className="lg:col-span-7">
          <div className="flex gap-4">
            {images.length > 1 && (
              <ul className="hidden w-20 shrink-0 flex-col gap-3 md:flex" aria-label="Fotos">
                {images.map((n, i) => (
                  <li key={n}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Ver foto ${n} de ${images.length}`}
                      aria-current={active === i}
                      className={cn('block w-full overflow-hidden ring-offset-2 transition', active === i ? 'ring-2 ring-palmeira' : 'opacity-70 hover:opacity-100')}
                    >
                      <ProductImage slug={product.slug} n={n} alt="" sizes="80px" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="relative min-w-0 flex-1">
              <div
                ref={scroller}
                className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onScroll={(e) => {
                  const el = e.currentTarget
                  const i = Math.round(el.scrollLeft / el.clientWidth)
                  if (i !== active) setActive(i)
                }}
                aria-label="Galeria de fotos"
                tabIndex={0}
              >
                {images.map((n) => (
                  <div key={n} className="w-full shrink-0 snap-center">
                    <ProductImage slug={product.slug} n={n} alt={`${product.name}, foto ${n} de ${images.length}`} priority={n === 1} sizes="(min-width: 1024px) 50vw, 100vw" />
                  </div>
                ))}
              </div>
              {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
                  {images.map((n, i) => (
                    <span key={n} className={cn('h-1.5 rounded-full bg-nuvem transition-all', active === i ? 'w-5' : 'w-1.5 opacity-60')} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* compra */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            {product.isNew && <p className="text-sm font-semibold text-palmeira-2">Novidade na loja</p>}
            <h1 className="mt-1 text-[2.1rem] leading-[1.1] sm:text-[2.6rem]">{product.name}</h1>
            {product.brand && <p className="mt-2 text-palmeira-2">Marca: {product.brand}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-2xl" data-testid="preco">
                {formatBRL(product.price)}
              </p>
              {product.priceConfirmed ? (
                <span className="demo-tag bg-manteiga-claro">Preço divulgado pela loja</span>
              ) : (
                <span className="demo-tag">Preço demonstrativo</span>
              )}
            </div>

            <form
              className="mt-8 space-y-7"
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              noValidate
            >
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">
                  Cor{color ? <span className="font-normal text-palmeira-2">: {color}</span> : null}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <label key={c} className="cursor-pointer">
                      <input type="radio" name="cor" value={c} checked={color === c} onChange={() => setColor(c)} className="peer sr-only" />
                      <span className="inline-flex min-h-11 items-center rounded-full border border-linha bg-white px-4 text-sm transition peer-checked:border-palmeira peer-checked:bg-palmeira peer-checked:text-nuvem peer-focus-visible:ring-2 peer-focus-visible:ring-palmeira peer-focus-visible:ring-offset-2">
                        {c}
                      </span>
                    </label>
                  ))}
                </div>
                {!product.colorsConfirmed && product.colors.length > 0 && <p className="mt-2 text-xs text-palmeira-2">Cor conforme a foto da publicação.</p>}
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Tamanho</legend>
                <div className="inline-flex gap-1 rounded-full border border-linha bg-white p-1" role="group" aria-label="Tamanho">
                  <AnimatedBackground className="rounded-full bg-palmeira" transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }} defaultValue={size ?? undefined} onValueChange={(id) => id && setSize(id)}>
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        data-id={s}
                        type="button"
                        aria-pressed={size === s}
                        aria-label={`Tamanho ${s}`}
                        className="h-11 w-12 items-center justify-center rounded-full text-sm font-semibold text-palmeira transition-colors aria-pressed:text-nuvem"
                      >
                        {s}
                      </button>
                    ))}
                  </AnimatedBackground>
                </div>
                <p className="mt-2 text-xs text-palmeira-2">
                  {product.sizesConfirmed ? 'Tamanhos informados pela loja.' : 'Grade de tamanhos demonstrativa. Confirme as medidas com a loja.'}
                </p>
              </fieldset>

              <div>
                <p className="mb-3 text-sm font-semibold" id="qtd-label">
                  Quantidade
                </p>
                <QtyStepper value={qty} max={product.maxQty} onChange={setQty} label="Quantidade" />
                <p className="mt-2 text-xs text-palmeira-2">Até {product.maxQty} unidades por pedido. Disponibilidade demonstrativa.</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    ref={errorRef}
                    tabIndex={-1}
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg bg-alerta/10 px-4 py-3 text-sm text-alerta outline-none"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" className={cn('btn w-full text-base', added ? 'btn-sun' : 'btn-primary')} data-testid="adicionar">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={added ? 'ok' : 'add'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="inline-flex items-center gap-2"
                  >
                    {added ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" /> Adicionado à sacola
                      </>
                    ) : (
                      'Adicionar à sacola'
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </form>

            <div className="mt-10 divide-y divide-linha border-y border-linha">
              <details open className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  Sobre a peça <span className="text-palmeira-2 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-palmeira-2">{product.description}</p>
                {!product.captionBased && <p className="mt-2 text-xs text-palmeira-2">A publicação não tinha legenda; descrição feita a partir da foto.</p>}
              </details>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  Entrega e retirada <span className="text-palmeira-2 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-palmeira-2">
                  A Terra do Sol envia para todo o Brasil e tem duas lojas em Lavras. Nesta demonstração, o frete é simulado no checkout.
                </p>
              </details>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  Dúvidas sobre medidas <span className="text-palmeira-2 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-palmeira-2">
                  Fale com a loja{' '}
                  <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="link text-palmeira">
                    pelo WhatsApp
                  </a>{' '}
                  ou pelo telefone {STORE.landline}.
                </p>
              </details>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-palmeira-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Foto e descrição da{' '}
                <a href={instagramPostUrl(product.post)} target="_blank" rel="noreferrer" className="link inline-flex items-center gap-1 text-palmeira">
                  publicação no Instagram <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                {product.postedAt && <> de {new Date(product.postedAt + 'T12:00:00').toLocaleDateString('pt-BR')}</>}.
              </span>
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="titulo-relacionados">
          <h2 id="titulo-relacionados" className="text-3xl">
            Mais em {categoryLabel(product.category).toLowerCase()}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
