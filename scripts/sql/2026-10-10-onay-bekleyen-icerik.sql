-- ONAY BEKLİYOR — UYGULANMADI. Paylaşımlı DB: yazıldığı an canlıya yansır.
-- Çağrı onayından sonra, prod deploy ile aynı turda çalıştırılacak:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/2026-10-10-onay-bekleyen-icerik.sql
BEGIN;

-- 1) Troya / Troia (KARARLAR madde 6): Türkçe "Troya", yabancı dilde "Troia".
--    Slug (URL) değişmez. "Truva Savaşı" sanatçının ifadesi, kararın konusu
--    değil — dokunulmadı.
UPDATE products SET
  title_tr       = replace(title_tr, 'Troia', 'Troya'),
  description_tr = replace(description_tr, 'Troia', 'Troya'),
  about_tr       = replace(about_tr, 'Troia', 'Troya'),
  title_en       = regexp_replace(title_en, '\mTroy\M', 'Troia', 'g'),
  description_en = regexp_replace(description_en, '\mTroy\M', 'Troia', 'g'),
  about_en       = regexp_replace(about_en, '\mTroy\M', 'Troia', 'g')
WHERE slug = 'troia-yili-anisina-1915';

-- 2) Eski seed'den kalan UYDURMA basın kayıtları (example.com linkli; canlıda
--    /tr/melike/sergiler'de görünüyor). Uydurma içerik yasağı.
DELETE FROM press_items WHERE url LIKE 'https://example.com/%';

COMMIT;
