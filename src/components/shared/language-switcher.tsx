'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/lib/i18n/navigation'

export function getLanguageLinks(currentLocale: string, pathname: string) {
  return [
    { locale: 'tr', href: pathname, active: currentLocale === 'tr' },
    { locale: 'en', href: pathname, active: currentLocale === 'en' },
  ]
}

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const links = getLanguageLinks(locale, pathname)

  return (
    <div className="flex items-center gap-2 text-sm">
      {links.map((link, idx) => (
        <span key={link.locale} className="flex items-center gap-2">
          {idx > 0 && <span className="text-neutral-300">|</span>}
          <Link
            href={link.href}
            locale={link.locale}
            className={
              link.active
                ? 'font-semibold'
                : 'text-neutral-500 hover:text-neutral-900'
            }
          >
            {link.locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  )
}
