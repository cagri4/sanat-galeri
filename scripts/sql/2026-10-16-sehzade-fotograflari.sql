-- Üretildi: scripts/masal-belgeler-2026-10-16.py — sehzade-fotograflari. Silme yok, eski kare(ler) gizlenir.
-- Geri alma: 2026-10-16-sehzade-fotograflari-GERI-AL.sql
BEGIN;
UPDATE product_images SET is_visible = false WHERE id IN (588, 589);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES (55, 'https://res.cloudinary.com/df0henatz/image/upload/v1792135635/uarttasarim/heykel/sehzade-2026-10-1.jpg', 2, true); -- Şehzade/Şehzade
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES (55, 'https://res.cloudinary.com/df0henatz/image/upload/v1792135637/uarttasarim/heykel/sehzade-2026-10-2.jpg', 3, true); -- Şehzade/Şehzade.1
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES (55, 'https://res.cloudinary.com/df0henatz/image/upload/v1792135638/uarttasarim/heykel/sehzade-2026-10-3.jpg', 4, true); -- Şehzade/Şehzade.2
COMMIT;
