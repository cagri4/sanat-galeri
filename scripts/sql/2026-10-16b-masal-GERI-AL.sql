-- 2026-10-16b-masal.sql geri alma — yedekten. Cloudinary dosyaları kalır.
BEGIN;
DELETE FROM product_images WHERE product_id = 55 AND url IN ('https://res.cloudinary.com/df0henatz/image/upload/v1792148688/uarttasarim/heykel/sehzade-2026-10-16-1.jpg', 'https://res.cloudinary.com/df0henatz/image/upload/v1792148691/uarttasarim/heykel/sehzade-2026-10-16-2.jpg');
UPDATE products SET year = NULL, medium_tr = NULL, medium_en = NULL, dimensions_tr = NULL, dimensions_en = NULL, description_tr = 'Anadolu’nun sözlü kültüründe kuşaktan kuşağa aktarılan masallar; yalnızca düşsel hikâyeler değil, toplumun korkularını, umutlarını, dönüşümlerini ve ortak belleğini taşıyan anlatılardır.

“Masalın Hafızası”; Şahmaran, Zümrüdüanka, Keloğlan, dev, dev anası, padişah ve prens gibi karakterleri çağdaş seramik heykel diliyle yeniden yorumlar.

Elle biçimlendirilen her figür, geleneksel anlatıdaki görünümünün ötesine geçerek kendi simgesel anlamını ve hikâyesini taşıyan özgün bir sanat eserine dönüşür.', description_en = 'Passed down from generation to generation in Anatolia’s oral culture, folk tales are not merely fantastical stories; they carry a society’s fears, hopes, transformations and shared memory.

“The Memory of Tales” reinterprets characters such as Şahmaran, the Zümrüdüanka, Keloğlan, the giant, the giant’s mother, the sultan and the prince in the language of contemporary ceramic sculpture.

Shaped by hand, each figure goes beyond its appearance in the traditional tale and becomes an original work of art carrying its own symbolic meaning and story.' WHERE id = 54;
UPDATE products SET year = 2011, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve sırlı pişirim', medium_en = 'Free-formed grogged clay, glaze firing', dimensions_tr = '40 × 65 cm', dimensions_en = '40 × 65 cm', description_tr = 'Şahmaran’ın Cemşab ile karşılaşmasını sembolize eder. Simetrik U formundaki beden, iki doğanın dengeye geldiği, ikiliğin bütünlüğe dönüştüğü andır.

Şahmaran, Anadolu''nun sözlü kültüründe yüzyıllardır yaşayan; bilgelik, doğa, şifa, sır ve dönüşüm kavramlarıyla ilişkilendirilen kadim bir anlatının izlerinden doğan seramik heykel serisidir.

Bu seride Şahmaran, geleneksel anlatılardaki yarı insan yarı yılan biçiminin doğrudan bir temsili olarak ele alınmaz. İnsan yüzü, yılansı beden ve organik formlar birbirine eklenen ayrı parçalar olmaktan çıkar; kıvrılan, bölünen, yeniden birleşen ve sürekli dönüşen tek bir varlığa dönüşür. Böylece Şahmaran, belirli bir figürden çok insan ile doğa arasındaki sınırda yaşayan bir varoluş biçimi olarak yeniden yorumlanır.

Heykellerde tekrar eden spiral hareketler, iç boşluklar, karşı karşıya gelen insan ve yılan biçimleri; eşik, dönüşüm, ikilik, içsel bilgelik ve özlem kavramlarını görünür kılar. Boşluk ise yalnızca heykelin biçimsel bir unsuru değildir; yerüstü ile yeraltı, bilinen ile bilinmeyen, insan ile doğa arasındaki geçişi çağrıştıran sembolik bir alana dönüşür.

Serinin her parçası Şahmaran''ın başka bir hâlini taşır. Kimi zaman insan ve yılan aynı bedende birbirine dönüşür, kimi zaman figür kendi içine kıvrılır; kimi zaman ise insan yüzü ile doğasal beden arasındaki mesafe bir sessizlik ve özlem duygusu yaratır. Bu farklı biçimler boyunca Şahmaran''ın bilgeliği, dışarıdan edinilen bir bilgi olmaktan çok toprağın, suyun ve canlılığın içinde saklanan kadim bir hafıza olarak düşünülür.

Şahmaran Heykel Serisi, masalı yeniden anlatmak yerine onun bellekte bıraktığı izlerin peşinden gider; Şahmaran''ı geçmişten gelen mitolojik bir karakter olarak değil, doğa, insan ve hafıza arasındaki ilişkinin bugün de dönüşmeye devam eden simgesel bir varlığı olarak ele alır.', description_en = 'It symbolises Şahmaran’s encounter with Cemşab. The body, in its symmetrical U form, is the moment when two natures come into balance and duality becomes wholeness.

Şahmaran is a series of ceramic sculptures born from the traces of an ancient narrative that has lived for centuries in Anatolia’s oral culture and is associated with wisdom, nature, healing, secrecy and transformation.

In this series Şahmaran is not treated as a direct representation of the half-human, half-serpent form of the traditional tales. The human face, the serpentine body and organic forms cease to be separate parts joined together and become a single being that coils, divides, reunites and constantly transforms. Şahmaran is thus reinterpreted less as a particular figure than as a mode of existence living on the border between human and nature.

The recurring spiral movements, inner voids and facing human and serpent forms in the sculptures make the concepts of threshold, transformation, duality, inner wisdom and longing visible. The void is not merely a formal element of the sculpture; it becomes a symbolic space evoking the passage between the world above and the world below, the known and the unknown, the human and nature.

Each piece in the series carries another state of Şahmaran. Sometimes human and serpent turn into one another in the same body, sometimes the figure coils into itself; at other times the distance between the human face and the natural body creates a feeling of silence and longing. Across these different forms, Şahmaran’s wisdom is conceived not as knowledge acquired from outside but as an ancient memory hidden within earth, water and living things.

Rather than retelling the tale, the Şahmaran Sculpture Series follows the traces it has left in memory; it approaches Şahmaran not as a mythological character from the past but as a symbolic being of the relationship between nature, the human and memory that continues to transform today.' WHERE id = 62;
UPDATE product_images SET is_visible = false, sort_order = 0 WHERE id = 588;
UPDATE product_images SET is_visible = false, sort_order = 1 WHERE id = 589;
UPDATE product_images SET is_visible = true, sort_order = 2 WHERE id = 671;
UPDATE product_images SET is_visible = true, sort_order = 3 WHERE id = 672;
UPDATE product_images SET is_visible = true, sort_order = 4 WHERE id = 673;
COMMIT;
