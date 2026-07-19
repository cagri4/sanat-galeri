import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { getArtistBySlug, getArtistPortfolio, getArtistExhibitions } from '@/lib/queries/artist'
import { getProductsByArtist } from '@/lib/queries/gallery'
import { ARTIST_AVATARS, AVATAR_CLASS } from '@/lib/artist-avatars'
import ArtistNav from '@/components/artist/artist-nav'

// NOT: Burada daha once stok fotograflar vardi ve gercek kisi adiyla
// etiketleniyordu (alt="Melike Dogan") — kaldirildi. Artik baslik bandinda
// sanatcinin gercek atolye gorseli yuvarlak avatar olarak kullaniliyor
// (bkz. lib/artist-avatars).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}): Promise<Metadata> {
  const { locale, artist } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })

  let data: Awaited<ReturnType<typeof getArtistBySlug>> | null = null
  try { data = await getArtistBySlug(artist) } catch {}

  const name = data
    ? (locale === 'tr' ? (data.nameTr ?? data.nameEn) : (data.nameEn ?? data.nameTr)) ?? artist
    : artist.charAt(0).toUpperCase() + artist.slice(1)

  return {
    title: t('artistTitle', { name }),
    description: t('artistDesc', { name }),
    openGraph: data?.photoUrl ? { images: [{ url: data.photoUrl }] } : undefined,
  }
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const isTr = locale === 'tr'

  let data: Awaited<ReturnType<typeof getArtistBySlug>> | null = null
  let works: Awaited<ReturnType<typeof getProductsByArtist>> = []
  let exhibitions: Awaited<ReturnType<typeof getArtistExhibitions>> = []

  try {
    data = await getArtistBySlug(artist)
    if (data?.id) {
      ;[works, exhibitions] = await Promise.all([
        getProductsByArtist(data.id, 4),
        getArtistExhibitions(data.id),
      ])
    }
  } catch {}

  const name = data
    ? (isTr ? (data.nameTr ?? data.nameEn) : (data.nameEn ?? data.nameTr)) ?? artist
    : artist.charAt(0).toUpperCase() + artist.slice(1)

  const bio = data ? (isTr ? (data.bioTr ?? data.bioEn) : (data.bioEn ?? data.bioTr)) : null
  const statement = data ? (isTr ? (data.statementTr ?? data.statementEn) : (data.statementEn ?? data.statementTr)) : null
  // Hero gorseli: sanatcinin kendi eserlerinden ilki. Portre/atolye
  // fotografi gelince HERO_IMAGES uzerinden gecilecek.
  // Atolye profil gorseli — kucuk/yuvarlak kullanilir (bkz. lib/artist-avatars).
  const avatar = ARTIST_AVATARS[artist]
  const soloCount = exhibitions.filter(e => e.type === 'solo_sergi').length
  const groupCount = exhibitions.filter(e => e.type === 'grup_sergi').length

  return (
    <main>
      {/* Baslik bandi — sade.
          Onceki halinde eser fotografi tam ekran object-cover ile arka plana
          konuyordu; kap asiri buyuyup dokuya donusuyor, ustundeki beyaz metin
          ve yuvarlak avatar okunmuyordu. Eserler zaten asagidaki portfolyoda
          hakkiyla gosteriliyor, bu yuzden baslik sakin bir bant oldu. */}
      <section className="full-bleed bg-[#f4f0e9]">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-16">
          {avatar && (
            <Image
              src={avatar.src}
              alt={isTr ? avatar.alt.tr : avatar.alt.en}
              width={320}
              height={320}
              priority
              className={`mb-7 h-28 w-28 sm:h-32 sm:w-32 ${AVATAR_CLASS}`}
            />
          )}
          <h1 className="font-[family-name:var(--font-serif)] text-4xl font-light tracking-[-0.01em] text-[#1a1a1a] sm:text-5xl lg:text-6xl">
            {name}
          </h1>
          {soloCount + groupCount > 0 && (
            <p className="mt-4 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
              {soloCount > 0 && `${soloCount} ${isTr ? 'solo sergi' : 'solo exhibitions'}`}
              {soloCount > 0 && groupCount > 0 && ' · '}
              {groupCount > 0 && `${groupCount} ${isTr ? 'grup sergisi' : 'group exhibitions'}`}
            </p>
          )}
        </div>
      </section>

      {/* Artist sub-navigation */}
      <ArtistNav locale={locale} artist={artist} />

      {/* Bio Section */}
      {bio && (
        <section className="py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
            {data?.photoUrl && (
              <div className="md:col-span-2">
                <div className="aspect-[3/4] relative overflow-hidden bg-[#f0ece4]">
                  <Image
                    src={data.photoUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
              </div>
            )}
            <div className={data?.photoUrl ? 'md:col-span-3 md:pt-4' : 'md:col-span-5'}>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-4">
                {isTr ? 'Hakkında' : 'About'}
              </h2>
              <p className="text-[15px] text-[#6b6b6b] leading-[1.9]">{bio}</p>
            </div>
          </div>
        </section>
      )}

      {/* Artist Statement */}
      {statement && (
        <section className="py-12 border-t border-[#e8e4de]">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-6">
            {isTr ? 'Sanatçı Beyanı' : 'Artist Statement'}
          </h2>
          <blockquote className="font-[family-name:var(--font-serif)] text-xl sm:text-2xl font-light leading-relaxed text-[#1a1a1a] italic max-w-3xl border-l-2 border-[#612E49] pl-6">
            {statement}
          </blockquote>
        </section>
      )}

      {/* Recent Works */}
      {works.length > 0 && (
        <section className="py-16 border-t border-[#e8e4de]">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-light text-[#1a1a1a]">
              {isTr ? 'Son Eserler' : 'Recent Works'}
            </h2>
            <Link
              href={`/${locale}/${artist}/portfolyo`}
              className="text-[13px] uppercase tracking-[0.15em] text-[#612E49] hover:text-[#4f243b] transition-colors"
            >
              {isTr ? 'Tümünü Gör' : 'View All'} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {works.map((work) => (
              <Link
                key={work.id}
                href={`/${locale}/urun/${work.slug}`}
                className="group"
              >
                <div className="aspect-[3/4] bg-[#f0ece4] overflow-hidden">
                  {work.images?.[0] ? (
                    <img
                      src={work.images[0].url}
                      alt={isTr ? (work.images[0].altTr ?? work.titleTr) : (work.images[0].altEn ?? work.titleEn)}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[#999] text-xs">{isTr ? work.titleTr : work.titleEn}</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-2 text-sm text-[#1a1a1a]">{isTr ? work.titleTr : work.titleEn}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Fallback if no data */}
      {!data && (
        <section className="py-20 text-center">
          <p className="text-[#6b6b6b]">
            {isTr ? 'Sanatçı sayfası yakında zenginleştirilecek.' : 'Artist page coming soon.'}
          </p>
        </section>
      )}
    </main>
  )
}
