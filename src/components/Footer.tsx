import { MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories } from '../data/products'
import { STORE, STORES } from '../data/store'
import { Logo } from './Logo'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-linha bg-ceu/60">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-palmeira-2">
            Boutique de moda feminina em Lavras, Minas Gerais, desde 1988. Enviamos para todo o Brasil.
          </p>
        </div>
        <nav aria-label="Categorias">
          <h2 className="font-sans text-sm font-semibold">Coleção</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/produtos?novidades=1" className="link">
                Novidades
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/produtos?categoria=${c.id}`} className="link">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="font-sans text-sm font-semibold">Lojas em Lavras</h2>
          <ul className="mt-3 space-y-3 text-sm text-palmeira-2">
            {STORES.map((s) => (
              <li key={s.id}>{s.address}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold">Atendimento</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 link">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp da loja
              </a>
            </li>
            <li>
              <a href={STORE.landlineHref} className="inline-flex items-center gap-2 link">
                <Phone className="h-4 w-4" aria-hidden="true" /> {STORE.landline}
              </a>
            </li>
            <li>
              <a href={STORE.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 link">
                <InstagramIcon className="h-4 w-4" /> {STORE.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-palmeira/10">
        <div className="wrap flex flex-col gap-2 py-6 text-xs text-palmeira-2 sm:flex-row sm:justify-between">
          <p>
            Site demonstrativo. Fotos e descrições vêm do Instagram da Terra do Sol; preços, estoque, frete e pagamentos são simulados e nenhum valor é cobrado.
          </p>
          <Link to="/sobre-a-demonstracao" className="link shrink-0">
            Sobre esta demonstração
          </Link>
        </div>
      </div>
    </footer>
  )
}
