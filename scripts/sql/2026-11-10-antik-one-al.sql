-- Görev A (10 Kas, ablam): Antik Dönem / terra sigillata'da volütlü krater ve kylix eserleri öne.
-- Kylix: aulos-calan-menad-kylix (form "Kylix (tondo kompozisyonu)"), afrodit-ve-kaz (form "Kylix"). Volütlü krater: volutlu-krater.
-- Geri alma: 2026-11-10-antik-one-al-GERI-AL.sql
BEGIN;
UPDATE products SET sort_order = 0 WHERE slug = 'volutlu-krater';
UPDATE products SET sort_order = 1 WHERE slug = 'aulos-calan-menad-kylix';
UPDATE products SET sort_order = 2 WHERE slug = 'afrodit-ve-kaz';
UPDATE products SET sort_order = 3 WHERE slug = 'europa';
UPDATE products SET sort_order = 4 WHERE slug = 'mainad';
UPDATE products SET sort_order = 5 WHERE slug = 'thetis';
UPDATE products SET sort_order = 6 WHERE slug = 'siren';
UPDATE products SET sort_order = 7 WHERE slug = 'geometrik-donem-tabak';
UPDATE products SET sort_order = 8 WHERE slug = 'geometrik-donem-toren-kabi';
UPDATE products SET sort_order = 9 WHERE slug = 'can-krater';
COMMIT;
