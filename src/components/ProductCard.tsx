import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { formatBRL, imgSrc } from '../lib/utils'
import { ProductImage } from './ProductImage'

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const hasSecond = product.images > 1
  return (
    <article className="group relative">
      <Link to={`/produto/${product.slug}`} className="block focus-visible:outline-offset-4">
        <div className="relative overflow-hidden bg-linho">
          <ProductImage slug={product.slug} alt={product.name} priority={priority} />
          {hasSecond && (
            <img
              src={imgSrc(product.slug, 2, 480)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="pointer-events-none absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-[1023px]:hidden"
            />
          )}
          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-nuvem/90 px-2.5 py-1 text-xs font-semibold text-palmeira">
              Novidade
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1 pr-2">
          <h3 className="font-sans text-[0.95rem] leading-snug font-medium text-palmeira">{product.name}</h3>
          <p className="text-[0.95rem] text-palmeira">
            {formatBRL(product.price)}
            {!product.priceConfirmed && <span className="sr-only"> (preço demonstrativo)</span>}
          </p>
        </div>
      </Link>
    </article>
  )
}
