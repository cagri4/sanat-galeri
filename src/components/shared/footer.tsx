import { getTranslations } from 'next-intl/server'
import { getCrossDomainLinks } from './navbar'

interface FooterProps {
  locale: string
}

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'footer' })

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'
  const links = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)

  return (
    <footer className="border-t border-[#e8e4de] mt-20">
      <div className="py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-[family-name:var(--font-serif)] text-xl font-light tracking-wide text-[#1a1a1a]">
              U-Art Tasarım
            </h3>
            {/* whitespace-pre-line: adres cok satirli */}
            <p className="mt-3 whitespace-pre-line text-[length:var(--text-meta)] leading-relaxed text-[#6b6b6b]">
              {t('address')}
            </p>
            {/* Genel "info@" adresi dogrulanmadigi icin kaldirildi; sanatcilarin
                gercek e-posta/WhatsApp bilgileri iletisim sayfasinda. */}
            <a
              href={links.contact}
              className="mt-1 inline-block text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors underline underline-offset-2"
            >
              {t('contactLink')}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-4">
              {locale === 'tr' ? 'Keşfet' : 'Explore'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href={links.gallery} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  {t('galleryLink')}
                </a>
              </li>
              <li>
                <a href={links.about} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  {t('aboutLink')}
                </a>
              </li>
              <li>
                <a href={links.contact} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  {t('contactLink')}
                </a>
              </li>
            </ul>
          </div>

          {/* Artists */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-4">
              {locale === 'tr' ? 'Sanatçılar' : 'Artists'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href={links.melike} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  Melike Doğan
                </a>
              </li>
              <li>
                <a href={links.seref} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  Şeref Doğan
                </a>
              </li>
            </ul>
          </div>

          {/* Sosyal: instagram.com / facebook.com genel adreslerine giden
              yer tutucu linkler kaldirildi (gercek hesap adi henuz yok).
              Instagram bolumu Cagri hesap adini verince eklenecek. */}
        </div>

        <div className="mt-14 pt-6 border-t border-[#e8e4de]">
          <p className="text-[11px] text-[#999] tracking-wide text-center">
            {t('copyright', { year: new Date().getFullYear().toString() })}
          </p>
        </div>
      </div>
    </footer>
  )
}
