import { getTranslations } from 'next-intl/server'
import { getCrossDomainLinks } from './navbar'
import { SOCIAL } from '@/lib/social'

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
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
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

          {/* Sosyal — yalnizca GERCEK hesap (bkz. lib/social.ts).
              Facebook vb. dogrulanmis adres olmadigi icin eklenmedi. */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#999] mb-4">
              {t('followUs')}
            </h4>
            <a
              href={SOCIAL.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-2 text-[length:var(--text-meta)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              <span>{SOCIAL.instagram.handle}</span>
            </a>
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
