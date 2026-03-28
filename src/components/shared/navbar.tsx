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
      <nav className="flex items-center justify-between py-6">
        <a
          href={links.main}
          className="font-[family-name:var(--font-serif)] text-xl sm:text-2xl font-light tracking-wide text-[#1a1a1a] hover:opacity-70 transition-opacity"
        >
          U-Art Tasarım
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-8">
          <a href={links.gallery} className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
            {t('gallery')}
          </a>
          <a href={links.about} className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
            {t('about')}
          </a>
          <a href={links.melike} className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
            Melike
          </a>
          <a href={links.seref} className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
            Şeref
          </a>
          <LanguageSwitcher />
        </div>

        {/* Mobile hamburger */}
        <MobileMenu
          links={{ gallery: links.gallery, about: links.about, melike: links.melike, seref: links.seref }}
          labels={{ gallery: t('gallery'), about: t('about') }}
        />
      </nav>
    </header>
  )
}
