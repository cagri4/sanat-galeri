'use client'

import { useState } from 'react'
import LanguageSwitcher from './language-switcher'

interface MobileMenuProps {
  links: {
    gallery: string
    collections: string
    about: string
    commissions: string
    contact: string
  }
  labels: {
    gallery: string
    collections: string
    about: string
    commissions: string
    contact: string
  }
}

export default function MobileMenu({ links, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  // Menu sirasi masaustuyle ayni: Galeri · Koleksiyonlar · Hakkinda ·
  // Ozel Siparis · Iletisim. Sanatcilar footer'a tasindi.
  const items = [
    { href: links.gallery, label: labels.gallery },
    { href: links.collections, label: labels.collections },
    { href: links.about, label: labels.about },
    { href: links.commissions, label: labels.commissions },
    { href: links.contact, label: labels.contact },
  ]

  return (
    <div className="sm:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-[5px] p-2 -mr-2"
        aria-label="Menu"
        aria-expanded={open}
      >
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-transform duration-300 ${open ? 'translate-y-[6.5px] rotate-45' : ''}`} />
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-transform duration-300 ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed left-0 right-0 top-[73px] z-50 border-b border-[var(--border)] bg-[#FAFAF8] px-6 py-6">
          <nav className="flex flex-col gap-5">
            {items.map((it) => (
              <a
                key={it.href}
                href={it.href}
                className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] transition-colors hover:text-[#2C2C2C]"
                onClick={() => setOpen(false)}
              >
                {it.label}
              </a>
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
