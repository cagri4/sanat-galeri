import Image from 'next/image'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/shared/language-switcher'
import MobileMenu from '@/components/shared/mobile-menu'
import { galeriPath, kurumsalPath } from '@/lib/site'

/**
 * Kurumsal başlık. LOGO GALERİYLE AYNI (karar 3) — fark tipografi ve
 * düzende: ince çizgili sert bar, "Kurumsal" etiketi, mono-sız sade menü.
 */
export default async function KurumsalNavbar({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const ts = await getTranslations({ locale, namespace: 'site' })
  const host = (await headers()).get('host') ?? ''
  const k = (path = '') => kurumsalPath(host, locale, path)

  const items = [
    { href: k('/projeler'), label: t('nav.projects') },
    { href: k('/surec'), label: t('nav.process') },
    { href: k('/hakkimizda'), label: t('nav.about') },
    { href: k('/iletisim'), label: t('nav.contact') },
  ]
  const galeriHref = galeriPath(host, locale)

  return (
    <header className="border-b border-[var(--rule)]">
      <nav className="flex items-center justify-between py-5">
        <a href={k()} className="inline-flex min-h-11 items-center gap-3 text-[var(--foreground)]">
          <Image src="/brand/uart-logo.png" alt="" width={150} height={150} priority className="h-9 w-9 shrink-0" />
          <span className="text-lg font-medium tracking-tight">Uarttasarım</span>
          <span className="ml-1 border border-[var(--rule)] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[var(--tracking-label)] text-[var(--muted)]">
            {t('brandTag')}
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {items.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center text-[length:var(--text-meta)] text-[var(--muted)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--accent)]"
            >
              {l.label}
            </a>
          ))}
          <a
            href={galeriHref}
            className="inline-flex min-h-11 items-center border-l border-[var(--rule)] pl-6 text-[length:var(--text-meta)] text-[var(--faint)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--foreground)]"
          >
            {ts('galeri')} &rarr;
          </a>
          <LanguageSwitcher />
        </div>

        <div className="md:hidden">
          <MobileMenu items={[...items, { href: galeriHref, label: ts('galeri') }]} />
        </div>
      </nav>
    </header>
  )
}
