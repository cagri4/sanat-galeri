/**
 * Sanatci profil gorselleri — yuvarlak avatar (sanatci sayfasi basligi + Hakkimizda > Sanatcilar).
 * 21 Eki 2026: ablamin yeni fotolari (Drive "Hakkimizda/Melike.jpg, şeref.jpg"), kare 640 px
 * (scripts/ablam-21eki.py). Kaynaklar 1500 ve 2448 px kare — artik yuksek cozunurluklu.
 */
export const ARTIST_AVATARS: Record<string, { src: string; alt: { tr: string; en: string } }> = {
  seref: {
    src: '/brand/seref-avatar.jpg',
    alt: {
      tr: 'Şeref Doğan’ın elleri, çarkta çamuru şekillendirirken',
      en: 'Şeref Doğan’s hands shaping clay on the wheel',
    },
  },
  melike: {
    src: '/brand/melike-avatar.jpg',
    alt: {
      tr: 'Melike Doğan fırçayla bir seramik formu boyarken',
      en: 'Melike Doğan painting a ceramic form with a brush',
    },
  },
}

/** Yuvarlak avatar icin ortak sinif — her yerde ayni gorunsun. */
export const AVATAR_CLASS =
  'rounded-full object-cover ring-1 ring-[var(--rule)]'
