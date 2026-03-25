'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/urunler', label: 'Eserler' },
  { href: '/admin/sanatcilar', label: 'Sanatcilar' },
  { href: '/admin/mesajlar', label: 'Mesajlar' },
]

export default function AdminNavLinks() {
  const pathname = usePathname()
  return (
    <div className="flex flex-col gap-1 flex-1">
      {navLinks.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <Link
            key={link.href}
            href={link.href}
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
  )
}
