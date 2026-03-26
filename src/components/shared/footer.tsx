import { getTranslations } from 'next-intl/server'

interface FooterProps {
  locale: string
}

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'footer' })

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''

  return (
    <footer className="border-t border-neutral-200 mt-16">
      <div className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-base font-semibold text-neutral-900">U-Art Tasarım</h3>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              {t('address')}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              info@uarttasarim.com
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-3">
              {locale === 'tr' ? 'Hızlı Bağlantılar' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href={`${MAIN_URL}/${locale}/galeri`} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                  {t('galleryLink')}
                </a>
              </li>
              <li>
                <a href={`${MAIN_URL}/${locale}/hakkimizda`} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                  {t('aboutLink')}
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-3">
              {t('followUs')}
            </h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 text-center">
            {t('copyright', { year: new Date().getFullYear().toString() })}
          </p>
        </div>
      </div>
    </footer>
  )
}
