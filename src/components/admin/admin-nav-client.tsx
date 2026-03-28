'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/urunler', label: 'Eserler' },
  { href: '/admin/sanatcilar', label: 'Sanatçılar' },
  { href: '/admin/mesajlar', label: 'Mesajlar' },
]

export default function AdminNavLinks() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center gap-2 px-3 py-2 text-sm text-neutral-600"
        aria-label="Menü"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
        Menü
      </button>

      {/* Nav links — always visible on md+, toggleable on mobile */}
      <div className={`flex flex-col gap-1 flex-1 ${open ? 'block' : 'hidden md:flex'}`}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </>
  )
}
