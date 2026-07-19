import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getArtistBySlug } from '@/lib/queries/artist'
import { getProductsByArtist } from '@/lib/queries/gallery'
import Reveal from '@/components/motion/reveal'
import { staggerDelay } from '@/lib/motion'

/**
 * HATA DUZELTMESI (2026-07-20)
 * Bu sayfa eskiden `getArtistPortfolio()` ile `portfolio_items` tablosunu
 * okuyordu. O tablo BOS (0 satir) — sanatcinin eserleri `products` tablosunda
 * duruyor. Sonuc: eserler DB'de oldugu halde sayfa "Henuz portfolyo eklenmedi"
 * diyordu. Artik ana galeriyle ayni kaynagi (`products`) kullaniyor, boylece
 * admin panelinden eser eklendiginde portfolyo da kendiliginden guncelleniyor.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}): Promise<Metadata> {
  const { locale, artist } = await params
  const data = await getArtistBySlug(artist)
  const t = await getTranslations({ locale, namespace: 'meta' })

  if (!data) return {}

  const name =
    locale === 'tr'
      ? (data.nameTr ?? data.nameEn ?? artist)
      : (data.nameEn ?? data.nameTr ?? artist)

  return { title: t('portfolioTitle', { name }) }
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const isTr = locale === 'tr'

  const data = await getArtistBySlug(artist)
  if (!data) notFound()

  const items = await getProductsByArtist(data.id)
  const t = await getTranslations({ locale, namespace: 'cv' })

  return (
    <main className="py-14 sm:py-20">
      <h1 className="font-[family-name:var(--font-serif)] text-3xl font-light tracking-[-0.01em] text-[#1a1a1a] sm:text-4xl">
        {t('portfolioTitle')}
      </h1>
      <p className="mt-3 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#999]">
        {t('workCount', { count: items.length })}
      </p>

      {items.length === 0 ? (
        <p className="mt-10 max-w-[60ch] text-[length:var(--text-body)] leading-[1.9] text-[#6b6b6b]">
          {t('noPortfolio')}
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
          {items.map((item, i) => {
            const title = isTr ? item.titleTr : item.titleEn
            const image = item.images?.[0]
            return (
              <Reveal key={item.id} delay={staggerDelay(i)}>
                <Link href={`/${locale}/urun/${item.slug}`} className="media-zoom group block">
                  <div className="aspect-[3/4] overflow-hidden bg-[#f0ece4]">
                    {image && (
                      <img
                        src={image.url}
                        alt={(isTr ? image.altTr : image.altEn) ?? title}
                        loading={i < 4 ? 'eager' : 'lazy'}
                        className="h-full w-full object-cover transition-transform duration-[var(--dur-image)] group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <h2 className="mt-4 font-[family-name:var(--font-serif)] text-lg font-light leading-snug text-[#1a1a1a]">
                    {title}
                  </h2>
                  {item.category && (
                    <p className="mt-1 text-[length:var(--text-meta)] text-[#8a8a8a]">
                      {item.category}
                    </p>
                  )}
                </Link>
              </Reveal>
            )
          })}
        </div>
      )}
    </main>
  )
}
