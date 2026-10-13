# PAZARLAMA STRATEJİSİ — Uart: iki kitle, iki yol · 13 Ekim 2026

> **Kaynak:** `GOREV-PAZARLAMA-STRATEJISI-2026-10-13.md` (Çağrı ↔ sanatçı, 13 Eki WhatsApp)
> **Kapsam:** Strateji. Kod, tasarım ya da deploy yok.
> **Sayı kuralı:** Reklam maliyeti, tıklama başı ücret, dönüşüm oranı yazılmadı, çünkü **kaynağını bulamadım**. Bunlar ilk kampanyadan ölçülecek (§6). Metindeki her sayı ya bizim veritabanımızdan ya da kaynağı gösterilmiş bir yayından.

## 0. Tez ve sanatçının kısıtı

**Çağrı'nın tezi (10:35–10:39):**
- İki tür hizmet, iki ayrı müşteri.
- Satış süreci, kanal ve mesaj ayrı.
- Ayrı pazarlanmazsa zaman ve reklam bütçesi boşa gider.

**Sanatçının kısıtları:**
- (10:36) *"buradan satış olmayacak, internet üzerinde tanıtmak gibi"*
- (10:50) *"özel ve sanatsal işler yaptırmak ya da sanat eseri niteliğinde işler almak isteyen birileri bize ulaşsın, sadece mimarlar gelmesin"*

**Çağrı'nın uyarısı (10:48–10:50):** Bireysel ürünler ucuz muadille (N11'de 400 TL) yarışırsa reklam boşa gider.

**İkisini birlikte karşılayan konumlandırma:**

> **Galeri tarafı "ürün" değil "eser" anlatır; kurumsal taraf "eser" değil "proje" anlatır.**

- Galeri sitesi tabak, kase gibi kullanım eşyası **satmaz, göstermez de**. Gösterdiği şeyler:
  - İmzalı, tek parça, sergi geçmişi olan işler
  - Sanatçının hikâyesi
  - Atölye
- Bu dilde N11'deki 400 TL'lik tabak rakip olmaktan çıkar, çünkü karşılaştırılan şey artık tabak değil, sanatçının işi.
- Galerinin hedefi "sepete ekle" değil, **"bu eser hakkında yazmak"**.
- Kurumsal sitenin hedefi **"projem için görüşme istemek"**.
- Böylece "sadece mimarlar gelmesin" isteği karşılanır: bireysel kapı açık kalır, ama ucuz ürün yarışına girmez.

## 1. Ölçtüğüm gerçekler (strateji bunlara dayanıyor)

| Gerçek | Kaynak |
|---|---|
| Galeri tarafında 39 görünür eser: 13 resimli seramik, 16 heykel, 10 antik replika | DB `products`, 13 Eki |
| Kurumsal tarafta 11 mimari pano + aynı 16 heykel | DB `products` |
| Panoların bilinen uygulama yerleri: Çanakkale Devlet Hastanesi (*Şifanın Işığı*), Çimenlik Kalesi Deniz Müzesi (*Akar'ın Deryası*, 24 m²), Çanakkale Savaşları anma işleri (*Çanakkale Şehitleri Anısına*, *Yürekli Yiğitlerin Anısına 1915*), Parion (*Parion Esintisi*) | Eser açıklamaları, DB |
| İşletme adresi: Çanakkale, Türkiye | Sitenin iletişim sayfası |
| Pano yapım/montaj fotoğrafı: 87; sergi fotoğrafı: 49 | DB `exhibition_photos` |
| Sitede **ölçüm aracı yok**: analytics, Meta pikseli, Google etiketi yok | Kod taraması |
| İletişim formu mesajları `messages` tablosuna düşüyor, ama **hangi siteden / hangi reklamdan geldiği kaydedilmiyor** (alan yok). Bugüne kadar 0 mesaj; siteler henüz yayında değil, noindex | DB şeması |
| Ziyaretçilerin çoğu sayfayı 10–20 saniyede terk eder. İlk 10 saniye kalma kararında belirleyici; değer önerisi bu sürede net anlatılırsa dikkat uzar | [Nielsen Norman Group, "How Long Do Users Stay on Web Pages?"](https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/). Çağrı'nın "10–15 saniye" kuralını destekliyor |

**Bu tablodan çıkan en önemli şey:** Kurumsal tarafın bilinen müşterileri **kamu kurumları ve Çanakkale yerel ölçeği** (hastane, müze, anma alanları). Yani "mimarlar" tek başına doğru hedef değil. Kararı veren çoğu zaman bir kurum, mimar ise o kararın içindeki kişi. Bu işlerin **nasıl geldiği** (ihale mi, doğrudan davet mi, mimar önerisi mi, tanıdık mı) bilinmiyor. Stratejinin en çok güveneceği veri bu olurdu; Çağrı kararıyla sanatçıya sorulmayacak (§7.1).

## 2. KİTLE A — Kurumsal (Uart Kurumsal: mimari panolar + heykel)

### Kim? (öncelik sırasıyla, gerekçeli)

1. **Kamu kurumları ve kamu yatırımı yapan birimler:** belediyeler, valilik/il özel idaresi, devlet hastaneleri, üniversiteler, müzeler.
   - **Gerekçe:** Bilinen işlerin çoğu bu türden (§1).
   - **Satış süreci:** Uzun; bütçe ve onay zinciri var.
   - **Karar verici:** Kurum yöneticisi + teknik birim.
2. **Kamu ve özel projelerde çalışan mimarlık ofisleri ve iç mimarlar.** Özellikle şu yapı türlerinde: hastane, okul/üniversite, kültür merkezi, otel lobisi, kurumsal genel merkez.
   - **Gerekçe:** Panoyu projeye "yazdıran" kişi bunlar.
   - "Mimar" yetmez; **kamu yapısı ve otel/ağırlama projesi yapan** ofisler.
3. **Otel, butik otel ve restoran yatırımcıları:** özellikle Çanakkale–Bozcaada–Ege hattı.
   - **Gerekçe:** Mekâna özel, yerel tarih anlatan pano (Troya, Parion, deniz) burada güçlü bir hikâye.
   - **Durum:** Bu kitleden bilinen bir iş **yok**, bu bir **hipotez**. Doğrulanmalı.
4. **Müteahhit/yüklenici firmalar:** Sanat eseri kalemini işi bitirmek için alırlar.
   - **Durum:** Kanal mı, müşteri mi, belirsiz; sanatçıya sorulmalı (§7).

**Bizim işi almayacak olanlar:**
- Konut sahibi bireyler ("duvar seramiği" arayanlar)
- Seri seramik/fayans alıcıları
- Peyzaj mimarları (Çağrı'nın örneği)

Peyzaj mimarları ancak dış mekân heykeli projesinde hedef olur. Panolar iç mekâna daha uygun görünüyor; dış mekâna uygunluk sanatçıya sorulmalı.

### Nerede bulunur? Kanal kanal

| Kanal | Rol | Not |
|---|---|---|
| **Google Arama (ücretli)** | Ana kanal | Bu kitle niyetle arar: "mimari seramik pano", "seramik rölyef", "duvar seramik sanat eseri", "kamusal sanat eseri seramik". Hacim ve maliyet **bilinmiyor**; Google Ads Keyword Planner'da kampanya açmadan ücretsiz bakılabilir, ama hesap ve fatura bilgisi gerekir, hacimler aralık olarak görünür ([Search Engine Land](https://searchengineland.com/google-ads-keyword-planner-455058)). **Bütçeden önce ilk iş bu.** |
| **Google Arama (organik) + Google İşletme Profili** | Destek | Ücretsiz. Proje sayfaları ("Çimenlik Kalesi seramik uygulama", "hastane seramik rölyef") uzun kuyruk aramalarda bulunabilir. Bugün noindex açık; alan adı geçişinde açılır (SEO-GECIS-KONTROL.md) |
| **LinkedIn** | Doğrudan erişim | Mimarlık ofislerini ve kurum yöneticilerini **reklamla değil, doğrudan mesaj ve proje paylaşımıyla** bulmak. Reklam maliyeti bilinmiyor; önce organik |
| **Mimarlık yayınları / ürün platformları** (ör. Arkitera, Archello) | Görünürlük | Proje yayımlatmak. Hangisinin Türkiye'de mimarlara gerçekten ulaştığı **doğrulanmadı** |
| **Yapı/mimarlık fuarları** (ör. İstanbul'daki yapı fuarları) | Yüz yüze | Bütçe ve zaman ister; öncelik düşük. Önce dijital kanal ölçülsün |
| **Kamu ihale ilanları (EKAP)** | Talep takibi | Pano/sanat eseri kalemi içeren ilanların takibi. Bu yolla iş alınıp alınmadığı **bilinmiyor** (§7) |
| **Meta (Instagram/Facebook) reklamı** | **Kullanılmaz** (Çağrı'nın kararı) | Gerekçe §4 |
| **Instagram (organik)** | Vitrin | Kurum/mimar reklamdan değil, aramadan sonra "kim bunlar" diye bakar. Profil düzenli ve projeler görünür olmalı. Reklam değil, güven aracı |

### İlk 10 saniyede ne görmeli? (tek şey)

> **"Bu ekip, benim mekânıma özel, kalıcı bir seramik eser yapıp duvara uygulayabilir."**

- **Görsel:** **Mekânda** çekilmiş tek bir büyük pano karesi. Atölye ya da detay karesi değil, binanın içinde, insan ölçeği görünen kare. En güçlü aday *Akar'ın Deryası* (Çimenlik Kalesi Deniz Müzesi, 24 m²), çünkü ölçek ve kurum aynı karede.
- **Cümle:** Bugünkü başlık doğru yönde: *"Kamusal ve mimari mekânlar için büyük ölçekli seramik uygulamalar"*. Altına tek bir kanıt satırı eklenir: **uygulanmış proje sayısı + bilinen kurum adları**, ama yalnızca adının kullanılmasına izin verilmiş kurumlar (§7).
- **Tek düğme:** "Proje görüşmesi talep et". Hepsi bu.
- **İlk ekranda olmayacaklar:** Süreç anlatımı (zaten kalkıyor, 10:54), heykel/sanat dili, bireysel eserler.

### Hangi reklam?

**Çağrı'nın kararı: Google yalnızca kurumsal tarafta.**

**Gerekçe:**
- Kurumsal alıcı ihtiyacı doğduğunda **arar**. Reklam arama niyetini yakalar.
- Bireysel alıcı "seramik tabak" diye arar ve ucuz muadil sonuçlarıyla aynı sayfaya düşer. Bu, Çağrı'nın 10:48'deki "insanlar ucuz versiyonlarına N11'den bakıyor" tespitiyle aynı şey.

**Benim görüşüm:** Katılıyorum. İki ekleme ve bir çekince var:

1. **Ekleme, bütçeden önce hacim ölçümü:**
   - Kurumsal anahtar kelimeler büyük ihtimalle **düşük hacimli**. Bu bir varsayım, kaynağım yok; Keyword Planner gösterecek.
   - Hacim çok düşükse, ücretli Google'ın yerini organik proje sayfaları ve LinkedIn'den doğrudan erişim alabilir.
   - Yani "Google'a reklam verelim" kararı Keyword Planner verisinden **sonra** verilmeli.
2. **Ekleme, bölge hedefi:**
   - Bilinen işler Çanakkale'de.
   - İlk kampanya **Türkiye geneli değil**, önce Marmara/Ege ve İstanbul–Ankara (kamu karar merkezleri) gibi dar bir bölgeyle sınanmalı.
   - Bu bir öneri; doğru bölge geçmiş işlerin nasıl geldiğine bağlı (§7).
3. **Çekince:**
   - Kamu alımları reklamla değil, ilişki ve ihale süreciyle yürüyor olabilir.
   - Öyleyse reklamın değeri "iş getirmek" değil, **"adı duyulan firmanın ciddi göründüğü yer"** olmak. Site bu yüzden reklamdan önce hazır olmalı.

### İçerik: 5 tür

1. **Mekânda bitmiş proje:** Bina içinde, insan ölçekli tek kare + künye (kurum, yıl, ölçü, malzeme). Bugünkü proje sayfaları buna hazır.
2. **Yapım ve montaj kısa videosu:** Panonun duvara takıldığı gün, modüllerin yerleşmesi.
   - Süreç anlatımı değil, **"işi uyguluyoruz" kanıtı**.
   - 87 montaj fotoğrafı var; video var mı bilinmiyor.
3. **Önce/sonra:** Boş duvar ve uygulanmış pano. Mimarın kafasındaki soru "bu duvara ne olur?" olduğu için doğrudan cevap.
4. **Mekâna özel tasarımın hikâyesi, kısa:** "Neden Troya, neden deniz flamaları?" Kuruma "sizin şehrinizin/kurumunuzun hikâyesini anlatırız" mesajı. Uzun anlatım değil, iki cümle (sanatçının 10:54 isteğiyle uyumlu).
5. **Teknik güven kartı:** Dayanıklılık, iç/dış mekân uygunluğu, bakım. Mimarın şartnameye yazabileceği bilgi.
   - ⚠️ Bu bilgiler bizde **yok**; sanatçıdan alınmadan yazılmaz (§7).

**Bu kitleye çalışmayacak içerik:**
- Tabak yapım videosu (Çağrı'nın örneği)
- Atölyede rastgele anlar
- Fiyat/kampanya dili

## 3. KİTLE B — Bireysel (Uart Galeri: resimli seramik, heykel, antik replika)

### Kim? (öncelik sırasıyla)

1. **Sanat eseri alan bireyler / küçük koleksiyonerler:** Evine ya da ofisine tek parça, imzalı bir iş isteyen kişi. Sanatçının tarif ettiği kişi bu (10:50).
2. **Sergilerden ve bölgeden tanıyanlar:** Bozcaada, Çanakkale, Ankara ve İstanbul sergilerini görmüş kişiler. Sergi listesi DB'de var.
   - En sıcak kitle bu, ama bugün **ulaşma listesi yok** (§7).
3. **Antik replikalar için müze ve kültür meraklıları:**
   - Troya, Parion, terra sigillata hikâyesi.
   - Ayrıca **kurum hediyesi / protokol hediyesi** alanlar (belediye, kurum, firma). Bu bir **hipotez**; satış değil, iletişim.
   - Antik replikaların bu kanaldan gidip gitmediği bilinmiyor (§7).
4. **Butik otel / kafe sahibi, tekil eser arayan:** Kurumsal ile bireysel arasında. Galeriden girer, büyük iş için kurumsala yönlendirilir.

**Bizim işi almayacak olanlar:**
- Fiyatla karar veren kullanım eşyası alıcısı (N11 kitlesi)
- "Hediyelik seramik" arayan

Galeri bu kişilere seslenmemeli. Seslenirse Çağrı'nın uyarısı tam gerçekleşir.

### Nerede bulunur?

| Kanal | Rol | Not |
|---|---|---|
| **Instagram (organik)** | Ana vitrin | Sanatçının zaten seçtiği kanal (10:46). Profil = galeri |
| **Meta reklamı (Instagram/Facebook)** | Ana ücretli kanal (Çağrı'nın kararı) | Satış reklamı değil, **eser/sanatçı tanıtımı**. Hedef: profil ziyareti ve DM, site değil (§3, ölçü). Maliyet **bilinmiyor**; küçük bütçeli bir deneme kampanyasıyla ölçülür |
| **Sergiler ve yerel çevre** | En sıcak kitle | Sergi davetlerinde ve kataloglarda Instagram + galeri adresi. Dijital olmayan ama ölçülebilir kanal (QR, "bizi nereden duydunuz") |
| **Galeri sitesi** | Güven + derinlik | Instagram'dan gelen kişinin "bu ciddi bir sanatçı mı" sorusuna cevap. Reklam doğrudan buraya değil, önce profile ya da eser sayfasına |
| **Google (ücretli)** | **Kullanılmaz** (Çağrı'nın kararı) | Gerekçe aşağıda |
| **Google (organik)** | Destek | Sanatçı adıyla yapılan aramalar ("Melike Doğan seramik", "Şeref Doğan heykel"). Ücretsiz, alan adı geçişinde açılır |

### İlk 10 saniyede ne görmeli? (tek şey)

> **"Bu, bir sanatçının elinden çıkmış, başka yerde olmayan bir eser."**

- **Görsel:** Tek bir güçlü eser, iyi ışıkta, eser yıldız. Bugünkü hero bu yönde: admin sırasındaki ilk eserler antik replika ve resimli seramik (*Afrodit ve Kaz*, *İçimdeki Güneş*).
  - Mimari pano **değil** (PLAN-DUZELTMELER B7'deki önerimin gerekçesi bu). Pano ilk ekranda bireysel ziyaretçiye "burası bana göre değil" dedirtir, Çağrı'nın 10:41'deki senaryosu.
- **Cümle:** Sanatçı + eser vurgusu. Örnek yön: *"Toprağın Hafızası: Anadolu'nun belleğinden, iki sanatçının elinden tek parça seramik eserler"*.
  - Bu bir öneri; nihai metin Çağrı/sanatçı onayıyla.
  - "Satın al", "sipariş", fiyat yok.
- **Tek düğme:** "Eserleri gör" ya da "Bu eser hakkında yazın" (eser sayfasında).

### Hangi reklam? Meta, gerekçesiyle

**Çağrı'nın kararı: Bireysel tarafa Meta, Google değil.**

**Gerekçe:**
- Sanat eseri **ihtiyaçtan aranmaz, görülünce istenir**. Meta görme kanalı, Google arama kanalı.
- Bireysel taraf Google'da ucuz muadille aynı sonuç sayfasına düşer (§2).

**Benim görüşüm:** Katılıyorum. Bir uyarım var:

- Meta reklamının ölçüsü **beğeni olmamalı**. Çağrı'nın 10:41'deki "aa çok güzelmiş der geçer" senaryosu tam olarak beğeni metriği.
- Reklamın ölçüsü **profil ziyareti → DM / eser sorusu** olmalı (§6).
- Beğeni alıp mesaj almayan reklam, Çağrı'nın uyardığı boşa harcanan bütçedir.

### İçerik: 5 tür

1. **Bir eserin doğuşu, kısa reels:** Çamurdan fırına tek bir eser.
   - Çağrı'nın "kurumsalda çalışmaz" dediği tabak videosu **burada çalışır**.
   - Şartı: kullanım eşyası değil, **imzalı, tek parça** bir eser olsun. "Tabak" değil, "eser" dili.
2. **Atölyede sanatçı:** Elde çamur, fırın başı.
   - Bireysel alıcının satın aldığı şey ürün değil, sanatçı.
   - ⚠️ Bu fotoğraflar **yok** (PLAN-DUZELTMELER C4). Gelene kadar bu içerik üretilemez.
3. **Eserin hikâyesi:** Esin kaynağı, mit ve masal, Anadolu belleği. Sanatçının biyografisi bu dili zaten kuruyor (DB `artists.bio_tr`).
4. **Sergiden kareler:** Eserin galeride, insanlar arasında görüldüğü an. Sosyal kanıt; sergi fotoğrafları var (49).
5. **Antik replika: kaynağı ve kopyası yan yana.** Müzedeki özgün parça ile atölyedeki kopyası. Kültür meraklısı ve kurum hediyesi alıcısı için.
   - ⚠️ Müze görsellerinin kullanım hakkı sorulmalı.

**Bu kitleye çalışmayacak içerik:**
- Pano montajı
- Teknik künye
- İndirim/fiyat
- "Toplu sipariş"

## 4. İki kitle neden karışmamalı? (Çağrı'nın tezinin işletilmesi)

| | Kurumsal | Bireysel |
|---|---|---|
| Neden gelir? | İhtiyaç var (bir mekân, bir proje) | Görür ve ister |
| Nasıl bulur? | Arar (Google), tavsiye, ihale | Görür (Instagram, sergi) |
| İlk ekran | Mekânda pano + "projenizi konuşalım" | Tek eser + sanatçı |
| Karar süresi | Uzun, çok kişili | Kısa, tek kişi |
| Başarı | Görüşme talebi | Eser sorusu / DM |
| Reklam | Google (önce hacim ölç) | Meta (ölçü: DM, beğeni değil) |
| Site | uart-kurumsal | uart-galeri |

- **Çapraz yönlendirme tek yönde, sessiz:** Galeride "Mimari projeler ↗" linki durur (otel sahibi kurumsala geçebilsin).
- Kurumsal reklam **asla galeriye**, bireysel reklam **asla kurumsala** gitmez.

## 5. Hollanda / Türkiye

**Bilinenler:**
- İşletme adresi Çanakkale.
- Bilinen bütün pano işleri Türkiye'de.
- Siteler TR + EN.

**Bilinmeyenler:**
- Hollanda'nın bu işteki rolü. Müşteri mi, pazar mı, yalnızca Çağrı'nın bulunduğu yer mi?
- Hollanda'dan bir iş ya da talep olup olmadığı.

**Öneri:**
- Bu netleşene kadar **iki kampanya da yalnızca Türkiye**.
- EN sayfalar organik olarak kalır, reklamla desteklenmez.
- Hollanda bir pazar olarak hedeflenecekse ayrı bir kararı ve ayrı bir analizi var:
  - Dil (NL)
  - Kamu sanat alımlarının oradaki işleyişi
  - Nakliye ve montaj
- Bu analizi kaynaksız yazmıyorum (§7).

## 6. Ölçü — "satış olmayacak"sa başarı nedir?

**Başarı = nitelikli temas.** Sayı hedefi yazmadım; elimde temel değer (baseline) yok. Bugüne kadar 0 form mesajı var, çünkü siteler yayında değil. İlk ayın verisi temel değer olur.

| | Ana ölçü | Ara ölçüler | Nitelikli sayılması için |
|---|---|---|---|
| **Kurumsal** | **Proje görüşmesi talebi** (form) + telefon/e-posta | Proje sayfası görüntüleme, reklam tıklaması, "İletişim" sayfasına ulaşma | Mesajda mekân türü, yaklaşık ölçü ya da takvim var. Form bunları zaten soruyor |
| **Bireysel** | **Eser sorusu** (eser sayfasındaki form) + **Instagram DM** | Profil ziyareti, siteye tıklama, kaydetme/paylaşma (beğeni değil) | Belirli bir esere ya da sanatçıya atıf var |

**Bunun ölçülebilmesi için eksikler** (kod işi; bu görevde yapılmadı, ayrı onayla):
1. **Analytics yok.** Gizlilik dostu bir ölçüm (ör. Vercel Analytics ya da benzeri) + Meta pikseli (yalnızca galeri) + Google Ads dönüşüm etiketi (yalnızca kurumsal) gerekir.
   - KVKK / çerez onayı da beraberinde gelir.
2. **Form mesajı hangi siteden ve hangi kampanyadan geldi, kaydedilmiyor.**
   - `messages` tablosuna `site` + `utm_source/utm_campaign` alanı gerekir.
   - Bu bir **veri modeli değişikliği**, Çağrı onayı ister.
3. **"Bizi nereden duydunuz?"** sorusu: Sergi ve tavsiye gibi dijital olmayan kanalları da ölçer. Forma tek bir seçmeli alan.
4. **DM sayımı manuel:** Instagram DM'leri ayda bir elle sayılır; hangi gönderiden ya da reklamdan geldiği not edilir.

**Karar kuralı (öneri):**
- Bir kanal **3 ay** boyunca nitelikli temas getirmiyorsa bütçesi kesilir.
- 3 ay bir öneri, araştırmaya dayanmıyor; kurumsal karar süresi uzun olduğu için kısa tutulmadı.
- Süre Çağrı'nın kararı.

## 7. Çağrı'ya sorulacaklar (bilmediğim, varsaymadığım)

1. ~~**Geçmiş 11 pano işi nasıl geldi?**~~ **Kapandı:** Çağrı'nın kararıyla (13 Eki, GOREV-A-LISTESI-UYGULA madde 7) sanatçıya **sorulmayacak**. Kurumsal kanal seçimi bu veri olmadan, §2'deki gerekçelerle yapılır.
2. Hangi kurumların adı sitede ve reklamda **referans olarak kullanılabilir?** (İzin.)
3. Kamu ihalelerine girme kapasiteleri var mı (şirket türü, belgeler)? EKAP takibi anlamlı mı?
4. Müteahhitler müşteri mi, aracı mı?
5. Panolar dış mekâna uygun mu? Dayanıklılık/bakım bilgisi (teknik güven kartı için) kimden alınacak?
6. **Reklam bütçesi** ne kadar, iki tarafa nasıl bölünecek? *(Ben rakam önermedim; maliyet verim yok.)*
7. Google Ads hesabı var mı? Keyword Planner hacim kontrolünü kim yapacak?
8. Sergilerden kalan bir ziyaretçi/iletişim listesi var mı?
9. Antik replikalar kurum/protokol hediyesi olarak hiç gitti mi?
10. Montaj ve yapım **videosu** var mı, yoksa yalnızca fotoğraf mı?
11. **Hollanda'nın rolü** ne? Müşteri, pazar, yoksa yalnızca senin bulunduğun yer mi?
12. İçerik üretimini (reels, paylaşım) kim yapacak? Sanatçı mı, sen mi, dışarıdan biri mi?
13. Ölçüm için analytics + piksel + `messages` tablosuna kaynak alanı: ayrı bir görev olarak açılsın mı?

## Kaynaklar

- Nielsen Norman Group: [How Long Do Users Stay on Web Pages?](https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/)
- Search Engine Land: [Google Ads Keyword Planner: What you need to know](https://searchengineland.com/google-ads-keyword-planner-455058)
- İç kaynaklar:
  - Supabase `products`, `exhibition_photos`, `messages`, `artists` (13 Eki, salt okuma)
  - Kod taraması
  - `GOREV-PAZARLAMA-STRATEJISI-2026-10-13.md`
  - `PLAN-DUZELTMELER-2026-10-13.md`
