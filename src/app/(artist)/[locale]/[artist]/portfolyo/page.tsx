import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getArtistBySlug, getArtistPortfolio } from '@/lib/queries/artist'
import PortfolioGallery from '@/components/artist/portfolio-gallery'

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

  return {
    title: t('portfolioTitle', { name }),
  }
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const data = await getArtistBySlug(artist)
  if (!data) notFound()

  const items = await getArtistPortfolio(data.id)
  const t = await getTranslations({ locale, namespace: 'cv' })

  return (
    <main className="py-8 sm:py-12 lg:py-16">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight mb-8 sm:mb-12">
        {t('portfolioTitle')}
      </h1>

      {items.length === 0 ? (
        <p className="text-base sm:text-lg text-neutral-500">{t('noPortfolio')}</p>
      ) : (
        <PortfolioGallery items={items} locale={locale} />
      )}
    </main>
  )
}
