-- Gizli içerik açılışı (Çağrı onayı 11.10.2026): 20 ürün. Yedek: yedek/gizli-urunler-2026-10-11.json
BEGIN;
UPDATE products SET is_visible = true WHERE id IN (41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60) AND is_visible = false;
COMMIT;
