import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from './language-switcher'
import MobileMenu from './mobile-menu'

export function buildDomainLink(baseUrl: string, path: string): string {
  try {
    const url = new URL(baseUrl)
    url.pathname = path
    return url.toString()
  } catch {
    return `${baseUrl}${path}`
  }
}

function buildArtistLink(mainUrl: string, artistUrl: string, locale: string, artist: string): string {
  // If artist URL is same as main URL → path-based routing (Vercel preview / single domain)
  // If different domain → subdomain routing (production)
  try {
    const main = new URL(mainUrl)
    const art = new URL(artistUrl)
    if (main.hostname === art.hostname) {
      // Same domain: use /locale/artist path
      return buildDomainLink(mainUrl, `/${locale}/${artist}`)
    }
    // Different domain: use subdomain/locale
    return buildDomainLink(artistUrl, `/${locale}`)
  } catch {
    return `/${locale}/${artist}`
  }
}

export function getCrossDomainLinks(
  locale: string,
  mainUrl: string,
  melikeUrl: string,
  serefUrl: string
) {
  return {
    main: buildDomainLink(mainUrl, `/${locale}`),
    gallery: buildDomainLink(mainUrl, `/${locale}/galeri`),
    collections: buildDomainLink(mainUrl, `/${locale}/koleksiyonlar`),
    about: buildDomainLink(mainUrl, `/${locale}/hakkimizda`),
    commissions: buildDomainLink(mainUrl, `/${locale}/ozel-siparis`),
    exhibition: buildDomainLink(mainUrl, `/${locale}/sergi/bozcaada-2010`),
    technique: buildDomainLink(mainUrl, `/${locale}/teknik`),
    contact: buildDomainLink(mainUrl, `/${locale}/iletisim`),
    melike: buildArtistLink(mainUrl, melikeUrl, locale, 'melike'),
    seref: buildArtistLink(mainUrl, serefUrl, locale, 'seref'),
  }
}

interface NavbarProps {
  locale: string
  domain?: 'main' | 'melike' | 'seref'
}

export default async function Navbar({ locale }: NavbarProps) {
  const t = await getTranslations({ locale, namespace: 'nav' })

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? 'https://uarttasarim.com'
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? 'https://melike.uarttasarim.com'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? 'https://seref.uarttasarim.com'

  const links = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)

  return (
    <header className="relative border-b border-[#e9e7e1]">
      <nav className="flex items-center justify-between py-7">
        <a
          href={links.main}
          className="group inline-flex min-h-11 items-center gap-3 text-[#2C2C2C] transition-colors duration-[var(--dur-micro)] hover:text-[var(--accent)]"
        >
          {/* Logo markasi 40px'te ic yazisi okunmaz, o yuzden yaninda kelime
              markasi duruyor; erisilebilirlik icin alt bos birakildi
              (bitisikteki metin zaten adi soyluyor). */}
          <Image
            src="/brand/uart-logo.png"
            alt=""
            width={150}
            height={150}
            priority
            className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
          />
          <span className="text-lg font-medium tracking-tight sm:text-xl">
            U-Art Tasarım
          </span>
        </a>

        {/* Desktop nav — vitrin menusu (5 madde). Teknik/Sergiler artik
            Koleksiyonlar/Hakkinda icinden; sanatcilar footer'da. */}
        <div className="hidden items-center gap-8 sm:flex">
          {[
            { href: links.gallery, label: t('gallery') },
            { href: links.collections, label: t('collections') },
            { href: links.about, label: t('about') },
            { href: links.commissions, label: t('commissions') },
            { href: links.contact, label: t('contact') },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#2C2C2C] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#2C2C2C] after:transition-transform after:duration-[var(--dur-micro)] after:ease-out hover:after:scale-x-100"
            >
              {l.label}
            </a>
          ))}
          <LanguageSwitcher />
        </div>

        {/* Mobile hamburger */}
        <MobileMenu
          links={{ gallery: links.gallery, collections: links.collections, about: links.about, commissions: links.commissions, contact: links.contact }}
          labels={{ gallery: t('gallery'), collections: t('collections'), about: t('about'), commissions: t('commissions'), contact: t('contact') }}
        />
      </nav>
    </header>
  )
}
