import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactPageForm from '@/components/shared/contact-page-form'
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

  // Ana sitede her iki sanatçının kendi iletişim bilgisi listelenir.
  let artists: Awaited<ReturnType<typeof getAllArtists>> = []
  try {
    artists = await getAllArtists()
  } catch {
    // DB yoksa iletişim formu yine de çalışır
  }

  return (
    <main className="py-12 sm:py-16 lg:py-20">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-wide text-[#2C2C2C]">
        {isTr ? 'İletişim' : 'Contact'}
      </h1>
      <p className="mt-4 text-[15px] text-[#6b6b6b] max-w-2xl">
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
              <h2 className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999] mb-2">
                {isTr ? 'Adres' : 'Address'}
              </h2>
              <p className="whitespace-pre-line text-[length:var(--text-body)] leading-relaxed text-[#2C2C2C]">
                {'Boğazkent mah. 3.cad. 1/10\nKepez, Çanakkale 17100\nTürkiye'}
              </p>
            </div>

            <div className="space-y-8">
              {artists.map((a: any) => (
                <div key={a.slug}>
                  <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-2">
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
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-6">
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
