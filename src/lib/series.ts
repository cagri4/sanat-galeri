/**
 * Heykel serileri (13 Eki, sanatçı: "Anadolu Ekininde Güzeller ... Masalın
 * Hafızası'ndan ayrılması lazım"). Seri = koleksiyon adının ana kısmı:
 * "Masalın Hafızası — Anka Serisi" → "Masalın Hafızası". Veri zaten ayrı
 * (products.collection); bu yardımcı yalnız GÖSTERİMİ seri başlıklarıyla böler.
 *
 * ⚠️ Yalnız heykeller için: panolarda `collection` uygulama YERİDİR, seri değil.
 */
export const SERIES_CATEGORY = 'Seramik Heykeller'

export function seriesName(collection: string | null | undefined): string | null {
  const base = collection?.split(' — ')[0]?.trim()
  return base || null
}

/** Sıra korunur (sanatçının sort_order'ı); seri, ilk eserinin yerinde başlar. */
export function groupBySeries<T extends { collection?: string | null }>(items: T[]): { series: string | null; items: T[] }[] {
  const groups: { series: string | null; items: T[] }[] = []
  for (const it of items) {
    const s = seriesName(it.collection)
    const g = groups.find((x) => x.series === s)
    if (g) g.items.push(it)
    else groups.push({ series: s, items: [it] })
  }
  return groups
}

/**
 * Heykeller İKİ AYRI SAYFA (sanatçı 13 Eki 21:29: "Biri masalın hafızası diğeri
 * Anadolu ekininde güzeller"). Eski /koleksiyonlar/seramik-heykeller 301 ile
 * /koleksiyonlar'a gider (iki seri orada yan yana) — lib/site-routing.
 * Seri adları özel ad; iki dilde de aynen yazılır.
 */
export const SERIES_PAGES: { slug: string; series: string; category: string }[] = [
  { slug: 'masalin-hafizasi', series: 'Masalın Hafızası', category: SERIES_CATEGORY },
  { slug: 'anadolu-ekininde-guzeller', series: 'Anadolu Ekininde Güzeller', category: SERIES_CATEGORY },
]

export function seriesPageBySlug(slug: string) {
  return SERIES_PAGES.find((s) => s.slug === slug) ?? null
}

export function seriesSlug(series: string | null | undefined): string | null {
  return SERIES_PAGES.find((s) => s.series === series)?.slug ?? null
}

/**
 * Galeri koleksiyon sayfaları sırayla: kategori sayfaları, heykel kategorisi
 * yerine iki seri sayfası. Menü, /koleksiyonlar, ana sayfa blokları ve sitemap
 * bu listeden beslenir.
 */
export function galleryCollections(categories: string[], categorySlugs: Record<string, string>) {
  return categories.flatMap((category) =>
    category === SERIES_CATEGORY
      ? SERIES_PAGES.map((s) => ({ slug: s.slug, category, series: s.series as string | null }))
      : [{ slug: categorySlugs[category], category, series: null as string | null }],
  )
}

/** Bir koleksiyon girdisine düşen eserler (seri sayfasında yalnız o seri). */
export function itemsFor<T extends { category: string; collection?: string | null }>(
  items: T[],
  c: { category: string; series: string | null },
): T[] {
  return items.filter((p) => p.category === c.category && (!c.series || seriesName(p.collection) === c.series))
}
