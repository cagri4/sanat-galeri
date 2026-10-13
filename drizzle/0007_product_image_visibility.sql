-- Fotoğraf GİZLEME (silmeden) — Çağrı onayı, 13 Eki 2026 (DURUM-ANADOLU-EKININDE-GUZELLER §4).
-- Sanatçı fotoğraf yenilediğinde eski kareler silinmez, is_visible=false ile
-- sitede gizlenir; Cloudinary'deki dosya ve DB satırı kalır. Temas tablosu
-- işaretlemeleri de bu alanla uygulanır.
-- Varsayılan TRUE: mevcut 466 satırın hiçbiri değişmez, eski kod etkilenmez.
-- Geri alma: ALTER TABLE "product_images" DROP COLUMN IF EXISTS "is_visible";
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "is_visible" boolean NOT NULL DEFAULT true;
