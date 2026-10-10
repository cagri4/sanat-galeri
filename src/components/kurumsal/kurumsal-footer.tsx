import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { galeriPath, kurumsalPath } from '@/lib/site'
import { SOCIAL } from '@/lib/social'

export default async function KurumsalFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const ts = await getTranslations({ locale, namespace: 'site' })
  const tf = await getTranslations({ locale, namespace: 'footer' })
  const host = (await headers()).get('host') ?? ''
  const k = (path = '') => kurumsalPath(host, locale, path)

  return (
    <footer className="mt-24 border-t border-[var(--rule)] py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-base font-medium">Uarttasarım · {t('brandTag')}</p>
          <p className="mt-3 whitespace-pre-line text-[length:var(--text-meta)] leading-relaxed text-[var(--muted)]">
            {tf('address')}
          </p>
        </div>
        <ul className="space-y-2 md:col-span-4">
          {[
            { href: k('/projeler'), label: t('nav.projects') },
            { href: k('/surec'), label: t('nav.process') },
            { href: k('/hakkimizda'), label: t('nav.about') },
            { href: k('/iletisim'), label: t('nav.contact') },
          ].map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--accent)]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="space-y-2 md:col-span-3">
          <a href={galeriPath(host, locale)} className="block text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--accent)]">
            {ts('galeri')} &rarr;
          </a>
          <a href={SOCIAL.instagram.url} target="_blank" rel="noopener noreferrer" className="block text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--accent)]">
            {SOCIAL.instagram.handle}
          </a>
        </div>
      </div>
      <p className="mt-12 font-mono text-[11px] text-[var(--faint)]">
        {tf('copyright', { year: new Date().getFullYear().toString() })}
      </p>
    </footer>
  )
}
