-- 2026-10-13-atolye-fotograflari.sql geri alma. Cloudinary dosyaları kalır.
BEGIN;
DELETE FROM exhibition_photos WHERE exhibition_slug = 'atolye' AND url LIKE '%/uarttasarim/atolye/atolye-2026-10-%';
COMMIT;
