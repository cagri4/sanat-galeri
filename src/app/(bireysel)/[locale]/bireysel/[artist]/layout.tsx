import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'

/**
 * Bireysel sanatçı sitesi kabuğu (PLAN-BIREYSEL-SITELER). Kendi teması var
 * (data-site="bireysel": galeri minimalizmi, saf beyaz, Jost — globals.css);
 * galeri menüsü yok — kişi sayfası kendi başlığını ve gezinmesini taşır (page.tsx).
 */
export default async function BireyselLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  if (!routing.locales.includes(locale as never)) notFound()
  if (artist !== 'seref') notFound() // Melike sitesi kurulana kadar yalnız Şeref
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <div data-site="bireysel" className="w-full min-w-0">{children}</div>
    </NextIntlClientProvider>
  )
}
