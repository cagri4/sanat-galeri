'use client'

import { useState } from 'react'
import LanguageSwitcher from './language-switcher'

interface MobileMenuProps {
  links: {
    gallery: string
    about: string
    contact: string
    melike: string
    seref: string
  }
  labels: {
    gallery: string
    about: string
    contact: string
  }
}

export default function MobileMenu({ links, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-[5px] p-2 -mr-2"
        aria-label="Menu"
      >
        <span className={`block w-5 h-[1.5px] bg-[#1a1a1a] transition-transform duration-300 ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
        <span className={`block w-5 h-[1.5px] bg-[#1a1a1a] transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-[1.5px] bg-[#1a1a1a] transition-transform duration-300 ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed top-[73px] left-0 right-0 bg-[#fbf9f5] border-b border-[#e8e4de] z-50 px-6 py-6">
          <nav className="flex flex-col gap-5">
            <a
              href={links.gallery}
              className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              onClick={() => setOpen(false)}
            >
              {labels.gallery}
            </a>
            <a
              href={links.about}
              className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              onClick={() => setOpen(false)}
            >
              {labels.about}
            </a>
            <a
              href={links.contact}
              className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              onClick={() => setOpen(false)}
            >
              {labels.contact}
            </a>
            <div className="border-t border-[#e8e4de] pt-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-3">
                {labels.gallery === 'Galeri' ? 'Sanatçılar' : 'Artists'}
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href={links.melike}
                  className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Melike Doğan
                </a>
                <a
                  href={links.seref}
                  className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Şeref Doğan
                </a>
              </div>
            </div>
            <div className="border-t border-[#e8e4de] pt-4">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
