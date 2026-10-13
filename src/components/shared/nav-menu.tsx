import { SOCIAL } from '@/lib/social'
import SubmenuToggle from './submenu-toggle'

/** Menü maddesi. `children` varsa masaüstünde açılır panel, mobilde alt liste. */
export interface NavItem {
  href: string
  label: string
  /** Diğer siteye (galeri ↔ kurumsal) giden bağlantı — yanında ↗ işareti. */
  external?: boolean
  children?: NavItem[]
}

const galeriLink =
  'relative inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#2C2C2C] after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#2C2C2C] after:transition-transform after:duration-[var(--dur-micro)] after:ease-[var(--ease)] hover:after:scale-x-100 group-hover:after:scale-x-100 group-focus-within:after:scale-x-100'

/** Kurumsal ton: büyük harf yok, vurgu rengi petrol mavisi (PLAN-TASARIM). */
const kurumsalLink =
  'inline-flex min-h-11 items-center text-[length:var(--text-meta)] text-[var(--muted)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--accent)] group-hover:text-[var(--accent)] group-focus-within:text-[var(--accent)]'

/**
 * Masaüstü menüsü. Üst madde kendi sayfasına gider; alt panel fareyle üzerine
 * gelince (CSS) ya da yanındaki ok düğmesiyle açılır — dokunmatik ekranda ve
 * klavyede de (SubmenuToggle, Esc kapatır).
 */
export function DesktopNav({
  items,
  submenuLabel,
  tone = 'galeri',
}: {
  items: NavItem[]
  submenuLabel: string
  tone?: 'galeri' | 'kurumsal'
}) {
  const linkClass = tone === 'kurumsal' ? kurumsalLink : galeriLink
  return (
    <ul className={`flex items-center ${tone === 'kurumsal' ? 'gap-7' : 'gap-8'}`}>
      {items.map((it) => (
        <li key={it.label} className="group relative">
          <div className="flex items-center">
            <a href={it.href} className={linkClass}>
              {it.label}
            </a>
            {it.children && <SubmenuToggle label={`${it.label} ${submenuLabel}`} />}
          </div>
          {it.children && (
            <div className="invisible absolute left-1/2 top-full z-40 -translate-x-1/2 pt-2 opacity-0 transition-[opacity,visibility] duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:visible group-hover:opacity-100 group-data-[open]:visible group-data-[open]:opacity-100">
              <ul
                aria-label={`${it.label} ${submenuLabel}`}
                className="min-w-[15rem] border border-[var(--border)] bg-[var(--background)] py-2 shadow-[0_12px_32px_-16px_rgba(44,44,44,0.25)]"
              >
                {it.children.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      className="flex min-h-11 items-center justify-between gap-4 px-5 text-[14px] text-[#4a4a4a] transition-colors duration-[var(--dur-micro)] hover:bg-black/[0.03] hover:text-[#2C2C2C]"
                    >
                      {c.label}
                      {c.external && <span aria-hidden="true" className="text-[var(--faint)]">↗</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Header sağ üstteki Instagram bağlantısı (44px dokunma alanı). */
export function InstagramLink({ label, className = '' }: { label: string; className?: string }) {
  return (
    <a
      href={SOCIAL.instagram.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={SOCIAL.instagram.handle}
      className={`inline-flex h-11 w-11 items-center justify-center text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#2C2C2C] ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    </a>
  )
}
