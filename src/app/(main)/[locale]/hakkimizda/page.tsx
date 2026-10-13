import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getCrossDomainLinks } from '@/components/shared/navbar'
import { ARTIST_AVATARS, AVATAR_CLASS } from '@/lib/artist-avatars'
import PageBanner from '@/components/shared/page-banner'
import { atolyeFotolari } from '@/lib/banner-images'
import { staggerDelay } from '@/lib/motion'
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
    title: isTr ? 'Hakkımızda | Uarttasarım' : 'About | Uarttasarım',
    description: isTr
      ? 'Uarttasarım sanat atölyesi hakkında'
      : 'About Uarttasarım art studio',
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
  const ta = await getTranslations({ locale, namespace: 'about' })

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'
  const domainLinks = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)
  // Banner + "Atölyeden" ızgarası: sanatçının atölye fotoğrafları (11 Eki 22:07
  // isteği, 13 Eki 21:25'te yüklendi). Kişiler adlandırılmaz.
  const { photos: atolye, banner } = await atolyeFotolari()
  const ta2 = await getTranslations({ locale, namespace: 'home' })

  const artists = [
    { slug: 'melike', name: 'Melike Doğan', href: domainLinks.melike },
    { slug: 'seref', name: 'Şeref Doğan', href: domainLinks.seref },
  ]

  return (
    <main className="pb-16 pt-8 sm:pb-24 sm:pt-10">
      <PageBanner title={isTr ? 'Hakkımızda' : 'About Us'} image={banner} />
      <Reveal as="section" className="mt-12 max-w-2xl">
        {/* Sanatcinin kendi Hakkimizda metni (Drive: Hakkimizda.docx) — aynen. */}
        <p className="max-w-[68ch] text-[length:var(--text-lead)] leading-[1.8] text-[#4a4a4a]">
          {ta('lead')}
        </p>
        <div className="mt-6 max-w-[68ch] space-y-5">
          {ta('body').split('\n\n').filter(Boolean).map((para, i) => (
            <p key={i} className="text-[length:var(--text-body)] leading-[1.85] text-[#4a4a4a]">
              {para}
            </p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2">
          <Link
            href={`/${locale}/koleksiyonlar/antik-donem-replikalari#terra-sigillata`}
            className="group inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#2C2C2C]"
          >
            <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-micro)] ease-[var(--ease)] group-hover:bg-[length:100%_1px]">
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

      {atolye.length > 0 && (
        <Reveal as="section" className="mt-24 border-t border-[var(--rule)] pt-16">
          <h2 className="text-3xl font-medium text-[#2C2C2C] sm:text-4xl">{ta2('fromStudio')}</h2>
          {/* Sabit oranlı ızgara: yüklenirken kayma yok (CLS). */}
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {atolye.map((f, i) => (
              <Reveal as="li" key={f.id} delay={staggerDelay(i % 8)} className="relative aspect-[4/5] overflow-hidden bg-[#ece7de]">
                <Image
                  src={f.url}
                  alt={ta2('studioAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </Reveal>
            ))}
          </ul>
        </Reveal>
      )}

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

        <p className="mt-12 max-w-[68ch] border-l border-[var(--rule)] pl-5 text-[length:var(--text-meta)] leading-relaxed text-[var(--faint)]">
          {isTr
            ? 'Sanatçı biyografileri ve sergi geçmişi sanatçılardan geldikçe bu sayfaya eklenecektir.'
            : 'Artist biographies and exhibition histories will be added to this page as they are provided by the artists.'}
        </p>
      </Reveal>
    </main>
  )
}
