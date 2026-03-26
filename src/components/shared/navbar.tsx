import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from './language-switcher'

export function buildDomainLink(baseUrl: string, path: string): string {
  try {
    const url = new URL(baseUrl)
    url.pathname = path
    return url.toString()
  } catch {
    return `${baseUrl}${path}`
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
    melike: buildDomainLink(melikeUrl, `/${locale}`),
    seref: buildDomainLink(serefUrl, `/${locale}`),
  }
}

interface NavbarProps {
  locale: string
  domain?: 'main' | 'melike' | 'seref'
}

export default async function Navbar({ locale }: NavbarProps) {
  const t = await getTranslations({ locale, namespace: 'nav' })

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? 'https://uarttasarim.com'
  const MELIKE_URL =
    process.env.NEXT_PUBLIC_MELIKE_URL ?? 'https://melike.uarttasarim.com'
  const SEREF_URL =
    process.env.NEXT_PUBLIC_SEREF_URL ?? 'https://seref.uarttasarim.com'

  const links = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)

  return (
    <header className="border-b border-[#e8e4de]">
      {/* Main nav */}
      <nav className="flex items-center justify-between py-6">
        <a
          href={links.main}
          className="font-[family-name:var(--font-serif)] text-xl sm:text-2xl font-light tracking-wide text-[#1a1a1a] hover:opacity-70 transition-opacity"
        >
          U-Art Tasarım
        </a>

        <div className="flex items-center gap-6 sm:gap-8">
          <a
            href={links.gallery}
            className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            {t('gallery')}
          </a>
          <a
            href={links.about}
            className="hidden sm:inline text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            {t('about')}
          </a>
          <a
            href={links.melike}
            className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            Melike
          </a>
          <a
            href={links.seref}
            className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            Şeref
          </a>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  )
}
