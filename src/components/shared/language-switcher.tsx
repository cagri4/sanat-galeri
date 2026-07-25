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
    <div className="flex items-center gap-1 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)]">
      {links.map((link, idx) => (
        <span key={link.locale} className="flex items-center gap-1">
          {idx > 0 && <span className="text-[#d4cfc7]">/</span>}
          <Link
            href={link.href}
            locale={link.locale}
            aria-current={link.active ? 'true' : undefined}
            className={`inline-flex min-h-11 items-center px-1.5 transition-colors duration-[var(--dur-micro)] ${
              link.active
                ? 'font-medium text-[#2C2C2C]'
                : 'text-[#6b6b6b] hover:text-[#2C2C2C]'
            }`}
          >
            {link.locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  )
}
