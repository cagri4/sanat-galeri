import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from './language-switcher'

export function getCrossDomainLinks(
  locale: string,
  mainUrl: string,
  melikeUrl: string,
  serefUrl: string
) {
  return {
    main: `${mainUrl}/${locale}`,
    gallery: `${mainUrl}/${locale}/galeri`,
    melike: `${melikeUrl}/${locale}`,
    seref: `${serefUrl}/${locale}`,
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
    <header className="border-b border-neutral-200">
      <nav className="flex items-center justify-between py-4">
        <a
          href={links.main}
          className="text-base font-semibold tracking-tight text-neutral-900 hover:text-neutral-700"
        >
          {t('siteTitle')}
        </a>

        <div className="flex items-center gap-1 sm:gap-6">
          <a
            href={links.gallery}
            className="px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            {t('gallery')}
          </a>
          <span className="text-neutral-300">|</span>
          <a
            href={links.melike}
            className="px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Melike
          </a>
          <span className="text-neutral-300">|</span>
          <a
            href={links.seref}
            className="px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Şeref
          </a>
          <span className="text-neutral-300">|</span>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  )
}
