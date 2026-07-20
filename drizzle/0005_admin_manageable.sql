-- Admin panelinden yönetilebilirlik için eklenen alanlar (2026-07-20).
-- Denetimde bulunan boşluklar: "Replika Hakkında" metni, koleksiyon alanı,
-- ana sayfa hero/Instagram seçimi ve Bozcaada sergi fotoğrafları kodda sabitti.

-- "Replika Hakkında" — eser sayfasındaki sabit bölüm. Boş bırakılırsa site
-- çeviri dosyasındaki genel metne düşer (gallery.aboutText).
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "about_tr" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "about_en" text;

-- Koleksiyon / alt-seri (ör. "Resimli Seramikler" altında "Zamansız Manzaralar").
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "collection" text;

-- Ana sayfa yerleşimleri. NULL = o bölümde gösterilme.
-- Küçük sayı önce gelir; hero için ilk 5, Instagram için ilk 9 kullanılır.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hero_order" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "instagram_order" integer;

-- Sergi fotoğrafları (Bozcaada 2010 ve sonraki sergiler).
-- `exhibition_slug` sayfa yolundaki sergi kimliği: 'bozcaada-2010'.
CREATE TABLE IF NOT EXISTS "exhibition_photos" (
  "id" serial PRIMARY KEY NOT NULL,
  "exhibition_slug" text NOT NULL,
  "url" text NOT NULL,
  "title_tr" text,
  "title_en" text,
  "caption_tr" text,
  "caption_en" text,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "exhibition_photos_slug_idx"
  ON "exhibition_photos" ("exhibition_slug", "sort_order");

-- RLS: diğer public tablolarla aynı desen — herkese okuma, yazma yalnızca
-- service_role ile (admin sunucu tarafı) mümkün.
ALTER TABLE "exhibition_photos" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_exhibition_photos" ON "exhibition_photos";
CREATE POLICY "public_read_exhibition_photos"
  ON "exhibition_photos" FOR SELECT TO public USING (true);
