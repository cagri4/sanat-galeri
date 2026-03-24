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
      ? `${product.currency ?? 'TRY'} ${Number(product.price).toLocaleString('tr-TR')}`
      : null

  return (
    <Link
      href={`/${locale}/urun/${product.slug}`}
      className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
    >
      <div className="relative aspect-[3/4] w-full bg-neutral-100">
        {image?.url ? (
          <Image
            src={image.url}
            alt={locale === 'tr' ? (image.altTr ?? title) : (image.altEn ?? title)}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {product.isSold && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {locale === 'tr' ? 'Satıldı' : 'Sold'}
          </div>
        )}
      </div>

      <div className="p-3">
        <span className="inline-block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">
          {title}
        </h3>
        {priceDisplay && (
          <p className="mt-1 text-sm font-medium text-neutral-700">{priceDisplay}</p>
        )}
      </div>
    </Link>
  )
}
