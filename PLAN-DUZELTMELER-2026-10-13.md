# PLAN — Sanatçı düzeltmeleri (WA, 11 Eki) · 13 Ekim 2026

> **Kaynak:** `GOREV-SANATCI-DUZELTMELER-2026-10-13.md`
> **Durum:** Yalnızca plan. Kod, veri ya da deploy değişmedi.
> **Önce Çağrı karar verecek:** B1 (tek site mi, iki site mi). A listesinin büyük kısmı bu karara göre şekil alır.

## 0. Önce bilinmesi gerekenler (ölçüldü)

**Drive zaten yeni menüye göre düzenlenmiş.**
- Sanatçı 3 Ekim'de kök klasörde şu yapıyı kurmuş:
  - `Galeri/` → `mimari duvar panoları`, `Resimli seramikler`, `Heykeller`
  - `Objects/` → `Antik dönem replikaları`
  - `Studio/` → `Hakkımızda`, `Üretim süreçleri`, `Sergiler` (içinde 8 sergi klasörü)
- 22:37 mesajındaki menü bu klasör yapısının birebir aynısı. Mesaj yeni bir fikir değil, sanatçının kafasındaki yapı bu.
- **Eksikler:**
  - `Studio/Hakkımızda` içinde yalnızca iki özgeçmiş görseli var. **Atölye fotoğrafı yok.**
  - `Studio/Üretim süreçleri` klasörü **boş**.
  - `Objects` içinde **kaşık koleksiyonu klasörü yok**.

**Veritabanında görünür eserler:**

| Kategori | Eser | Fotoğraf | Bir eserde en çok fotoğraf |
|---|---|---|---|
| Mimari Duvar Panoları | 11 | 119 | 18 |
| Resimli Seramikler | 13 | 225 | **24** |
| Seramik Heykeller | 16 | 68 | 9 |
| Antik Dönem Replikaları | 10 | 54 | 11 |

- Ayrıca sergi fotoğrafları (49) ve yapım/montaj fotoğrafları (87) var.
- **Sanatçı siteleri kodda zaten var:** `src/app/(artist)/[locale]/[artist]/` (ana sayfa, portfolyo, sergiler, iletişim).
  - Şu an eski `melike.` / `seref.` adresleri galerideki sanatçı sayfasına 301 ile gidiyor.
  - Dolayısıyla "sanatçı siteleri ayrı yapılabilir" isteği, bu sayfaların kendi alan adlarına bağlanması demek. Sıfırdan iş değil.
- **SEO bedeli bugün düşük:** İki site de noindex, gerçek alan adı yok, Google'da bu yapıdan indeksli sayfa yok.
  - Yapıyı değiştirmenin en ucuz zamanı **şimdi**.
  - 301 + sitemap kuralı yine geçerli, ama asıl yük alan adı geçişinde. Eski ikas URL'leri için `SEO-GECIS-KONTROL.md` §9 ayrıca gerekiyor.

## 1. Referans site ölçümü — hanna-miadzvedzeva.com

- **Yöntem:** Puppeteer, 1440×900, beş sayfa (ana, cv, portfolio, activity, contact).
- **Ölçülen:** Görünür elemanların hesaplanmış stilleri. Arka plan değerleri alan ağırlıklı.
- **Altyapı:** Wix.
- **Ekran görüntüleri:** scratchpad `hanna-*.png`

| Rol | Değer | Nerede |
|---|---|---|
| **Sayfa fonu** | **#2F2E2E** (rgb 47,46,46) | Beş sayfanın hepsinde, baskın |
| İç panel / kutu fonu | **#232323** | Ana sayfa vitrin kutusu, activity |
| Açık bant (ara bölüm) | **#CCCCCC** üstünde koyu metin | Yalnızca activity |
| Ara koyu ton | #413B3B | activity, küçük alan |
| Gövde metni | **#DBDBDB** | cv, contact |
| Başlık / menü | #FFFFFF ve #DBDBDB | |

**Kontrast (WCAG):**

| Metin | Fon | Oran | Sonuç |
|---|---|---|---|
| #DBDBDB | #2F2E2E | **9.78:1** | AA geçer |
| #FFFFFF | #2F2E2E | 13.54:1 | |
| #2F2E2E | #CCCCCC | 8.43:1 | |
| #A6A6A6 (soluk metin için aday) | #2F2E2E | 5.56:1 | |
| #8A8A8A | #2F2E2E | 3.92:1 | **Geçmez** |
| Kurumsal vurgu #1F4E5A | #2F2E2E | 1.48:1 | **Koyu fonda kullanılamaz** |

**Tipografi (bilgi için, kopyalanmayacak):**
- Hepsi ince, tırnaksız Wix fontları: DIN Next Light, Avenir Light, Futura Light. Başlıklar BÜYÜK HARF.
- Gövde 18/25px; büyük başlıklar 52–60px.
- Serif yok.
- Bizim galeri fontumuz (EB Garamond) ile karakter olarak ters yönde.

**Boşluk ritmi:**
- Dar ortalanmış içerik (≈980px kutu).
- Görseller arası dar boşluk (≈10–15px).
- Görseller tam kaplanıyor.
- Az metin, çok görsel.

**Not:** Sanatçı yalnızca **fon rengi** dedi; kopyalanacak olan bu. Mevcut tasarım krem (#F7F4EF) ve açık gri (#F5F6F5) üstüne kurulu. Koyu fona geçiş renk değişikliğinden büyük bir iş, ayrıntısı B3'te.

## 2. Sayfa envanteri ve yeni menüye eşleme

Sanatçının menüsü (22:37):
- **Galeri** → Mimari Duvar Panoları · Resimli Seramikler · Heykeller
- **Object** → Antik dönem replikaları · (özel tasarım objeler)
- **Studio** → Hakkımızda · Üretim süreçleri · Sergiler
- **İletişim** + Instagram

| Mevcut adres | Site | Yeni yeri | İşlem |
|---|---|---|---|
| `/` ana sayfa | galeri | Ana sayfa (panoyla açılır) | Yeniden kurulur |
| `/kurumsal` (kurumsal ana) | kurumsal | Ana sayfaya birleşir (B1'e bağlı) | 301 → `/` |
| `/galeri` (tüm eserler) | galeri | Galeri | Kalır, panolar da girer |
| `/koleksiyonlar` | galeri | Galeri / Object açılır menüsü | 301 → `/galeri` |
| `/koleksiyonlar/mimari-…` · `resimli-…` · `seramik-heykeller` | galeri | Galeri alt başlıkları | Kalır (adres aynı) |
| `/koleksiyonlar/antik-donem-replikalari` | galeri | Object | Kalır |
| `/kurumsal/projeler` + `/projeler/[slug]` | kurumsal | Galeri → Mimari Duvar Panoları (proje künyesiyle) | 301 → pano koleksiyonu / `/urun/[slug]` |
| `/urun/[slug]` | galeri | Eser sayfası | Kalır |
| `/hakkimizda` | galeri | Studio → Hakkımızda | Kalır |
| `/kurumsal/hakkimizda` | kurumsal | Birleşir | 301 → `/hakkimizda` |
| `/kurumsal/surec` | kurumsal | Studio → Üretim süreçleri (kısaltılmış) | Yeni adres `/uretim` + 301 |
| `/sergi/bozcaada-2010` | galeri | Studio → Sergiler (detay) | Kalır |
| — (yok) | | Studio → **Sergiler listesi** | **Yeni sayfa** `/sergiler`. Veri `exhibitions` tablosunda hazır |
| `/ozel-siparis` | galeri | **Kalkar** (A3) | 301 → `/iletisim` |
| `/iletisim` + `/kurumsal/iletisim` | ikisi | İletişim | Tekilleşir, 301 |
| `/teknik` | | | Zaten 301 (antik koleksiyon) |
| `/[melike\|seref]/…` | galeri | Sanatçı siteleri (ayrı alan adı, B5) | Bugünkü 301'ler yön değiştirir |

**Kaşık koleksiyonu:** Fotoğraf yok → **menüye girmez, boş bölüm açılmaz.** Fotoğraflar gelince "Object" altına yeni bir kategori olarak eklenir; bunun için veri modeline bir kategori satırı yeterli.

**SEO kuralı:** Yukarıdaki her "301" satırı `src/lib/site-routing.ts` içinde test edilerek eklenir.
- Mevcut 20 testin yanına her yönlendirme için bir test gelir.
- `src/app/sitemap.ts` bugün **yok**. Yeni yapıyla birlikte yazılır (SEO-GECIS-KONTROL §4).
- noindex olduğu sürece sitemap zarar vermez; `robots.txt` Disallow kalır.

## A) Hemen yapılabilir — karar gerektirmeyen, net istekler

> **Sıra:** A1–A3 ve A5, B1'den bağımsız; önce bunlar yapılabilir. A4 ve A6, B1/B2 kararından sonra yapılırsa iş iki kez yapılmaz.

**A1. Instagram üst sağ köşeye (22:24)**
- **Ne değişir:**
  - Header'ın sağına Instagram ikonu eklenir (dil seçicinin yanına, 44px dokunma alanı, `aria-label`).
  - Ana sayfanın ortasındaki Instagram bölümü kalkar. Bileşen ve admin alanı silinmez, yalnızca ana sayfadan çıkar.
- **Dosyalar:** `src/components/shared/navbar.tsx`, `kurumsal/kurumsal-navbar.tsx`, `mobile-menu.tsx`, `src/app/(main)/[locale]/page.tsx` (satır ~305).
- **İş:** ~1 saat.
- **Risk:** Düşük. Instagram adresi kodda var (`src/lib/social.ts`).

**A2. Sayfa başlıklarına görselli banner (21:55, "çok boş")**
- **Ne değişir:**
  - İç sayfaların `<h1>` alanı tam genişlikte, görselli bir başlık bandına döner.
  - Görsel o sayfanın kendi eserlerinden seçilir; yeni fotoğraf gerekmez.
  - Başlık görselin üstünde, okunurluk için alttan karartma ile durur.
  - Ortak bir `PageBanner` bileşeni yazılır.
- **Dosyalar:** Yeni `src/components/shared/page-banner.tsx`. Kullanan sayfalar: galeri, koleksiyonlar/[slug], hakkimizda, iletisim, sergi, projeler, surec.
- **İş:** ~3–4 saat.
- **Risk:** Düşük-orta.
  - Görsel seçimi zevk işi; ilk seçimi ben yaparım, ekran görüntüsüyle onaya sunarım.
  - LCP (ilk görsel) için `priority` + uygun boyut gerekir.

**A3. Özel sipariş bölümü kalkar (21:55)**
- **Ne değişir:**
  - `/ozel-siparis` sayfası, menü linki ve ana sayfadaki "özel sipariş" bölümü kalkar.
  - `/ozel-siparis` → `/iletisim` 301.
  - Metin kaybolmasın: mevcut TR/EN metin bu plana ek olarak repoda `docs/kaldirilan-metinler/` altına arşivlenir.
- **Dosyalar:** `src/app/(main)/[locale]/ozel-siparis/`, `navbar.tsx` (commissions linki), `page.tsx` (ana sayfa bölümü), `src/messages/*.json`, `site-routing.ts` + test.
- **İş:** ~1 saat.
- **Risk:** Düşük. Formdan gelen mesajlar `messages` tablosunda; tablo silinmez.

**A4. Üretim süreci sadeleşir (21:55, "bu kadar ayrıntılı gerek yok")**
- **Ne değişir:**
  - `/kurumsal/surec` beş adımlı uzun anlatım kısalır: adım başına 1–2 cümle, tek ekran.
  - Yapım/montaj fotoğraflarından (87 adet, mevcut) birkaçı eşlik eder.
  - Yeni bilgi yazılmaz, mevcut metin kısaltılır.
  - Kısaltılmış metin önce Çağrı'ya gösterilir.
- **Dosyalar:** `src/app/(kurumsal)/[locale]/kurumsal/surec/page.tsx`, `src/messages/{tr,en}.json` (`steps.s1–s5`).
- **İş:** ~2 saat.
- **Risk:** Düşük.
- **Bağımlılık:** B1'e göre sayfanın adresi değişir (`/uretim`), içerik değişmez.

**A5. Ana sayfa bir seramik pano görseliyle açılır (21:55 + 22:24)**
- **Ne değişir:**
  - Hero'nun ilk görseli bir mimari pano olur. Bugün galeri hero'sunda pano yok (panolar yalnızca kurumsalda).
  - Hangi pano: ilk seçimi ben yaparım, en güçlü "mekânda" kare. Ekran görüntüsüyle onay.
- **Dosyalar:** `src/app/(main)/[locale]/page.tsx` (hero), `src/lib/site.ts` (pano kategorisi galeriye açılırsa).
- **İş:** ~1–2 saat.
- **Risk:** **B1'e bağlı.**
  - İki site kalırsa panoyu galeri hero'suna koymak, 10 Ekim ayrımıyla çelişir ("panolar kurumsalda").
  - Tek site kararında doğal olarak çözülür.
  - → A'da duruyor, ama B1'den sonra yapılmalı.

**A6. Yeni menü (22:37)**
- **Ne değişir:** §2'deki yapı. Açılır alt menüler (Galeri ▾, Object ▾, Studio ▾), mobilde akordeon.
- **Dosyalar:** `navbar.tsx`, `mobile-menu.tsx`, `kurumsal-navbar.tsx` (B1'e göre kalkabilir), `src/messages/*.json`, yeni `/sergiler` sayfası, `site-routing.ts` 301'leri + testler, yeni `sitemap.ts`.
- **İş:** ~1–1,5 gün (sergiler sayfası ve 301 testleri dahil).
- **Risk:**
  - Orta. Bütün iç linkler değişir; kırık link taraması (crawl) şart.
  - İçerik net, ama **hangi sitede** kurulacağı B1'e bağlı. "Galeri" menüsü panoları içerdiği için bu menü iki site yapısında galeri sitesine oturmaz.
  - → B1'den sonra.

## B) Çağrı'nın kararı gerekiyor — yapıyı/stratejiyi değiştirenler

**B1. Tek site mi, iki site mi? (22:14 — 10 Ekim kararını değiştirir)**

- **Sanatçının cümlesi:** "İki site olmasın bence, sanatçı bu sadece kurumsal bir site olsun. Sanatçı siteleri ayrı olarak yapılabilir."
- **Bugünkü karar:** KARARLAR-2026-10-10 §1, "iki ayrı alan adı, ürün bazlı".
- Bunu ben değiştiremem. Seçenekler:

| | Seçenek 1 — **Tek Uart sitesi** (sanatçının menüsüyle) + sanatçı siteleri ayrı | Seçenek 2 — **İki site kalır**, her birine sanatçının istekleri uygulanır | Seçenek 3 — **Tek site, ama "Mimari" bölümü proje diliyle** (kurumsal sayfaların proje künyesi/yapım akışı korunur, ayrı alan adı olmaz) |
|---|---|---|---|
| Sanatçının mesajına uyum | Tam | 22:14 ile çelişir | Tam |
| Alan adı | 1 (Uart) + sanatçılar için 2 (melikedogan.com / serefdogan.com, B5) | 2 | 1 + 2 |
| Vercel | `uart-galeri` kalır; `uart-kurumsal` emekli (vercel.app 301) | İkisi de kalır | Seçenek 1 ile aynı |
| Heykel çift metni (10 Eki §2) | Tek metin seçilmeli (B4) | Aynen kalır | Heykel sayfasında iki metin yan yana olabilir (B4) |
| Kurumsal sayfalar (projeler, yapım kareleri, künye tablosu) | Pano eser sayfalarına taşınır, sayfalar 301 | Kalır | Pano sayfaları "proje" formatını korur |
| İş | ~3–4 gün (menü + birleştirme + 301 + sitemap + testler) | ~1,5 gün (yalnızca A listesi) | ~4 gün |
| SEO | Bugün ucuz (noindex, alan adı yok). 301'ler `uart-kurumsal.vercel.app` ve eski yollar için | Değişmez | Seçenek 1 ile aynı |
| Kaybolan | Ayrı "mimar/kurum" kapısı, kurumsal tasarım dili (Inter + petrol mavisi) | Hiçbir şey | Az: kurumsal dil bölüm içinde yaşar |

- **Benim notum, karar değil:**
  - Drive'daki klasör yapısı (3 Ekim) ve 22:37 menüsü tek siteyi işaret ediyor.
  - 21:55 ile 22:14 arasındaki çelişki (C1) netleşmeden kod yazmamak gerekir.
  - "Kurumsal" kelimesi iki anlama da gelebiliyor.

**B2. Hangi tasarım dili kalır? (B1 = tek site ise)**
- Galeri dili: EB Garamond + Jost, krem.
- Kurumsal dil: Inter + IBM Plex Mono, açık gri, petrol mavisi.
- Sanatçı "sadece kurumsal bir site olsun" diyor ama referans olarak koyu, tırnaksız fontlu bir sanatçı sitesi verdi.
- **Seçenekler:**
  - (a) Galeri dili + koyu fon
  - (b) Kurumsal dil + koyu fon
  - (c) Galeri başlık fontu + kurumsal gövde fontu
- Hangisi seçilirse seçilsin, Türkçe karakter testi tekrar yapılır.

**B3. Fon rengi: koyuya geçilecek mi? (21:55 + 21:59)**
- **Bugün:**
  - Krem (#F7F4EF) ve açık gri (#F5F6F5).
  - Krem fon tasarım turunda Çağrı onayıyla seçildi (onay 2 / 5).
- **Referans:** #2F2E2E (antrasit), #232323 iç kutular, #DBDBDB metin.
- **Seçenekler:**
  - (a) Tam koyu site.
  - (b) Koyu header/hero/footer + açık içerik bölümleri. Referanstaki activity sayfası da açık gri bant kullanıyor.
  - (c) Krem kalır, yalnızca bazı bölümler koyu.
- **Bedel (a için):**
  - Bütün renk token'ları ters döner (`globals.css`).
  - Elle yazılmış `text-[#2C2C2C]` gibi sabit renkler (13 dosyada) token'a çevrilmeli.
  - Kurumsal vurgu rengi koyu fonda 1.48:1 → yeni vurgu rengi gerekir.
  - Logo koyu fonda test edilmeli (açık sürümü var mı?).
  - Admin paneli etkilenmez.
  - ~1 gün + görsel kontrol.
- **Risk:** Orta. Ürün fotoğraflarının bir kısmı beyaz/krem fonda çekilmiş; koyu sayfada "kutu" gibi durabilirler. Ekran görüntüsüyle karşılaştırma önerilir.

**B4. Heykel metni (B1 = tek site ise)**
- 10 Ekim §2: her heykelin iki metni var (galeri: hikâye, kurumsal: ölçü/mekân).
- Tek sitede hangisi gösterilir? Seçenekler:
  - Galeri metni
  - Kurumsal metin
  - İkisi alt alta ("Eser" + "Mekânda uygulama")
- Veri silinmez, yalnızca gösterim kararı.

**B5. Sanatçı siteleri (22:14 "ayrı olarak yapılabilir")**
- Kodda hazır sayfalar var; ayrı alan adlarına bağlanmaları gerekir.
  - Hangi alan adları? `melikedogan.com` / `serefdogan.com` kodda eski adres olarak tanımlı.
  - Hangi Vercel projesi?
- Kapsam ve zamanlama Çağrı'nın. Bu turun işi mi, sonraki tur mu?
- **Not:** Melike'nin ortak sergileri sorusu (TODO'da açık) burada yeniden önem kazanıyor.

**B6. Eski `sanat-galeri.vercel.app` demosu** (TODO'da açık): B1 kararıyla birlikte kapatılabilir.

## C) Belirsiz — sanatçıya sorulmalı (soruları Çağrı iletecek)

**C1. Çelişki: 21:55 "kurumsal diye ayırmasak mı" ↔ 22:14 "bu sadece kurumsal bir site olsun"**
- Kendi yorumumu gerçek gibi sunmuyorum.
- İki okuma da mümkün:
  - (i) "Kurumsal" = **şirket sitesi** (Uart'ın kendisi), yani ayrı bir "kurumsal bölüm" olmasın, tek şirket sitesi olsun.
  - (ii) "Kurumsal" = **mimari panolar sitesi**, yani galeri kalksın, yalnızca panolar kalsın.
- 22:37 menüsü resimli seramik, heykel ve antik replikaları da içerdiği için (i) daha tutarlı görünüyor, ama doğrulanmalı.
- **Soru:**
  > "Hocam, 'iki site olmasın, sadece kurumsal olsun' derken: bütün eserlerin (panolar, resimli seramikler, heykeller, antik replikalar) **tek bir Uart sitesinde**, gönderdiğiniz menüyle (Galeri / Object / Studio) durmasını mı kastediyorsunuz? Yoksa sitede **yalnızca mimari panolar** mı kalsın?"

**C2. Fon rengi ne kadar koyu? (21:55 + 21:59)**
> "Örnek sitedeki koyu gri fonu **sitenin tamamında** mı istiyorsunuz, yoksa yalnızca giriş/üst kısımda mı? Eser fotoğraflarının bir kısmı açık fonda çekildi; koyu sayfada nasıl durduğunu bir ekran görüntüsüyle göstermemizi ister misiniz?"

**C3. "Bazı resimler azaltılabilir, benzer fotoğraflar bir arada" (21:55)**
- Hangi sayfa, hangi eser belli değil.
- Ölçülen yoğunluk:
  - Resimli Seramikler'de eser başına ortalama 17, en çok **24** fotoğraf.
  - Panolarda en çok 18.
- **Öneri:** Benzer kareleri gruplayan bir temas tablosu (contact sheet) hazırlarım, sanatçı silinecekleri işaretler. Hiçbir fotoğraf silinmez, `is_visible`/sıra ile gizlenir.
- **Soru:**
  > "Fotoğrafları azaltma isteği **hangi sayfalar** için? Eser sayfalarındaki fotoğraf galerisi mi, yoksa ana sayfadaki 'Sergiden kareler' / 'Yapımdan kareler' şeritleri mi? Size her eser için benzer kareleri yan yana gösteren bir sayfa hazırlayalım, çıkarılacakları işaretleyin."

**C4. Hakkımızda: atölye fotoğrafları (22:07)**
- Drive'da `Studio/Hakkımızda` klasöründe yalnızca iki özgeçmiş görseli var; **atölyede çalışırken fotoğraf yok.**
- Uydurma/stok görsel konamaz.
- **Soru:**
  > "Atölyede çalışırken fotoğrafları Drive'daki **Studio → Hakkımızda** klasörüne yükleyebilir misiniz? Gelene kadar Hakkımızda sayfası bugünkü haliyle kalacak."

**C5. Üretim süreçleri: fotoğraf ve kapsam**
- `Studio/Üretim süreçleri` klasörü **boş**.
- Elimizde yalnızca panoların yapım/montaj fotoğrafları var (87).
- **Soru:**
  > "Üretim süreçleri sayfası için klasöre fotoğraf koyacak mısınız? Koymayacaksanız pano yapım/montaj fotoğraflarıyla kısa bir anlatım (4–5 adım, adım başına bir-iki cümle) yeterli mi?"

**C6. Menü adları: "Object" / "Studio"**
- TR sayfada İngilizce mi kalsın ("Object", "Studio"), Türkçe mi olsun ("Objeler", "Stüdyo")?
- Drive klasörleri "Objects" ve "Studio".
- **Soru:**
  > "Menüde Türkçe sayfada 'Object' ve 'Studio' İngilizce mi kalsın, yoksa 'Objeler' / 'Stüdyo' mu yazalım?"

**C7. "Sayfa açıldığında ilk nasıl açılacak" (21:55)**
- 22:24 mesajı "seramik panolardan bir görselle başlayabilir" diyerek bunu büyük ölçüde cevaplıyor (A5).
- Tek açık nokta: Tek görsel mi, yoksa birkaç pano görselinin sırayla geçtiği bir giriş mi?
- **Soru:**
  > "Açılışta tek bir büyük pano fotoğrafı mı olsun, yoksa birkaç pano sırayla mı geçsin?"

**C8. Kaşık koleksiyonu (22:37)** — Soru değil, hatırlatma: fotoğraflar `Objects/` altına yeni bir klasörle gelince eklenir. O zamana kadar menüde görünmez.

## 3. Önerilen sıra

1. **Çağrı:** B1 (+ B2, B3, B4) kararları. C1–C7 soruları sanatçıya iletilir.
2. **Kararı beklemeden yapılabilecekler:** A1 (Instagram), A2 (banner bileşeni), A3 (özel sipariş). Hepsi iki yapıda da geçerli.
3. **B1'den sonra:**
   - A6 (menü + `/sergiler` + 301 + sitemap)
   - A5 (pano hero)
   - A4 (süreç kısaltma)
   - B3'e göre renk geçişi
4. **Her adım sonunda:** testler, kırık link taraması, iki ekran genişliğinde (390 / 1440) ekran görüntüsü. noindex kalır. Deploy Çağrı onayıyla.

## 4. Çağrı'ya sorular (özet)

1. **B1:** Tek site mi (Seçenek 1/3), iki site mi (Seçenek 2)? C1 cevabı gelmeden mi karar verilsin, gelince mi?
2. **B3:** Koyu fona geçiş: tam mı, kısmi mi? Önce örnek ekran görüntüsü ister misin?
3. **B4:** Tek sitede heykel metni: galeri, kurumsal, ikisi birden?
4. **B5:** Sanatçı siteleri bu turda mı? Alan adları hangileri?
5. **Başlangıç:** A1–A3'e (Instagram, banner, özel sipariş) B1'i beklemeden başlayayım mı?
