import { Link } from 'react-router-dom'
import { CartLines } from '../components/CartLines'
import { SunMark } from '../components/Logo'
import { AnimatedNumber } from '../components/motion/animated-number'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatBRL } from '../lib/utils'
import { useCart } from '../state/cart'

export default function CartPage() {
  const { priced, totals } = useCart()
  usePageMeta('Sacola')

  if (priced.length === 0) {
    return (
      <div className="wrap flex flex-col items-center py-24 text-center" data-testid="sacola-vazia">
        <SunMark className="h-16 w-16 text-palmeira" />
        <h1 className="mt-6 text-4xl">Sua sacola está vazia</h1>
        <p className="mt-3 max-w-[40ch] text-palmeira-2">Escolha uma peça no catálogo e ela aparece aqui, guardada neste navegador.</p>
        <Link to="/produtos" className="btn btn-primary mt-8">
          Ver a coleção
        </Link>
      </div>
    )
  }

  return (
    <div className="wrap pt-10">
      <h1 className="text-4xl sm:text-5xl">Sacola</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="border-t border-linha">
            <CartLines />
          </div>
          <Link to="/produtos" className="link mt-6 inline-block text-sm">
            Continuar escolhendo
          </Link>
        </div>
        <aside className="lg:col-span-4" aria-labelledby="titulo-resumo">
          <div className="rounded-2xl bg-ceu p-6 lg:sticky lg:top-28">
            <h2 id="titulo-resumo" className="text-2xl">
              Resumo
            </h2>
            <dl className="mt-5 space-y-3 text-[0.95rem]">
              <div className="flex justify-between">
                <dt className="text-palmeira-2">
                  {totals.itemCount} {totals.itemCount === 1 ? 'peça' : 'peças'}
                </dt>
                <dd className="" data-testid="sacola-subtotal">
                  {formatBRL(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-palmeira-2">Frete</dt>
                <dd className="text-palmeira-2">calculado no checkout</dd>
              </div>
              <div className="flex justify-between border-t border-palmeira/15 pt-3 text-lg font-semibold">
                <dt>Total</dt>
                <dd data-testid="sacola-total">
                  <AnimatedNumber value={totals.total / 100} format={(v) => formatBRL(Math.round(v * 100))} />
                </dd>
              </div>
            </dl>
            <Link to="/checkout" className="btn btn-primary mt-6 w-full">
              Ir para o checkout
            </Link>
            <p className="mt-3 text-xs text-palmeira-2">Preços demonstrativos. Nenhum valor é cobrado.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
