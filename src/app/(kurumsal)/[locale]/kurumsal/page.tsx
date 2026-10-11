import Image from 'next/image'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { getExhibitionPhotosBySlugs } from '@/lib/queries/exhibition-photos'
import { CATEGORIES } from '@/lib/categories'
import { categoriesForSite, kurumsalPath } from '@/lib/site'
import { projectNo, projectStats } from '@/lib/kurumsal'
import { yeniIcerikAcik } from '@/lib/yeni-icerik'
import ProjectCard from '@/components/kurumsal/project-card'
import SeriesTabs from '@/components/shared/series-tabs'
import CardRail from '@/components/shared/card-rail'

/**
 * Kurumsal ana sayfa — PLAN-TASARIM-2026-10-11 §2. Stil: ui-ux-pro-max
 * "Trust & Authority" (vaka/künye + rakam + referans), ölçülü hareket.
 */
export default async function KurumsalHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const tg = await getTranslations({ locale, namespace: 'gallery' })
  const th = await getTranslations({ locale, namespace: 'home' })
  const host = (await headers()).get('host') ?? ''
  const k = (path = '') => kurumsalPath(host, locale, path)

  let projects: Awaited<ReturnType<typeof getProducts>> = []
  try {
    projects = await getProducts(undefined, 'kurumsal')
  } catch {
    // DB yoksa boş durum
  }
  const withImage = projects.filter((p) => p.images?.[0]?.url)

  // Hero: admin'deki hero_order'ın ilki. İlk proje kartıyla AYNI görsel iki kez
  // çıkmasın diye (önce görüntüsündeki tekrar) kartlarda hero eseri atlanır.
  const hero =
    [...withImage].filter((p) => p.heroOrder != null).sort((a, b) => (a.heroOrder as number) - (b.heroOrder as number))[0] ??
    withImage[0]
  const stats = projectStats(projects)

  // Proje türü sekmeleri (pano / heykel) — yalnız görünür eserler.
  const groups = categoriesForSite('kurumsal', CATEGORIES)
    .map((cat) => ({ cat, items: withImage.filter((p) => p.category === cat && p.id !== hero?.id).slice(0, 6) }))
    .filter((g) => g.items.length > 0)

  // Referans mekânlar: görünür panoların konum alanı (DB'deki gerçek kurum adları).
  // LOGO YOK — kullanım izni ayrı iş (Çağrı, 11.10.2026).
  const mekanlar = [...new Set(
    projects
      .filter((p) => p.category === 'Mimari Duvar Panoları' && p.collection)
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .map((p) => p.collection as string),
  )]

  // Yapım ve montajdan kareler — gizli içerikle birlikte açılır (lib/yeni-icerik).
  const yapim = yeniIcerikAcik()
    ? await getExhibitionPhotosBySlugs(withImage.map((p) => `yapim-${p.slug}`))
    : []
  const projeAdi = new Map(withImage.map((p) => [`yapim-${p.slug}`, p]))

  const steps = Object.values(t.raw('steps') as Record<string, { t: string; b: string }>)

  return (
    <main>
      {/* Hero: metin solda, tek proje görseli sağda — 12 kolon */}
      <section className="grid grid-cols-1 gap-10 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6 md:pr-6">
          <p className="font-mono text-[12px] uppercase tracking-[var(--tracking-label)] text-[var(--accent)]">
            {t('heroEyebrow')}
          </p>
          <h1 className="mt-5 text-4xl leading-[1.08] sm:text-5xl">{t('heroTitle')}</h1>
          <p className="mt-6 max-w-[52ch] text-[length:var(--text-lead)] leading-[1.7] text-[var(--muted)]">
            {t('heroLead')}
          </p>
          {/* Rakamlar yalnız DB'deki gerçek kayıtlardan */}
          {stats.count > 0 && (
            <dl className="mt-10 grid grid-cols-3 border-t border-[var(--foreground)]">
              <div className="py-4 pr-3">
                <dt className="sr-only">{t('statProjects')}</dt>
                <dd className="font-mono text-2xl">{String(stats.count).padStart(2, '0')}</dd>
                <dd className="mt-1 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">{t('statProjects')}</dd>
              </div>
              {stats.yearRange && (
                <div className="border-l border-[var(--rule)] px-3 py-4">
                  <dt className="sr-only">{t('statYears')}</dt>
                  <dd className="font-mono text-lg sm:text-2xl">
                    {stats.yearRange[0]}–<wbr />{stats.yearRange[1]}
                  </dd>
                  <dd className="mt-1 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">{t('statYears')}</dd>
                </div>
              )}
              {stats.places > 0 && (
                <div className="border-l border-[var(--rule)] px-3 py-4">
                  <dt className="sr-only">{t('statPlaces')}</dt>
                  <dd className="font-mono text-2xl">{String(stats.places).padStart(2, '0')}</dd>
                  <dd className="mt-1 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">{t('statPlaces')}</dd>
                </div>
              )}
            </dl>
          )}
          <a
            href={k('/iletisim')}
            className="mt-10 inline-flex min-h-11 cursor-pointer items-center bg-[var(--accent)] px-6 text-[length:var(--text-meta)] text-white transition-opacity duration-[var(--dur-micro)] hover:opacity-90"
          >
            {t('ctaButton')}
          </a>
        </div>
        {hero && (
          <a href={k(`/projeler/${hero.slug}`)} className="relative block aspect-[4/3] overflow-hidden bg-[#e6e9e8] md:col-span-6">
            <Image src={hero.images[0].url} alt={isTr ? hero.titleTr : hero.titleEn} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </a>
        )}
      </section>

      {/* Seçili projeler — proje türü sekmeleri (Spode sekme deseni) */}
      <section className="border-t border-[var(--rule)] py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="text-2xl sm:text-3xl">{t('featured')}</h2>
          <a href={k('/projeler')} className="shrink-0 text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--accent)]">
            {t('allProjects')} &rarr;
          </a>
        </div>
        <SeriesTabs
          label={t('tabsLabel')}
          groups={groups.map((g) => ({
            key: g.cat,
            label: tg.has(`categories.${g.cat}`) ? tg(`categories.${g.cat}`) : g.cat,
            content: (
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((p, i) => (
                  <ProjectCard
                    key={p.id}
                    href={k(`/projeler/${p.slug}`)}
                    no={projectNo(i)}
                    title={isTr ? p.titleTr : p.titleEn}
                    image={p.images[0]?.url ?? null}
                    meta={[p.year ? String(p.year) : null, p.collection, isTr ? p.dimensionsTr : p.dimensionsEn]}
                  />
                ))}
              </div>
            ),
          }))}
        />
      </section>

      {/* Yapım ve montajdan kareler — Spode "Sofralardan kareler"in kurumsal
          karşılığı; gizli içerikle birlikte açılır. */}
      {yapim.length > 0 && (
        <section className="border-t border-[var(--rule)] py-16">
          <h2 className="mb-8 text-2xl sm:text-3xl">{t('makingTitle')}</h2>
          <CardRail label={t('makingTitle')} prevLabel={th('railPrev')} nextLabel={th('railNext')}>
            {yapim.map((f) => {
              const p = projeAdi.get(f.exhibitionSlug)
              return (
                <a key={f.id} href={p ? k(`/projeler/${p.slug}`) : undefined} className="w-[80%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e6e9e8]">
                    <Image src={f.url} alt={p ? `${isTr ? p.titleTr : p.titleEn} — ${t('makingProject')}` : ''} fill className="object-cover" sizes="(max-width: 640px) 80vw, 33vw" />
                  </div>
                  {p && <p className="mt-3 font-mono text-[12px] text-[var(--muted)]">{isTr ? p.titleTr : p.titleEn}</p>}
                </a>
              )
            })}
          </CardRail>
        </section>
      )}

      {/* Referans mekânlar — kurum ADLARI, logosuz */}
      {mekanlar.length > 0 && (
        <section className="grid grid-cols-1 gap-8 border-t border-[var(--rule)] py-16 md:grid-cols-12">
          <h2 className="text-2xl sm:text-3xl md:col-span-4">{t('referencesTitle')}</h2>
          <ul className="border-t border-[var(--foreground)] md:col-span-8">
            {mekanlar.map((m) => (
              <li key={m} className="border-b border-[var(--rule)] py-3 text-[length:var(--text-body)]">{m}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Süreç özeti — 5 adım (sanatçının "Yapım Süreci" metinlerinden) */}
      <section className="border-t border-[var(--rule)] py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="text-2xl sm:text-3xl">{t('processSummary')}</h2>
          <a href={k('/surec')} className="shrink-0 text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--accent)]">
            {t('processMore')} &rarr;
          </a>
        </div>
        <ol className="grid grid-cols-1 gap-px bg-[var(--rule)] sm:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.t} className="bg-[var(--background)] py-5 pr-4 sm:px-4 sm:first:pl-0">
              <span className="font-mono text-[12px] text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-[length:var(--text-meta)] leading-snug">{s.t}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
