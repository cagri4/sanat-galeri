-- Üretildi: scripts/sahmaran-2026-10-14.py — Şahmaran.docx (Drive, 13 Eki). Silme yok.
-- Geri alma: 2026-10-14-sahmaran-GERI-AL.sql (yedek: scripts/sql/yedek/sahmaran-2026-10-14.json)
BEGIN;
DO $$ BEGIN IF EXISTS (select 1 from products where slug='sahmaran-v-karsilasma') THEN RAISE EXCEPTION 'Şahmaran V zaten var'; END IF; END $$;
UPDATE products SET year = 2008, medium_tr = 'Kırmızı kilden serbest şekillendirme ve isli pişirim', medium_en = 'Free-formed red clay, smoke firing', subject_tr = 'Dönüşüm / Eşik', subject_en = 'Transformation / Threshold', description_tr = 'Şahmaran I, dönüşüm anının kendisidir. Yılan beden alt kaideden başlayarak bir spiral çizerek yükselir, kendi boşluğunu yaratır ve o boşluğun etrafında kapanır. Formun iki ucunda iki varlık karşı karşıya gelir: Bir yanda yalın, içgüdüsel yılan başı; diğer yanda boynuzumsu çıkıntıları, çatallı dili ve içe dönük bakışıyla insanlaşan yüz.

Bu iki baş birbirine değmez. Aralarındaki mesafe, insan ile doğa arasındaki kadim mesafenin, özlemin ve sessizliğin alanıdır. Pişmiş toprağın dokulu, yanık teni bu anlatıyı masalsı bir figürden çıkarıp toprağın hafızasına taşır.

Şahmaran, Anadolu''nun sözlü kültüründe yüzyıllardır yaşayan; bilgelik, doğa, şifa, sır ve dönüşüm kavramlarıyla ilişkilendirilen kadim bir anlatının izlerinden doğan seramik heykel serisidir.

Bu seride Şahmaran, geleneksel anlatılardaki yarı insan yarı yılan biçiminin doğrudan bir temsili olarak ele alınmaz. İnsan yüzü, yılansı beden ve organik formlar birbirine eklenen ayrı parçalar olmaktan çıkar; kıvrılan, bölünen, yeniden birleşen ve sürekli dönüşen tek bir varlığa dönüşür. Böylece Şahmaran, belirli bir figürden çok insan ile doğa arasındaki sınırda yaşayan bir varoluş biçimi olarak yeniden yorumlanır.

Heykellerde tekrar eden spiral hareketler, iç boşluklar, karşı karşıya gelen insan ve yılan biçimleri; eşik, dönüşüm, ikilik, içsel bilgelik ve özlem kavramlarını görünür kılar. Boşluk ise yalnızca heykelin biçimsel bir unsuru değildir; yerüstü ile yeraltı, bilinen ile bilinmeyen, insan ile doğa arasındaki geçişi çağrıştıran sembolik bir alana dönüşür.

Serinin her parçası Şahmaran''ın başka bir hâlini taşır. Kimi zaman insan ve yılan aynı bedende birbirine dönüşür, kimi zaman figür kendi içine kıvrılır; kimi zaman ise insan yüzü ile doğasal beden arasındaki mesafe bir sessizlik ve özlem duygusu yaratır. Bu farklı biçimler boyunca Şahmaran''ın bilgeliği, dışarıdan edinilen bir bilgi olmaktan çok toprağın, suyun ve canlılığın içinde saklanan kadim bir hafıza olarak düşünülür.

Şahmaran Heykel Serisi, masalı yeniden anlatmak yerine onun bellekte bıraktığı izlerin peşinden gider; Şahmaran''ı geçmişten gelen mitolojik bir karakter olarak değil, doğa, insan ve hafıza arasındaki ilişkinin bugün de dönüşmeye devam eden simgesel bir varlığı olarak ele alır.', description_en = 'Şahmaran I is the moment of transformation itself. Rising from the base, the serpent body traces a spiral, creates its own void and closes around it. At the two ends of the form two beings face each other: on one side a plain, instinctive serpent head; on the other a face turning human, with horn-like protrusions, a forked tongue and an inward gaze.

The two heads never touch. The distance between them is the space of the ancient distance between human and nature, of longing and of silence. The textured, scorched skin of the fired clay lifts this narrative out of a fairy-tale figure and carries it into the memory of the earth.

Şahmaran is a series of ceramic sculptures born from the traces of an ancient narrative that has lived for centuries in Anatolia’s oral culture and is associated with wisdom, nature, healing, secrecy and transformation.

In this series Şahmaran is not treated as a direct representation of the half-human, half-serpent form of the traditional tales. The human face, the serpentine body and organic forms cease to be separate parts joined together and become a single being that coils, divides, reunites and constantly transforms. Şahmaran is thus reinterpreted less as a particular figure than as a mode of existence living on the border between human and nature.

The recurring spiral movements, inner voids and facing human and serpent forms in the sculptures make the concepts of threshold, transformation, duality, inner wisdom and longing visible. The void is not merely a formal element of the sculpture; it becomes a symbolic space evoking the passage between the world above and the world below, the known and the unknown, the human and nature.

Each piece in the series carries another state of Şahmaran. Sometimes human and serpent turn into one another in the same body, sometimes the figure coils into itself; at other times the distance between the human face and the natural body creates a feeling of silence and longing. Across these different forms, Şahmaran’s wisdom is conceived not as knowledge acquired from outside but as an ancient memory hidden within earth, water and living things.

Rather than retelling the tale, the Şahmaran Sculpture Series follows the traces it has left in memory; it approaches Şahmaran not as a mythological character from the past but as a symbolic being of the relationship between nature, the human and memory that continues to transform today.', description_kurumsal_tr = replace(description_kurumsal_tr, 'dört parçasından', 'beş parçasından'), description_kurumsal_en = replace(description_kurumsal_en, 'four pieces', 'five pieces'), form_tr = 'spiral, yükseliş, organik değişim', form_en = 'spiral, ascent, organic change' WHERE slug = 'sahmaran-i-donusum';
UPDATE products SET year = 2008, medium_tr = 'Kırmızı kilden serbest şekillendirme ve Raku sırlı pişirimi', medium_en = 'Free-formed red clay, raku glaze firing', subject_tr = 'İkilik / Arada Olma', subject_en = 'Duality / Being In Between', description_tr = 'Tek bir ortak bedenden iki zıt yöne ayrılan bir varoluş. İnsan ve yılan aynı kökten doğup birbirinden uzaklaşırken, kesişme noktasında birbirine düğümlenir.

Form, mitolojik anlatılardaki "yarı insan yarı yılan" klişesini tekrar etmez. Onun yerine "iki yönlülük" kavramını heykelleştirir. Ortak bir bedenden doğan iki baş, iki farklı bilince işaret eder. Biri yukarı bakar, diğeri ileri. Biri geçmişin hafızasını, diğeri doğanın içgüdüsünü taşır.

Şahmaran, Anadolu''nun sözlü kültüründe yüzyıllardır yaşayan; bilgelik, doğa, şifa, sır ve dönüşüm kavramlarıyla ilişkilendirilen kadim bir anlatının izlerinden doğan seramik heykel serisidir.

Bu seride Şahmaran, geleneksel anlatılardaki yarı insan yarı yılan biçiminin doğrudan bir temsili olarak ele alınmaz. İnsan yüzü, yılansı beden ve organik formlar birbirine eklenen ayrı parçalar olmaktan çıkar; kıvrılan, bölünen, yeniden birleşen ve sürekli dönüşen tek bir varlığa dönüşür. Böylece Şahmaran, belirli bir figürden çok insan ile doğa arasındaki sınırda yaşayan bir varoluş biçimi olarak yeniden yorumlanır.

Heykellerde tekrar eden spiral hareketler, iç boşluklar, karşı karşıya gelen insan ve yılan biçimleri; eşik, dönüşüm, ikilik, içsel bilgelik ve özlem kavramlarını görünür kılar. Boşluk ise yalnızca heykelin biçimsel bir unsuru değildir; yerüstü ile yeraltı, bilinen ile bilinmeyen, insan ile doğa arasındaki geçişi çağrıştıran sembolik bir alana dönüşür.

Serinin her parçası Şahmaran''ın başka bir hâlini taşır. Kimi zaman insan ve yılan aynı bedende birbirine dönüşür, kimi zaman figür kendi içine kıvrılır; kimi zaman ise insan yüzü ile doğasal beden arasındaki mesafe bir sessizlik ve özlem duygusu yaratır. Bu farklı biçimler boyunca Şahmaran''ın bilgeliği, dışarıdan edinilen bir bilgi olmaktan çok toprağın, suyun ve canlılığın içinde saklanan kadim bir hafıza olarak düşünülür.

Şahmaran Heykel Serisi, masalı yeniden anlatmak yerine onun bellekte bıraktığı izlerin peşinden gider; Şahmaran''ı geçmişten gelen mitolojik bir karakter olarak değil, doğa, insan ve hafıza arasındaki ilişkinin bugün de dönüşmeye devam eden simgesel bir varlığı olarak ele alır.', description_en = 'An existence that splits from a single shared body in two opposite directions. Human and serpent are born from the same root and draw apart, yet are knotted together at the point where they cross.

The form does not repeat the "half human, half serpent" cliché of mythological tales. Instead it gives sculptural form to the idea of "two-directionality". The two heads born from one body point to two different consciousnesses. One looks up, the other forward. One carries the memory of the past, the other the instinct of nature.

Şahmaran is a series of ceramic sculptures born from the traces of an ancient narrative that has lived for centuries in Anatolia’s oral culture and is associated with wisdom, nature, healing, secrecy and transformation.

In this series Şahmaran is not treated as a direct representation of the half-human, half-serpent form of the traditional tales. The human face, the serpentine body and organic forms cease to be separate parts joined together and become a single being that coils, divides, reunites and constantly transforms. Şahmaran is thus reinterpreted less as a particular figure than as a mode of existence living on the border between human and nature.

The recurring spiral movements, inner voids and facing human and serpent forms in the sculptures make the concepts of threshold, transformation, duality, inner wisdom and longing visible. The void is not merely a formal element of the sculpture; it becomes a symbolic space evoking the passage between the world above and the world below, the known and the unknown, the human and nature.

Each piece in the series carries another state of Şahmaran. Sometimes human and serpent turn into one another in the same body, sometimes the figure coils into itself; at other times the distance between the human face and the natural body creates a feeling of silence and longing. Across these different forms, Şahmaran’s wisdom is conceived not as knowledge acquired from outside but as an ancient memory hidden within earth, water and living things.

Rather than retelling the tale, the Şahmaran Sculpture Series follows the traces it has left in memory; it approaches Şahmaran not as a mythological character from the past but as a symbolic being of the relationship between nature, the human and memory that continues to transform today.', description_kurumsal_tr = replace(description_kurumsal_tr, 'dört parçasından', 'beş parçasından'), description_kurumsal_en = replace(description_kurumsal_en, 'four pieces', 'five pieces'), form_tr = 'iki yön, iki baş, kesişme, ortak beden', form_en = 'two directions, two heads, intersection, a shared body' WHERE slug = 'sahmaran-ii-iki-doga';
UPDATE products SET year = 2008, medium_tr = 'Beyaz kilden serbest şekillendirme ve Raku sırlı pişirimi', medium_en = 'Free-formed white clay, raku glaze firing', subject_tr = 'Kendine dönüş, sessizlik, doğanın bilgisini taşıma', subject_en = 'Turning inward, silence, carrying the knowledge of nature', description_tr = 'Yılan bedeninden yükselen insan yüzü, artık dışa değil içe bakar. Bilgelik dışarıda aranan bir sır değil, bedenin kıvrımlarında saklı duran sessiz bir hafızadır.

Serinin üçüncü hâlinde Şahmaran artık ikiye ayrılmaz. Ortak gövde alt kısımda dalga dalga genişleyerek toprağa köklenir, üst kısımda ise dikey bir yükselişle insan yüzüne dönüşür. Yılan başı öne doğru atılırken, insan yüzü hafif arkaya eğik, gözleri kapalı gibidir. Sanki beden ileri gitmek isterken, yüz kendi içine, kendi bilgeliğine döner.

Şahmaran, Anadolu''nun sözlü kültüründe yüzyıllardır yaşayan; bilgelik, doğa, şifa, sır ve dönüşüm kavramlarıyla ilişkilendirilen kadim bir anlatının izlerinden doğan seramik heykel serisidir.

Bu seride Şahmaran, geleneksel anlatılardaki yarı insan yarı yılan biçiminin doğrudan bir temsili olarak ele alınmaz. İnsan yüzü, yılansı beden ve organik formlar birbirine eklenen ayrı parçalar olmaktan çıkar; kıvrılan, bölünen, yeniden birleşen ve sürekli dönüşen tek bir varlığa dönüşür. Böylece Şahmaran, belirli bir figürden çok insan ile doğa arasındaki sınırda yaşayan bir varoluş biçimi olarak yeniden yorumlanır.

Heykellerde tekrar eden spiral hareketler, iç boşluklar, karşı karşıya gelen insan ve yılan biçimleri; eşik, dönüşüm, ikilik, içsel bilgelik ve özlem kavramlarını görünür kılar. Boşluk ise yalnızca heykelin biçimsel bir unsuru değildir; yerüstü ile yeraltı, bilinen ile bilinmeyen, insan ile doğa arasındaki geçişi çağrıştıran sembolik bir alana dönüşür.

Serinin her parçası Şahmaran''ın başka bir hâlini taşır. Kimi zaman insan ve yılan aynı bedende birbirine dönüşür, kimi zaman figür kendi içine kıvrılır; kimi zaman ise insan yüzü ile doğasal beden arasındaki mesafe bir sessizlik ve özlem duygusu yaratır. Bu farklı biçimler boyunca Şahmaran''ın bilgeliği, dışarıdan edinilen bir bilgi olmaktan çok toprağın, suyun ve canlılığın içinde saklanan kadim bir hafıza olarak düşünülür.

Şahmaran Heykel Serisi, masalı yeniden anlatmak yerine onun bellekte bıraktığı izlerin peşinden gider; Şahmaran''ı geçmişten gelen mitolojik bir karakter olarak değil, doğa, insan ve hafıza arasındaki ilişkinin bugün de dönüşmeye devam eden simgesel bir varlığı olarak ele alır.', description_en = 'The human face rising from the serpent body now looks not outward but inward. Wisdom is not a secret sought outside but a silent memory kept in the folds of the body.

In the third state of the series Şahmaran no longer splits in two. Below, the shared body widens in waves and takes root in the earth; above, it rises vertically and becomes a human face. As the serpent head thrusts forward, the human face leans slightly back, its eyes as if closed. It is as though the body wants to move forward while the face turns into itself, into its own wisdom.

Şahmaran is a series of ceramic sculptures born from the traces of an ancient narrative that has lived for centuries in Anatolia’s oral culture and is associated with wisdom, nature, healing, secrecy and transformation.

In this series Şahmaran is not treated as a direct representation of the half-human, half-serpent form of the traditional tales. The human face, the serpentine body and organic forms cease to be separate parts joined together and become a single being that coils, divides, reunites and constantly transforms. Şahmaran is thus reinterpreted less as a particular figure than as a mode of existence living on the border between human and nature.

The recurring spiral movements, inner voids and facing human and serpent forms in the sculptures make the concepts of threshold, transformation, duality, inner wisdom and longing visible. The void is not merely a formal element of the sculpture; it becomes a symbolic space evoking the passage between the world above and the world below, the known and the unknown, the human and nature.

Each piece in the series carries another state of Şahmaran. Sometimes human and serpent turn into one another in the same body, sometimes the figure coils into itself; at other times the distance between the human face and the natural body creates a feeling of silence and longing. Across these different forms, Şahmaran’s wisdom is conceived not as knowledge acquired from outside but as an ancient memory hidden within earth, water and living things.

Rather than retelling the tale, the Şahmaran Sculpture Series follows the traces it has left in memory; it approaches Şahmaran not as a mythological character from the past but as a symbolic being of the relationship between nature, the human and memory that continues to transform today.', description_kurumsal_tr = replace(description_kurumsal_tr, 'dört parçasından', 'beş parçasından'), description_kurumsal_en = replace(description_kurumsal_en, 'four pieces', 'five pieces') WHERE slug = 'sahmaran-iii-icsel-bilgelik';
UPDATE products SET year = 2012, medium_tr = 'Beyaz kilden serbest şekillendirme ve Raku sırlı pişirimi', medium_en = 'Free-formed white clay, raku glaze firing', subject_tr = 'Özlem / Uzaklık', subject_en = 'Longing / Distance', description_tr = 'İki baş aynı bedenden doğar ama aynı yöne bakmaz. İnsan yüzü uzağa, yılan yüzü geriye... Arada kalan boşluk özlemin kendisidir. Yüzey pürüzsüz, akışkan ve parlak. Tıpkı özlem gibi - keskin değil, yumuşak ama derin.

Şahmaran, Anadolu''nun sözlü kültüründe yüzyıllardır yaşayan; bilgelik, doğa, şifa, sır ve dönüşüm kavramlarıyla ilişkilendirilen kadim bir anlatının izlerinden doğan seramik heykel serisidir.

Bu seride Şahmaran, geleneksel anlatılardaki yarı insan yarı yılan biçiminin doğrudan bir temsili olarak ele alınmaz. İnsan yüzü, yılansı beden ve organik formlar birbirine eklenen ayrı parçalar olmaktan çıkar; kıvrılan, bölünen, yeniden birleşen ve sürekli dönüşen tek bir varlığa dönüşür. Böylece Şahmaran, belirli bir figürden çok insan ile doğa arasındaki sınırda yaşayan bir varoluş biçimi olarak yeniden yorumlanır.

Heykellerde tekrar eden spiral hareketler, iç boşluklar, karşı karşıya gelen insan ve yılan biçimleri; eşik, dönüşüm, ikilik, içsel bilgelik ve özlem kavramlarını görünür kılar. Boşluk ise yalnızca heykelin biçimsel bir unsuru değildir; yerüstü ile yeraltı, bilinen ile bilinmeyen, insan ile doğa arasındaki geçişi çağrıştıran sembolik bir alana dönüşür.

Serinin her parçası Şahmaran''ın başka bir hâlini taşır. Kimi zaman insan ve yılan aynı bedende birbirine dönüşür, kimi zaman figür kendi içine kıvrılır; kimi zaman ise insan yüzü ile doğasal beden arasındaki mesafe bir sessizlik ve özlem duygusu yaratır. Bu farklı biçimler boyunca Şahmaran''ın bilgeliği, dışarıdan edinilen bir bilgi olmaktan çok toprağın, suyun ve canlılığın içinde saklanan kadim bir hafıza olarak düşünülür.

Şahmaran Heykel Serisi, masalı yeniden anlatmak yerine onun bellekte bıraktığı izlerin peşinden gider; Şahmaran''ı geçmişten gelen mitolojik bir karakter olarak değil, doğa, insan ve hafıza arasındaki ilişkinin bugün de dönüşmeye devam eden simgesel bir varlığı olarak ele alır.', description_en = 'Two heads are born from the same body but do not look in the same direction. The human face looks into the distance, the serpent face back... The void left between them is longing itself. The surface is smooth, flowing and glossy. Just like longing: not sharp, but soft and deep.

Şahmaran is a series of ceramic sculptures born from the traces of an ancient narrative that has lived for centuries in Anatolia’s oral culture and is associated with wisdom, nature, healing, secrecy and transformation.

In this series Şahmaran is not treated as a direct representation of the half-human, half-serpent form of the traditional tales. The human face, the serpentine body and organic forms cease to be separate parts joined together and become a single being that coils, divides, reunites and constantly transforms. Şahmaran is thus reinterpreted less as a particular figure than as a mode of existence living on the border between human and nature.

The recurring spiral movements, inner voids and facing human and serpent forms in the sculptures make the concepts of threshold, transformation, duality, inner wisdom and longing visible. The void is not merely a formal element of the sculpture; it becomes a symbolic space evoking the passage between the world above and the world below, the known and the unknown, the human and nature.

Each piece in the series carries another state of Şahmaran. Sometimes human and serpent turn into one another in the same body, sometimes the figure coils into itself; at other times the distance between the human face and the natural body creates a feeling of silence and longing. Across these different forms, Şahmaran’s wisdom is conceived not as knowledge acquired from outside but as an ancient memory hidden within earth, water and living things.

Rather than retelling the tale, the Şahmaran Sculpture Series follows the traces it has left in memory; it approaches Şahmaran not as a mythological character from the past but as a symbolic being of the relationship between nature, the human and memory that continues to transform today.', description_kurumsal_tr = replace(description_kurumsal_tr, 'dört parçasından', 'beş parçasından'), description_kurumsal_en = replace(description_kurumsal_en, 'four pieces', 'five pieces'), form_tr = 'açık C formu, yan yana yükseliş, akışkan yüzey', form_en = 'open C form, rising side by side, flowing surface' WHERE slug = 'sahmaran-iv-ozlem';
-- V, IV'ün hemen ardından: sonraki heykeller bir sıra kayar
UPDATE products SET sort_order = sort_order + 1 WHERE category = 'Seramik Heykeller' AND sort_order > 308;
INSERT INTO products (artist_id, slug, title_tr, title_en, category, collection, year, medium_tr, medium_en, subject_tr, subject_en, form_tr, form_en,
  description_tr, description_en, description_kurumsal_tr, description_kurumsal_en, is_visible, sort_order)
VALUES ((select id from artists where slug='melike'), 'sahmaran-v-karsilasma', 'Şahmaran V – Karşılaşma', 'Şahmaran V – Encounter', 'Seramik Heykeller', 'Masalın Hafızası — Şahmaran Serisi', 2011,
  'Beyaz kilden serbest şekillendirme ve sırlı pişirim', 'Free-formed white clay, glaze firing', 'Karşılaşma / Yüzleşme', 'Encounter / Confrontation', 'simetrik U formu, cepheden bakış, denge, taç formu', 'symmetrical U form, frontal view, balance, crown form',
  'Şahmaran’ın cansab ile karşılaşmasını sembolize eder. Simetrik U formundaki beden, iki doğanın dengeye geldiği, ikiliğin bütünlüğe dönüştüğü andır.

Şahmaran, Anadolu''nun sözlü kültüründe yüzyıllardır yaşayan; bilgelik, doğa, şifa, sır ve dönüşüm kavramlarıyla ilişkilendirilen kadim bir anlatının izlerinden doğan seramik heykel serisidir.

Bu seride Şahmaran, geleneksel anlatılardaki yarı insan yarı yılan biçiminin doğrudan bir temsili olarak ele alınmaz. İnsan yüzü, yılansı beden ve organik formlar birbirine eklenen ayrı parçalar olmaktan çıkar; kıvrılan, bölünen, yeniden birleşen ve sürekli dönüşen tek bir varlığa dönüşür. Böylece Şahmaran, belirli bir figürden çok insan ile doğa arasındaki sınırda yaşayan bir varoluş biçimi olarak yeniden yorumlanır.

Heykellerde tekrar eden spiral hareketler, iç boşluklar, karşı karşıya gelen insan ve yılan biçimleri; eşik, dönüşüm, ikilik, içsel bilgelik ve özlem kavramlarını görünür kılar. Boşluk ise yalnızca heykelin biçimsel bir unsuru değildir; yerüstü ile yeraltı, bilinen ile bilinmeyen, insan ile doğa arasındaki geçişi çağrıştıran sembolik bir alana dönüşür.

Serinin her parçası Şahmaran''ın başka bir hâlini taşır. Kimi zaman insan ve yılan aynı bedende birbirine dönüşür, kimi zaman figür kendi içine kıvrılır; kimi zaman ise insan yüzü ile doğasal beden arasındaki mesafe bir sessizlik ve özlem duygusu yaratır. Bu farklı biçimler boyunca Şahmaran''ın bilgeliği, dışarıdan edinilen bir bilgi olmaktan çok toprağın, suyun ve canlılığın içinde saklanan kadim bir hafıza olarak düşünülür.

Şahmaran Heykel Serisi, masalı yeniden anlatmak yerine onun bellekte bıraktığı izlerin peşinden gider; Şahmaran''ı geçmişten gelen mitolojik bir karakter olarak değil, doğa, insan ve hafıza arasındaki ilişkinin bugün de dönüşmeye devam eden simgesel bir varlığı olarak ele alır.', 'It symbolises Şahmaran’s encounter with Cansab. The body, in its symmetrical U form, is the moment when two natures come into balance and duality becomes wholeness.

Şahmaran is a series of ceramic sculptures born from the traces of an ancient narrative that has lived for centuries in Anatolia’s oral culture and is associated with wisdom, nature, healing, secrecy and transformation.

In this series Şahmaran is not treated as a direct representation of the half-human, half-serpent form of the traditional tales. The human face, the serpentine body and organic forms cease to be separate parts joined together and become a single being that coils, divides, reunites and constantly transforms. Şahmaran is thus reinterpreted less as a particular figure than as a mode of existence living on the border between human and nature.

The recurring spiral movements, inner voids and facing human and serpent forms in the sculptures make the concepts of threshold, transformation, duality, inner wisdom and longing visible. The void is not merely a formal element of the sculpture; it becomes a symbolic space evoking the passage between the world above and the world below, the known and the unknown, the human and nature.

Each piece in the series carries another state of Şahmaran. Sometimes human and serpent turn into one another in the same body, sometimes the figure coils into itself; at other times the distance between the human face and the natural body creates a feeling of silence and longing. Across these different forms, Şahmaran’s wisdom is conceived not as knowledge acquired from outside but as an ancient memory hidden within earth, water and living things.

Rather than retelling the tale, the Şahmaran Sculpture Series follows the traces it has left in memory; it approaches Şahmaran not as a mythological character from the past but as a symbolic being of the relationship between nature, the human and memory that continues to transform today.', 'Elle biçimlendirilmiş seramik heykel, Masalın Hafızası koleksiyonu. Cepheden okunan, simetrik U formunda bir gövde; iki yanın dengesi üstte taç biçiminde birleşir.

Şahmaran Serisi''nin beş parçasından biridir; seri, insan ile doğa arasındaki eşik temasını ortak bir biçim diliyle sürdürür ve grup olarak da kurgulanabilir.', 'Hand-shaped ceramic sculpture from The Memory of Tales collection. A body in a symmetrical U form, read from the front; the balance of its two sides meets at the top in a crown-like form.

One of the five pieces in the Şahmaran Series; the series pursues the theme of the threshold between human and nature in a shared formal language and can also be arranged as a group.', true, 309);
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='sahmaran-v-karsilasma'), 'https://res.cloudinary.com/df0henatz/image/upload/v1791930301/uarttasarim/heykel/sahmaran-v-karsilasma-1.jpg', 0, true); -- Şahmaran– Karşılaşma1.jpg
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='sahmaran-v-karsilasma'), 'https://res.cloudinary.com/df0henatz/image/upload/v1791930303/uarttasarim/heykel/sahmaran-v-karsilasma-2.jpg', 1, true); -- Şahmaran– Karşılaşma2.jpg
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='sahmaran-v-karsilasma'), 'https://res.cloudinary.com/df0henatz/image/upload/v1791930306/uarttasarim/heykel/sahmaran-v-karsilasma-3.jpg', 2, true); -- Şahmaran– Karşılaşma3.jpg
INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='sahmaran-v-karsilasma'), 'https://res.cloudinary.com/df0henatz/image/upload/v1791930307/uarttasarim/heykel/sahmaran-v-karsilasma-4.jpg', 3, true); -- Şahmaran– Karşılaşma4.jpg
COMMIT;
