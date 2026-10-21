-- Güzel Bakış: ablamın 21 Eki yeni fotoğrafları (Drive). Eski kareler GİZLENİR (silinmez). Geri alma: -GERI-AL.sql
BEGIN;
UPDATE product_images SET is_visible = false WHERE id IN (248,251,244,245,246,247);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='guzel-bakis'), 'https://res.cloudinary.com/df0henatz/image/upload/v1792601367/uarttasarim/mimari/guzel-bakis-2026-10-21-1.jpg', 0, true);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='guzel-bakis'), 'https://res.cloudinary.com/df0henatz/image/upload/v1792601371/uarttasarim/mimari/guzel-bakis-2026-10-21-2.jpg', 1, true);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='guzel-bakis'), 'https://res.cloudinary.com/df0henatz/image/upload/v1792601373/uarttasarim/mimari/guzel-bakis-2026-10-21-3.jpg', 2, true);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='guzel-bakis'), 'https://res.cloudinary.com/df0henatz/image/upload/v1792601376/uarttasarim/mimari/guzel-bakis-2026-10-21-4.jpg', 3, true);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='guzel-bakis'), 'https://res.cloudinary.com/df0henatz/image/upload/v1792601379/uarttasarim/mimari/guzel-bakis-2026-10-21-5.jpg', 4, true);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='guzel-bakis'), 'https://res.cloudinary.com/df0henatz/image/upload/v1792601381/uarttasarim/mimari/guzel-bakis-2026-10-21-6.jpg', 5, true);
COMMIT;
