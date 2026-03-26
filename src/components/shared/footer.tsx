import { getTranslations } from 'next-intl/server'
import { buildDomainLink } from './navbar'

interface FooterProps {
  locale: string
}

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'footer' })

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'

  return (
    <footer className="border-t border-[#e8e4de] mt-20">
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-[family-name:var(--font-serif)] text-xl font-light tracking-wide text-[#1a1a1a]">
              U-Art Tasarım
            </h3>
            <p className="mt-3 text-[13px] text-[#6b6b6b] leading-relaxed">
              {t('address')}
            </p>
            <p className="mt-1 text-[13px] text-[#6b6b6b]">
              info@uarttasarim.com
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-4">
              {locale === 'tr' ? 'Keşfet' : 'Explore'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href={buildDomainLink(MAIN_URL, `/${locale}/galeri`)} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  {t('galleryLink')}
                </a>
              </li>
              <li>
                <a href={buildDomainLink(MAIN_URL, `/${locale}/hakkimizda`)} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  {t('aboutLink')}
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
                <a href={buildDomainLink(MELIKE_URL, `/${locale}`)} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  Melike Yıldız
                </a>
              </li>
              <li>
                <a href={buildDomainLink(SEREF_URL, `/${locale}`)} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                  Şeref Kaya
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-4">
              {t('followUs')}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
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
