import { getTranslations } from 'next-intl/server'
import { getArtistBySlug } from '@/lib/queries/artist'

type ArtistType = Awaited<ReturnType<typeof getArtistBySlug>>

interface StatementSectionProps {
  artist: NonNullable<ArtistType>
  locale: string
}

export default async function StatementSection({ artist, locale }: StatementSectionProps) {
  const statement =
    locale === 'tr'
      ? (artist.statementTr ?? artist.statementEn ?? null)
      : (artist.statementEn ?? artist.statementTr ?? null)

  if (!statement) return null

  const t = await getTranslations({ locale, namespace: 'cv' })

  return (
    <section className="mt-12 sm:mt-16">
      <div className="border-l-4 border-neutral-800 pl-6 py-2">
        <h2 className="text-lg font-medium text-neutral-500 uppercase tracking-widest mb-4">
          {t('statementTitle')}
        </h2>
        <p className="text-base sm:text-lg text-neutral-700 leading-relaxed italic whitespace-pre-line">
          {statement}
        </p>
      </div>
    </section>
  )
}
