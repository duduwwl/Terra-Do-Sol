import { MapPin, MessageCircle, Phone, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ProductImage } from '../components/ProductImage'
import { InView } from '../components/motion/in-view'
import { categories, getProduct, products } from '../data/products'
import { STORE, STORES } from '../data/store'
import { usePageMeta } from '../hooks/usePageMeta'

const HERO = getProduct('vestido-midi-azul-amarracao')!

/** Peça representativa de cada categoria (todas reais, do Instagram da loja). */
const CATEGORY_COVER: Record<string, string> = {
  vestidos: 'vestido-midi-branco-bordado',
  conjuntos: 'conjunto-calca-colete-risca-de-giz',
  blusas: 'blusa-sleepwear-renda',
  'calcas-shorts': 'calca-linho-poa',
  'blazers-jaquetas': 'max-blazer-risca-de-giz',
  trico: 'trico-poa',
}

const BUTTER = ['vestido-curto-amarelo-manteiga', 'conjunto-blazer-calca-amarelo', 'conjunto-linho-amarelo-colete'].map(
  (s) => getProduct(s)!,
)

export function HomePage() {
  usePageMeta('', 'Terra do Sol, moda feminina em Lavras-MG desde 1988. Vestidos, conjuntos, blusas e alfaiataria com envio para todo o Brasil.')
  const fresh = products.filter((p) => p.isNew).slice(0, 8)

  return (
    <>
      {/* ——— Abertura: o sol nascendo atrás da janela em arco ——— */}
      <section className="relative overflow-hidden bg-ceu">
        <div className="wrap grid items-end gap-10 pt-10 md:grid-cols-12 md:gap-6 md:pt-16 lg:pt-20">
          <div className="pb-4 md:col-span-6 md:pb-20 lg:col-span-6 lg:pb-28">
            <h1 className="max-w-[13ch] text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-[4.6rem]">
              <span className="sr-only">Moda feminina em Lavras desde 1988</span>
              <span aria-hidden="true">
                {'Moda feminina em Lavras desde 1988'.split(' ').map((w, i) => (
                  <span key={i}>
                    <span className="hero-word" style={{ animationDelay: `${80 * i}ms` }}>
                      {w}
                    </span>{' '}
                  </span>
                ))}
              </span>
            </h1>
            <div className="hero-rise" style={{ animationDelay: '480ms' }}>
              <p className="mt-6 max-w-[46ch] text-lg text-palmeira-2">
                Vestidos, conjuntos e alfaiataria que chegam às nossas duas lojas no centro de Lavras. Escolha por aqui e receba onde estiver: enviamos para todo o Brasil.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/produtos" className="btn btn-primary">
                  Ver a coleção
                </Link>
                <Link to="/produtos?novidades=1" className="btn btn-ghost">
                  Ver as novidades
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[24rem] md:col-span-6 md:mr-0 md:max-w-[30rem] lg:col-span-5 lg:col-start-8">
            {/* o sol */}
            <div aria-hidden="true" className="absolute left-1/2 -top-[7%] aspect-square w-[104%] -translate-x-1/2">
              <div className="sun-rise h-full w-full rounded-full bg-manteiga" />
            </div>
            <Link to={`/produto/${HERO.slug}`} className="group relative block" aria-label={`${HERO.name}, ver detalhes`}>
              <div className="arch relative overflow-hidden bg-linho">
                <ProductImage slug={HERO.slug} alt={HERO.name} priority sizes="(min-width: 768px) 30rem, 90vw" className="transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
            </Link>
          </div>
        </div>
        {/* horizonte */}
        <div className="relative h-px bg-palmeira/40" aria-hidden="true" />
        <div className="wrap flex flex-col gap-1 py-4 text-sm text-palmeira-2 sm:flex-row sm:justify-between">
          <p>
            Na foto: <Link to={`/produto/${HERO.slug}`} className="link text-palmeira">{HERO.name.toLowerCase()}</Link>, novidade de outubro.
          </p>
          <p>Revenda autorizada Levi’s</p>
        </div>
      </section>

      {/* ——— Categorias ——— */}
      <section className="wrap mt-20" aria-labelledby="titulo-categorias">
        <div className="flex items-end justify-between gap-4">
          <h2 id="titulo-categorias" className="text-3xl sm:text-4xl">
            Categorias
          </h2>
          <Link to="/produtos" className="link text-sm">
            Todas as {products.length} peças
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const cover = getProduct(CATEGORY_COVER[c.id])!
            const count = products.filter((p) => p.category === c.id).length
            return (
              <li key={c.id}>
                <Link to={`/produtos?categoria=${c.id}`} className="group block">
                  <div className="arch overflow-hidden bg-linho">
                    <ProductImage slug={cover.slug} alt="" sizes="(min-width: 1024px) 14vw, 45vw" className="transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <p className="mt-3 font-display text-xl leading-tight group-hover:underline">{c.label}</p>
                  <p className="text-sm text-palmeira-2">{count} peças</p>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ——— Novidades ——— */}
      <section className="wrap mt-24" aria-labelledby="titulo-novidades">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="titulo-novidades" className="text-3xl sm:text-4xl">
              Chegou nas lojas
            </h2>
            <p className="mt-2 text-palmeira-2">Peças que a Terra do Sol publicou em setembro e outubro.</p>
          </div>
          <Link to="/produtos?novidades=1" className="link text-sm">
            Ver todas as novidades
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {fresh.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ——— Amarelo-manteiga ——— */}
      <section className="mt-24 bg-manteiga" aria-labelledby="titulo-manteiga">
        <div className="wrap grid gap-10 py-16 lg:grid-cols-12 lg:py-20">
          <InView
            once
            viewOptions={{ once: true, margin: '0px 0px -20% 0px' }}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 lg:pr-6"
          >
            <div>
              <h2 id="titulo-manteiga" className="text-4xl sm:text-5xl">
                Amarelo-manteiga
              </h2>
              <p className="mt-4 max-w-[38ch] text-lg">
                Foi a cor que a loja mais mostrou na primavera e no verão: num vestido curto, num conjunto de linho e no blazer com calça de alfaiataria.
              </p>
              <Link to="/produtos?cor=amarelo" className="btn btn-primary mt-8">
                Ver peças amarelas
              </Link>
            </div>
          </InView>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:col-span-8">
            {BUTTER.map((p, i) => (
              <div key={p.id} className={i === 2 ? 'max-sm:hidden' : undefined}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Lojas e atendimento ——— */}
      <section className="wrap mt-24" aria-labelledby="titulo-lojas">
        <h2 id="titulo-lojas" className="text-3xl sm:text-4xl">
          Duas lojas em Lavras
        </h2>
        <div className="mt-8 grid gap-8 border-t border-linha pt-8 md:grid-cols-3">
          <div>
            <h3 className="flex items-center gap-2 font-sans text-base font-semibold">
              <MapPin className="h-4 w-4" aria-hidden="true" /> Endereços
            </h3>
            <ul className="mt-3 space-y-1.5 text-palmeira-2">
              {STORES.map((s) => (
                <li key={s.id}>{s.address}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-sans text-base font-semibold">
              <Truck className="h-4 w-4" aria-hidden="true" /> Envio
            </h3>
            <p className="mt-3 text-palmeira-2">A loja envia para todo o Brasil. O valor do frete é combinado no atendimento.</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-sans text-base font-semibold">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Atendimento
            </h3>
            <p className="mt-3 text-palmeira-2">
              Tire dúvidas de tamanho e disponibilidade{' '}
              <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="link text-palmeira">
                pelo WhatsApp
              </a>{' '}
              ou pelo telefone{' '}
              <a href={STORE.landlineHref} className="link inline-flex items-center gap-1 text-palmeira">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {STORE.landline}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
