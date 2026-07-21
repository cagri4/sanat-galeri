import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { COLLECTIONS } from '@/lib/categories'
import Reveal from '@/components/motion/reveal'
import { staggerDelay } from '@/lib/motion'
import ArtworkCard from './artwork-card'

type ProductWithImage = Awaited<ReturnType<typeof getProducts>>[number]

interface ArtworkGridProps {
  products: ProductWithImage[]
  locale: string
  /** Aktif kategori — boş durumda "içerik yakında" mesajını kişiselleştirir. */
  category?: string | null
}

export default async function ArtworkGrid({ products, locale, category }: ArtworkGridProps) {
  const t = await getTranslations({ locale, namespace: 'gallery' })
  const isTr = locale === 'tr'

  if (products.length === 0) {
    // Henüz eser girilmemiş kategori: hata gibi değil, sakin bir bekleme durumu.
    const collections = category ? (COLLECTIONS[category] ?? []) : []
    return (
      <div className="py-14 text-center">
        <p className="font-[family-name:var(--font-serif)] text-xl font-light text-[#1a1a1a]">
          {category ? t('comingSoon') : t('emptyState')}
        </p>
        {category && (
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#999]">
            {t('comingSoonBody')}
          </p>
        )}
        {collections.length > 0 && (
          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#bbb]">
              {t('collectionsLabel')}
            </p>
            <ul className="mt-3 space-y-1">
              {collections.map((c) => (
                <li
                  key={c.tr}
                  className="font-[family-name:var(--font-serif)] text-base font-light italic text-[#6b6b6b]"
                >
                  {isTr ? c.tr : c.en}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    // gap-y > gap-x: satirlar arasi nefes, kunye metinlerinin bir sonraki
    // kartin gorseline yapismasini onler.
    <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <Reveal key={product.id} delay={staggerDelay(i)}>
          <ArtworkCard product={product} locale={locale} />
        </Reveal>
      ))}
    </div>
  )
}
