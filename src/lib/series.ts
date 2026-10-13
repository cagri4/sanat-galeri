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
