import Link from 'next/link'
import { signOut } from '@/auth'
import AdminNavLinks from './admin-nav-client'

export default function AdminNav() {
  return (
    <nav className="w-52 min-h-screen bg-white border-r border-neutral-200 flex flex-col p-4 gap-1">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Admin Panel
        </span>
      </div>

      <AdminNavLinks />

      <div className="mt-auto pt-4 border-t border-neutral-200 flex flex-col gap-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 py-2 rounded text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          Siteyi Gor &rarr;
        </Link>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/admin/login' })
          }}
        >
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Cikis Yap
          </button>
        </form>
      </div>
    </nav>
  )
}
