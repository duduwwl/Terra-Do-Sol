import { Minus, Plus } from 'lucide-react'
import { cn } from '../lib/utils'

interface Props {
  value: number
  max: number
  min?: number
  onChange: (n: number) => void
  label: string
  size?: 'sm' | 'md'
}

export function QtyStepper({ value, max, min = 1, onChange, label, size = 'md' }: Props) {
  const h = size === 'sm' ? 'h-10' : 'h-12'
  const btn = cn('inline-flex w-10 items-center justify-center text-palmeira transition-colors hover:bg-ceu disabled:opacity-35 disabled:hover:bg-transparent', h)
  return (
    <div className={cn('inline-flex items-stretch overflow-hidden rounded-full border border-linha bg-white focus-within:ring-2 focus-within:ring-palmeira/30', h)} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuir quantidade">
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label="Quantidade"
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.trunc(n))))
        }}
        className="w-10 [appearance:textfield] bg-transparent text-center outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar quantidade">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
