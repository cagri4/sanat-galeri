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
    about: buildDomainLink(mainUrl, `/${locale}/hakkimizda`),
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
    <header className="relative border-b border-[#e8e4de]">
      <nav className="flex items-center justify-between py-7">
        <a
          href={links.main}
          className="group inline-flex min-h-11 items-center gap-3 text-[#1a1a1a] transition-colors duration-[var(--dur-micro)] hover:text-[var(--accent)]"
        >
          {/* Logo markasi 40px'te ic yazisi okunmaz, o yuzden yaninda serif
              kelime markasi duruyor; erisilebilirlik icin alt bos birakildi
              (bitisikteki metin zaten adi soyluyor). */}
          <Image
            src="/brand/uart-logo.png"
            alt=""
            width={150}
            height={150}
            priority
            className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
          />
          <span className="font-[family-name:var(--font-serif)] text-xl font-light tracking-wide sm:text-2xl">
            U-Art Tasarım
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-8">
          <a href={links.gallery} className="relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#1a1a1a] after:transition-transform after:duration-[var(--dur-micro)] after:ease-out hover:after:scale-x-100">
            {t('gallery')}
          </a>
          <a href={links.technique} className="relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#1a1a1a] after:transition-transform after:duration-[var(--dur-micro)] after:ease-out hover:after:scale-x-100">
            {t('technique')}
          </a>
          <a href={links.exhibition} className="relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#1a1a1a] after:transition-transform after:duration-[var(--dur-micro)] after:ease-out hover:after:scale-x-100">
            {t('exhibitions')}
          </a>
          <a href={links.about} className="relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#1a1a1a] after:transition-transform after:duration-[var(--dur-micro)] after:ease-out hover:after:scale-x-100">
            {t('about')}
          </a>
          <a href={links.contact} className="relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#1a1a1a] after:transition-transform after:duration-[var(--dur-micro)] after:ease-out hover:after:scale-x-100">
            {t('contact')}
          </a>
          <a href={links.melike} className="relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#1a1a1a] after:transition-transform after:duration-[var(--dur-micro)] after:ease-out hover:after:scale-x-100">
            Melike
          </a>
          <a href={links.seref} className="relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#1a1a1a] after:transition-transform after:duration-[var(--dur-micro)] after:ease-out hover:after:scale-x-100">
            Şeref
          </a>
          <LanguageSwitcher />
        </div>

        {/* Mobile hamburger */}
        <MobileMenu
          links={{ gallery: links.gallery, technique: links.technique, exhibition: links.exhibition, about: links.about, contact: links.contact, melike: links.melike, seref: links.seref }}
          labels={{ gallery: t('gallery'), technique: t('technique'), exhibition: t('exhibitions'), about: t('about'), contact: t('contact') }}
        />
      </nav>
    </header>
  )
}
