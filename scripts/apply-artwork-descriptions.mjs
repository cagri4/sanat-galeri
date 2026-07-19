/**
 * Eser açıklamalarını sanatçının KENDİ metinleriyle doldurur.
 *
 * KAYNAK: SANATCI-ESER-ACIKLAMALARI.md (Drive "Replikalar hakkında.docx").
 * Bu metinler GERÇEK — uydurma değil. Sanatçının isteği üzerine
 * KISALTILMADAN / SADELEŞTİRİLMEDEN girilir; yalnızca sanatçının kendine
 * yazdığı ikinci-tekil hitaplar üçüncü şahsa çevrildi.
 *
 * Vurgular (**...**) sanatçının kendi bölümlemesidir; eser sayfasında
 * `components/shared/rich-text.tsx` tarafından kalın olarak basılır.
 *
 * Çalıştırma:  node scripts/apply-artwork-descriptions.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')])
)
const H = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}
const patch = async (slug, body) => {
  const r = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}`,
    { method: 'PATCH', headers: H, body: JSON.stringify(body) }
  )
  const t = await r.text()
  if (!r.ok) throw new Error(`${slug} → ${r.status} ${t}`)
  const rows = JSON.parse(t)
  if (rows.length !== 1) throw new Error(`${slug} → ${rows.length} satır güncellendi (1 bekleniyordu)`)
  return rows[0]
}

const WORKS = {
  'afrodit-ve-kaz': {
    tr: `Bu kompozisyonun kökeni: MÖ 460–450 Attika beyaz zeminli tabak Pistoxenos Ressamı'na atfedilir.

Replikada, Afrodit uzun khiton giysisi ve başındaki taçla betimlenmiş; altında ise kutsal hayvanı olan kaz yer alıyor. Kazın açılmış kanatları, tanrıçanın göksel ve zarif doğasını vurguluyor.

Afrodit denince çoğu kişi güvercin ya da kuğuyu düşünür; ancak kaz da Afrodit'in kutsal hayvanlarından biridir. Bunun birkaç nedeni vardır: sevgi, evlilik ve bereketi simgeler; su ile ilişkisi nedeniyle Afrodit'in denizden doğuşuna gönderme yapar. Antik Yunan sanatında özellikle MÖ 5. yüzyılda Afrodit bazen kazın üzerinde otururken veya onunla birlikte yürürken resmedilmiştir.

**Pistoxenos Ressamı'nın üslubu:** Zarif ve ince çizgiler; beyaz zemin üzerine hafif kırmızı, kahverengi ve siyah konturlar; figürlerde sakin ve şiirsel bir anlatım; giysi kıvrımlarının akıcı verilmesi; mitolojik sahnelerin dramatik değil, dingin bir estetikle sunulması.`,
    en: `The origin of this composition: an Attic white-ground plate of 460–450 BC, attributed to the Pistoxenos Painter.

In the replica, Aphrodite is depicted in a long chiton with a diadem on her head; beneath her is the goose, one of her sacred animals. The goose's outspread wings emphasise the celestial and graceful nature of the goddess.

Most people associate Aphrodite with the dove or the swan; the goose, however, is also one of her sacred animals. There are several reasons for this: it symbolises love, marriage and fertility, and through its association with water it alludes to Aphrodite's birth from the sea. In ancient Greek art, particularly in the 5th century BC, Aphrodite is sometimes shown seated upon a goose or walking together with one.

**The style of the Pistoxenos Painter:** graceful, fine lines; light red, brown and black contours on a white ground; a calm and poetic treatment of the figures; the flowing rendering of drapery folds; and mythological scenes presented not dramatically but with a serene aesthetic.`,
  },

  europa: {
    tr: `Terra sigillata tekniğiyle yapılan bu çalışma, seramiklerin ruhunu yansıtıyor. Sahne Europa'nın Zeus tarafından kaçırılışı mitini betimliyor.

**İkonografik çözümleme:** Merkezde genç bir kadın olan Europa bulunuyor. Yanındaki beyaz boğa, gerçekte tanrı Zeus'tur. Europa'nın boğanın sırtına yerleşmiş ya da ona tutunmuş şekilde gösterilmesi, mitin en tanınmış anını temsil eder. Rüzgârda savrulan pelerini ve hareket hâlindeki boğa, kaçırılma sahnesine dinamizm kazandırır. Çevredeki spiral bordürler (meander ve dalga motifleri), Antik Yunan seramiklerinin karakteristik bezeme anlayışını yansıtır.

**Mitolojik öykü:** Europa, Fenike kralı Agenor'un kızıdır. Zeus onu görür ve güzelliğine âşık olur. Ancak doğrudan yaklaşmak yerine uysal ve bembeyaz bir boğa kılığına girer. Europa ve arkadaşları çiçek toplarken bu sakin boğayı görünce korkmazlar. Europa boğanın sırtına oturduğu anda Zeus denize doğru koşar ve onu Girit Adası'na götürür. Girit'te Zeus gerçek kimliğini açıklar ve bu birliktelikten üç önemli çocuk doğar: Minos (Girit'in efsanevi kralı), Rhadamanthys ve Sarpedon. Özellikle Minos, daha sonra Labirent ve Minotor efsanelerinin merkezindeki figür olacaktır.

**Sembolik anlamı:** Bu sahne yalnızca bir kaçırılma hikâyesi değildir. Antik sanat tarihçileri onu farklı biçimlerde yorumlar: tanrısal gücün insan dünyasına müdahalesi, deniz yolculuğu ve kültürlerin taşınması, Doğu'dan Batı'ya geçişin simgesi. Nitekim "Avrupa" kıtasının adı da Europa'dan gelir.

**Bu replika hakkında:** Terra sigillata tekniğiyle yapılan bu çalışma, kırmızı figürlü Attika seramiklerinin estetik dilini yeniden yorumluyor. Özellikle boğanın beyaz vurgularla modellenmesi, figürün sade ama akıcı drapeleri ve spiral bordürlerin ritmi, antik seramiklerdeki dekoratif anlayışı yansıtıyor.`,
    en: `Made in the terra sigillata technique, this work reflects the spirit of the ancient ceramics. The scene depicts the myth of the abduction of Europa by Zeus.

**Iconographic reading:** At the centre is Europa, a young woman. The white bull beside her is in fact the god Zeus. Europa shown settled on the bull's back, or holding on to it, represents the best-known moment of the myth. Her cloak billowing in the wind and the bull in motion lend dynamism to the abduction scene. The surrounding spiral borders (meander and wave motifs) reflect the characteristic decorative language of ancient Greek ceramics.

**The myth:** Europa is the daughter of Agenor, king of Phoenicia. Zeus sees her and falls in love with her beauty. Rather than approaching her directly, he takes the guise of a gentle, snow-white bull. While Europa and her companions are gathering flowers, they see this calm bull and are not afraid. The moment Europa sits on its back, Zeus runs towards the sea and carries her to the island of Crete. There Zeus reveals his true identity, and from this union three important children are born: Minos (the legendary king of Crete), Rhadamanthys and Sarpedon. Minos in particular would later become the central figure of the Labyrinth and Minotaur legends.

**Symbolic meaning:** This scene is not merely a story of abduction. Historians of ancient art interpret it in various ways: the intervention of divine power in the human world, a sea voyage and the transmission of cultures, the symbol of passage from East to West. Indeed, the name of the continent "Europe" derives from Europa.

**About this replica:** Made in the terra sigillata technique, the work reinterprets the aesthetic language of Attic red-figure ceramics. The modelling of the bull with white highlights, the plain yet flowing drapery of the figure and the rhythm of the spiral borders all reflect the decorative sensibility of ancient ceramics.`,
  },

  mainad: {
    tr: `Mainadlar, şarap ve coşkunun tanrısı Dionysos'un kadın takipçileridir. Antik Yunan seramiklerinde onları dans ederken, avlanırken ya da vahşi hayvanlarla birlikte görmek oldukça yaygındır.

**İkonografik özellikler:** *Leopar postu (nebris)* — omuzlarına aldığı benekli post, Mainadların en karakteristik giysisidir, Dionysos kültüyle doğrudan ilişkilidir. *Thyrsos* — sol elindeki, ucunda çam kozalağı bulunan uzun asa, Dionysos'un kutsal simgesidir. *Panter/Leopar* — sağ elinden tuttuğu benekli yırtıcı hayvan yine Dionysos'un kutsal hayvanlarından biridir; Mainadlar antik sanat eserlerinde sık sık panterleri ehlileştirmiş veya onlarla birlikte tasvir edilir. *Hareketli giysiler ve uçuşan saçlar* — Mainadların trans hâlindeki danslarını ve coşkulu ruh hâllerini ifade eder.

**Mitolojik anlamı:** Mainadlar yalnızca dans eden kadınlar değildir. Dionysos kültünde doğanın dizginlenemeyen gücünü, coşkuyu (ekstasis), esrimeyi ve insan ile doğa arasındaki sınırların ortadan kalkmasını temsil ederler. Bu nedenle antik sanatçılar onları çoğu zaman yürürken değil, hareket hâlinde, rüzgârla savrulan giysiler ve canlı bir ritim içinde betimlemişlerdir.

**Üslup:** Çizgi ekonomisi ve zarif konturlarıyla Attika kırmızı figür üslubunun karakterini taşıyor. Figürün profilden verilmesi, ince giysi kıvrımları ve dengeli kompozisyon klasik dönem vazo resimlerinin estetiğini yansıtıyor.`,
    en: `Maenads were the female followers of Dionysos, god of wine and ecstasy. In ancient Greek ceramics it is common to see them dancing, hunting, or in the company of wild animals.

**Iconographic features:** *The leopard skin (nebris)* — the spotted pelt drawn over the shoulders is the most characteristic garment of the Maenads and is directly linked to the cult of Dionysos. *The thyrsos* — the long staff in the left hand, tipped with a pine cone, is a sacred emblem of Dionysos. *The panther/leopard* — the spotted predator held in the right hand is likewise one of Dionysos's sacred animals; in ancient art Maenads are frequently shown having tamed panthers or accompanied by them. *Flowing garments and streaming hair* — these express the Maenads' entranced dance and their exalted state of mind.

**Mythological meaning:** Maenads are not merely dancing women. Within the cult of Dionysos they represent the untameable force of nature, ecstasy (ekstasis), rapture, and the dissolution of the boundary between human being and nature. For this reason ancient artists most often depicted them not walking but in motion, with wind-blown garments and a vivid rhythm.

**Style:** With its economy of line and graceful contours, the work carries the character of the Attic red-figure style. The profile rendering of the figure, the fine folds of the garment and the balanced composition reflect the aesthetic of Classical-period vase painting.`,
  },

  thetis: {
    tr: `Thetis, deniz tanrısı Nereus ile Doris'in kızlarından biridir ve Nereidlerin (deniz perilerinin) en ünlüsüdür. Aynı zamanda Akhilleus'un annesi olarak Homeros'un destanlarında önemli bir yere sahiptir.

**Bu kompozisyondaki ikonografi:** Thetis'i tanımlayan en önemli unsur, balıklarla birlikte betimlenmiş olmasıdır. Figürün iki elinde tuttuğu büyük balıklar, onun deniz dünyasıyla olan bağını simgeler. Etrafında yüzen diğer balıklar, sahnenin deniz ortamında geçtiğini açıkça ifade eder. Hafif hareket hâlindeki giysisi ve zarif duruşu, Nereid tasvirlerinin tipik özelliklerindendir. Kırmızı zemin üzerine beyaz figür tekniği, Geç Arkaik ve Erken Klasik dönem Attika seramiklerinde görülen dekoratif anlayışı hatırlatıyor. Dış bordürdeki dama (checkerboard) deseni ise bazı Attika kyliks ve tabaklarında kullanılan süsleme şemalarından biridir.

**Mitolojideki önemi:** Zeus ve Poseidon, Thetis'e ilgi duyarlar. Ancak bir kehanet, onun doğuracağı oğlun babasından daha güçlü olacağını söyler. Bu yüzden Thetis, ölümlü kahraman Peleus ile evlendirilir. Bu evlilikten Akhilleus doğar. Thetis, oğlunu ölümsüz yapmak için çeşitli girişimlerde bulunur; en bilinen anlatıda Akhilleus'u Styx Nehri'ne batırır ve yalnızca topuğundan tuttuğu için o kısım savunmasız kalır. Homeros'un İlyada destanında Akhilleus'un yeni zırhını tanrı Hephaistos'a yaptıran da yine Thetis'tir.

**Sanat tarihindeki yeri:** Thetis, antik seramiklerde çoğunlukla üç farklı biçimde görülür: Peleus ile güreşirken, deniz perileriyle birlikte denizden yükselirken, ya da balıklar ve deniz canlıları arasında tek başına. Balıkların figürün etrafında ritmik olarak yerleştirilmesi, onu doğrudan denizin hâkimi olarak tanıtıyor.`,
    en: `Thetis was one of the daughters of the sea god Nereus and Doris, and the most famous of the Nereids. As the mother of Achilles she also holds an important place in the Homeric epics.

**The iconography of this composition:** The most important element identifying Thetis is that she is depicted together with fish. The large fish held in each of the figure's hands symbolise her bond with the world of the sea. The other fish swimming around her make it plain that the scene takes place in a marine setting. Her lightly moving garment and graceful stance are typical features of Nereid depictions. The white-figure-on-red technique recalls the decorative sensibility found in Attic ceramics of the Late Archaic and Early Classical periods, while the checkerboard pattern on the outer border is one of the ornamental schemes used on certain Attic kylikes and plates.

**Her importance in mythology:** Zeus and Poseidon are both drawn to Thetis. A prophecy, however, declares that the son she bears will be mightier than his father. Thetis is therefore married to the mortal hero Peleus, and from this marriage Achilles is born. Thetis makes various attempts to render her son immortal; in the best-known account she dips Achilles in the river Styx, and because she holds him by the heel that part remains vulnerable. In Homer's Iliad it is again Thetis who has the god Hephaistos make new armour for Achilles.

**Her place in art history:** In ancient ceramics Thetis is most often seen in three ways: wrestling with Peleus, rising from the sea in the company of sea nymphs, or alone among fish and sea creatures. The rhythmic placement of the fish around the figure presents her directly as mistress of the sea.`,
  },

  siren: {
    tr: `Bu figür, ikonografik özelliklerine bakıldığında bir Siren tasviridir. Kadın başı ve gövdesi ile kuş kanatları birlikte verilmiş. Dizlerin altından itibaren kuş bacakları ve pençeleri görülüyor. Ayakların altında küçük bir kaya ya da zemin motifi var; Sirenler antik sanatta çoğunlukla kayalık kıyılarla ilişkilendirilir. Figürün sakin ve ön cepheye yakın duruşu, Geç Klasik ve Helenistik dönemde mezar stelleri ve seramiklerde görülen Siren betimlemelerine benziyor.

**Siren kimdir?** Antik Yunan mitolojisinde Sirenler kadın başlı, kuş gövdeli mitolojik varlıklardır. Büyüleyici şarkılarıyla denizcileri kendilerine çekerler. En ünlü anlatıları, Odysseia destanında Odysseus'un Sirenlerin şarkısını dinlemek için kendini geminin direğine bağlatmasıdır. Aynı zamanda antik Yunan sanatında yalnızca "baştan çıkarıcı" varlıklar değil; ölüm, ruhun yolculuğu ve öteki dünya ile ilişkilendirilen semboller olarak da kullanılmışlardır. Bu nedenle mezar anıtlarında da sıkça görülürler.

**Üslup:** Terra sigillata üzerine yapılan bu çalışma, antik ikonografiyi zarif biçimde aktarıyor. Özellikle kanatlardaki beyaz noktalı süslemeler, drapenin ince kıvrımları, dış bordürdeki bitkisel rumi benzeri bezemeler ve spiral friz, kompozisyona hem antik hem dekoratif bir karakter kazandırıyor.`,
    en: `Judging by its iconographic features, this figure is a depiction of a Siren. A woman's head and torso are combined with the wings of a bird. From below the knees the legs and talons of a bird appear. Beneath the feet is a small rock or ground motif; in ancient art Sirens are most often associated with rocky shores. The figure's calm, near-frontal stance resembles the Siren depictions found on grave stelae and ceramics of the Late Classical and Hellenistic periods.

**Who is the Siren?** In ancient Greek mythology Sirens are mythological beings with the head of a woman and the body of a bird. With their enchanting song they draw sailors to themselves. Their most famous appearance is in the Odyssey, where Odysseus has himself bound to the mast of his ship in order to listen to the Sirens' song. In ancient Greek art they were not only "seductive" beings, but were also used as symbols associated with death, the journey of the soul and the other world. For this reason they are frequently seen on funerary monuments as well.

**Style:** Executed on terra sigillata, this work conveys the ancient iconography with grace. The white dotted ornaments on the wings, the fine folds of the drapery, the vegetal, rumi-like decoration on the outer border and the spiral frieze together lend the composition both an ancient and a decorative character.`,
  },

  'aulos-calan-menad-kylix': {
    // NOT: slug eski yazımı ("menad") koruyor — eser GİZLİ, bağlantı verilmiş
    // olabileceği için slug değiştirilmedi. Başlık "Mainad" olarak düzeltildi.
    tr: `Bu figür büyük olasılıkla çifte aulos (çift kamışlı flüt) çalan bir müzisyen ya da Dionysos alayına (thiasos) katılan bir kadın tasviridir.

Figür iki borulu bir aulos çalıyor. Antik Yunan'da aulos, flütten farklı olarak kamışlı nefesli bir çalgıdır ve özellikle Dionysos şenliklerinde, tiyatroda ve dinsel törenlerde kullanılırdı. Figür uzun bir khiton giymiş; sırtında benekli bir nebris (geyik ya da panter postu) taşıyor. Bu ayrıntı Dionysos kültüyle ilişkiyi güçlendiriyor. Ön tarafta görülen bitkisel motif büyük olasılıkla asma dalı veya sarmaşıktır — bunlar da Dionysos'un en önemli sembolleridir.

**Kim olabilir:** Dionysos'un kadın takipçilerinden bir Mainad (aulos çalarak ritüele eşlik ediyor olabilir; Mainadlar yalnızca dans etmez, müzik de yaparlar); profesyonel bir kadın aulos sanatçısı (auletris); ya da Satyrler, Mainadlar ve müzisyenlerden oluşan kutsal alayın bir üyesi. İkonografik değerlendirme aulos çalan bir Mainad olduğu yönündedir: hayvan postu taşıyor, bitkisel motif Dionysos'u çağrıştırıyor, aulos Dionysos kültünün vazgeçilmez çalgısıdır ve figürün duruşu yürüyen bir alay sahnesine benziyor.

**Kap formu üzerine:** Orijinal antik kylix; geniş ağızlı, sığ gövdeli, ince ayaklı ve iki yatay kulplu bir şarap kadehidir. İç yüzeyinin ortasında bulunan yuvarlak resim alanına *tondo* denir. İçki içildikçe tondo yavaş yavaş görünür ve resim adeta izleyiciye "ortaya çıkar" — bu, Antik Yunan seramik sanatının en etkileyici özelliklerinden biridir. Bu çalışmada da merkezde bir tondo bulunuyor ve figür bu dairesel alanın içine yerleştirilmiş. Kompozisyon, antik kırmızı figürlü kylikslerin iç dekorasyon anlayışını takip ediyor. Ancak kulplar biraz daha kalın ve gövde daha derin olduğu için, birebir bir Attika kylixinden ziyade kylix kompozisyonunun çağdaş bir yorumu niteliğinde.`,
    en: `This figure is most probably a musician playing the double aulos (a double-reed pipe), or a woman taking part in the Dionysiac procession (thiasos).

The figure plays a two-piped aulos. In ancient Greece the aulos, unlike the flute, is a reed wind instrument, used above all at Dionysiac festivals, in the theatre and at religious ceremonies. The figure wears a long chiton and carries a spotted nebris (a deer or panther skin) on the back. This detail strengthens the link with the cult of Dionysos. The vegetal motif seen at the front is most probably a vine branch or ivy — these too are among the most important symbols of Dionysos.

**Who she might be:** a Maenad, one of the female followers of Dionysos (she may be accompanying the ritual on the aulos; Maenads did not only dance, they also made music); a professional female aulos player (auletris); or a member of the sacred procession made up of Satyrs, Maenads and musicians. The iconographic assessment favours a Maenad playing the aulos: she carries an animal skin, the vegetal motif evokes Dionysos, the aulos is the indispensable instrument of the Dionysiac cult, and the stance of the figure resembles a scene from a moving procession.

**On the vessel form:** The original ancient kylix is a wine cup with a wide mouth, shallow body, slender foot and two horizontal handles. The circular pictorial field at the centre of its interior is called the *tondo*. As the wine is drunk the tondo gradually comes into view and the image seems to "reveal itself" to the drinker — one of the most striking features of ancient Greek ceramic art. This work likewise has a tondo at its centre, with the figure placed inside that circular field. The composition follows the interior decorative logic of ancient red-figure kylikes. However, since the handles are somewhat thicker and the body deeper, it stands less as an exact Attic kylix than as a contemporary interpretation of the kylix composition.`,
  },

  'geometrik-donem-toren-kabi': {
    tr: `Bu eser, Geometrik Dönem bezeme anlayışını yansıtan bir replikadır. İlk bakışta belirgin bir mitolojik sahne yerine, tamamen dekoratif ve sembolik bir kompozisyon görülür.

**1. Merkezdeki rozet (güneş çiçeği):** Ortadaki ışınsal rozet, Geometrik Dönem seramiklerinde en sık görülen motiflerden biridir. Araştırmacılar bunu güneş, yaşamın merkezi, kozmik düzen ve sonsuz döngü olarak yorumlar. Bu motif özellikle MÖ 9.–8. yüzyıl seramiklerinde çok yaygındır.

**2. Radyal siyah şeritler:** Merkezden dışarı doğru yayılan siyah çizgiler ışın, hareket, düzen ve ritim duygusu oluşturur. Geometrik sanatın temel özelliği olan tekrar ve simetri burada açıkça görülür.

**3. Dış kuşakta kuş motifleri:** En dikkat çekici bölüm dış bordürdür. Burada dönüşümlü olarak su kuşları, uzun boyunlu kuşlar, palmet benzeri yaprak motifleri, spiral bezemeler ve haç biçimli rozetler yer alır. Bu kuşlar büyük olasılıkla su kuşları, kuğular, ördekler veya kazlar olarak stilize edilmiştir. Geometrik Dönem'de kuşlar özellikle gökyüzü, yolculuk, ruh ve doğa ile ilişkilendirilirdi.

Bu bezeme dili büyük olasılıkla Geç Geometrik Dönem'e (yaklaşık MÖ 760–700) tarihlenen Attika seramiklerinden esinlenmiştir. Henüz kırmızı figür ya da siyah figür tekniği ortaya çıkmadan önce Yunan seramiklerinde bu tür geometrik süslemeler hâkimdi. Terra sigillata uygulaması açısından fırça çizgilerinin netliği, dairesel kompozisyonun korunması, merkezden dışarı yayılan ritim ve terra sigillatanın doğal yüzey rengi antik örneklerin karakterini iyi yansıtıyor.`,
    en: `This work is a replica reflecting the decorative sensibility of the Geometric period. At first glance one sees not a distinct mythological scene but an entirely decorative and symbolic composition.

**1. The central rosette (sun flower):** The radiating rosette at the centre is one of the most frequently encountered motifs on Geometric-period ceramics. Researchers interpret it as the sun, the centre of life, cosmic order and the eternal cycle. The motif is especially widespread on ceramics of the 9th–8th centuries BC.

**2. Radial black bands:** The black lines spreading outward from the centre create a sense of rays, movement, order and rhythm. Repetition and symmetry, the fundamental characteristics of Geometric art, are clearly visible here.

**3. Bird motifs in the outer band:** The most striking part is the outer border. Here water birds, long-necked birds, palmette-like leaf motifs, spiral ornaments and cruciform rosettes alternate. These birds are most probably stylised as water birds, swans, ducks or geese. In the Geometric period birds were associated in particular with the sky, with journeying, with the soul and with nature.

This decorative language was most probably inspired by Attic ceramics dated to the Late Geometric period (roughly 760–700 BC). Before the red-figure or black-figure techniques had yet appeared, geometric ornament of this kind prevailed on Greek ceramics. In terms of the terra sigillata application, the clarity of the brushwork, the preservation of the circular composition, the rhythm radiating from the centre and the natural surface colour of the terra sigillata reflect the character of the ancient examples well.`,
  },

  'geometrik-donem-tabak': {
    tr: `Bu eserde kuş frizi yerine tamamen geometrik motiflere yer verilmiştir. Bu tip kompozisyonlar, Antik Yunan'ın Geometrik Dönemi (MÖ 900–700) estetiğini yansıtır.

Bu tabakta belirgin bir figür ya da mitolojik sahne yoktur; anlatım tamamen sembolik ve ritmiktir. **Merkezdeki rozet** Geometrik Dönem'in en karakteristik motiflerinden biridir; güneş, kozmik düzen, yaşam döngüsü ve evrenin merkezini simgelediği düşünülür. Bu motif yalnızca Yunan sanatında değil, Ege ve Anadolu'nun Erken Demir Çağı bezemelerinde de görülür. **Radyal çizgiler** — merkezden dışarı yayılan koyu bantlar hareket, ışık, düzen ve simetri fikrini güçlendirir; geometrik sanatın temel ilkesi olan tekrar burada açıkça görülür. **Dış kuşak** — palmet veya tomurcuk benzeri yaprak motifleri, spiral (volüt) motifleri, üçgenler, haç biçimli rozetler ve paralel çizgiler yer alır. Bunların hepsi Geometrik Dönem seramik repertuarının temel bezeme elemanlarıdır: üçgenler dağ veya mimariyi, spiral sonsuzluğu ve sürekliliği, rozet güneşi, yaprak/palmet ise yaşamı ve doğayı çağrıştırır.`,
    en: `In this work, purely geometric motifs take the place of a bird frieze. Compositions of this type reflect the aesthetic of the Greek Geometric period (900–700 BC).

There is no distinct figure or mythological scene on this plate; the expression is entirely symbolic and rhythmic. **The central rosette** is one of the most characteristic motifs of the Geometric period; it is thought to symbolise the sun, cosmic order, the cycle of life and the centre of the universe. The motif appears not only in Greek art but also in the Early Iron Age ornament of the Aegean and Anatolia. **Radial lines** — the dark bands spreading outward from the centre reinforce the idea of movement, light, order and symmetry; repetition, the fundamental principle of geometric art, is clearly visible here. **The outer band** — palmette or bud-like leaf motifs, spiral (volute) motifs, triangles, cruciform rosettes and parallel lines. All of these are basic decorative elements of the Geometric-period ceramic repertoire: triangles evoke the mountain or architecture, the spiral infinity and continuity, the rosette the sun, and the leaf/palmette life and nature.`,
  },

  'can-krater': {
    tr: `**Figür analizi:** Ortadaki sakallı figür, uzun ve gösterişli bir himation giymiş. İki kolunu yana açmış olması; savaşan ya da tartışan iki taraf arasında hakemlik, arabuluculuk veya hüküm verme jesti olarak okunabilir. Sol ve sağdaki figürler tam teçhizatlı hoplit savaşçılardır. İkisinin de mızrak ve kalkan taşıması, bunun sıradan bir düello değil, kahramanlar arasındaki bir karşılaşma olduğunu düşündürüyor.

Herakles'i vazo resimlerinde tanımamızı sağlayan ikonografik özellikler vardır: aslan postu (Nemea Aslanı) omuzlarda ya da başta olur, topuzu (club) en belirgin simgesidir, bazen yayı ve okları da bulunur. Bu çalışmada sol savaşçının omzunda hayvan postuna benzeyen bir ayrıntı görülüyor. Ortadaki figür Zeus olabilir; vazo resimlerinde bazen elinde asa (skeptron) veya şimşek demeti ile gösterilir, fakat bazı sahnelerde yalnızca hakem ve otorite figürü olarak da resmedilmiştir — özellikle tanrılar ile kahramanlar arasındaki anlaşmazlıklarda kollarını iki yana açmış biçimde.

**Üslup:** Siyah figür tekniğiyle yapıldı. Figürlerde kazıma çizgileri belirgin, giysilerde beyaz ek boya kullanılmış. Meander bordürü ve lotus-palmet frizi Arkaik dönem bezeme anlayışını yansıtıyor. Özgün örnek büyük olasılıkla MÖ 550–520 yılları arasındaki Attika siyah figür geleneğine dayanıyor.`,
    en: `**Analysis of the figures:** The bearded figure at the centre wears a long and imposing himation. His arms opened out to either side may be read as a gesture of arbitration, mediation or judgement between two parties who are fighting or in dispute. The figures to the left and right are fully equipped hoplite warriors. That both carry a spear and shield suggests this is not an ordinary duel but an encounter between heroes.

There are iconographic features by which Herakles is recognised in vase painting: the lion skin (of the Nemean Lion) worn over the shoulders or the head, the club as his most distinctive emblem, and sometimes his bow and arrows. In this work a detail resembling an animal skin can be seen on the shoulder of the warrior at the left. The central figure may be Zeus; in vase painting he is sometimes shown with a staff (skeptron) or a thunderbolt in his hand, but in certain scenes he is depicted purely as a figure of arbitration and authority — particularly in disputes between gods and heroes, with his arms opened to either side.

**Style:** Executed in the black-figure technique. Incised lines are pronounced on the figures, and added white has been used on the garments. The meander border and lotus-palmette frieze reflect the decorative sensibility of the Archaic period. The original example most probably derives from the Attic black-figure tradition of 550–520 BC.`,
  },

  'volutlu-krater': {
    tr: `**A yüzü:** Bu yüzde dört figür görülüyor. İki yanında uzun asalar taşıyan kadın figürleri bulunuyor; soldaki figürlerden biri elini kaldırmış durumda. Figürlerin tamamı uzun himationlar giymiş. Bu yüz ilk bakışta dramatik bir mitolojik olaydan çok ritüel veya dinsel bir alayı andırıyor. İki olasılık öne çıkıyor: Eleusis Gizemleri ile ilgili bir sahne, ya da Demeter–Persephone kültüne ait bir geçit töreni. Asa taşıyan kadınlar rahibeler veya kült görevlileri olabilir.

**B yüzü:** Ortadaki genç figürün özellikleri Apollon'un klasik ikonografisiyle uyumludur: genç ve sakalsız yüz, başında taç veya çelenk, sol elinde defne çelengi, sağ elini kutsama veya konuşma jestiyle kaldırmış. Yanındaki geyik, Apollon'un doğrudan simgesi olmasa da onun doğa ve av kültüyle, özellikle ikiz kardeşi Artemis'le olan ilişkisini çağrıştırabilir. Soldaki tahtta oturan figür büyük olasılıkla bir tanrıçadır — Leto (Apollon ve Artemis'in annesi) olabilir. Sağ tarafta mızrak ya da uzun asa taşıyan kadın figürlerle birlikte Leto, Apollon ve Artemis'ten oluşan Delos Üçlüsünü temsil ediyor olabilir. Geyik Artemis'in en önemli kutsal hayvanı olduğu için Artemis kültü de düşünülebilir. İkinci olasılık Demeter ve Triptolemos'tur: Triptolemos, tarım tanrıçası Demeter'den kutsal bilgiyi alan genç kahramandır; bazı Attika vazolarında Demeter tahtta oturur, genç Triptolemos önünde durur, Persephone yanında yer alır.

**Üslup:** Kırmızı figür tekniğini taklit ediyor. Palmet frizi kaliteli uygulanmış, volüt kulplar ayrıntılı işlenmiş. Gövde oranları Attika volütlü kraterlerini başarılı biçimde yansıtıyor.`,
    en: `**Side A:** Four figures are visible on this side. On either side are female figures carrying long staffs; one of the figures at the left has raised her hand. All the figures wear long himations. At first glance this side suggests a ritual or religious procession rather than a dramatic mythological event. Two possibilities stand out: a scene relating to the Eleusinian Mysteries, or a processional rite belonging to the cult of Demeter and Persephone. The women carrying staffs may be priestesses or cult officials.

**Side B:** The features of the young figure at the centre accord with the classical iconography of Apollo: a young, beardless face, a diadem or wreath on the head, a laurel wreath in the left hand, and the right hand raised in a gesture of blessing or speech. The deer beside him, while not a direct emblem of Apollo, may evoke his association with nature and the hunt, and especially with his twin sister Artemis. The enthroned figure at the left is most probably a goddess — possibly Leto, the mother of Apollo and Artemis. Together with the female figures carrying spears or long staffs at the right, the group may represent the Delian Triad of Leto, Apollo and Artemis. Since the deer is Artemis's most important sacred animal, the cult of Artemis may also be considered. A second possibility is Demeter and Triptolemos: Triptolemos is the young hero who receives sacred knowledge from Demeter, goddess of agriculture; on some Attic vases Demeter is enthroned, the young Triptolemos stands before her, and Persephone is placed at her side.

**Style:** The work imitates the red-figure technique. The palmette frieze is finely executed and the volute handles are worked in detail. The proportions of the body reflect Attic volute kraters successfully.`,
  },
}

/**
 * GİZLİ KALACAK ESER — "Aulos Çalan Mainad — Kylix" (slug: aulos-calan-menad-kylix)
 *
 * Bu eserin AÇIKLAMASI artık hazır (yukarıda, sanatçının kendi metni), ancak
 * FOTOĞRAFI YOK. Fotoğrafsız bir eser sayfası zayıf görüneceği için
 * `products.is_visible = false` bırakıldı; eser galeride ve portfolyoda
 * listelenmez, doğrudan URL ile de açılmaz (`getProductBySlug` görünürlük
 * filtresi uygular).
 *
 * AÇMAK İÇİN: fotoğraf(lar) `product_images` tablosuna yüklendikten sonra
 * tek yapılacak şey `is_visible = true` (admin panelinden de yapılabilir).
 * Bu script görünürlüğe DOKUNMAZ.
 */

// Sanatçının listesine göre isim düzeltmesi: "Menad" değil "Mainad".
const TITLE_FIXES = {
  'aulos-calan-menad-kylix': {
    title_tr: 'Aulos Çalan Mainad — Kylix',
    title_en: 'Maenad Playing the Aulos — Kylix',
  },
}

let n = 0
for (const [slug, texts] of Object.entries(WORKS)) {
  const body = { description_tr: texts.tr, description_en: texts.en, ...(TITLE_FIXES[slug] ?? {}) }
  const row = await patch(slug, body)
  console.log(
    `✓ ${slug.padEnd(28)} TR ${String(row.description_tr.length).padStart(5)}  EN ${String(row.description_en.length).padStart(5)}  "${row.title_tr}"`
  )
  n++
}
console.log(`\n${n} eser güncellendi.`)
