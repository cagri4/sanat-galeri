import Link from 'next/link'
import { getAllProducts, getAllArtists, getAllMessages } from '@/lib/queries/admin'

export default async function DashboardPage() {
  const [products, artists, messages] = await Promise.all([
    getAllProducts(),
    getAllArtists(),
    getAllMessages(),
  ])

  const unreadCount = messages.filter((m) => !m.isRead).length

  const sections = [
    {
      title: 'Eserler',
      count: products.length,
      href: '/admin/urunler',
      description: 'Toplam eser',
    },
    {
      title: 'Sanatçılar',
      count: artists.length,
      href: '/admin/sanatcilar',
      description: 'Kayıtlı sanatçı',
    },
    {
      title: 'Mesajlar',
      count: unreadCount,
      href: '/admin/mesajlar',
      description: 'Okunmamış mesaj',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight text-neutral-900 mb-8">
        Yönetim Paneli
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div
            key={section.href}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <p className="text-sm text-neutral-500 mb-1">{section.description}</p>
            <p className="text-4xl font-light text-neutral-900 mb-4">
              {section.count}
            </p>
            <h2 className="text-sm font-medium text-neutral-700 mb-3">
              {section.title}
            </h2>
            <Link
              href={section.href}
              className="text-sm text-neutral-500 hover:text-neutral-900 underline-offset-2 hover:underline transition-colors"
            >
              Görüntüle &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
