import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { kurumsalPath } from '@/lib/site'

/**
 * Süreç. METİN KAYNAĞI: sanatçının pano dokümanlarındaki "Yapım Süreci"
 * bölümleri (Drive ceramicart/mimari duvar panoları/*.docx — Gizem, Türk
 * Denizcilerinin Sesi, Akar'ın Deryası, Çanakkale Şehitleri, Bilginin
 * Kaynağı). Adımlar o metinlerden derlendi; yeni iddia eklenmedi.
 * Yapım/montaj fotoğrafları (Drive'da 96 kare) içerik turunda proje
 * sayfalarına girecek.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  return { title: t('nav.process') }
}

export default async function SurecPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const host = (await headers()).get('host') ?? ''
  const steps = Object.values(t.raw('steps') as Record<string, { t: string; b: string }>)

  return (
    <main className="py-16 sm:py-20">
      <p className="font-mono text-[12px] uppercase tracking-[var(--tracking-label)] text-[var(--accent)]">{t('processEyebrow')}</p>
      <h1 className="mt-4 max-w-[22ch] text-4xl leading-[1.1] sm:text-5xl">{t('processTitle')}</h1>
      <p className="mt-6 max-w-[60ch] text-[length:var(--text-lead)] leading-[1.7] text-[var(--muted)]">{t('processLead')}</p>

      <ol className="mt-14 border-t border-[var(--foreground)]">
        {steps.map((s, i) => (
          <li key={s.t} className="grid grid-cols-12 gap-4 border-b border-[var(--rule)] py-6">
            <span className="col-span-2 font-mono text-[13px] text-[var(--accent)] sm:col-span-1">{String(i + 1).padStart(2, '0')}</span>
            <h2 className="col-span-10 text-lg sm:col-span-4">{s.t}</h2>
            <p className="col-span-12 text-[length:var(--text-body)] leading-[1.7] text-[var(--muted)] sm:col-span-7">{s.b}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-12">
        <h2 className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--muted)] md:col-span-4">{t('materialTitle')}</h2>
        <p className="font-mono text-[14px] md:col-span-8">{t('materialBody')}</p>
      </section>

      <p className="mt-14 text-[length:var(--text-meta)] text-[var(--faint)]">{t('processSource')}</p>
      <a
        href={kurumsalPath(host, locale, '/iletisim')}
        className="mt-8 inline-flex min-h-11 items-center bg-[var(--accent)] px-6 text-[length:var(--text-meta)] text-white hover:opacity-90"
      >
        {t('ctaButton')}
      </a>
    </main>
  )
}
