import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { routing } from '@/lib/i18n/routing'
import Navbar from '@/components/shared/navbar'
import Footer from '@/components/shared/footer'
import ContactWidget from '@/components/shared/contact-widget'
import ArtistNav from '@/components/artist/artist-nav'
import { getArtistBySlug } from '@/lib/queries/artist'
import { ARTIST_AVATARS, AVATAR_CLASS } from '@/lib/artist-avatars'

const VALID_ARTISTS = ['melike', 'seref']

/**
 * Sanatci bolumu kabugu.
 *
 * Baslik bandi ve alt navigasyon bilerek LAYOUT'ta duruyor: daha once ikisi de
 * yalnizca sanatci ana sayfasindaydi, bu yuzden Portfolyo/Sergiler/Iletisim
 * sayfalarina gecildiginde sekmeler ve sanatci basligi ekrandan kayboluyordu.
 */
export default async function ArtistLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  if (!routing.locales.includes(locale as never)) notFound()
  if (!VALID_ARTISTS.includes(artist)) notFound()

  const messages = await getMessages()
  const isTr = locale === 'tr'

  let data: Awaited<ReturnType<typeof getArtistBySlug>> | null = null
  try { data = await getArtistBySlug(artist) } catch {}

  const name = data
    ? ((isTr ? (data.nameTr ?? data.nameEn) : (data.nameEn ?? data.nameTr)) ?? artist)
    : artist.charAt(0).toUpperCase() + artist.slice(1)

  // Atolye profil gorseli — kucuk/yuvarlak kullanilir (bkz. lib/artist-avatars).
  const avatar = ARTIST_AVATARS[artist]

  return (
    <NextIntlClientProvider messages={messages}>
      {/* `w-full min-w-0` — ana site kabuguyla ayni. Kabuk `body`nin flex
          ogesi; `w-full` olmadan max-content genisligine buyuyor ve 390px'te
          52px yatay tasma olusuyordu (`overflow-x-hidden` bunu gizliyordu,
          o yuzden o da kaldirildi — gercek tasma bir daha maskelenmesin). */}
      <div className="mx-auto w-full min-w-0 max-w-6xl px-6 sm:px-10 lg:px-16">
        <Navbar locale={locale} domain={artist as 'melike' | 'seref'} />

        <header className="full-bleed bg-[#f2f1ec]">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-14 text-center sm:px-10 sm:py-18 lg:px-16">
            {avatar && (
              <Image
                src={avatar.src}
                alt={isTr ? avatar.alt.tr : avatar.alt.en}
                width={320}
                height={320}
                priority
                className={`mb-6 h-24 w-24 sm:h-28 sm:w-28 ${AVATAR_CLASS}`}
              />
            )}
            <h1 className="text-4xl font-medium tracking-[-0.01em] text-[#2C2C2C] sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            <p className="mt-4 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
              Uarttasarım · Çanakkale
            </p>
          </div>
        </header>

        <ArtistNav locale={locale} artist={artist} />

        {children}
        <Footer locale={locale} />
      </div>
      {/* Ana sitedeki ile ayni sabit iletisim dugmesi + modal (/api/contact). */}
      <ContactWidget />
    </NextIntlClientProvider>
  )
}
