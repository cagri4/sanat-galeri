-- Üretildi: scripts/masal-belgeler-2026-10-16.py — dev-fotograflari. Silme yok, eski kare(ler) gizlenir.
-- Geri alma: 2026-10-16-dev-fotograflari-GERI-AL.sql
BEGIN;
UPDATE product_images SET is_visible = false WHERE id IN (569);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES (51, 'https://res.cloudinary.com/df0henatz/image/upload/v1792135631/uarttasarim/heykel/dev-6.jpg', 5, true); -- Dev /dev6.jpg
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES (51, 'https://res.cloudinary.com/df0henatz/image/upload/v1792135634/uarttasarim/heykel/dev-7.jpg', 6, true); -- Dev /dev7.jpg
COMMIT;
