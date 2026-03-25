import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getArtistBySlug } from '@/lib/queries/artist'
import ArtistContactForm from '@/components/artist/artist-contact-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}): Promise<Metadata> {
  const { locale, artist } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const data = await getArtistBySlug(artist)
  if (!data) return {}
  const name = data.nameTr ?? artist
  return { title: t('contactTitle', { name }) }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const t = await getTranslations({ locale, namespace: 'cv' })

  const data = await getArtistBySlug(artist)
  if (!data) notFound()

  return (
    <main className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight mb-2">
          {t('contactTitle')}
        </h1>
        <p className="text-base text-neutral-600 mb-8">{data.nameTr}</p>

        {(data.email || data.whatsapp) && (
          <div className="mb-8 flex flex-col gap-2">
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="text-sm text-neutral-700 hover:text-neutral-900 underline underline-offset-2"
              >
                {data.email}
              </a>
            )}
            {data.whatsapp && (
              <a
                href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-700 hover:text-neutral-900 underline underline-offset-2"
              >
                WhatsApp: {data.whatsapp}
              </a>
            )}
          </div>
        )}

        <ArtistContactForm artistSlug={data.slug} />
      </div>
    </main>
  )
}
