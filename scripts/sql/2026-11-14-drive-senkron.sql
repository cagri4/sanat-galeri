-- Görev B (14 Kas): Drive senkronu — sitede görünen ama Drive'da olmayan kare, aynı eserin Drive'da olup gizli duran karesiyle yer değiştirir.
-- UYGULANMADI: Çağrı onayı bekliyor. Önizleme: rc-inbox raporundaki link. Silme yok, yalnız is_visible/sort_order.
BEGIN;
UPDATE product_images SET is_visible=false WHERE id=187 AND is_visible=true;  -- parion-esintisi çıkan
UPDATE product_images SET is_visible=true, sort_order=8 WHERE id=185 AND is_visible=false;  -- parion-esintisi giren
UPDATE product_images SET is_visible=false WHERE id=195 AND is_visible=true;  -- sifanin-isigi çıkan
UPDATE product_images SET is_visible=true, sort_order=4 WHERE id=196 AND is_visible=false;  -- sifanin-isigi giren
UPDATE product_images SET is_visible=false WHERE id=217 AND is_visible=true;  -- yurekli-yigitlerin-anisina-1915 çıkan
UPDATE product_images SET is_visible=true, sort_order=9 WHERE id=209 AND is_visible=false;  -- yurekli-yigitlerin-anisina-1915 giren
UPDATE product_images SET is_visible=false WHERE id=226 AND is_visible=true;  -- troia-yili-anisina-1915 çıkan
UPDATE product_images SET is_visible=true, sort_order=0 WHERE id=690 AND is_visible=false;  -- troia-yili-anisina-1915 giren
UPDATE product_images SET is_visible=false WHERE id=229 AND is_visible=true;  -- troia-yili-anisina-1915 çıkan
UPDATE product_images SET is_visible=true, sort_order=3 WHERE id=227 AND is_visible=false;  -- troia-yili-anisina-1915 giren
UPDATE product_images SET is_visible=false WHERE id=231 AND is_visible=true;  -- troia-yili-anisina-1915 çıkan
UPDATE product_images SET is_visible=true, sort_order=5 WHERE id=228 AND is_visible=false;  -- troia-yili-anisina-1915 giren
UPDATE product_images SET is_visible=false WHERE id=232 AND is_visible=true;  -- troia-yili-anisina-1915 çıkan
UPDATE product_images SET is_visible=true, sort_order=6 WHERE id=230 AND is_visible=false;  -- troia-yili-anisina-1915 giren
UPDATE product_images SET is_visible=false WHERE id=241 AND is_visible=true;  -- troia-yili-anisina-1915 çıkan
UPDATE product_images SET is_visible=true, sort_order=15 WHERE id=243 AND is_visible=false;  -- troia-yili-anisina-1915 giren
UPDATE product_images SET is_visible=false WHERE id=262 AND is_visible=true;  -- the-sun-within-me çıkan
UPDATE product_images SET is_visible=true, sort_order=10 WHERE id=258 AND is_visible=false;  -- the-sun-within-me giren
UPDATE product_images SET is_visible=false WHERE id=264 AND is_visible=true;  -- the-sun-within-me çıkan
UPDATE product_images SET is_visible=true, sort_order=12 WHERE id=266 AND is_visible=false;  -- the-sun-within-me giren
UPDATE product_images SET is_visible=false WHERE id=269 AND is_visible=true;  -- the-turning-sky çıkan
UPDATE product_images SET is_visible=true, sort_order=1 WHERE id=274 AND is_visible=false;  -- the-turning-sky giren
UPDATE product_images SET is_visible=false WHERE id=288 AND is_visible=true;  -- the-turning-sky çıkan
UPDATE product_images SET is_visible=true, sort_order=20 WHERE id=284 AND is_visible=false;  -- the-turning-sky giren
UPDATE product_images SET is_visible=false WHERE id=295 AND is_visible=true;  -- the-inner-face-of-winter çıkan
UPDATE product_images SET is_visible=true, sort_order=6 WHERE id=290 AND is_visible=false;  -- the-inner-face-of-winter giren
UPDATE product_images SET is_visible=false WHERE id=305 AND is_visible=true;  -- the-inner-face-of-winter çıkan
UPDATE product_images SET is_visible=true, sort_order=16 WHERE id=292 AND is_visible=false;  -- the-inner-face-of-winter giren
UPDATE product_images SET is_visible=false WHERE id=309 AND is_visible=true;  -- the-abode-of-light çıkan
UPDATE product_images SET is_visible=true, sort_order=3 WHERE id=321 AND is_visible=false;  -- the-abode-of-light giren
UPDATE product_images SET is_visible=false WHERE id=319 AND is_visible=true;  -- the-abode-of-light çıkan
UPDATE product_images SET is_visible=true, sort_order=13 WHERE id=325 AND is_visible=false;  -- the-abode-of-light giren
UPDATE product_images SET is_visible=false WHERE id=322 AND is_visible=true;  -- the-abode-of-light çıkan
UPDATE product_images SET is_visible=true, sort_order=16 WHERE id=328 AND is_visible=false;  -- the-abode-of-light giren
UPDATE product_images SET is_visible=false WHERE id=331 AND is_visible=true;  -- the-rotating-sky çıkan
UPDATE product_images SET is_visible=true, sort_order=2 WHERE id=330 AND is_visible=false;  -- the-rotating-sky giren
UPDATE product_images SET is_visible=false WHERE id=333 AND is_visible=true;  -- the-rotating-sky çıkan
UPDATE product_images SET is_visible=true, sort_order=4 WHERE id=338 AND is_visible=false;  -- the-rotating-sky giren
UPDATE product_images SET is_visible=false WHERE id=342 AND is_visible=true;  -- the-rotating-sky çıkan
UPDATE product_images SET is_visible=true, sort_order=13 WHERE id=339 AND is_visible=false;  -- the-rotating-sky giren
UPDATE product_images SET is_visible=false WHERE id=353 AND is_visible=true;  -- the-threshold-of-the-day çıkan
UPDATE product_images SET is_visible=true, sort_order=6 WHERE id=691 AND is_visible=false;  -- the-threshold-of-the-day giren
UPDATE product_images SET is_visible=false WHERE id=362 AND is_visible=true;  -- the-threshold-of-the-day çıkan
UPDATE product_images SET is_visible=true, sort_order=15 WHERE id=350 AND is_visible=false;  -- the-threshold-of-the-day giren
UPDATE product_images SET is_visible=false WHERE id=377 AND is_visible=true;  -- around-the-water çıkan
UPDATE product_images SET is_visible=true, sort_order=6 WHERE id=373 AND is_visible=false;  -- around-the-water giren
UPDATE product_images SET is_visible=false WHERE id=386 AND is_visible=true;  -- around-the-water çıkan
UPDATE product_images SET is_visible=true, sort_order=15 WHERE id=384 AND is_visible=false;  -- around-the-water giren
UPDATE product_images SET is_visible=false WHERE id=389 AND is_visible=true;  -- inner-sun çıkan
UPDATE product_images SET is_visible=true, sort_order=0 WHERE id=390 AND is_visible=false;  -- inner-sun giren
UPDATE product_images SET is_visible=false WHERE id=393 AND is_visible=true;  -- inner-sun çıkan
UPDATE product_images SET is_visible=true, sort_order=4 WHERE id=392 AND is_visible=false;  -- inner-sun giren
UPDATE product_images SET is_visible=false WHERE id=398 AND is_visible=true;  -- inner-sun çıkan
UPDATE product_images SET is_visible=true, sort_order=9 WHERE id=396 AND is_visible=false;  -- inner-sun giren
UPDATE product_images SET is_visible=false WHERE id=429 AND is_visible=true;  -- the-trees-first-home çıkan
UPDATE product_images SET is_visible=true, sort_order=3 WHERE id=431 AND is_visible=false;  -- the-trees-first-home giren
UPDATE product_images SET is_visible=false WHERE id=430 AND is_visible=true;  -- the-trees-first-home çıkan
UPDATE product_images SET is_visible=true, sort_order=4 WHERE id=434 AND is_visible=false;  -- the-trees-first-home giren
UPDATE product_images SET is_visible=false WHERE id=448 AND is_visible=true;  -- the-sleep-of-the-branches çıkan
UPDATE product_images SET is_visible=true, sort_order=8 WHERE id=443 AND is_visible=false;  -- the-sleep-of-the-branches giren
UPDATE product_images SET is_visible=false WHERE id=460 AND is_visible=true;  -- the-sleep-of-the-branches çıkan
UPDATE product_images SET is_visible=true, sort_order=20 WHERE id=456 AND is_visible=false;  -- the-sleep-of-the-branches giren
UPDATE product_images SET is_visible=false WHERE id=466 AND is_visible=true;  -- the-sleep-of-deep-water çıkan
UPDATE product_images SET is_visible=true, sort_order=4 WHERE id=692 AND is_visible=false;  -- the-sleep-of-deep-water giren
UPDATE product_images SET is_visible=false WHERE id=471 AND is_visible=true;  -- the-sleep-of-deep-water çıkan
UPDATE product_images SET is_visible=true, sort_order=9 WHERE id=464 AND is_visible=false;  -- the-sleep-of-deep-water giren
UPDATE product_images SET is_visible=false WHERE id=472 AND is_visible=true;  -- the-sleep-of-deep-water çıkan
UPDATE product_images SET is_visible=true, sort_order=10 WHERE id=469 AND is_visible=false;  -- the-sleep-of-deep-water giren
COMMIT;
