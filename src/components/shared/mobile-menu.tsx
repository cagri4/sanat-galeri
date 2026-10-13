'use client'

import { useState } from 'react'
import LanguageSwitcher from './language-switcher'
import { InstagramLink, type NavItem } from './nav-menu'

interface MobileMenuProps {
  /** Masaüstü menüsüyle aynı sıra. İki site (galeri/kurumsal) kendi listesini verir. */
  items: NavItem[]
  menuLabel: string
  instagramLabel: string
}

/**
 * Mobil menü (md altı). Alt menüler akordeon değil, başlığın altında hep açık
 * liste: en çok üç alt madde var, dokunma sayısı az kalsın.
 */
export default function MobileMenu({ items, menuLabel, instagramLabel }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center md:hidden">
      <InstagramLink label={instagramLabel} />
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
        aria-label={menuLabel}
        aria-expanded={open}
      >
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-transform duration-[var(--dur-fast)] ${open ? 'translate-y-[6.5px] rotate-45' : ''}`} />
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-opacity duration-[var(--dur-fast)] ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-transform duration-[var(--dur-fast)] ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
      </button>

      {open && (
        <div className="fixed left-0 right-0 top-[73px] z-50 max-h-[calc(100dvh-73px)] overflow-y-auto border-b border-[var(--border)] bg-[var(--background)] px-6 py-6">
          <nav aria-label={menuLabel} className="flex flex-col gap-5">
            {items.map((it) => (
              <div key={it.label}>
                <a
                  href={it.href}
                  className="inline-flex min-h-11 items-center text-[13px] uppercase tracking-[0.15em] text-[#2C2C2C]"
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                  {it.external && <span aria-hidden="true" className="ml-2 text-[var(--faint)]">↗</span>}
                </a>
                {it.children && (
                  <ul className="ml-1 border-l border-[var(--border)] pl-4">
                    {it.children.map((c) => (
                      <li key={c.href}>
                        <a
                          href={c.href}
                          className="inline-flex min-h-11 items-center text-[15px] text-[#6b6b6b] transition-colors hover:text-[#2C2C2C]"
                          onClick={() => setOpen(false)}
                        >
                          {c.label}
                          {c.external && <span aria-hidden="true" className="ml-2 text-[var(--faint)]">↗</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className="border-t border-[var(--border)] pt-4">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
