import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProductById } from '../data/products'
import { useCart } from '../state/cart'
import { ProductImage } from './ProductImage'

/** Confirmação discreta após adicionar uma peça. */
export function AddedToast() {
  const { notice, setDrawerOpen, drawerOpen } = useCart()
  const [visibleId, setVisibleId] = useState<number | null>(null)

  useEffect(() => {
    if (!notice) return
    setVisibleId(notice.id)
    const t = window.setTimeout(() => setVisibleId((v) => (v === notice.id ? null : v)), 4500)
    return () => window.clearTimeout(t)
  }, [notice])

  const product = notice ? getProductById(notice.productId) : undefined
  const show = !!notice && visibleId === notice.id && !drawerOpen && !!product

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-6">
      <AnimatePresence>
        {show && product && (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-palmeira p-3 pr-2 text-nuvem shadow-[0_18px_40px_-18px_rgba(31,53,41,.6)]"
            role="status"
          >
            <div className="w-12 shrink-0 overflow-hidden rounded-md">
              <ProductImage slug={product.slug} alt="" sizes="48px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Check className="h-4 w-4 text-manteiga" aria-hidden="true" />
                {notice.message}
              </p>
              <p className="truncate text-sm text-nuvem/75">{product.name}</p>
            </div>
            <button type="button" onClick={() => setDrawerOpen(true)} className="h-10 shrink-0 rounded-full bg-manteiga px-4 text-sm font-semibold text-palmeira">
              Ver sacola
            </button>
            <button type="button" onClick={() => setVisibleId(null)} className="inline-flex h-10 w-9 items-center justify-center rounded-full text-nuvem/70 hover:text-nuvem" aria-label="Fechar aviso">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
