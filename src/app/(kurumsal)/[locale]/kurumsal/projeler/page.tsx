import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { CATEGORIES, CATEGORY_SLUGS, categoryBySlug } from '@/lib/categories'
import { categoriesForSite, kurumsalPath } from '@/lib/site'
import { projectNo } from '@/lib/kurumsal'
import ProjectCard from '@/components/kurumsal/project-card'
import Reveal from '@/components/motion/reveal'
import PageBanner, { bannerFromProducts } from '@/components/shared/page-banner'
import { groupBySeries, SERIES_CATEGORY } from '@/lib/series'
import { staggerDelay } from '@/lib/motion'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tur?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  return { title: t('nav.projects') }
}

export default async function ProjelerPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { tur } = await searchParams
  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const tg = await getTranslations({ locale, namespace: 'gallery' })
  const host = (await headers()).get('host') ?? ''
  const k = (path = '') => kurumsalPath(host, locale, path)

  // Kurumsal kategoriler: panolar + heykeller (lib/site.ts)
  const cats = categoriesForSite('kurumsal', CATEGORIES)
    .sort((a, b) => Number(b === 'Mimari Duvar Panoları') - Number(a === 'Mimari Duvar Panoları'))
  const requested = tur ? categoryBySlug(tur) : null
  const active = requested && cats.includes(requested) ? requested : null

  let projects: Awaited<ReturnType<typeof getProducts>> = []
  try {
    projects = await getProducts(active ?? undefined, 'kurumsal')
  } catch {
    // DB yoksa boş durum
  }
  const label = (c: string) => (tg.has(`categories.${c}`) ? tg(`categories.${c}`) : c)

  return (
    <main className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      <PageBanner title={t('nav.projects')} image={bannerFromProducts(projects, locale)} />

      {/* Filtre: sade sekme çizgisi */}
      <nav className="mt-10 flex flex-wrap gap-x-8 border-b border-[var(--rule)]">
        {[{ href: k('/projeler'), text: t('filterAll'), on: !active }, ...cats.map((c) => ({
          href: k(`/projeler?tur=${CATEGORY_SLUGS[c]}`), text: label(c), on: active === c,
        }))].map((f) => (
          <a
            key={f.href}
            href={f.href}
            aria-current={f.on ? 'page' : undefined}
            className={`-mb-px inline-flex min-h-11 items-center border-b-2 text-[length:var(--text-meta)] ${
              f.on ? 'border-[var(--accent)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {f.text}
          </a>
        ))}
      </nav>

      {projects.length === 0 ? (
        <p className="py-20 text-[length:var(--text-meta)] text-[var(--muted)]">{t('empty')}</p>
      ) : (
        // Panolar tek blok; heykeller SERİ başlıklarıyla (Masalın Hafızası /
        // Anadolu Ekininde Güzeller — sanatçı 13 Eki). Numara her blokta 01'den.
        // Tek blok varsa (ör. yalnız panolar) başlık çizilmez — sekme zaten söylüyor.
        <div className="mt-12 space-y-20">
          {(() => {
            const blocks = [
              ...(() => {
                const panolar = projects.filter((p) => p.category !== SERIES_CATEGORY)
                return panolar.length ? [{ key: 'panolar', title: label('Mimari Duvar Panoları'), items: panolar }] : []
              })(),
              ...groupBySeries(projects.filter((p) => p.category === SERIES_CATEGORY)).map((g) => ({
                key: g.series ?? 'heykel',
                title: g.series ?? label(SERIES_CATEGORY),
                items: g.items,
              })),
            ]
            return blocks.map((b) => (
              <section key={b.key} aria-labelledby={blocks.length > 1 ? `blok-${b.key}` : undefined}>
                {blocks.length > 1 && (
                  <div className="mb-8 flex items-baseline gap-4 border-b border-[var(--rule)] pb-3">
                    <h2 id={`blok-${b.key}`} className="text-2xl sm:text-3xl">{b.title}</h2>
                    <span className="font-mono text-[12px] text-[var(--muted)]">{b.items.length}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {b.items.map((p, i) => (
                    <Reveal key={p.id} delay={staggerDelay(i)}>
                    <ProjectCard
                      href={k(`/projeler/${p.slug}`)}
                      no={projectNo(i)}
                      title={isTr ? p.titleTr : p.titleEn}
                      image={p.images[0]?.url ?? null}
                      meta={[p.year ? String(p.year) : null, p.collection, isTr ? p.dimensionsTr : p.dimensionsEn]}
                    />
                    </Reveal>
                  ))}
                </div>
              </section>
            ))
          })()}
        </div>
      )}
    </main>
  )
}
