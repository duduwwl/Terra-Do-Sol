import { cn } from '../lib/utils'

/** Sol nascendo sobre o horizonte — referência ao nome e ao logotipo original da loja. */
export function SunMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M4 21a12 12 0 0 1 24 0z" fill="var(--color-manteiga)" />
      <path d="M2 21.75h28" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 26h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-end gap-2 leading-none', className)}>
      <SunMark className="h-8 w-8 shrink-0" />
      <span className="flex flex-col">
        <span translate="no" className="font-display text-[1.45rem] tracking-[-0.02em]">Terra do Sol</span>
        {!compact && <span className="mt-1 hidden text-[0.72rem] text-palmeira-2 sm:block">Lavras, desde 1988</span>}
      </span>
    </span>
  )
}
