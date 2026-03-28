import { getTranslations } from 'next-intl/server'

interface ArtistNavProps {
  locale: string
  artist: string
}

export default async function ArtistNav({ locale, artist }: ArtistNavProps) {
  const t = await getTranslations({ locale, namespace: 'cv' })

  const links = [
    { href: `/${locale}/${artist}`, label: t('bioTitle') },
    { href: `/${locale}/${artist}/portfolyo`, label: t('portfolioTitle') },
    { href: `/${locale}/${artist}/sergiler`, label: t('exhibitionsTitle') },
    { href: `/${locale}/${artist}/iletisim`, label: t('contactTitle') },
  ]

  return (
    <nav className="flex gap-6 sm:gap-8 py-6 border-b border-[#e8e4de] overflow-x-auto">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors whitespace-nowrap"
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
