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

/**
 * Ana sayfa "Sanatçılarımız" Şeref Doğan kartının GEÇİCİ görseli (Çağrı 13 Eki):
 * pano yerine atölyeden, KİŞİ GÖRÜNMEYEN bir kare — fırının içi, raflarda Çanakkale
 * Şehitleri Anısına panosunun parçaları. Kişili kare seçilmedi: kartta "bu kişi
 * Şeref" izlenimi verir, kim olduğu doğrulanmadı. Gerçek portre gelince değişir.
 */
export const SEREF_KART_ATOLYE = { slug: 'yapim-canakkale-sehitleri-anisina', file: 'canakkale-sehitleri-anisina-1' }

function matches(p: { exhibitionSlug: string; url: string }, h: { slug: string; file: string }) {
  return p.exhibitionSlug === h.slug && new RegExp(`/${h.file}\\.[a-z]+$`).test(p.url)
}

/** Tek kare bul (yoksa null). */
export function pickOne<T extends { exhibitionSlug: string; url: string }>(photos: T[], h: { slug: string; file: string }): T | null {
  return photos.find((p) => matches(p, h)) ?? null
}

/** Fotoğraf listesinden seçili atölye karelerini sırasıyla döndürür; bulunmayan atlanır. */
export function pickAtolye<T extends { exhibitionSlug: string; url: string }>(photos: T[]): (T & { eser: string })[] {
  return HERO_ATOLYE.flatMap((h) => {
    const f = photos.find((p) => matches(p, h))
    return f ? [{ ...f, eser: h.eser }] : []
  })
}
