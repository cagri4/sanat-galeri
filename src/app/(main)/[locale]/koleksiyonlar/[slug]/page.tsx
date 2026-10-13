import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { categoryBySlug } from '@/lib/categories'
import { isOnSite } from '@/lib/site'
import ArtworkGrid from '@/components/gallery/artwork-grid'
import PageBanner, { bannerFromProducts } from '@/components/shared/page-banner'
import { SERIES_CATEGORY, itemsFor, seriesPageBySlug } from '@/lib/series'
import Reveal from '@/components/motion/reveal'

/**
 * Galeri kategori (koleksiyon) sayfası.
 *
 * Antik Dönem Replikaları sayfası eski /teknik sayfasının metnini taşır:
 * Edit Talepleri satır 11 "Teknik alanını kaldır" → sayfa kaldırıldı, metin
 * kaybolmasın diye buraya (#terra-sigillata) alındı; /teknik buraya 301 verir.
 * TÜM METİN sanatçının kendi dokümanından (SANATCI-SITE-DUZENI.md).
 */

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

const ANTIK = 'Antik Dönem Replikaları'

/**
 * Sayfa kaynağı: galeri kategorisi YA DA heykel seri sayfası (13 Eki: heykeller
 * iki ayrı sayfa). Heykel kategorisinin eski tek sayfası artık yok — 301
 * /koleksiyonlar'a (lib/site-routing).
 */
function resolveCollection(slug: string): { category: string; series: string | null } | null {
  const seri = seriesPageBySlug(slug)
  if (seri) return { category: seri.category, series: seri.series }
  const cat = categoryBySlug(slug)
  // Yalnız galeride yer alan kategoriler; panolar kurumsal sitededir.
  if (!cat || !isOnSite(cat, 'galeri') || cat === SERIES_CATEGORY) return null
  return { category: cat, series: null }
}

/**
 * Seri sayfası banner'ı sanatçının seçtiği fotoğraf (yoksa sayfanın kendi eserlerinden).
 * Masalın Hafızası: "Masalın Hafızası: Anadolu'dan Günümüze Seramik Bedenler"
 * (sanatçı teyidi 13 Eki 23:47).
 */
/**
 * Seri banner'ının üst satırı. Varsayılan: kategori adı ("Seramik Heykeller").
 * Masalın Hafızası: sanatçı 14 Eki 00:03 — "seramik heykeller yerine Anadolu'dan
 * günümüze seramik bedenler yazsın" (serinin tam adı, Drive klasörü/belgesi).
 */
const SERIES_EYEBROWS: Record<string, { tr: string; en: string }> = {
  'masalin-hafizasi': { tr: 'Anadolu’dan Günümüze Seramik Bedenler', en: 'Ceramic Bodies from Anatolia to the Present' },
}

const SERIES_BANNERS: Record<string, string> = {
  // Sanatçı 13 Eki 23:47'de teyit etti: "Masalın Hafızası: Anadolu'dan Günümüze
  // Seramik Bedenler" (Drive ID 1QUU6qrd…, aynı dosya).
  'masalin-hafizasi': 'https://res.cloudinary.com/df0henatz/image/upload/v1791921809/uarttasarim/koleksiyon/masalin-hafizasi-banner-2026-10.jpg',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const c = resolveCollection(slug)
  if (!c) return {}
  const tg = await getTranslations({ locale, namespace: 'gallery' })
  return { title: c.series ?? (tg.has(`categories.${c.category}`) ? tg(`categories.${c.category}`) : c.category) }
}

/** Çoklu paragrafı ayrı <p>'lere bölerek okunur tutar. */
function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text.split('\n\n').filter(Boolean).map((p, i) => (
        <p key={i} className="max-w-[68ch] text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]">
          {p}
        </p>
      ))}
    </div>
  )
}

export default async function KoleksiyonPage({ params }: PageProps) {
  const { locale, slug } = await params
  const resolved = resolveCollection(slug)
  if (!resolved) notFound()
  const { category, series } = resolved

  const tg = await getTranslations({ locale, namespace: 'gallery' })
  const tc = await getTranslations({ locale, namespace: 'collection' })
  const tcol = await getTranslations({ locale, namespace: 'collectionsPage' })
  const t = await getTranslations({ locale, namespace: 'terra' })

  let products: Awaited<ReturnType<typeof getProducts>> = []
  try {
    products = itemsFor(await getProducts(category, 'galeri'), resolved)
  } catch {
    // DB yoksa sakin boş durum
  }

  const isAntik = category === ANTIK
  // Seri = koleksiyonun ana adı ("Masalın Hafızası — Anka Serisi" → "Masalın Hafızası").
  const seriMap = new Map<string, typeof products>()
  for (const p of products) {
    const k = p.collection ? p.collection.split(' — ')[0] : ''
    seriMap.set(k, [...(seriMap.get(k) ?? []), p])
  }
  const seriler = [...seriMap.entries()].filter(([k]) => k)
  const terraSections = [
    { title: t('s1title'), body: t('s1body') },
    { title: t('s2title'), body: t('s2body') },
    { title: t('s3title'), body: t('s3body') },
    { title: t('s4title'), body: t('s4body') },
  ]

  return (
    <main className="pb-16 pt-8 sm:pb-24 sm:pt-10">
      <PageBanner
        eyebrow={
          SERIES_EYEBROWS[slug]
            ? SERIES_EYEBROWS[slug][locale === 'tr' ? 'tr' : 'en']
            : series
              ? (tg.has(`categories.${category}`) ? tg(`categories.${category}`) : category)
              : tcol('title')
        }
        title={series ?? (tg.has(`categories.${category}`) ? tg(`categories.${category}`) : category)}
        image={
          SERIES_BANNERS[slug]
            ? { src: SERIES_BANNERS[slug], alt: series ?? '' }
            : bannerFromProducts(products, locale)
        }
      />

      {isAntik && (
        <div className="mt-6 max-w-[68ch]">
          <p className="text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]">
            {tc('jointProduction')}
          </p>
        </div>
      )}

      {/* Birden çok seri varsa seri başlıklarıyla; tek seride düz ızgara.
          (Heykeller artık seri başına ayrı sayfa — burada tek seri kalır.) */}
      {seriler.length > 1 && products.every((p) => p.collection) ? (
        <div className="mt-12 space-y-20">
          {seriler.map(([seri, items]) => (
            <section key={seri} className="border-t border-[var(--border)] pt-10 first:border-t-0 first:pt-0">
              <h2 className="flex items-baseline gap-4 text-2xl text-[var(--foreground)] sm:text-3xl">
                {seri}
                <span className="text-[length:var(--text-meta)] text-[var(--faint)]">{items.length}</span>
              </h2>
              <div className="mt-8">
                <ArtworkGrid products={items} locale={locale} category={category} />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <ArtworkGrid products={products} locale={locale} category={category} />
        </div>
      )}

      {isAntik && (
        // Eski /teknik sayfasının metni — kaybolmasın diye koleksiyona taşındı.
        <section id="terra-sigillata" className="mt-24 scroll-mt-24 border-t border-[var(--rule)] pt-16">
          <Reveal className="max-w-2xl">
            <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">
              {t('eyebrow')}
            </p>
            <h2 className="font-display mt-4 text-3xl leading-[1.15] text-[#2C2C2C] sm:text-4xl">
              {t('title')}
            </h2>
            <div className="mt-8">
              <Paragraphs text={t('lead')} />
            </div>
          </Reveal>
          <div className="mt-16 space-y-14">
            {terraSections.map((s) => (
              <Reveal as="section" key={s.title}>
                <h3 className="font-display text-2xl leading-snug text-[#2C2C2C] sm:text-3xl">{s.title}</h3>
                <div className="mt-5">
                  <Paragraphs text={s.body} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
