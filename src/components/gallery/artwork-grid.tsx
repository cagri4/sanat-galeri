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
        <p className="text-xl font-medium text-[#2C2C2C]">
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
                <li key={c.tr} className="text-base italic text-[#6b6b6b]">
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
    // REDESIGN: 3 sutun, ~1:1 kare, tile arasi ~24px. Kart kunyesi hover'da
    // gorselin ustunde belirdigi icin satir arasi ekstra bosluga gerek yok;
    // izgara ciplak gorsel duvari gibi durur. Mobilde 2 sutun.
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
      {products.map((product, i) => (
        <Reveal key={product.id} delay={staggerDelay(i)}>
          <ArtworkCard product={product} locale={locale} />
        </Reveal>
      ))}
    </div>
  )
}
