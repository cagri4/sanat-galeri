'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

/**
 * Sanatci alt navigasyonu.
 *
 * ONEMLI: Bu bilesen `layout.tsx` icinde render edilir; daha once yalnizca
 * sanatci ANA sayfasinda (page.tsx) duruyordu, bu yuzden "Portfolyo" veya
 * "Sergiler"e gecince tum sekmeler kayboluyor ve kullanici geri donemiyordu.
 * Layout'ta durdugu icin dort sayfada da gorunur.
 *
 * Client bilesen olmasinin tek sebebi aktif sekmeyi isaretlemek (usePathname).
 */

interface ArtistNavProps {
  locale: string
  artist: string
}

export default function ArtistNav({ locale, artist }: ArtistNavProps) {
  const t = useTranslations('cv')
  const pathname = usePathname()

  const base = `/${locale}/${artist}`
  const links = [
    { href: base, label: t('bioTitle') },
    { href: `${base}/portfolyo`, label: t('portfolioTitle') },
    { href: `${base}/sergiler`, label: t('exhibitionsTitle') },
    { href: `${base}/iletisim`, label: t('contactTitle') },
  ]

  // Sondaki egik cizgiyi yok say ("/tr/melike/" == "/tr/melike").
  const current = pathname.replace(/\/$/, '') || '/'

  // Mobilde sekmeler satira sigmaz; TEK satirda yatay kaydirilir.
  // `-mx-6` ile tam-genislik tasirmasi DENENDI ve geri alindi: sayfa kabugu bir
  // flex ogesi oldugu icin negatif kenar bosluklari kabugu buyutuyor ve 390px'te
  // 52px yatay tasma yaratiyordu.
  return (
    <nav
      aria-label={t('navLabel')}
      className="filter-scroll flex min-w-0 gap-x-6 overflow-x-auto border-b border-[var(--rule)] sm:gap-x-8"
    >
      {links.map((link) => {
        const active = current === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`relative shrink-0 whitespace-nowrap py-4 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] transition-colors duration-[var(--dur-micro)] sm:py-5 ${
              active
                ? 'text-[#2C2C2C] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:bg-[var(--accent)]'
                : 'text-[#6b6b6b] hover:text-[#2C2C2C]'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
