import Link from 'next/link'
import { signOut } from '@/auth'
import AdminNavLinks from './admin-nav-client'

export default function AdminNav() {
  return (
    <nav className="md:w-52 md:min-h-screen bg-white border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col p-4 gap-1">
      <div className="flex items-center justify-between md:block md:mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Admin Panel
        </span>
      </div>

      <AdminNavLinks />

      <div className="hidden md:flex mt-auto pt-4 border-t border-neutral-200 flex-col gap-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 py-2 rounded text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          Siteyi Gör &rarr;
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
            Çıkış Yap
          </button>
        </form>
      </div>
    </nav>
  )
}
