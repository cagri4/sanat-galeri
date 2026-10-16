-- Üretildi: scripts/masal-belgeler-2026-10-16b.py — sanatçının 16 Eki cevapları. Silme yok.
-- Geri alma: 2026-10-16b-masal-GERI-AL.sql (yedek: scripts/sql/yedek/masal-belgeler-2026-10-16b.json)
BEGIN;
UPDATE products SET year = 2012 WHERE slug = 'sahmaran-v-karsilasma';
UPDATE products SET year = 2009, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve Raku pişirimi', medium_en = 'Free-formed grogged clay, raku firing', dimensions_tr = '45 × 50 cm', dimensions_en = '45 × 50 cm', description_tr = 'Türk masallarında padişah tipi, belli bir otoritenin ve gücün simgesidir. Bütün düzen onun elindedir. Ancak bu mutlak güç, onun yenilmez olduğu anlamına gelmez. Masallarda da en güçlü padişahın bile üstesinden gelemediği durumlar vardır, başkalarının aklına ve yardımına ihtiyaç duyar.

Günümüzde de bu arketip yaşamaktadır. Gücü ve otoriteyi elinde tutan, toplumun sorunlarına karşı duyarsız ve bencil kalabilen insanlar vardır. Fakat onlar da maddi gücün bile yetersiz kaldığı bir hastalıkla, iflasla, çaresizlikle yüzleşebilirler. Masaldaki padişah gibi, modern iktidar da kırılgandır.

Benim biçimlendirdiğim Padişah, bu çelişkiyi taşır. Tahtına oturmuş, rahatlık içinde bütün işleri oturduğu yerden kontrol eder. Parlak Raku sırlı giysileri ve stilize tahtı, soyluluğun ve otoritenin gösterişli kabuğudur. Yüzündeki hafif alaycı, rahat ifade ve bacak bacak üstüne atmış umursamaz duruşu, kendini ölümsüz sanan iktidarın rehavetidir. Tahtının etrafına dizdiğim elmalar ise onun en büyük arzusunu anlatır: çocukları ve soyunun ebedi oluşu, sonsuza kadar sürecek bir saltanat hayali.

Anadolu’nun sözlü kültüründe kuşaktan kuşağa aktarılan masallar; yalnızca düşsel hikâyeler değil, toplumun korkularını, umutlarını, dönüşümlerini ve ortak belleğini taşıyan anlatılardır.

“Masalın Hafızası”; Şahmaran, Zümrüdüanka, Keloğlan, dev, dev anası, padişah ve prens gibi karakterleri çağdaş seramik heykel diliyle yeniden yorumlar.

Elle biçimlendirilen her figür, geleneksel anlatıdaki görünümünün ötesine geçerek kendi simgesel anlamını ve hikâyesini taşıyan özgün bir sanat eserine dönüşür.', description_en = 'In Turkish tales the sultan type is a symbol of a certain authority and power. The whole order is in his hands. Yet this absolute power does not mean he is invincible. In the tales there are situations that even the mightiest sultan cannot overcome; he needs the wisdom and help of others.

This archetype lives on today. There are people who hold power and authority and can remain indifferent and selfish towards society’s problems. But they too may come face to face with an illness, a bankruptcy or a helplessness against which even material power falls short. Like the sultan in the tale, modern power is fragile.

The Sultan I have shaped carries this contradiction. Seated on his throne, he controls all affairs in comfort from where he sits. His glossy raku-glazed robes and stylised throne are the showy shell of nobility and authority. The slightly mocking, relaxed expression on his face and his careless cross-legged posture are the complacency of a power that believes itself immortal. The apples I have arranged around his throne tell of his greatest desire: his children and the eternity of his line, the dream of a reign that will last forever.

Passed down from generation to generation in Anatolia’s oral culture, folk tales are not merely fantastical stories; they carry a society’s fears, hopes, transformations and shared memory.

“The Memory of Tales” reinterprets characters such as Şahmaran, the Zümrüdüanka, Keloğlan, the giant, the giant’s mother, the sultan and the prince in the language of contemporary ceramic sculpture.

Shaped by hand, each figure goes beyond its appearance in the traditional tale and becomes an original work of art carrying its own symbolic meaning and story.' WHERE slug = 'padisah';
UPDATE product_images SET is_visible = false WHERE id IN (671, 672, 673); -- dünkü sahnelenmiş 3 kare (Drive'dan kalktı)
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES (55, 'https://res.cloudinary.com/df0henatz/image/upload/v1792148688/uarttasarim/heykel/sehzade-2026-10-16-1.jpg', 0, true); -- Şehzade/Şehzade.jpg
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES (55, 'https://res.cloudinary.com/df0henatz/image/upload/v1792148691/uarttasarim/heykel/sehzade-2026-10-16-2.jpg', 1, true); -- Şehzade/Şehzade1.jpg
UPDATE product_images SET is_visible = true, sort_order = 2 WHERE id = 589; -- sehzade-2 = Drive Şehzade3.jpg
COMMIT;
