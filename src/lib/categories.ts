/**
 * Sitenin kanonik kategori listesi.
 *
 * DB'de kategori adı TR kanonik değeriyle saklanır; EN karşılığı
 * messages/*.json içindeki `gallery.categories` sözlüğünden gelir.
 *
 * Bu liste sabittir: bir kategoride henüz eser olmasa bile filtrede görünür
 * ve "içerik yakında" boş durumu gösterilir (kategori kaybolmaz).
 */
export const CATEGORIES = [
  'Antik Dönem Replikaları',
  'Resimli Seramikler',
  'Seramik Heykeller',
  'Mimari Duvar Panoları',
] as const

export type Category = (typeof CATEGORIES)[number]

/**
 * Kategori altındaki koleksiyonlar (alt-seri).
 * Fotoğraflar geldikçe eserler bu koleksiyonlara bağlanacak.
 */
export const COLLECTIONS: Record<string, { tr: string; en: string }[]> = {
  'Resimli Seramikler': [{ tr: 'Zamansız Manzaralar', en: 'Timeless Landscapes' }],
}

/** Kategori sayfası adresi (/koleksiyonlar/[slug]). */
export const CATEGORY_SLUGS: Record<string, string> = {
  'Antik Dönem Replikaları': 'antik-donem-replikalari',
  'Resimli Seramikler': 'resimli-seramikler',
  'Seramik Heykeller': 'seramik-heykeller',
  'Mimari Duvar Panoları': 'mimari-duvar-panolari',
}

export function categoryBySlug(slug: string): string | null {
  return Object.entries(CATEGORY_SLUGS).find(([, s]) => s === slug)?.[0] ?? null
}
