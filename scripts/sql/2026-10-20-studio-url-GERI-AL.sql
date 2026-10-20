-- 2026-10-20-studio-url.sql geri alma. Cloudinary dosyaları kalır.
BEGIN;
UPDATE product_images SET studio_url = NULL;
COMMIT;
