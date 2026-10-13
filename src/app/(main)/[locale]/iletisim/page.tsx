import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactPageForm from '@/components/shared/contact-page-form'
import PageBanner, { bannerFromProducts } from '@/components/shared/page-banner'
import { getProducts } from '@/lib/queries/gallery'
import { getAllArtists } from '@/lib/queries/artist'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isTr = locale === 'tr'
  return {
    title: isTr ? 'İletişim | Uarttasarım' : 'Contact | Uarttasarım',
    description: isTr ? 'Bizimle iletişime geçin' : 'Get in touch with us',
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'contact' })
  // Banner: galeri eserlerinden (admin hero sırasının 3.'sü — ana sayfa ve
  // galeri banner'ıyla aynı kare tekrarlanmasın).
  let banner = null
  try {
    banner = bannerFromProducts(await getProducts(undefined, 'galeri'), locale, 2)
  } catch {
    // DB yoksa sade başlık
  }

  // Ana sitede her iki sanatçının kendi iletişim bilgisi listelenir.
  let artists: Awaited<ReturnType<typeof getAllArtists>> = []
  try {
    artists = await getAllArtists()
  } catch {
    // DB yoksa iletişim formu yine de çalışır
  }

  return (
    <main className="pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pb-20">
      <PageBanner title={isTr ? 'İletişim' : 'Contact'} image={banner} />
      <p className="mt-10 text-[15px] text-[#6b6b6b] max-w-2xl">
        {isTr
          ? 'Eserler, sergiler veya iş birliği teklifleri hakkında bizimle iletişime geçin.'
          : 'Get in touch about artworks, exhibitions, or collaboration proposals.'}
      </p>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Info + Map */}
        <div>
          {/* Contact details */}
          <div className="space-y-6">
            {/* Atolye adresi — Cagri tarafindan verildi (dogrulanmis) */}
            <div>
              <h2 className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)] mb-2">
                {isTr ? 'Adres' : 'Address'}
              </h2>
              <p className="whitespace-pre-line text-[length:var(--text-body)] leading-relaxed text-[#2C2C2C]">
                {'Boğazkent mah. 3.cad. 1/10\nKepez, Çanakkale 17100\nTürkiye'}
              </p>
            </div>

            <div className="space-y-8">
              {artists.map((a: any) => (
                <div key={a.slug}>
                  <h2 className="text-[11px] uppercase tracking-[0.2em] text-[var(--faint)] mb-2">
                    {a.nameTr}
                  </h2>
                  {a.email && (
                    <a
                      href={`mailto:${a.email}`}
                      className="block text-[15px] text-[#2C2C2C] hover:text-[#2C2C2C] transition-colors"
                    >
                      {a.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[var(--faint)] mb-6">
            {isTr ? 'Mesaj Gönderin' : 'Send a Message'}
          </h2>
          <ContactPageForm locale={locale} labels={{
            name: t('nameLabel'),
            namePlaceholder: t('namePlaceholder'),
            email: t('emailLabel'),
            emailPlaceholder: t('emailPlaceholder'),
            message: t('messageLabel'),
            messagePlaceholder: isTr
              ? 'Eserler, sergiler veya iş birliği hakkında mesajınızı yazın...'
              : 'Write your message about artworks, exhibitions, or collaboration...',
            submit: t('submit'),
            submitting: t('submitting'),
            success: t('successMessage'),
          }} />
        </div>
      </div>
    </main>
  )
}
