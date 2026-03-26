import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import Navbar from '@/components/shared/navbar'
import Footer from '@/components/shared/footer'

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as never)) {
    notFound()
  }
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-w-[320px] mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 overflow-x-hidden">
        <Navbar locale={locale} domain="main" />
        <div className="min-h-[60vh]">{children}</div>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  )
}
