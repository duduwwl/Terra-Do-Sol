import { AnimatePresence, motion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getProductById } from '../data/products'
import { formatBRL } from '../lib/utils'
import { useCart } from '../state/cart'
import { ProductImage } from './ProductImage'
import { QtyStepper } from './QtyStepper'

/** Lista de itens da sacola — usada na gaveta e na página da sacola. */
export function CartLines({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const { priced, setQty, remove, lastRemoved, undoRemove } = useCart()
  const removedProduct = lastRemoved ? getProductById(lastRemoved.productId) : undefined
  return (
    <>
    <div aria-live="polite">
      {removedProduct && (
        <p className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-ceu px-4 py-2.5 text-sm">
          <span className="min-w-0">{removedProduct.name} foi removida.</span>
          <button type="button" onClick={undoRemove} className="shrink-0 font-semibold link">
            Desfazer
          </button>
        </p>
      )}
    </div>
    <ul className="divide-y divide-linha" aria-label="Itens na sacola">
      <AnimatePresence initial={false}>
        {priced.map((l) => (
          <motion.li
            key={l.key}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-4 overflow-hidden py-4"
            data-testid="linha-sacola"
          >
            <Link to={`/produto/${l.product.slug}`} onClick={onNavigate} className={compact ? 'w-20 shrink-0' : 'w-24 shrink-0 sm:w-28'}>
              <ProductImage slug={l.product.slug} alt={l.product.name} sizes="120px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/produto/${l.product.slug}`} onClick={onNavigate} className="font-medium leading-snug hover:underline">
                    {l.product.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-palmeira-2">
                    {l.color}, tamanho {l.size}
                  </p>
                  <p className="mt-0.5 text-sm text-palmeira-2">{formatBRL(l.unitPrice)} cada</p>
                </div>
                <p className="shrink-0 font-semibold" data-testid="subtotal-item">
                  {formatBRL(l.lineTotal)}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3">
                <QtyStepper size="sm" value={l.qty} max={l.product.maxQty} onChange={(n) => setQty(l.key, n)} label={`Quantidade de ${l.product.name}`} />
                <button
                  type="button"
                  onClick={() => remove(l.key)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-palmeira-2 hover:bg-ceu hover:text-palmeira"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remover<span className="sr-only"> {l.product.name}</span>
                </button>
              </div>
              {l.qty >= l.product.maxQty && <p className="text-xs text-palmeira-2">Limite de {l.product.maxQty} unidades por pedido.</p>}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
    </>
  )
}
