import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatBRL } from '../lib/utils'
import { useCart } from '../state/cart'
import { AnimatedNumber } from './motion/animated-number'
import { CartLines } from './CartLines'
import { SunMark } from './Logo'
import { Sheet } from './Sheet'

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, totals, priced } = useCart()
  const navigate = useNavigate()
  const close = useCallback(() => setDrawerOpen(false), [setDrawerOpen])

  return (
    <Sheet
      open={drawerOpen}
      onClose={close}
      title={`Sacola${totals.itemCount ? ` (${totals.itemCount})` : ''}`}
      footer={
        priced.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-palmeira-2">Subtotal</span>
              <span className="text-lg font-semibold" data-testid="gaveta-subtotal">
                <AnimatedNumber value={totals.subtotal / 100} format={(v) => formatBRL(Math.round(v * 100))} />
              </span>
            </div>
            <p className="text-xs text-palmeira-2">Frete calculado no checkout. Valores demonstrativos.</p>
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => {
                close()
                navigate('/checkout')
              }}
            >
              Ir para o checkout
            </button>
            <Link to="/sacola" onClick={close} className="btn btn-ghost w-full">
              Ver sacola completa
            </Link>
          </div>
        ) : undefined
      }
    >
      {priced.length === 0 ? (
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <SunMark className="h-14 w-14 text-palmeira" />
          <p className="mt-5 font-display text-2xl">Sua sacola está vazia</p>
          <p className="mt-2 max-w-[22ch] text-palmeira-2">As peças que você escolher aparecem aqui.</p>
          <Link to="/produtos" onClick={close} className="btn btn-primary mt-6">
            Ver a coleção
          </Link>
        </div>
      ) : (
        <div className="px-5">
          <CartLines compact onNavigate={close} />
        </div>
      )}
    </Sheet>
  )
}
