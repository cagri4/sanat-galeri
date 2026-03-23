import { useTranslations } from 'next-intl'

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ artist: string }>
}) {
  const { artist } = await params
  const t = useTranslations('common')
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
