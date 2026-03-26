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
  const t = await getTranslations({ locale, namespace: 'meta' })

  let data: Awaited<ReturnType<typeof getArtistBySlug>> | null = null
  try {
    data = await getArtistBySlug(artist)
  } catch {
    // DB not available
  }

  const name = data
    ? (locale === 'tr'
        ? (data.nameTr ?? data.nameEn ?? artist)
        : (data.nameEn ?? data.nameTr ?? artist))
    : artist.charAt(0).toUpperCase() + artist.slice(1)

  return {
    title: t('artistTitle', { name }),
    description: t('artistDesc', { name }),
    openGraph: data?.photoUrl
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

  let data: Awaited<ReturnType<typeof getArtistBySlug>> | null = null
  try {
    data = await getArtistBySlug(artist)
  } catch {
    // DB not available — show fallback
  }

  if (!data) {
    const displayName = artist.charAt(0).toUpperCase() + artist.slice(1)
    return (
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900">
            {displayName}
          </h1>
          <p className="mt-4 text-lg text-neutral-500">
            {locale === 'tr'
              ? 'Sanatçı sayfası yakında yayında olacak.'
              : 'Artist page coming soon.'}
          </p>
        </div>
      </main>
    )
  }

  const hasStatement = Boolean(data.statementTr || data.statementEn)

  return (
    <main className="py-8 sm:py-12 lg:py-16">
      <BioSection artist={data} locale={locale} />
      {hasStatement && <StatementSection artist={data} locale={locale} />}
    </main>
  )
}
