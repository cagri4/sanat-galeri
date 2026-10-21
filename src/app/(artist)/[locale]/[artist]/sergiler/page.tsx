import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getArtistBySlug, getArtistExhibitions } from '@/lib/queries/artist'
import ExhibitionList from '@/components/artist/exhibition-list'
import LightboxViewer from '@/components/gallery/lightbox-viewer'
import { sergiFotolari } from '@/lib/sanatci-sayfa'
import PressList from '@/components/artist/press-list'

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
  return { title: t('exhibitionsTitle', { name }) }
}

export default async function ExhibitionsPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const t = await getTranslations({ locale, namespace: 'cv' })

  const data = await getArtistBySlug(artist)
  if (!data) notFound()

  // 21 Eki (ablam): sergi ADLARI yazılmaz — yalnız fotoğraflar. Ödüller listesi sergi değil, korunur.
  const exhibitions = (await getArtistExhibitions(data.id)).filter((e) => e.type === 'odul')
  const isTr = locale === 'tr'
  const ad = (isTr ? (data.nameTr ?? data.nameEn) : (data.nameEn ?? data.nameTr)) ?? artist
  const fotolar = await sergiFotolari(artist, isTr, ad)

  return (
    <main className="py-8 sm:py-12 lg:py-16">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight mb-10">
        {t('exhibitionsTitle')}
      </h1>
      <div className="space-y-12">
        {fotolar.length > 0 && <LightboxViewer slides={fotolar} thumbnails={fotolar} />}
        <ExhibitionList exhibitions={exhibitions} locale={locale} />
        <PressList artistId={data.id} locale={locale} />
      </div>
    </main>
  )
}
