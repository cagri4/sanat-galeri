import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactPageForm from '@/components/shared/contact-page-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isTr = locale === 'tr'
  return {
    title: isTr ? 'İletişim | U-Art Tasarım' : 'Contact | U-Art Design',
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

  return (
    <main className="py-12 sm:py-16 lg:py-20">
      <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide text-[#1a1a1a]">
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
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-2">
                {isTr ? 'Adres' : 'Address'}
              </h2>
              <p className="text-[15px] text-[#1a1a1a] leading-relaxed">
                U-Art Tasarım Atölyesi<br />
                Beyoğlu, İstanbul<br />
                Türkiye
              </p>
            </div>

            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-2">
                {isTr ? 'Telefon' : 'Phone'}
              </h2>
              <a href="tel:+905551234567" className="text-[15px] text-[#1a1a1a] hover:text-[#612E49] transition-colors">
                +90 555 123 45 67
              </a>
            </div>

            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-2">
                E-posta
              </h2>
              <a href="mailto:info@uarttasarim.com" className="text-[15px] text-[#1a1a1a] hover:text-[#612E49] transition-colors">
                info@uarttasarim.com
              </a>
            </div>

            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-2">
                WhatsApp
              </h2>
              <a
                href="https://wa.me/905551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] text-[#1a1a1a] hover:text-[#612E49] transition-colors"
              >
                +90 555 123 45 67
              </a>
            </div>

            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-2">
                {isTr ? 'Çalışma Saatleri' : 'Working Hours'}
              </h2>
              <p className="text-[15px] text-[#1a1a1a]">
                {isTr ? 'Pazartesi – Cumartesi: 10:00 – 18:00' : 'Monday – Saturday: 10:00 AM – 6:00 PM'}
              </p>
              <p className="text-[13px] text-[#6b6b6b]">
                {isTr ? 'Pazar: Randevu ile' : 'Sunday: By appointment'}
              </p>
            </div>
          </div>

          {/* Google Maps */}
          <div className="mt-8">
            <div className="aspect-[4/3] w-full bg-[#f0ece4] overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12038.5959421793!2d28.970!3d41.035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2sBeyoğlu%2C%20Istanbul!5e0!3m2!1str!2str!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={isTr ? 'Konum haritası' : 'Location map'}
              />
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
