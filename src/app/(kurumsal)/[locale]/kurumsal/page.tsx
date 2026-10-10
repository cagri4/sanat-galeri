import Image from 'next/image'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { kurumsalPath } from '@/lib/site'
import { projectNo, projectStats } from '@/lib/kurumsal'
import ProjectCard from '@/components/kurumsal/project-card'

export default async function KurumsalHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const host = (await headers()).get('host') ?? ''
  const k = (path = '') => kurumsalPath(host, locale, path)

  let projects: Awaited<ReturnType<typeof getProducts>> = []
  try {
    projects = await getProducts(undefined, 'kurumsal')
  } catch {
    // DB yoksa boş durum
  }
  const withImage = projects.filter((p) => p.images?.[0]?.url)
  const hero = withImage[0]
  const featured = withImage.slice(0, 6)
  const stats = projectStats(projects)

  return (
    <main>
      {/* Hero: metin solda, tek proje görseli sağda — 12 kolon */}
      <section className="grid grid-cols-1 gap-10 py-16 md:grid-cols-12 md:py-24">
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
              <div className="py-4 pr-4">
                <dt className="font-mono text-2xl">{String(stats.count).padStart(2, '0')}</dt>
                <dd className="mt-1 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--muted)]">{t('statProjects')}</dd>
              </div>
              {stats.yearRange && (
                <div className="border-l border-[var(--rule)] px-4 py-4">
                  <dt className="font-mono text-2xl">{stats.yearRange[0]}–{stats.yearRange[1]}</dt>
                  <dd className="mt-1 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--muted)]">{t('statYears')}</dd>
                </div>
              )}
              {stats.places > 0 && (
                <div className="border-l border-[var(--rule)] px-4 py-4">
                  <dt className="font-mono text-2xl">{String(stats.places).padStart(2, '0')}</dt>
                  <dd className="mt-1 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--muted)]">{t('statPlaces')}</dd>
                </div>
              )}
            </dl>
          )}
          <a
            href={k('/iletisim')}
            className="mt-10 inline-flex min-h-11 items-center bg-[var(--accent)] px-6 text-[length:var(--text-meta)] text-white transition-opacity duration-[var(--dur-micro)] hover:opacity-90"
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

      <section className="border-t border-[var(--rule)] py-16">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="text-2xl sm:text-3xl">{t('featured')}</h2>
          <a href={k('/projeler')} className="shrink-0 text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--accent)]">
            {t('allProjects')} &rarr;
          </a>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
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
      </section>
    </main>
  )
}
