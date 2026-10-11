import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import Navbar from '@/components/shared/navbar'
import Footer from '@/components/shared/footer'
import ContactWidget from '@/components/shared/contact-widget'

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
      {/* Konteyner genislikleri sevaceramics referansina yaklastirildi: galeri
          grid gorselleri ~430px (onceki ~325px). Metin bloklari zaten max-[68ch]
          ile kendini sinirliyor, okunabilirlik bozulmaz. */}
      {/* data-site dış kapsayıcıda: tam genişlik yapışkan başlık da token'ları alır. */}
      <div data-site="galeri" className="w-full min-w-0">
        <Navbar locale={locale} domain="main" />
        <div className="mx-auto w-full min-w-0 max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <div className="min-h-[60vh]">{children}</div>
          <Footer locale={locale} />
        </div>
      </div>
      {/* Sol altta sabit iletisim dugmesi + modal (mevcut /api/contact'e gider) */}
      <ContactWidget />
    </NextIntlClientProvider>
  )
}
