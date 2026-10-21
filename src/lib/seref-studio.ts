/**
 * Şeref sitesi — eser başına seçilen fotoğraflar (product_images.id; ilki eserin tamamı, sonrakiler detay).
 * 19 Eki stüdyo kareleri (scripts/seref-studio.py, uarttasarim/seref-studio/) 21 Eki'de GERİ ALINDI (Çağrı:
 * kesik/arka plansız görünüm kabul görmedi). Sayfa artık bu id'lerin ORİJİNAL fotoğraflarını gösterir.
 * Cloudinary'deki stüdyo dosyaları silinmedi (arşiv).
 */
/** Eser slug → seçili kareler (ilki: eserin tamamı; sonrakiler detay). */
export const SEREF_SECIM: Record<string, number[]> = {
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
