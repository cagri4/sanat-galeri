-- Önceki sıra (yedek: scripts/sql/yedek/products-2026-11-10-gorevA-oncesi.json)
BEGIN;
UPDATE products SET sort_order = 0 WHERE slug = 'afrodit-ve-kaz';
UPDATE products SET sort_order = 1 WHERE slug = 'europa';
UPDATE products SET sort_order = 2 WHERE slug = 'mainad';
UPDATE products SET sort_order = 3 WHERE slug = 'thetis';
UPDATE products SET sort_order = 4 WHERE slug = 'siren';
UPDATE products SET sort_order = 5 WHERE slug = 'geometrik-donem-tabak';
UPDATE products SET sort_order = 6 WHERE slug = 'geometrik-donem-toren-kabi';
UPDATE products SET sort_order = 7 WHERE slug = 'volutlu-krater';
UPDATE products SET sort_order = 8 WHERE slug = 'can-krater';
UPDATE products SET sort_order = 9 WHERE slug = 'aulos-calan-menad-kylix';
COMMIT;
