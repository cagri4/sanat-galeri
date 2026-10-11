-- Sergi afişleri "Sergiden kareler" şeridinden çıkar; SİLİNMEZ, sergi kaydının görseli olarak kalır.
-- 4 satır görselden teyit edildi (dosya adlarında "AFİŞ"): 113 bozcaada-2010-ek, 131 bendeki-…-2012,
-- 140 yolculuk-2-aksit-2010, 144 yolculuklar-armagrandi-2011. Kod: lib/yeni-icerik.ts SERGI_AFISI.
BEGIN;
UPDATE exhibition_photos SET title_tr = 'Sergi afişi', title_en = 'Exhibition poster'
 WHERE id IN (113, 131, 140, 144) AND title_tr IS NULL;
COMMIT;
