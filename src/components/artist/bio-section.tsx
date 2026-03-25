import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getArtistBySlug } from '@/lib/queries/artist'

type ArtistType = Awaited<ReturnType<typeof getArtistBySlug>>

interface BioSectionProps {
  artist: NonNullable<ArtistType>
  locale: string
}

export default async function BioSection({ artist, locale }: BioSectionProps) {
  const t = await getTranslations({ locale, namespace: 'cv' })

  const name = locale === 'tr' ? (artist.nameTr ?? artist.nameEn ?? '') : (artist.nameEn ?? artist.nameTr ?? '')
  const bio = locale === 'tr' ? (artist.bioTr ?? artist.bioEn ?? '') : (artist.bioEn ?? artist.bioTr ?? '')

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Photo column */}
      <div>
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-100">
          {artist.photoUrl ? (
            <Image
              src={artist.photoUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
              <span className="text-neutral-400 text-sm">Fotoğraf yok</span>
            </div>
          )}
        </div>
      </div>

      {/* Text column */}
      <div className="flex flex-col justify-start">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-6">
          {name}
        </h1>
        <h2 className="text-lg font-medium text-neutral-500 uppercase tracking-widest mb-4">
          {t('bioTitle')}
        </h2>
        {bio && (
          <p className="text-base sm:text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
            {bio}
          </p>
        )}
      </div>
    </section>
  )
}
