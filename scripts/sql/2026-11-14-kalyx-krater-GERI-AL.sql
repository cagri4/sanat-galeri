-- Görev B (14 Kas): Çan Krater → Kalyx Krater (Drive'daki ad; form kalyx kratere uyuyor). UYGULANMADI, Çağrı onayı bekliyor. Slug aynı kalır.
BEGIN;
UPDATE products SET title_tr='Çan Krater', title_en='Bell Krater' WHERE slug='can-krater';
COMMIT;
