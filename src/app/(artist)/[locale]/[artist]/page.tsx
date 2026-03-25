import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getArtistBySlug } from '@/lib/queries/artist'
import BioSection from '@/components/artist/bio-section'
import StatementSection from '@/components/artist/statement-section'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}): Promise<Metadata> {
  const { locale, artist } = await params
  const data = await getArtistBySlug(artist)
  const t = await getTranslations({ locale, namespace: 'meta' })

  if (!data) {
    const name = artist.charAt(0).toUpperCase() + artist.slice(1)
    return { title: `${name} | U-Art` }
  }

  const name =
    locale === 'tr'
      ? (data.nameTr ?? data.nameEn ?? artist)
      : (data.nameEn ?? data.nameTr ?? artist)

  return {
    title: t('artistTitle', { name }),
    description: t('artistDesc', { name }),
    openGraph: data.photoUrl
      ? { images: [{ url: data.photoUrl }] }
      : undefined,
  }
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const data = await getArtistBySlug(artist)
  if (!data) notFound()

  const hasStatement = Boolean(data.statementTr || data.statementEn)

  return (
    <main className="py-8 sm:py-12 lg:py-16">
      <BioSection artist={data} locale={locale} />
      {hasStatement && <StatementSection artist={data} locale={locale} />}
    </main>
  )
}
