import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'

type ProductWithImage = Awaited<ReturnType<typeof getProducts>>[number]

interface ArtworkCardProps {
  product: ProductWithImage
  locale: string
}

export default async function ArtworkCard({ product, locale }: ArtworkCardProps) {
  const t = await getTranslations({ locale, namespace: 'gallery' })
  const title = locale === 'tr' ? product.titleTr : product.titleEn
  const image = product.images[0]
  const categoryLabel = t.has(`categories.${product.category}`)
    ? t(`categories.${product.category}`)
    : product.category

  const priceDisplay =
    product.price != null
      ? `${Number(product.price).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')} ${product.currency ?? 'TRY'}`
      : null

  return (
    <Link
      href={`/${locale}/urun/${product.slug}`}
      className="group block cursor-pointer focus-visible:outline-none"
    >
      {/* media-zoom: gorsel gecisi yalnizca bu kapsayicida gecerli.
          Zoom 1.03 -> 1.02: muze sukuneti, hareket fark edilir olmasin. */}
      <div className="media-zoom relative aspect-[3/4] w-full overflow-hidden bg-[#f0ece4] group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-3 group-focus-visible:outline-[var(--accent)]">
        {image?.url ? (
          <>
            <Image
              src={image.url}
              alt={locale === 'tr' ? (image.altTr ?? title) : (image.altEn ?? title)}
              fill
              className="object-cover group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Cok hafif koyulasma: kartin tiklanabilir oldugunu belli eder,
                gorseli bogmadan. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[#1a1a1a] opacity-0 transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[0.04]"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="font-[family-name:var(--font-serif)] text-sm italic text-[#999]">
              {title}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
          {categoryLabel}
        </p>
        {/* Baslik serif: kart kunyesi ile eser sayfasi ayni dili konussun.
            Alt cizgi hover'da soldan acilir — layout kaydirmayan mikro etkilesim. */}
        <h3 className="mt-1.5 font-[family-name:var(--font-serif)] text-lg font-light leading-snug text-[#1a1a1a]">
          <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-[var(--dur-micro)] ease-out group-hover:bg-[length:100%_1px]">
            {title}
          </span>
        </h3>
        {priceDisplay && (
          <p className="mt-1 text-[length:var(--text-meta)] text-[#6b6b6b]">{priceDisplay}</p>
        )}
      </div>
    </Link>
  )
}
