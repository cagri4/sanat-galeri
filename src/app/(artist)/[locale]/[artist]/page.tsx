import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}): Promise<Metadata> {
  const { artist } = await params
  const name = artist.charAt(0).toUpperCase() + artist.slice(1)
  return { title: `${name} | U-Art`, description: `${name} - artist portfolio` }
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  return (
    <main className="py-8 sm:py-12 lg:py-16">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight capitalize">
        {artist}
      </h1>
      <p className="mt-4 text-base sm:text-lg text-neutral-600">
        {t('loading')}
      </p>
    </main>
  )
}
