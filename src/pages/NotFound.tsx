import { Link } from 'react-router-dom'
import { SunMark } from '../components/Logo'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFoundPage({ message }: { message?: string }) {
  usePageMeta('Página não encontrada')
  return (
    <div className="wrap flex flex-col items-center py-24 text-center">
      <SunMark className="h-16 w-16 text-palmeira" />
      <h1 className="mt-6 text-4xl">Página não encontrada</h1>
      <p className="mt-3 max-w-[40ch] text-palmeira-2">{message ?? 'O endereço pode ter mudado ou a peça saiu do catálogo.'}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/produtos" className="btn btn-primary">
          Ver a coleção
        </Link>
        <Link to="/" className="btn btn-ghost">
          Ir para o início
        </Link>
      </div>
    </div>
  )
}
