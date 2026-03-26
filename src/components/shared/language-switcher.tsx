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
    <div className="flex items-center gap-1 text-[13px] uppercase tracking-[0.15em]">
      {links.map((link, idx) => (
        <span key={link.locale} className="flex items-center gap-1">
          {idx > 0 && <span className="text-[#d4cfc7]">/</span>}
          <Link
            href={link.href}
            locale={link.locale}
            className={
              link.active
                ? 'text-[#1a1a1a] font-medium'
                : 'text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors'
            }
          >
            {link.locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  )
}
