-- 2026-10-16-sehzade-fotograflari.sql geri alma. Cloudinary dosyaları kalır.
BEGIN;
DELETE FROM product_images WHERE product_id = 55 AND url IN ('https://res.cloudinary.com/df0henatz/image/upload/v1792135635/uarttasarim/heykel/sehzade-2026-10-1.jpg', 'https://res.cloudinary.com/df0henatz/image/upload/v1792135637/uarttasarim/heykel/sehzade-2026-10-2.jpg', 'https://res.cloudinary.com/df0henatz/image/upload/v1792135638/uarttasarim/heykel/sehzade-2026-10-3.jpg');
UPDATE product_images SET is_visible = true WHERE id IN (588, 589);
COMMIT;
