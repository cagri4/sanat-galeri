/**
 * Sanatci profil gorselleri (atolye calismasindan, GERCEK).
 *
 * ⚠️ KULLANIM SINIRI: kaynak dosyalar kucuk cozunurluklu
 *   - seref-atolye.jpg   660x602
 *   - melike-atolye.jpg  365x430 (yumusak video karesi, olculu keskinlestirildi)
 * Bu yuzden YALNIZCA kucuk / yuvarlak profil gorseli olarak kullanilir.
 * Hero'da veya buyuk bolum gorseli olarak KULLANILMAZ — pikselli gorunur.
 *
 * Yuksek cozunurluklu orijinaller gelince buradaki dosyalar degistirilecek
 * ve boyut siniri kaldirilabilir.
 */
export const ARTIST_AVATARS: Record<string, { src: string; alt: { tr: string; en: string } }> = {
  seref: {
    src: '/brand/seref-avatar.jpg',
    alt: {
      tr: 'Şeref Doğan atölyede, tornada kap şekillendirirken',
      en: 'Şeref Doğan in the studio, shaping a vessel on the wheel',
    },
  },
  melike: {
    src: '/brand/melike-avatar.jpg',
    alt: {
      tr: 'Melike Doğan atölyede, desenli bir kâseyle çalışırken',
      en: 'Melike Doğan in the studio, working on a patterned bowl',
    },
  },
}

/** Yuvarlak avatar icin ortak sinif — her yerde ayni gorunsun. */
export const AVATAR_CLASS =
  'rounded-full object-cover ring-1 ring-[var(--rule)]'
