-- Stüdyo karesi (ANA-SITE-FOTO-BRIEF, Çağrı onayı 20 Eki 2026): temiz nötr zemin + 1:1 kare.
-- scripts/ana-site-studio.py çıktısı Cloudinary'de (uarttasarim/studio/<id>.jpg); orijinal "url" DEĞİŞMEZ.
-- Kod bu kolonu yalnız UART_STUDIO_FOTO=1 iken kullanır (lib/queries/gallery.ts) — canlı, bayrak
-- Production'a eklenene kadar etkilenmez. Varsayılan NULL: mevcut satırlar ve eski kod değişmez.
-- Geri alma: ALTER TABLE "product_images" DROP COLUMN IF EXISTS "studio_url";
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "studio_url" text;
