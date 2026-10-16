-- 2026-10-16-dev-fotograflari.sql geri alma. Cloudinary dosyaları kalır.
BEGIN;
DELETE FROM product_images WHERE product_id = 51 AND url IN ('https://res.cloudinary.com/df0henatz/image/upload/v1792135631/uarttasarim/heykel/dev-6.jpg', 'https://res.cloudinary.com/df0henatz/image/upload/v1792135634/uarttasarim/heykel/dev-7.jpg');
UPDATE product_images SET is_visible = true WHERE id IN (569);
COMMIT;
