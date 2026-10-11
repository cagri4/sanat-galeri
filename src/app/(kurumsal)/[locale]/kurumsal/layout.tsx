import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import KurumsalNavbar from '@/components/kurumsal/kurumsal-navbar'
import KurumsalFooter from '@/components/kurumsal/kurumsal-footer'

/**
 * UART KURUMSAL — ayrı site (KARARLAR-2026-10-10). Kendi Vercel projesinde
 * UART_SITE=kurumsal ile çalışır; proxy URL'deki yolu bu klasöre rewrite eder,
 * yani ziyaretçi /kurumsal görmez. Yerelde /tr/kurumsal'dan önizlenir.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  return { title: { default: t('metaTitle'), template: `%s | Uart ${t('brandTag')}` }, description: t('metaDesc') }
}

export default async function KurumsalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as never)) notFound()
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <div data-site="kurumsal" className="w-full min-w-0 flex-1">
        <KurumsalNavbar locale={locale} />
        <div className="mx-auto w-full min-w-0 max-w-[1280px] px-6 sm:px-10">
          <div className="min-h-[60vh]">{children}</div>
          <KurumsalFooter locale={locale} />
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
