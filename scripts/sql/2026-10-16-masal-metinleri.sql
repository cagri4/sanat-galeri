-- Üretildi: scripts/masal-belgeler-2026-10-16.py — sanatçının 15 Eki belgeleri. Silme yok.
-- Geri alma: 2026-10-16-masal-metinleri-GERI-AL.sql (yedek: scripts/sql/yedek/masal-belgeler-2026-10-16.json)
BEGIN;
UPDATE products SET year = 2012 WHERE slug = 'anka-i-ates-ve-donusum';
UPDATE products SET year = 2012 WHERE slug = 'anka-ii-karanliktan-yukselis';
UPDATE products SET year = 2012 WHERE slug = 'anka-iii-yasama-donus';
UPDATE products SET year = 2009, dimensions_tr = '40 × 55 cm', dimensions_en = '40 × 55 cm' WHERE slug = 'anka-iv-ozgurlesme';
UPDATE products SET description_kurumsal_tr = replace(description_kurumsal_tr, '35 × 65 cm — serinin en büyük parçası.', '40 × 55 cm.'), description_kurumsal_en = replace(description_kurumsal_en, '35 × 65 cm — the largest piece in the series.', '40 × 55 cm.') WHERE slug = 'anka-iv-ozgurlesme';
UPDATE products SET description_kurumsal_tr = replace(description_kurumsal_tr, ' (26 × 50 cm ile 35 × 65 cm arası)', ''), description_kurumsal_en = replace(description_kurumsal_en, ' (from 26 × 50 cm to 35 × 65 cm)', '') WHERE slug LIKE 'anka-%' AND collection = 'Masalın Hafızası — Anka Serisi';
UPDATE products SET year = 2009, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve Raku pişirimi', medium_en = 'Free-formed grogged clay, raku firing', dimensions_tr = '30 × 45 cm', dimensions_en = '30 × 45 cm' WHERE slug = 'sahmaran-i-donusum';
UPDATE products SET year = 2009, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve Raku pişirimi', medium_en = 'Free-formed grogged clay, raku firing', dimensions_tr = '35 × 55 cm', dimensions_en = '35 × 55 cm' WHERE slug = 'sahmaran-ii-iki-doga';
UPDATE products SET year = 2010, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve Raku pişirimi', medium_en = 'Free-formed grogged clay, raku firing', dimensions_tr = '35 × 50 cm', dimensions_en = '35 × 50 cm' WHERE slug = 'sahmaran-iii-icsel-bilgelik';
UPDATE products SET year = 2012, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve lüsterli pişirim', medium_en = 'Free-formed grogged clay, lustre firing', dimensions_tr = '35 × 45 cm', dimensions_en = '35 × 45 cm', description_tr = 'İki baş aynı bedenden doğar ama aynı yöne bakmaz. İnsan yüzü uzağa, yılan yüzü geriye bakar. Arada kalan boşluk özlemin kendisidir. Yüzey pürüzsüz, akışkan ve parlak. Tıpkı özlem gibi keskin değil, yumuşak ama derin.

Şahmaran, Anadolu''nun sözlü kültüründe yüzyıllardır yaşayan; bilgelik, doğa, şifa, sır ve dönüşüm kavramlarıyla ilişkilendirilen kadim bir anlatının izlerinden doğan seramik heykel serisidir.

Bu seride Şahmaran, geleneksel anlatılardaki yarı insan yarı yılan biçiminin doğrudan bir temsili olarak ele alınmaz. İnsan yüzü, yılansı beden ve organik formlar birbirine eklenen ayrı parçalar olmaktan çıkar; kıvrılan, bölünen, yeniden birleşen ve sürekli dönüşen tek bir varlığa dönüşür. Böylece Şahmaran, belirli bir figürden çok insan ile doğa arasındaki sınırda yaşayan bir varoluş biçimi olarak yeniden yorumlanır.

Heykellerde tekrar eden spiral hareketler, iç boşluklar, karşı karşıya gelen insan ve yılan biçimleri; eşik, dönüşüm, ikilik, içsel bilgelik ve özlem kavramlarını görünür kılar. Boşluk ise yalnızca heykelin biçimsel bir unsuru değildir; yerüstü ile yeraltı, bilinen ile bilinmeyen, insan ile doğa arasındaki geçişi çağrıştıran sembolik bir alana dönüşür.

Serinin her parçası Şahmaran''ın başka bir hâlini taşır. Kimi zaman insan ve yılan aynı bedende birbirine dönüşür, kimi zaman figür kendi içine kıvrılır; kimi zaman ise insan yüzü ile doğasal beden arasındaki mesafe bir sessizlik ve özlem duygusu yaratır. Bu farklı biçimler boyunca Şahmaran''ın bilgeliği, dışarıdan edinilen bir bilgi olmaktan çok toprağın, suyun ve canlılığın içinde saklanan kadim bir hafıza olarak düşünülür.

Şahmaran Heykel Serisi, masalı yeniden anlatmak yerine onun bellekte bıraktığı izlerin peşinden gider; Şahmaran''ı geçmişten gelen mitolojik bir karakter olarak değil, doğa, insan ve hafıza arasındaki ilişkinin bugün de dönüşmeye devam eden simgesel bir varlığı olarak ele alır.', description_en = 'Two heads are born from the same body but do not look in the same direction. The human face looks into the distance, the serpent face looks back. The void left between them is longing itself. The surface is smooth, flowing and glossy. Just like longing, it is not sharp but soft and deep.

Şahmaran is a series of ceramic sculptures born from the traces of an ancient narrative that has lived for centuries in Anatolia’s oral culture and is associated with wisdom, nature, healing, secrecy and transformation.

In this series Şahmaran is not treated as a direct representation of the half-human, half-serpent form of the traditional tales. The human face, the serpentine body and organic forms cease to be separate parts joined together and become a single being that coils, divides, reunites and constantly transforms. Şahmaran is thus reinterpreted less as a particular figure than as a mode of existence living on the border between human and nature.

The recurring spiral movements, inner voids and facing human and serpent forms in the sculptures make the concepts of threshold, transformation, duality, inner wisdom and longing visible. The void is not merely a formal element of the sculpture; it becomes a symbolic space evoking the passage between the world above and the world below, the known and the unknown, the human and nature.

Each piece in the series carries another state of Şahmaran. Sometimes human and serpent turn into one another in the same body, sometimes the figure coils into itself; at other times the distance between the human face and the natural body creates a feeling of silence and longing. Across these different forms, Şahmaran’s wisdom is conceived not as knowledge acquired from outside but as an ancient memory hidden within earth, water and living things.

Rather than retelling the tale, the Şahmaran Sculpture Series follows the traces it has left in memory; it approaches Şahmaran not as a mythological character from the past but as a symbolic being of the relationship between nature, the human and memory that continues to transform today.' WHERE slug = 'sahmaran-iv-ozlem';
UPDATE products SET medium_tr = 'Serbest şekillendirme, şamotlu çamur ve sırlı pişirim', medium_en = 'Free-formed grogged clay, glaze firing', dimensions_tr = '40 × 65 cm', dimensions_en = '40 × 65 cm', description_tr = 'Şahmaran’ın Cemşab ile karşılaşmasını sembolize eder. Simetrik U formundaki beden, iki doğanın dengeye geldiği, ikiliğin bütünlüğe dönüştüğü andır.

Şahmaran, Anadolu''nun sözlü kültüründe yüzyıllardır yaşayan; bilgelik, doğa, şifa, sır ve dönüşüm kavramlarıyla ilişkilendirilen kadim bir anlatının izlerinden doğan seramik heykel serisidir.

Bu seride Şahmaran, geleneksel anlatılardaki yarı insan yarı yılan biçiminin doğrudan bir temsili olarak ele alınmaz. İnsan yüzü, yılansı beden ve organik formlar birbirine eklenen ayrı parçalar olmaktan çıkar; kıvrılan, bölünen, yeniden birleşen ve sürekli dönüşen tek bir varlığa dönüşür. Böylece Şahmaran, belirli bir figürden çok insan ile doğa arasındaki sınırda yaşayan bir varoluş biçimi olarak yeniden yorumlanır.

Heykellerde tekrar eden spiral hareketler, iç boşluklar, karşı karşıya gelen insan ve yılan biçimleri; eşik, dönüşüm, ikilik, içsel bilgelik ve özlem kavramlarını görünür kılar. Boşluk ise yalnızca heykelin biçimsel bir unsuru değildir; yerüstü ile yeraltı, bilinen ile bilinmeyen, insan ile doğa arasındaki geçişi çağrıştıran sembolik bir alana dönüşür.

Serinin her parçası Şahmaran''ın başka bir hâlini taşır. Kimi zaman insan ve yılan aynı bedende birbirine dönüşür, kimi zaman figür kendi içine kıvrılır; kimi zaman ise insan yüzü ile doğasal beden arasındaki mesafe bir sessizlik ve özlem duygusu yaratır. Bu farklı biçimler boyunca Şahmaran''ın bilgeliği, dışarıdan edinilen bir bilgi olmaktan çok toprağın, suyun ve canlılığın içinde saklanan kadim bir hafıza olarak düşünülür.

Şahmaran Heykel Serisi, masalı yeniden anlatmak yerine onun bellekte bıraktığı izlerin peşinden gider; Şahmaran''ı geçmişten gelen mitolojik bir karakter olarak değil, doğa, insan ve hafıza arasındaki ilişkinin bugün de dönüşmeye devam eden simgesel bir varlığı olarak ele alır.', description_en = 'It symbolises Şahmaran’s encounter with Cemşab. The body, in its symmetrical U form, is the moment when two natures come into balance and duality becomes wholeness.

Şahmaran is a series of ceramic sculptures born from the traces of an ancient narrative that has lived for centuries in Anatolia’s oral culture and is associated with wisdom, nature, healing, secrecy and transformation.

In this series Şahmaran is not treated as a direct representation of the half-human, half-serpent form of the traditional tales. The human face, the serpentine body and organic forms cease to be separate parts joined together and become a single being that coils, divides, reunites and constantly transforms. Şahmaran is thus reinterpreted less as a particular figure than as a mode of existence living on the border between human and nature.

The recurring spiral movements, inner voids and facing human and serpent forms in the sculptures make the concepts of threshold, transformation, duality, inner wisdom and longing visible. The void is not merely a formal element of the sculpture; it becomes a symbolic space evoking the passage between the world above and the world below, the known and the unknown, the human and nature.

Each piece in the series carries another state of Şahmaran. Sometimes human and serpent turn into one another in the same body, sometimes the figure coils into itself; at other times the distance between the human face and the natural body creates a feeling of silence and longing. Across these different forms, Şahmaran’s wisdom is conceived not as knowledge acquired from outside but as an ancient memory hidden within earth, water and living things.

Rather than retelling the tale, the Şahmaran Sculpture Series follows the traces it has left in memory; it approaches Şahmaran not as a mythological character from the past but as a symbolic being of the relationship between nature, the human and memory that continues to transform today.' WHERE slug = 'sahmaran-v-karsilasma';
UPDATE products SET year = 2009, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve beyaz opak sır pişirimi', medium_en = 'Free-formed grogged clay, white opaque glaze firing', dimensions_tr = '53 cm', dimensions_en = '53 cm', description_tr = 'Türk kültürü içerisinde dini temele dayalı bir özellik taşıyan Derviş tipi, Türk masal anlatıları içerisinde kahramanların en önemli yardımcısı olan manevi kişilerdir. Bu kişiler zor durumda kalan ve yardıma ihtiyacı olan masal kahramanlarının karşısına çıkarak ona yardımcı olurlar ve dileklerini gerçekleştirirler.

Masallarda en sık görülen motif, çocuğu olmayan kahramanın dileğinin yerine getirilmesidir. Derviş, kahramana bir elma vererek onun çocuk sahibi olmasını sağlar. Elma, hem bereketin hem de neslin devamının simgesidir.

Benim şekillendirdiğim derviş karakterinde de bu özellik öne çıkarılır. Derviş, avuçlarında iki kırmızı elmayı uzatır biçimde tasvir edilmiştir. Oldukça yalın ve sade bir duruşu vardır. Çıplak ayaklıdır, dünya nimetlerinden uzaktır. Beyaz opak sırlı pişirimin verdiği açık, saf yüzey onun arınmışlığını vurgular.

Elbisesinin önündeki pencere şeklindeki niş içinden görünen bebek kabartması ise heykelin en güçlü sembolüdür. Bu, dervişin kendisinin değil, kahramanın düşlediği çocuk hayalinin ta kendisidir. Derviş, bir aracıdır; mucizeyi verir ama mucizenin sahibi değildir.

Anadolu’nun sözlü kültüründe kuşaktan kuşağa aktarılan masallar; yalnızca düşsel hikâyeler değil, toplumun korkularını, umutlarını, dönüşümlerini ve ortak belleğini taşıyan anlatılardır.

“Masalın Hafızası”; Şahmaran, Zümrüdüanka, Keloğlan, dev, dev anası, padişah ve prens gibi karakterleri çağdaş seramik heykel diliyle yeniden yorumlar.

Elle biçimlendirilen her figür, geleneksel anlatıdaki görünümünün ötesine geçerek kendi simgesel anlamını ve hikâyesini taşıyan özgün bir sanat eserine dönüşür.', description_en = 'In Turkish culture the dervish type has a religious foundation; in Turkish folk tales dervishes are spiritual figures, the heroes’ most important helpers. They appear before tale heroes who are in trouble and in need of help, assist them and make their wishes come true.

The most frequent motif in the tales is the granting of the wish of a hero who has no child. The dervish gives the hero an apple and so enables them to have a child. The apple is a symbol both of abundance and of the continuation of the line.

This quality is brought to the fore in the dervish character I have shaped as well. The dervish is depicted holding out two red apples in his palms. His bearing is very plain and simple. He is barefoot, far removed from worldly goods. The light, pure surface given by the white opaque glaze firing emphasises his purity.

The relief of a baby seen through the window-shaped niche at the front of his robe is the sculpture’s most powerful symbol. It is not the dervish himself but the very dream of the child the hero longs for. The dervish is an intermediary; he grants the miracle but is not its owner.

Passed down from generation to generation in Anatolia’s oral culture, folk tales are not merely fantastical stories; they carry a society’s fears, hopes, transformations and shared memory.

“The Memory of Tales” reinterprets characters such as Şahmaran, the Zümrüdüanka, Keloğlan, the giant, the giant’s mother, the sultan and the prince in the language of contemporary ceramic sculpture.

Shaped by hand, each figure goes beyond its appearance in the traditional tale and becomes an original work of art carrying its own symbolic meaning and story.' WHERE slug = 'dervis';
UPDATE products SET year = 2009, medium_tr = 'Serbest şekillendirme, şamotlu çamur, isli pişirim', medium_en = 'Free-formed grogged clay, smoke firing', dimensions_tr = '70 cm', dimensions_en = '70 cm', description_tr = 'Eski topluluklar, korktukları, karşısında çaresiz kaldıkları ve tanımlayamadıkları tabiat olaylarını tanrısallaştırmışlardır. Bu olaylar zamanla mitlerde ve masallarda ete kemiğe bürünerek dev karakterine dönüşmüştür. İnsanoğlu aşamadığı güçlükleri büyüterek, baş edilmesi güç olağanüstü bir varlığa dönüştürmüştür.

Masallarda dev, ürkütücü boyutlarda geniş kollara, bacaklara ve gövdeye sahip, iri yapılı bir varlıktır. İnsanlara kötülük eder, önüne engeller koyar. Aslında bu geniş yapısının içinde çabuk kandırılabilen küçük bir zekası vardır. Kahraman bu zayıflığı keşfettiğinde onu zekasıyla yener.

Çağımızda teknoloji sayesinde sorunlar çok kolay çözülür hale gelmiştir. Ancak her şeyi kolay elde edebilme durumu, insanı bencilleştirmiş ve yabancılaştırmıştır. İnsan her şeyi bilinçsizce tüketmekte ve dünyanın sonunu hazırlamaktadır. Birkaç yüzyıl önce dev gibi duran korkular yok olmuş, şimdi her şeyi bir dev gibi yok eden insanın kendisidir.

Benim biçimlendirdiğim dev karakteri, bu eski korkuların ve kaygıların temsilidir. Artık eski gücünü kaybetmiştir. Sopa yere düşmüş, beden zayıflamış, yüzde hüzünlü bir ifade belirmiştir. Yaşlanmış ve güçsüz bir dev olarak, çağımızın asıl devinin kim olduğunu sorgulatır.

Anadolu’nun sözlü kültüründe kuşaktan kuşağa aktarılan masallar; yalnızca düşsel hikâyeler değil, toplumun korkularını, umutlarını, dönüşümlerini ve ortak belleğini taşıyan anlatılardır.

“Masalın Hafızası”; Şahmaran, Zümrüdüanka, Keloğlan, dev, dev anası, padişah ve prens gibi karakterleri çağdaş seramik heykel diliyle yeniden yorumlar.

Elle biçimlendirilen her figür, geleneksel anlatıdaki görünümünün ötesine geçerek kendi simgesel anlamını ve hikâyesini taşıyan özgün bir sanat eserine dönüşür.', description_en = 'Early communities deified the natural phenomena they feared, felt helpless before and could not define. Over time these phenomena took on flesh and blood in myths and tales and turned into the character of the giant. Humankind magnified the difficulties it could not overcome and turned them into an extraordinary being that is hard to contend with.

In the tales the giant is a huge being with arms, legs and a body of frightening size. He harms people and puts obstacles in their way. Yet inside this vast frame lies a small mind that is easily fooled. When the hero discovers this weakness, he defeats him with his wits.

In our age technology has made problems very easy to solve. But being able to obtain everything easily has made people selfish and estranged. People consume everything unthinkingly and are preparing the end of the world. The fears that loomed like giants a few centuries ago have disappeared; now it is humans themselves who destroy everything like a giant.

The giant character I have shaped represents these old fears and anxieties. He has now lost his former strength. The club has fallen to the ground, the body has weakened, and a sorrowful expression has appeared on the face. As an aged and powerless giant, he makes us ask who the real giant of our age is.

Passed down from generation to generation in Anatolia’s oral culture, folk tales are not merely fantastical stories; they carry a society’s fears, hopes, transformations and shared memory.

“The Memory of Tales” reinterprets characters such as Şahmaran, the Zümrüdüanka, Keloğlan, the giant, the giant’s mother, the sultan and the prince in the language of contemporary ceramic sculpture.

Shaped by hand, each figure goes beyond its appearance in the traditional tale and becomes an original work of art carrying its own symbolic meaning and story.' WHERE slug = 'dev';
UPDATE products SET title_tr = 'Dev Anası', title_en = 'Dev Anası (The Giant’s Mother)', year = 2009, medium_tr = 'Serbest şekillendirme, şamotlu çamur, isli pişirim', medium_en = 'Free-formed grogged clay, smoke firing', dimensions_tr = '50 cm', dimensions_en = '50 cm', description_tr = 'Masallarda Dev Anası, devler gibi iri yapılı, çirkin ve korkunçtur. Fakat bu korkutucu bedenin içinde devlerden farklı olarak merhametli ve anaç bir kişilik taşır. Masalın en kritik eşiğidir. Kahraman onun arkasından dolaşıp sütünü emdiğinde, artık onun evladı sayılır; Dev Anası onu korur ve diğer devlerin zarar vermesine engel olur.

Bu motif, Anadolu masallarının en kadim anaerkil izlerinden biridir. Korkulan ama aynı zamanda sığınılan bir anadır.

Benim biçimlendirdiğim Dev Anası, bu özelliklere uygun olarak çirkin, korkunç ve ilkel bir görünüştedir. Elinde bir kepçe tutar, önündeki kazanla yemek yapar konumda durur. Bu kazan, sadece yamyamlığın değil, aynı zamanda bereketin de kabıdır. İçinde tüm dünyanın nimetlerini kaynatır. İsli pişirimin verdiği yanık, topraksı doku, onun çağlar öncesinden gelen ilkel gücünü vurgular. Kazan, bu çirkinliğin ardındaki sonsuz anaçlığın ve merhametin simgesidir.

Anadolu’nun sözlü kültüründe kuşaktan kuşağa aktarılan masallar; yalnızca düşsel hikâyeler değil, toplumun korkularını, umutlarını, dönüşümlerini ve ortak belleğini taşıyan anlatılardır.

“Masalın Hafızası”; Şahmaran, Zümrüdüanka, Keloğlan, dev, dev anası, padişah ve prens gibi karakterleri çağdaş seramik heykel diliyle yeniden yorumlar.

Elle biçimlendirilen her figür, geleneksel anlatıdaki görünümünün ötesine geçerek kendi simgesel anlamını ve hikâyesini taşıyan özgün bir sanat eserine dönüşür.', description_en = 'In the tales the Giant’s Mother is huge like the giants, ugly and frightening. Yet inside this frightening body, unlike the giants, she carries a merciful and motherly character. She is the tale’s most critical threshold. When the hero comes up behind her and suckles her milk, he is counted as her child from then on; the Giant’s Mother protects him and keeps the other giants from harming him.

This motif is one of the most ancient matriarchal traces in Anatolian tales. She is a mother who is feared but in whom one also takes refuge.

The Giant’s Mother I have shaped is, in keeping with these qualities, ugly, frightening and primitive in appearance. She holds a ladle in her hand and stands as if cooking at the cauldron before her. This cauldron is the vessel not only of cannibalism but also of abundance. In it she boils the bounty of the whole world. The burnt, earthy texture given by smoke firing emphasises her primeval power, coming from ages past. The cauldron is the symbol of the boundless motherliness and mercy behind this ugliness.

Passed down from generation to generation in Anatolia’s oral culture, folk tales are not merely fantastical stories; they carry a society’s fears, hopes, transformations and shared memory.

“The Memory of Tales” reinterprets characters such as Şahmaran, the Zümrüdüanka, Keloğlan, the giant, the giant’s mother, the sultan and the prince in the language of contemporary ceramic sculpture.

Shaped by hand, each figure goes beyond its appearance in the traditional tale and becomes an original work of art carrying its own symbolic meaning and story.' WHERE slug = 'devanasi';
UPDATE products SET year = 2009, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve Raku pişirimi', medium_en = 'Free-formed grogged clay, raku firing', dimensions_tr = '50 cm', dimensions_en = '50 cm', description_tr = 'Türk masal geleneğinin en önemli karakterlerinden Keloğlan, bu heykelde yaşamı bir oyun gibi algılayan, sorunlar karşısında kaygıya kapılmak yerine zekâsıyla kendi oyununu kuran bir karakter olarak yorumlanır. Yaşamın zorluklarını kendine dert edinmeden, pratik zekâsı ve kendine özgü yaklaşımıyla aşan Keloğlan, dünyayı farklı bir bakış açısıyla kavramanın simgesine dönüşür.

Heykelin kostümünde yer alan yamalar, karakterin yoksulluğuna gönderme yaparken; seramik yüzeydeki çatlaklı, gri ve beyaz tonlar onun saflığını ve masalsı kimliğini ifade eder. Malzemenin dokusu ve yüzeydeki izler, figürün karakteristik özelliklerini biçimsel anlatımla bütünleştirir.

Keloğlan, bu yorumda yalnızca yoksul bir masal kahramanı değil, yaşamın güçlükleri karşısında kendi çözüm yollarını geliştiren, olaylara oyunbaz bir zekâyla yaklaşan bir karakterdir. Heykel, geleneksel masal anlatısının taşıdığı kültürel belleği çağdaş bir seramik heykel diliyle yeniden ele alır.

Anadolu’nun sözlü kültüründe kuşaktan kuşağa aktarılan masallar; yalnızca düşsel hikâyeler değil, toplumun korkularını, umutlarını, dönüşümlerini ve ortak belleğini taşıyan anlatılardır.

“Masalın Hafızası”; Şahmaran, Zümrüdüanka, Keloğlan, dev, dev anası, padişah ve prens gibi karakterleri çağdaş seramik heykel diliyle yeniden yorumlar.

Elle biçimlendirilen her figür, geleneksel anlatıdaki görünümünün ötesine geçerek kendi simgesel anlamını ve hikâyesini taşıyan özgün bir sanat eserine dönüşür.', description_en = 'Keloğlan, one of the most important characters of the Turkish folk-tale tradition, is interpreted in this sculpture as a character who perceives life as a game and, rather than giving in to anxiety in the face of problems, sets up his own game with his wits. Overcoming life’s hardships without letting them trouble him, through his practical intelligence and his own particular approach, Keloğlan becomes a symbol of grasping the world from a different point of view.

The patches on the sculpture’s costume refer to the character’s poverty, while the crackled grey and white tones on the ceramic surface express his innocence and fairy-tale identity. The texture of the material and the marks on the surface bring the figure’s characteristic features together with its formal expression.

In this interpretation Keloğlan is not merely a poor tale hero but a character who develops his own solutions to life’s difficulties and approaches events with a playful intelligence. The sculpture revisits the cultural memory carried by the traditional tale in the language of contemporary ceramic sculpture.

Passed down from generation to generation in Anatolia’s oral culture, folk tales are not merely fantastical stories; they carry a society’s fears, hopes, transformations and shared memory.

“The Memory of Tales” reinterprets characters such as Şahmaran, the Zümrüdüanka, Keloğlan, the giant, the giant’s mother, the sultan and the prince in the language of contemporary ceramic sculpture.

Shaped by hand, each figure goes beyond its appearance in the traditional tale and becomes an original work of art carrying its own symbolic meaning and story.' WHERE slug = 'keloglan';
UPDATE products SET year = 2009, medium_tr = 'Serbest şekillendirme, şamotlu çamur ve Raku pişirimi', medium_en = 'Free-formed grogged clay, raku firing', dimensions_tr = '40 cm', dimensions_en = '40 cm', description_tr = 'Türk masallarında şehzade, varlıklı ve yakışıklı bir delikanlıdır. Tüm istekleri hemen yerine getirilir. Halkın gözünde hiç sorunu yoktur.

Oysa masalın bu en şanslı görünen karakterinin de en ağır yükü vardır. İleride koca bir toplumu yönetecektir. Henüz gençtir; yeterli birikimi, deneyimi yoktur. Bu nedenle gelecekle ilgili korkularının olmaması mümkün değildir.

Ben çalışmamda şehzadeyi bu yüzden düşünen adam duruşuyla biçimlendirdim. Zenginliği, yakışıklılığı ona yeterli gücü vermez, sorunların çözümüne yetmez. Bir eli çenesine dayalı, düşünceli, önüne bakan ve yüzünde umutsuz bir ifade taşıyan bir görünüm sergiler.

Üstünde taşıdığı kostüm onun geçmişten gelen soylu yaşamının simgesidir. Fakat bu soyluluk ona hiçbir zaman güç vermez. O içinde yaşadığı acılarla dolu yaşamın prensidir. Gerçek yaşamdaki acılar onun yakışıklılığını ve delikanlılığını silip süpürmüştür. Figürün büzülmüş duruşu ve yüz ifadesi, çevresindeki sorunların onu ne kadar bunalttığının ifadesidir.

Anadolu’nun sözlü kültüründe kuşaktan kuşağa aktarılan masallar; yalnızca düşsel hikâyeler değil, toplumun korkularını, umutlarını, dönüşümlerini ve ortak belleğini taşıyan anlatılardır.

“Masalın Hafızası”; Şahmaran, Zümrüdüanka, Keloğlan, dev, dev anası, padişah ve prens gibi karakterleri çağdaş seramik heykel diliyle yeniden yorumlar.

Elle biçimlendirilen her figür, geleneksel anlatıdaki görünümünün ötesine geçerek kendi simgesel anlamını ve hikâyesini taşıyan özgün bir sanat eserine dönüşür.', description_en = 'In Turkish tales the prince is a wealthy and handsome young man. All his wishes are granted at once. In the eyes of the people he has no troubles at all.

Yet this seemingly luckiest character of the tale carries the heaviest burden. One day he will rule a whole society. He is still young; he lacks enough knowledge and experience. That is why it is impossible for him not to have fears about the future.

This is why in my work I shaped the prince in the pose of a thinking man. His wealth and good looks do not give him enough strength, nor are they enough to solve his problems. With one hand resting on his chin, he appears thoughtful, looking down, with a hopeless expression on his face.

The costume he wears is the symbol of the noble life he comes from. But this nobility never gives him strength. He is the prince of a life full of the suffering he lives within. The pains of real life have swept away his good looks and his youth. The figure’s hunched posture and facial expression show how much the problems around him overwhelm him.

Passed down from generation to generation in Anatolia’s oral culture, folk tales are not merely fantastical stories; they carry a society’s fears, hopes, transformations and shared memory.

“The Memory of Tales” reinterprets characters such as Şahmaran, the Zümrüdüanka, Keloğlan, the giant, the giant’s mother, the sultan and the prince in the language of contemporary ceramic sculpture.

Shaped by hand, each figure goes beyond its appearance in the traditional tale and becomes an original work of art carrying its own symbolic meaning and story.' WHERE slug = 'sehzade';
COMMIT;
