import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

/**
 * Özel Sipariş — HAFİF tanıtım bloğu (Çağrı kararı, 2026-07-25).
 * Ayrı sipariş/sepet sistemi DEĞİL: sade metin + mevcut İletişim formuna
 * yönlendirme. Fiyat/süre uydurulmaz; görüşmede netleşir.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'commissions' })
  const isTr = locale === 'tr'
  return {
    title: `${t('title')} | ${isTr ? 'U-Art Tasarım' : 'U-Art Design'}`,
    description: t('lead'),
  }
}

export default async function OzelSiparisPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'commissions' })

  return (
    <main className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-medium tracking-[-0.015em] text-[#2C2C2C] sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-8 max-w-[60ch] text-[length:var(--text-lead)] leading-[1.85] text-[#4a4a4a]">
          {t('lead')}
        </p>
        <p className="mx-auto mt-6 max-w-[60ch] text-[length:var(--text-body)] leading-[1.85] text-[#4a4a4a]">
          {t('body')}
        </p>

        <Link
          href={`/${locale}/iletisim`}
          className="mt-10 inline-flex min-h-11 items-center border border-[#2C2C2C] px-8 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#2C2C2C] transition-colors duration-[var(--dur-micro)] hover:bg-[#2C2C2C] hover:text-white"
        >
          {t('cta')}
        </Link>

        <p className="mx-auto mt-6 max-w-[52ch] text-[length:var(--text-meta)] leading-relaxed text-[#999]">
          {t('note')}
        </p>
      </div>
    </main>
  )
}
