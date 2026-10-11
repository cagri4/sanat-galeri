BEGIN;
UPDATE exhibition_photos SET title_tr = NULL, title_en = NULL WHERE id IN (113, 131, 140, 144) AND title_tr = 'Sergi afişi';
COMMIT;
