import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn, imgSrc } from '../lib/utils'

interface Props {
  slug: string
  n?: number
  alt: string
  sizes?: string
  className?: string
  priority?: boolean
}

/** Foto do produto em 4:5, com srcset e estado de erro. */
export function ProductImage({ slug, n = 1, alt, sizes = '(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw', className, priority }: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (failed) {
    return (
      <div className={cn('flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 bg-linho text-sm text-palmeira-2', className)} role="img" aria-label={`${alt} (foto indisponível)`}>
        <ImageOff className="h-5 w-5" aria-hidden="true" />
        Foto indisponível
      </div>
    )
  }

  return (
    <img
      src={imgSrc(slug, n, 480)}
      srcSet={`${imgSrc(slug, n, 480)} 480w, ${imgSrc(slug, n, 960)} 960w`}
      sizes={sizes}
      alt={alt}
      width={480}
      height={600}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn(
        'aspect-[4/5] w-full bg-linho object-cover transition-opacity duration-500',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  )
}
