import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  side?: 'right' | 'left' | 'bottom'
  children: ReactNode
  footer?: ReactNode
  className?: string
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'

/** Painel lateral acessível: foco preso, Esc fecha, devolve o foco ao fechar. */
export function Sheet({ open, onClose, title, side = 'right', children, footer, className }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const lastFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    lastFocus.current = document.activeElement as HTMLElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    }, 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      lastFocus.current?.focus?.()
    }
  }, [open, onClose])

  const variants = {
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  }[side]

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-palmeira/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            {...variants}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className={cn(
              'absolute flex flex-col bg-nuvem shadow-[0_0_0_1px_rgba(31,53,41,.06),0_24px_60px_-20px_rgba(31,53,41,.35)]',
              side === 'right' && 'inset-y-0 right-0 w-full max-w-[26rem]',
              side === 'left' && 'inset-y-0 left-0 w-[88%] max-w-[22rem]',
              side === 'bottom' && 'inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl',
              className,
            )}
          >
            <div className="flex items-center justify-between border-b border-linha px-5 py-4">
              <h2 id={titleId} className="text-xl">
                {title}
              </h2>
              <button type="button" onClick={onClose} className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-ceu" aria-label="Fechar">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <div className="border-t border-linha bg-nuvem px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
