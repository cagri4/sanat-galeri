import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import Navbar from '@/components/shared/navbar'

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
      <div className="min-w-[320px] mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <Navbar locale={locale} domain="main" />
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
