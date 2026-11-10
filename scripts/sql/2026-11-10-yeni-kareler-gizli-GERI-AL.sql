-- Görev A (10 Kas): ablanın Drive'a eklediği, sitede karşılığı olmayan 3 kare — GİZLİ eklenir (6-foto sınırı; karar rc/ablada).
BEGIN;
DELETE FROM product_images WHERE url='https://res.cloudinary.com/df0henatz/image/upload/v1794338127/uarttasarim/eser/uarttasarim-troia-yili-anisina-1915-ceramic-art-wall.jpg';
DELETE FROM product_images WHERE url='https://res.cloudinary.com/df0henatz/image/upload/v1794338130/uarttasarim/eser/uarttasarim-the-threshold-of-the-day-ceramic-plate.jpg';
DELETE FROM product_images WHERE url='https://res.cloudinary.com/df0henatz/image/upload/v1794338132/uarttasarim/eser/uarttasarim-the-sleep-of-deep-water-ceramic-bowl.jpg';
COMMIT;
