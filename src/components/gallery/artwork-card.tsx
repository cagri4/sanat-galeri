import Image from 'next/image'
import Link from 'next/link'
import { getProducts } from '@/lib/queries/gallery'

type ProductWithImage = Awaited<ReturnType<typeof getProducts>>[number]

interface ArtworkCardProps {
  product: ProductWithImage
  locale: string
}

export default function ArtworkCard({ product, locale }: ArtworkCardProps) {
  const title = locale === 'tr' ? product.titleTr : product.titleEn
  const image = product.images[0]

  const priceDisplay =
    product.price != null
      ? `${Number(product.price).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')} ${product.currency ?? 'TRY'}`
      : null

  return (
    <Link
      href={`/${locale}/urun/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] w-full bg-[#f0ece4] overflow-hidden">
        {image?.url ? (
          <Image
            src={image.url}
            alt={locale === 'tr' ? (image.altTr ?? title) : (image.altEn ?? title)}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#999] text-sm font-[family-name:var(--font-serif)] italic">{title}</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#999]">{product.category}</p>
        <h3 className="mt-1 text-sm text-[#1a1a1a]">{title}</h3>
        {priceDisplay && (
          <p className="mt-0.5 text-[13px] text-[#6b6b6b]">{priceDisplay}</p>
        )}
      </div>
    </Link>
  )
}
