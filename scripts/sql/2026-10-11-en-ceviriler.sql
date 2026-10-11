-- EN çeviriler (Çağrı onayı 11.10.2026). Kaynak: TR biyografi ve CV künyeleri; çeviri, yeni bilgi yok.
-- Özel adlar (sergi adları, "Altın Testi" yarışma adı, eser adları) Türkçe bırakıldı.
BEGIN;
UPDATE artists SET bio_en = 'Melike Doğan is a ceramic artist and painter who approaches ceramics not merely as a material to be given form, but as a field of expression that carries the traces of memory, nature and cultural narratives.

At the centre of her artistic practice lie Anatolia’s cultural memory, myths and folk tales, the relationship between human and nature, and the transformation of images handed down from the past within contemporary art. Working across ceramic sculpture, painted ceramics, original functional forms and wearable ceramic pieces, the artist brings these different fields of production together within a shared visual and conceptual language.

Turkish folk tales and mythological narratives hold an important place in Doğan’s ceramic sculptures. Şahmaran, the Zümrüd-ü Anka, Tepegöz and other characters encountered in Turkish tales are reinterpreted in her work, moving away from a direct depiction of the narrative. Over time these figures become carriers of universal concepts such as wisdom, transformation, birth, rupture, solitude, searching and renewed existence.

Nature, in turn, is both a field of observation and a powerful visual memory in the artist’s work. In the Timeless Landscapes series, drawing on her own observations of nature and her photographs, she reconstructs traces of water, sky, tree, shore and plant life on the ceramic surface. Here the landscape ceases to be the depiction of a particular geography; it becomes a timeless space that fragments in memory, merges with dream and keeps changing around the form.

Doğan’s relationship with ancient forms and Anatolia’s archaeological heritage forms another layer of her practice. Bringing the formal memory of the past together with contemporary pictorial and plastic approaches, she explores the possibilities of the traditional ceramic form within today’s artistic language.

In her wearable ceramic works she explores the boundary between sculpture and jewellery. Female figures, images of Anatolian goddesses, seashells, organic forms taken from nature and symbols turn into small-scale sculptures and become art objects that can be worn on the body. That each piece is unique and handmade is an extension of the artist’s commitment to originality and slow production.

For Melike Doğan, ceramics is a bond formed between past and present, nature and the human, reality and dream. Bringing together form, surface, colour and narrative in her work, she invites the viewer to look not only at the visible form but also at the memory and associations it carries.

Continuing her artistic work under the roof of Uarttasarım / Uart Design Studio, the artist goes on producing ceramic sculpture, painting, original ceramic forms and architectural ceramic applications.' WHERE slug = 'melike' AND bio_en IS NULL AND bio_tr IS NOT NULL;
UPDATE artists SET bio_en = 'Şeref Doğan is a ceramic artist who approaches ceramics through the relationship between form, surface and space, and whose work explores the concepts of simplicity, purity and dynamism. At the root of his artistic practice lies the individual’s search to give new meaning to his own existence and inner world within the dense structure of a contemporary world shaped by technology and industry. In Doğan’s understanding of art, ceramics is not merely a material to be shaped but a plastic field of communication established between the inner world and the outer world.

The organic and abstract forms he creates by drawing on the possibilities of volume, texture and colour in ceramics emerge as a simple and minimalist expression of the artist’s inner world. Stripping form of unnecessary detail, the balance between surface and volume, and the movement within the form itself are among the defining features of his work.

The cultural traces and images left by past civilisations also hold an important place in the artist’s work. Rather than repeating these images directly, he turns towards their essence, the traces they leave in memory and the universal meanings they carry. The relationship he builds between past and present is reinterpreted through contemporary and original ceramic forms.

The concept of “Nüve / Nucleus” is one of the key starting points of Doğan’s artistic approach. Drawing on the images that make up the cultural memory of different civilisations, the artist aims to reach the essence of form and to create a strong, simple plastic language stripped of excess. For him, purity, simplicity and dynamism are not only formal choices but also ways for modern man to turn towards his own existence.

Alongside his ceramic sculptures, Doğan also creates large-scale ceramic wall panels for public and architectural spaces; in these works he treats ceramics as a monumental surface that enters into a relationship with the space it occupies. History, cultural memory, nature and the relationship with the human are reinterpreted in these works, created over different periods.

Since 2008, Doğan’s works have met audiences in solo exhibitions held in Istanbul, Ankara, Bursa, Bozcaada and Çanakkale, and his work has received awards in various ceramics, sculpture and art competitions.' WHERE slug = 'seref' AND bio_en IS NULL AND bio_tr IS NOT NULL;
UPDATE exhibitions SET title_en = 'Yolculuklar, Ceramics Exhibition' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Yolculuklar, Seramik Sergisi' AND title_en = title_tr;
UPDATE exhibitions SET title_en = 'Yolculuklar, Painting and Ceramics Exhibition' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Yolculuklar, Resim ve Seramik Sergisi' AND title_en = title_tr;
UPDATE exhibitions SET title_en = 'Yolculuk, Ceramics Exhibition' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Yolculuk, Seramik Sergisi' AND title_en = title_tr;
UPDATE exhibitions SET title_en = 'Medeniyetler, Ceramic Sculpture Exhibition' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Medeniyetler, Seramik Heykel Sergisi' AND title_en = title_tr;
UPDATE exhibitions SET title_en = 'Sınırsız Exhibition, Koridor Art Programme' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Sınırsız Sergisi, Koridor Sanat Programı' AND title_en = title_tr;
UPDATE exhibitions SET title_en = 'Nüve / Nucleus, Solo Open-Air Sculpture Exhibition' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Nüve / Nucleus, Kişisel Açık Hava Heykel Sergisi' AND title_en = title_tr;
UPDATE exhibitions SET title_en = 'İzmir Rotary Club 7th Altın Testi Ceramics Competition, Special Award, Kavramsal Formlar' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'İzmir Rotary Kulübü 7. Altın Testi Seramik Yarışması, Özel Ödül, Kavramsal Formlar' AND title_en = title_tr;
UPDATE exhibitions SET title_en = 'Turgut Pura Memorial Painting and Sculpture Competition, Second Prize in Sculpture, Doğadan 1' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'Turgut Pura Anısına Resim ve Heykel Yarışması, Heykel Dalında İkincilik Ödülü, Doğadan 1' AND title_en = title_tr;
UPDATE exhibitions SET title_en = 'İzmir Rotary Club 5th Altın Testi Ceramics Competition, Youth Award, Kavramsal Form' WHERE artist_id = (select id from artists where slug='seref') AND title_tr = 'İzmir Rotary Kulübü 5. Altın Testi Seramik Yarışması, Gençlik Ödülü, Kavramsal Form' AND title_en = title_tr;
COMMIT;
