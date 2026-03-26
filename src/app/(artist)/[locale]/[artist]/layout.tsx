import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import Navbar from '@/components/shared/navbar'
import Footer from '@/components/shared/footer'

const VALID_ARTISTS = ['melike', 'seref']

export default async function ArtistLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  if (!routing.locales.includes(locale as never)) notFound()
  if (!VALID_ARTISTS.includes(artist)) notFound()
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-w-[320px] mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <Navbar locale={locale} domain={artist as 'melike' | 'seref'} />
        <div className="min-h-[60vh]">{children}</div>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  )
}
