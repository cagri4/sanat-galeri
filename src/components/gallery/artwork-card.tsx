import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'

type ProductWithImage = Awaited<ReturnType<typeof getProducts>>[number]

interface ArtworkCardProps {
  product: ProductWithImage
  locale: string
}

/**
 * REDESIGN (sevaceramics referansi):
 * - ~1:1 kare oran.
 * - Grid'de SABIT ALTYAZI YOK. Eser adi + kategori yalnizca HOVER/FOCUS'ta
 *   gorselin alt seridinde ince bir katman olarak belirir. Boylece grid
 *   ciplak gorsel duvari gibi durur; renk fotograftan gelir.
 * - Dokunmatikte hover yok; erisilebilirlik icin ad `sr-only` olarak da var
 *   ve kartin aria-label'i tam adi tasir.
 */
export default async function ArtworkCard({ product, locale }: ArtworkCardProps) {
  const t = await getTranslations({ locale, namespace: 'gallery' })
  const title = locale === 'tr' ? product.titleTr : product.titleEn
  const image = product.images[0]
  const categoryLabel = t.has(`categories.${product.category}`)
    ? t(`categories.${product.category}`)
    : product.category

  return (
    <Link
      href={`/${locale}/urun/${product.slug}`}
      aria-label={title}
      className="group relative block cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="media-zoom relative aspect-square w-full overflow-hidden bg-[#f0efe9]">
        {image?.url ? (
          <Image
            src={image.url}
            alt={locale === 'tr' ? (image.altTr ?? title) : (image.altEn ?? title)}
            fill
            className="object-cover group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="text-sm italic text-[#999]">{title}</span>
          </div>
        )}

        {/* Hover/focus kunyesi — gorselin altina yumusak bir katman.
            Cikis: opacity + hafif yukari kayma. Dokunmatikte gorunmez,
            bilgi asagidaki sr-only'de + aria-label'de. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-4 pb-4 pt-10 opacity-0 transition-all duration-[var(--dur-micro)] ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-white/70">
            {categoryLabel}
          </p>
          <h3 className="mt-1 text-base font-medium leading-snug text-white">{title}</h3>
        </div>
      </div>

      <span className="sr-only">{title}</span>
    </Link>
  )
}
