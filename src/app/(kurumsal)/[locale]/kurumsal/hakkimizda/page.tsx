import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import PageBanner, { bannerFromProducts } from '@/components/shared/page-banner'
import { getProducts } from '@/lib/queries/gallery'
import { galeriPath } from '@/lib/site'

/**
 * Kurumsal Hakkımızda: galeriyle AYNI doğrulanmış metin (Drive Hakkımızda.docx,
 * `about` çevirileri). Sanatçı biyografisi DB'de henüz yok — uydurulmaz;
 * sanatçı sayfaları galeride.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  return { title: t('aboutTitle') }
}

export default async function KurumsalHakkimizda({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const ta = await getTranslations({ locale, namespace: 'about' })
  const host = (await headers()).get('host') ?? ''
  // Banner: kurumsalın kendi işi — mimari panolardan (admin hero sırası).
  let banner = null
  try {
    banner = bannerFromProducts(await getProducts('Mimari Duvar Panoları', 'kurumsal'), locale, 1)
  } catch {
    // DB yoksa sade başlık
  }

  return (
    <main className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      <PageBanner title={t('aboutTitle')} image={banner} />
      <div className="mt-12 max-w-3xl space-y-5">
        <p className="text-[length:var(--text-lead)] leading-[1.7]">{ta('lead')}</p>
        {ta('body').split('\n\n').filter(Boolean).map((para, i) => (
          <p key={i} className="max-w-[68ch] text-[length:var(--text-body)] leading-[1.8] text-[var(--muted)]">{para}</p>
        ))}
        <div className="mt-10 border-t border-[var(--foreground)] pt-6">
          <h2 className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--muted)]">{t('artistsTitle')}</h2>
          <ul className="mt-4 space-y-2">
            {[{ slug: 'melike', name: 'Melike Doğan' }, { slug: 'seref', name: 'Şeref Doğan' }].map((a) => (
              <li key={a.slug}>
                <a href={galeriPath(host, locale, `/${a.slug}`)} className="text-base hover:text-[var(--accent)]">{a.name} &rarr;</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
