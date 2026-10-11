'use client'

import { useState } from 'react'
import LanguageSwitcher from './language-switcher'

interface MobileMenuProps {
  /** Masaüstü menüsüyle aynı sıra. İki site (galeri/kurumsal) kendi listesini verir. */
  items: { href: string; label: string }[]
}

export default function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-[5px] p-2 -mr-2"
        aria-label="Menu"
        aria-expanded={open}
      >
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-transform duration-[var(--dur-fast)] ${open ? 'translate-y-[6.5px] rotate-45' : ''}`} />
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-opacity duration-[var(--dur-fast)] ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-[1.5px] w-5 bg-[#2C2C2C] transition-transform duration-[var(--dur-fast)] ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed left-0 right-0 top-[73px] z-50 border-b border-[var(--border)] bg-[var(--background)] px-6 py-6">
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
