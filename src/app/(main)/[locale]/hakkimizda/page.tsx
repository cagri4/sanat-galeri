import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getCrossDomainLinks } from '@/components/shared/navbar'
import { ARTIST_AVATARS, AVATAR_CLASS } from '@/lib/artist-avatars'
import Reveal from '@/components/motion/reveal'

/**
 * Hakkimizda.
 *
 * ONCEKI HALINDE UYDURMA ICERIK VARDI, KALDIRILDI:
 * - "Tablo, heykel, baski resim" konumlandirmasi (atolye antik donem seramik
 *   replikasi uretiyor).
 * - Melike icin "Akrilik, yagli boya ile calisir", "Istanbul ve uluslararasi
 *   galerilerde sergileri bulunan" — DOGRULANMAMIS sergi iddiasi.
 * - Seref icin "heykel, enstalasyon", "tas ve metal ile calisir".
 * - Uc adet stok Unsplash fotografi; ikisi gercek kisi adiyla etiketliydi.
 *
 * Simdi yalnizca DOGRULANMIS bilgi var: atolyenin ne urettigi (sanatcinin
 * kendi dokumani), gercek atolye gorselleri ve gercek Bozcaada 2010 sergisi.
 * Sanatci basina biyografi metni sanatciDAN gelene kadar YAZILMAZ.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isTr = locale === 'tr'
  return {
    title: isTr ? 'Hakkımızda | U-Art Tasarım' : 'About | U-Art Design',
    description: isTr
      ? 'U-Art Tasarım sanat atölyesi hakkında'
      : 'About U-Art Design art studio',
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isTr = locale === 'tr'
  const tc = await getTranslations({ locale, namespace: 'collection' })

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'
  const domainLinks = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)

  const artists = [
    { slug: 'melike', name: 'Melike Doğan', href: domainLinks.melike },
    { slug: 'seref', name: 'Şeref Doğan', href: domainLinks.seref },
  ]

  return (
    <main className="py-16 sm:py-24">
      <Reveal as="section" className="max-w-2xl">
        <h1 className="text-4xl font-medium leading-[1.1] tracking-[-0.01em] text-[#2C2C2C] sm:text-5xl lg:text-6xl">
          {isTr ? 'Hakkımızda' : 'About Us'}
        </h1>
        <p className="mt-8 max-w-[68ch] text-[length:var(--text-lead)] leading-[1.8] text-[#4a4a4a]">
          {isTr
            ? 'U-Art Tasarım, Melike Doğan ve Şeref Doğan’ın Çanakkale’deki sanat atölyesidir. Atölyede antik dönem seramiklerinin form, bezeme ve ikonografisi araştırılır; eserler terra sigillata tekniğiyle yeniden üretilir.'
            : 'U-Art Design is the Çanakkale studio of Melike Doğan and Şeref Doğan. The studio researches the form, decoration and iconography of ancient ceramics, reproducing works in the terra sigillata technique.'}
        </p>
        {/* Koleksiyon tanitimi — sanatcinin kendi metni */}
        <p className="mt-6 max-w-[68ch] text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]">
          {tc('short')}
        </p>
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2">
          <Link
            href={`/${locale}/teknik`}
            className="group inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#2C2C2C]"
          >
            <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-micro)] ease-out group-hover:bg-[length:100%_1px]">
              {tc('techniqueCta')}
            </span>
          </Link>
          <Link
            href={`/${locale}/sergi/bozcaada-2010`}
            className="inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#2C2C2C]"
          >
            {isTr ? 'Bozcaada Sergisi · 2010' : 'Bozcaada Exhibition · 2010'}
          </Link>
        </div>
      </Reveal>

      {/* Sanatcilar — biyografi metni sanatcidan gelene kadar YAZILMIYOR;
          yalnizca ad, gercek atolye gorseli ve portfolyo baglantisi. */}
      <Reveal as="section" className="mt-24 border-t border-[var(--rule)] pt-16">
        <h2 className="text-3xl font-medium text-[#2C2C2C] sm:text-4xl">
          {isTr ? 'Sanatçılar' : 'Artists'}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2">
          {artists.map((a) => {
            const avatar = ARTIST_AVATARS[a.slug]
            return (
              <a key={a.slug} href={a.href} className="group flex items-center gap-5">
                {avatar && (
                  // Kucuk/yuvarlak: kaynak gorsel dusuk cozunurluklu
                  // (bkz. lib/artist-avatars). Yuksek cozunurluklu orijinal
                  // gelince degistirilecek.
                  <Image
                    src={avatar.src}
                    alt={isTr ? avatar.alt.tr : avatar.alt.en}
                    width={320}
                    height={320}
                    className={`h-20 w-20 shrink-0 sm:h-24 sm:w-24 ${AVATAR_CLASS}`}
                  />
                )}
                <div>
                  <h3 className="text-2xl font-medium text-[#2C2C2C]">
                    {a.name}
                  </h3>
                  <span className="mt-2 inline-block text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] group-hover:text-[var(--accent)]">
                    {isTr ? 'Portfolyoyu Gör' : 'View Portfolio'} &rarr;
                  </span>
                </div>
              </a>
            )
          })}
        </div>

        <p className="mt-12 max-w-[68ch] border-l border-[var(--rule)] pl-5 text-[length:var(--text-meta)] leading-relaxed text-[#999]">
          {isTr
            ? 'Sanatçı biyografileri ve sergi geçmişi sanatçılardan geldikçe bu sayfaya eklenecektir.'
            : 'Artist biographies and exhibition histories will be added to this page as they are provided by the artists.'}
        </p>
      </Reveal>
    </main>
  )
}
