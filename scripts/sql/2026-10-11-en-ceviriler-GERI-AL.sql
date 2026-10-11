-- GERİ ALMA: EN çeviriler. Önceki durum: bio_en NULL, title_en = title_tr.
BEGIN;
UPDATE artists SET bio_en = NULL WHERE slug IN ('melike','seref');
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Yolculuklar, Seramik Sergisi';
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Yolculuklar, Resim ve Seramik Sergisi';
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Yolculuk, Seramik Sergisi';
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Medeniyetler, Seramik Heykel Sergisi';
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Sınırsız Sergisi, Koridor Sanat Programı';
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Nüve / Nucleus, Kişisel Açık Hava Heykel Sergisi';
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'İzmir Rotary Kulübü 7. Altın Testi Seramik Yarışması, Özel Ödül, Kavramsal Formlar';
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Turgut Pura Anısına Resim ve Heykel Yarışması, Heykel Dalında İkincilik Ödülü, Doğadan 1';
UPDATE exhibitions SET title_en = title_tr WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'İzmir Rotary Kulübü 5. Altın Testi Seramik Yarışması, Gençlik Ödülü, Kavramsal Form';
COMMIT;
