/**
 * Şeref sitesi stüdyo kareleri (SEREF-FOTO-BRIEF.md, Çağrı kararı 19 Eki).
 * scripts/seref-studio.py ile eserin GERÇEK fotoğraflarından üretildi: arka plan atıldı (IS-Net, yerel),
 * pano perspektifi künye oranına düzlendi, detaylar kare kırpıldı. Üretici AI yok — yüzey yeniden boyanmadı.
 * Hepsi 1600×1600, aynı nötr zemin (#F1F0EE). Anahtar: product_images.id (kaynak fotoğraf).
 * Yalnız bireysel sitede kullanılır; galeri/kurumsal eser sayfaları ve veritabanı değişmez.
 */
const BASE = 'https://res.cloudinary.com/df0henatz/image/upload'
export const STUDIO_FOLDER = 'uarttasarim/seref-studio'

/** Eser slug → seçili kareler (ilki: eserin tamamı; sonrakiler detay). */
export const SEREF_STUDIO: Record<string, number[]> = {
  'canakkale-sehitleri-anisina': [198, 199, 201, 204],
  'yurekli-yigitlerin-anisina-1915': [208, 210, 211, 218],
  'troia-yili-anisina-1915': [237, 241, 229, 232],
  'sifanin-isigi': [191, 192, 193, 195],
  'akarin-deryasi': [602, 599, 601, 607],
  'bilginin-kaynagi': [611, 612, 614, 615],
  'turk-denizcilerinin-sesi': [629, 633],
  'guzel-bakis': [244, 245, 246, 247],
  'parion-esintisi': [179, 188, 182, 190],
  'gonul-gozu': [168, 171, 172, 176],
  'gizem-olusum-ve-sonsuzluk': [620, 626, 627, 628],
  'anadolu-ekininde-guzeller': [647, 637, 645, 649],
  // Antik dönem replikaları: eser başına tek kare
  'volutlu-krater': [496],
  'geometrik-donem-toren-kabi': [518],
  'can-krater': [483],
  'afrodit-ve-kaz': [478],
  'aulos-calan-menad-kylix': [511],
  'geometrik-donem-tabak': [485],
}

/** Hero: Anadolu Ekininde Güzeller, stüdyo zemininde (2400×1350, eser sağda, solda ad için boşluk). */
export const SEREF_HERO = { slug: 'anadolu-ekininde-guzeller', title: 'Anadolu Ekininde Güzeller', src: `${BASE}/f_auto,q_auto/${STUDIO_FOLDER}/hero.jpg` }

export function studioUrl(id: number, w = 800) {
  return `${BASE}/c_limit,w_${w},f_auto,q_auto/${STUDIO_FOLDER}/${id}.jpg`
}
