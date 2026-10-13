/**
 * Atölye kareleri (sanatçı 13 Eki 21:25: "Hakkımızda klasörünün içine atölyeden
 * fotolar koydum. Ana girişte o fotolardan koyabilirsin."). Kaynak: Drive
 * Studio/Hakkımızda/"Atölyeden fotolar" → exhibition_photos (slug 'atolye',
 * scripts/atolye-ve-banner-2026-10-13.py). Kareler kişisiz atölye görünümleri.
 * Dosya adıyla eşlenir (Cloudinary public_id sonu), DB id'sine bağlı değil.
 */
export const ATOLYE_SLUG = 'atolye'

/** Ana giriş üçlüsü (dikey kareler; mobilde yalnız ilki). */
export const HERO_ATOLYE: { slug: string; file: string }[] = [
  { slug: ATOLYE_SLUG, file: 'atolye-2026-10-8' }, // amforalar ve figürler
  { slug: ATOLYE_SLUG, file: 'atolye-2026-10-2' }, // raflar, resimli seramikler
  { slug: ATOLYE_SLUG, file: 'atolye-2026-10-6' }, // pencere önü raf
]

/** Şeref Doğan kartı: heykel formlarının göründüğü atölye karesi (kişisiz). */
export const SEREF_KART_ATOLYE = { slug: ATOLYE_SLUG, file: 'atolye-2026-10-7' }

/** Hakkımızda başlık bandı: geniş atölye karesi. */
export const HAKKIMIZDA_BANNER_ATOLYE = { slug: ATOLYE_SLUG, file: 'atolye-2026-10-11' }

function matches(p: { exhibitionSlug: string; url: string }, h: { slug: string; file: string }) {
  return p.exhibitionSlug === h.slug && new RegExp(`/${h.file}\\.[a-z]+$`).test(p.url)
}

/** Tek kare bul (yoksa null). */
export function pickOne<T extends { exhibitionSlug: string; url: string }>(photos: T[], h: { slug: string; file: string }): T | null {
  return photos.find((p) => matches(p, h)) ?? null
}

/** Seçili kareleri sırasıyla döndürür; bulunmayan atlanır. */
export function pickAtolye<T extends { exhibitionSlug: string; url: string }>(photos: T[], list = HERO_ATOLYE): T[] {
  return list.flatMap((h) => {
    const f = pickOne(photos, h)
    return f ? [f] : []
  })
}
