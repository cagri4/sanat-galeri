-- 2026-10-13-anadolu-fotograf-yenile.sql geri alma. Cloudinary dosyaları kalır.
BEGIN;
DELETE FROM product_images WHERE url LIKE '%/uarttasarim/heykel/anadolu-ekininde-guzeller-2026-10-%';
UPDATE product_images SET is_visible = true, sort_order = sort_order - 100 WHERE id IN (590, 591, 592, 593, 594, 595, 596, 597, 598) AND sort_order >= 100;
DELETE FROM exhibition_photos WHERE exhibition_slug = 'nuve-nucleus-marina-2008' AND url LIKE '%/uarttasarim/heykel/anadolu-ekininde-guzeller-%';
COMMIT;
