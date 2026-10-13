import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PageBanner, { bannerFromProducts } from '@/components/shared/page-banner'
import { getProducts } from '@/lib/queries/gallery'
import ContactPageForm from '@/components/shared/contact-page-form'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  return { title: t('contactTitle') }
}

export default async function KurumsalIletisim({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const tc = await getTranslations({ locale, namespace: 'contact' })
  const tf = await getTranslations({ locale, namespace: 'footer' })
  // Banner: kurumsalın kendi işi — mimari panolardan (admin hero sırası).
  let banner = null
  try {
    banner = bannerFromProducts(await getProducts('Mimari Duvar Panoları', 'kurumsal'), locale, 2)
  } catch {
    // DB yoksa sade başlık
  }

  return (
    <main className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      <PageBanner title={t('ctaTitle')} image={banner} />
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12">
      <div className="md:col-span-5">
        <p className="max-w-[48ch] text-[length:var(--text-body)] leading-[1.75] text-[var(--muted)]">{t('contactLead')}</p>
        <p className="mt-8 whitespace-pre-line font-mono text-[13px] leading-relaxed text-[var(--muted)]">{tf('address')}</p>
      </div>
      <div className="md:col-span-7">
        {/* Mevcut /api/contact'e gider (galeriyle aynı uç). */}
        <ContactPageForm
          locale={locale}
          labels={{
            name: tc('nameLabel'),
            namePlaceholder: tc('namePlaceholder'),
            email: tc('emailLabel'),
            emailPlaceholder: tc('emailPlaceholder'),
            message: tc('messageLabel'),
            messagePlaceholder: t('contactLead'),
            submit: tc('submit'),
            submitting: tc('submitting'),
            success: tc('successMessage'),
          }}
        />
      </div>
      </div>
    </main>
  )
}
