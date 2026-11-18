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
export type CollectionInfo = { tr: string; en: string; about?: { tr: string; en: string } }

/**
 * Seri açıklaması TEK yerde (`about`): eser sayfalarında ve koleksiyon sayfasında
 * buradan basılır. Metin sanatçının kendisinin — kelimesine dokunulmaz; yalnız
 * satır sonu (\n) ve paragraf (\n\n) eklendi. Zamansız Manzaralar: Melike,
 * Çağrı onayı 18 Kas 2026 ("yok" satırları alt alta).
 */
export const COLLECTIONS: Record<string, CollectionInfo[]> = {
  'Resimli Seramikler': [
    {
      tr: 'Zamansız Manzaralar',
      en: 'Timeless Landscapes',
      about: {
        tr: 'Doğayı temsil etmekten çok, doğanın maddesel hafızasını ve insanda bıraktığı şiirsel etkileri araştırıyorum.\n\nPerspektif yok,\nsabit zaman yok,\ntek bakış noktası yok,\nnet sınırlar yok.\n\nBu yüzden bir zamana ait değiller; gelip geçen bir an, hafızanın izleri.',
        en: 'Rather than representing nature, I explore its material memory and the poetic traces it leaves in us.\n\nNo perspective,\nno fixed time,\nno single point of view,\nno clear borders.\n\nThat is why they belong to no time: a passing moment, traces of memory.',
      },
    },
  ],
}

/** Eserin koleksiyonunun seri açıklaması (o dilde); yoksa null. */
export function collectionAbout(collection: string | null | undefined, locale: string): string | null {
  if (!collection) return null
  const hit = Object.values(COLLECTIONS).flat().find((c) => c.tr === collection)
  return hit?.about ? hit.about[locale === 'tr' ? 'tr' : 'en'] : null
}

/**
 * Eser künyesindeki koleksiyon adının o dildeki karşılığı (Çağrı 18 Kas: EN eser
 * sayfasında "Zamansız Manzaralar" kalıyordu; menüde "Timeless Landscapes").
 * DB'de `collection` tek dilli (TR). Çevirisi COLLECTIONS'ta olan ad çevrilir;
 * seri adları (Masalın Hafızası, Anadolu Ekininde Güzeller, Anka, Şahmaran) özel
 * ad olduğu için aynen kalır, yalnız "… Serisi" eki EN'de "… Series" olur.
 */
export function collectionLabel(collection: string | null | undefined, locale: string): string | null {
  if (!collection) return null
  if (locale === 'tr') return collection
  const hit = Object.values(COLLECTIONS).flat().find((c) => c.tr === collection)
  if (hit) return hit.en
  return collection.replace(/ — (.+) Serisi$/, ' — $1 Series')
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
