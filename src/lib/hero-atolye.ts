/**
 * Galeri ana sayfa girişi: ATÖLYEDEN kareler (sanatçı 13 Eki: girişteki pano
 * görseli "çok ilgisiz", "atölyeden görünüşler" konsun). Kaynak: panoların
 * yapım/montaj fotoğrafları (exhibition_photos, slug yapim-<eser>) içinden
 * atölye İÇİNDE çekilmiş olanlar — 87 kare tek tek bakılarak seçildi.
 * Fotoğraftaki kişi adlandırılmaz (kim olduğu doğrulanmadı).
 * Dosya adıyla eşlenir (Cloudinary public_id sonu), DB id'sine bağlı değil.
 */
export const HERO_ATOLYE: { slug: string; file: string; eser: string }[] = [
  { slug: 'yapim-canakkale-sehitleri-anisina', file: 'canakkale-sehitleri-anisina-11', eser: 'canakkale-sehitleri-anisina' },
  { slug: 'yapim-bilginin-kaynagi', file: 'bilginin-kaynagi-3', eser: 'bilginin-kaynagi' },
  { slug: 'yapim-troia-yili-anisina-1915', file: 'troia-yili-anisina-1915-1', eser: 'troia-yili-anisina-1915' },
]

/** Fotoğraf listesinden seçili atölye karelerini sırasıyla döndürür; bulunmayan atlanır. */
export function pickAtolye<T extends { exhibitionSlug: string; url: string }>(photos: T[]): (T & { eser: string })[] {
  return HERO_ATOLYE.flatMap((h) => {
    const f = photos.find((p) => p.exhibitionSlug === h.slug && new RegExp(`/${h.file}\\.[a-z]+$`).test(p.url))
    return f ? [{ ...f, eser: h.eser }] : []
  })
}
