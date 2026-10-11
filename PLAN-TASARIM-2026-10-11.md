# PLAN — U-Art tasarım elden geçirme (referans: spodeharmony.com)

11.10.2026 · Görev: `GOREV-TASARIM-ELDEN-GECIRME.md`.
**Durum: ONAY BEKLİYOR. Kod yazılmadı. Siteler canlı, dokunulmadı.**

Kaynaklar:
- `ui-ux-pro-max` çıktıları: `--design-system` ×2 (galeri, kurumsal), typography ×2, color ×2, ux ×4, `--stack nextjs`
- Spode'un tarayıcıda hesaplanan stilleri (puppeteer)
- Font dosyalarında Türkçe glif testi (fontTools)
- WCAG kontrast hesapları
- "Önce" ekran görüntüleri: `preview-shots/tasarim-once/` (5 sayfa × masaüstü 1440 + telefon 390)

---

## 0. Doğrulama: orkestratörün ön incelemesi

| İddia | Sonuç |
|---|---|
| Başlık EB Garamond, gövde Jost | ✅ h1 60px/500, h2 48px/500 EB Garamond; gövde Jost 16px |
| Zemin krem `#ECE7DE` | ⚠️ **Kısmen.** `#ECE7DE` yalnız en üstteki duyuru şeridi. Sayfa zemini **`#F7F4EF`** (piksel örneği, 3 noktada aynı). |
| Yapışkan yarı saydam üst şerit | ✅ `position: sticky`, `backdrop-filter: blur(8px)`, zemin %95 opak krem |
| Hero'da tek kısa serif cümle | ✅ "Zarif sofralar, Spode ile." — görselin **üstünde**, ortalı |
| Koleksiyonlar arası sekme + yatay karusel + rozet | ✅ "Koleksiyon seçkilerimiz": Blue Italian / Heritage sekmeleri, ok butonlu yatay kartlar, "Tükendi" rozeti |
| "Sofralardan kareler" (ortam fotoğrafı) | ✅ Video/fotoğraf karuseli. Altında ürün + "Sepete ekle" **e-ticaret bağı** var, o alınmayacak. |
| Gelenek bölümü, Blog, SSS, WhatsApp | ✅ Ayrıca "Klasik ve modern" önce/sonra sürgüsü var (bize uygun değil, §3) |

Metin rengi tam siyah değil, lacivert-siyah `#1C2530`. Sıcak krem zemin üzerinde sert durmuyor.

## 1. Palet · font · stil (gerekçeli)

### Ortak sistem (iki site)
- Aynı logo (karar 3).
- Aynı boşluk ölçeği, bileşen iskeleti (kart, künye, lightbox, form, header) ve erişilebilirlik kuralları.
- Fark yalnızca `data-site` token'larından gelir. Altyapı zaten kurulu (`globals.css`).

### Uart Galeri — "sıcak editoryal minimalizm"

| | Seçim | Gerekçe |
|---|---|---|
| Stil | Skill: **Exaggerated Minimalism** (Portfolio Grid deseni) → **yumuşatılmış** | Skill'in "oversized, font-weight 900" efektini almıyorum. Seramik eser fotoğrafı öne çıksın, başlık yarışmasın. Bol boşluk ve görsel-önce ızgara alınıyor. |
| Zemin | **`#F7F4EF`** (bugün `#FAFAF8`) | Spode'un gerçek zemini. Toprak/terra tonlu eserler soğuk beyazda griye kaçıyor, kremde sıcak duruyor. Bu bir aksan değil zemin, o yüzden 25.07 "renk fotoğraftan gelir" kararıyla çelişmiyor. Skill'in `#FAFAFA` galeri beyazı reddedildi (fazla soğuk). |
| Metin | `#1C1B19` sıcak siyah · **15.7:1** | Skill'in `#09090B`'si saf siyaha çok yakın, krem üstünde sert. |
| İkincil metin | `#5F5A52` · **6.2:1** | |
| Etiket (küçük, büyük harf) | **`#6B645A` · 5.3:1** (bugün `#999` · **2.7:1 ❌**) | ⚠️ Bugünkü etiketler **WCAG'ı geçmiyor** (skill CRITICAL `color-contrast`). Bu turda düzelir. |
| Aksan | **Yok** (metin rengi) | 25.07 kararı korunur. |
| Başlık fontu | **EB Garamond 500** (bugün Newsreader) | Skill üç aday verdi: Playfair Display (Classic Elegant), Cormorant Garamond (Editorial Classic), Newsreader (News Editorial). Playfair moda/lüks dergisi kaydında, eserle yarışır. Cormorant'ta şapkalı harfler testte bozuk çıkmıştı. Newsreader skill'de "haber/gazete" olarak sınıflı. **EB Garamond** klasik kitap/katalog yazısı, Spode'da doğrulandı, **cmap tam + TRK locl var** (Türkçe'ye özel glif kuralları; Newsreader'da yok). Dün Newsreader'ı skill'den geçmeden seçmiştim, bu turda düzeltiyorum. |
| Gövde fontu | **Jost 400** (bugün Inter) | Geometrik sans, Garamond'un klasikliğini dengeler (Spode eşleşmesi). cmap tam; TRK locl yok ama Inter'de de yoktu, `lang="tr"` ile büyük harf dönüşümü tarayıcıda doğru çalışır. Skill'in Galeri önerisi Inter'di. Inter kurumsalda kalıyor; iki siteyi gövde yazısında da ayırmak için galeri Jost'a geçiyor. Mobilde gövde **16px** (skill `readable-font-size`; bugün 15px). |
| Hareket | Mevcut yavaş fade (700ms) **yalnız görselde**, mikro etkileşim 200ms; `prefers-reduced-motion` var (korunur) | Skill: "ekran başına 1–2 animasyon". Bugün her blokta `Reveal` var → azaltılır. |

### Uart Kurumsal — "güven ve otorite, teknik föy"

| | Seçim | Gerekçe |
|---|---|---|
| Stil | Skill: **Trust & Authority** | "Vaka çalışması + metrik + referans" tam olarak kurumsal alıcının aradığı. Proje künyesi, rakamlar ve kurum listesi bunun karşılığı. Skill'in "rozet hover efekti, metrik pulse animasyonu" alınmıyor (ölçülü motion). |
| Zemin / metin | `#F5F6F5` / `#1E2226` · **14.8:1** | Mevcut, korunur. Galerinin kreminden bilinçli olarak soğuk. |
| İkincil / etiket | `#5D6468` · 5.6:1 / **`#676E72` · 4.8:1** (bugün `#8B9296` · **2.9:1 ❌**) | Kontrast düzeltmesi |
| Vurgu / CTA | **Petrol `#1F4E5A`**, beyaz yazı **9.2:1** | Skill'in altın `#D4AF37`'si **reddedildi**: beyaz yazıyla **2.1:1**, metin olarak da **2.1:1**, ikisi de WCAG'dan kalıyor. Altın ayrıca "lüks perakende" kaydında; kurumsal alıcıya değil. |
| Font | **Inter** (başlık + gövde) + **IBM Plex Mono** (künye/ölçü) — değişmez | Skill'in Archivo / Space Grotesk önerisini değerlendirdim. Space Grotesk karakterli, "yaratıcı ajans" kaydında. Archivo, Inter'den anlamlı bir fark yaratmadan bir font daha yükletir. Mono künye, kurumsalı galeriden ayıran asıl tipografik imza. Türkçe test 10.10'da yapıldı. |
| Hareket | 150ms opaklık, zoom yok — değişmez | |

## 2. Sayfa sayfa yeni yerleşim

### Ortak: yapışkan, buzlu header (Spode deseni)
```
┌──────────────────────────────────────────────────────────────┐ sticky top-0, z-40
│ [logo] Uarttasarım      Galeri  Koleksiyonlar  …   Kurumsal→  TR/EN │ bg %92 + blur(8px)
└──────────────────────────────────────────────────────────────┘ alt çizgi 1px
```
- Skill `sticky-nav`: içerik header'ın altında kalmamalı → `scroll-margin-top` / üst boşluk.
- Skill'in "floating navbar (top-4)" önerisi alınmadı: Spode ve U-Art tam genişlik bar kullanıyor, galeri kaydına uygun.
- Mobil menü kapanınca odak hamburger'a döner.

### Uart Galeri — Ana sayfa
```
 [header]
 ─────────────────────────────────────────────
        «TEK KISA SERİF CÜMLE — §6 içerik onayı»          ← h1, EB Garamond, ortalı
 ┌───────────────────────────────────────────┐
 │  tam genişlik eser/sergi görseli (16:9)    │  ← bugünkü slider yerine TEK görsel
 │                          [Koleksiyonu incele]│     (mobilde 4:5; bugünkü boş zemin sorunu biter)
 └───────────────────────────────────────────┘
        Koleksiyon seçkileri                              ← h2
   [Masalın Hafızası] [Anadolu Ekininde Güzeller] [Zamansız Manzaralar] [Antik]  ← sekme (role=tablist)
 ┌────┐┌────┐┌────┐┌────┐ ›                         ← yatay kart şeridi, scroll-snap,
 │    ││    ││    ││    │                              ok butonları aria-label'lı
 └────┘└────┘└────┘└────┘                            kartta: ad + seri; rozet yalnız veri varsa
        Koleksiyonlar                                  ← 2'li büyük blok (Spode "Koleksiyonlar")
 ┌──────────────────┐┌──────────────────┐            görsel üstünde serif ad + 1 satır + "İncele"
 │ Masalın Hafızası │ │ Zamansız Manz.   │ …
 └──────────────────┘└──────────────────┘
        Sergiden kareler                               ← YENİ (Spode "Sofralardan kareler")
 [sergi fotoğrafı karuseli — 8 sergi, her karede: sergi adı · mekân · yıl]
        Toprağın hafızası                              ← hikâye/gelenek bölümü
 Hakkımızda + terra sigillata metninden kısa bölüm → "Hikâyemiz" / "Teknik"
        Sanatçılar  (Melike · Şeref — CV'den biyografi, §6)
        Özel sipariş bandı (mevcut)
 [footer]
```

### Uart Galeri — Koleksiyon sayfası (`/koleksiyonlar/[kategori]`, adres aynı)
- Başlık + seri metni.
- Heykellerde **seri sekmeleri**: Masalın Hafızası (alt seriler Anka · Şahmaran · diğer figürler) / Anadolu Ekininde Güzeller.
- Izgara mevcut (kare, hover'da künye). Mobilde künye adı görünür kalır; bugün yalnız hover'da, dokunmatikte görünmüyor.

### Uart Galeri — Eser sayfası (`/urun/[slug]`, adres aynı)
- Yerleşim korunur: lightbox solda, künye sağda.
- Değişen: serif başlık, kontrastı düzeltilmiş etiketler, "Bilgi al" formu.
- Anadolu serisinde görsel altına "Sergi görüntüsü" notu (sanatçı bilgisi, 11.10).
- Yüzen iletişim düğmesi mobilde metni örtüyor (önce görüntüsü). Düğme küçülür, form/metin alanlarında gizlenir.

### Uart Kurumsal — Ana sayfa
```
 [header — soğuk, ince çizgili]
 MİMARİ SERAMİK (mono)
 Kamusal ve mimari mekânlar için…  (mevcut metin)      ┌─────────────────┐
 [07 proje | 2003–2020 | 0N mekân]  (mono, DB'den)      │ proje görseli    │ ← hero görseli
 [Proje görüşmesi talep et]                              └─────────────────┘   ilk karttan FARKLI
 ─────────────────────────────────────────────          (bugün aynı görsel iki kez çıkıyor)
 Seçili projeler     [Mimari panolar] [Seramik heykeller]   ← sekme (Spode deseni)
 01 ┌────┐ 02 ┌────┐ 03 ┌────┐   (4:3, numaralı, mono künye — mevcut kart)
 ─────────────────────────────────────────────
 Yapım ve montajdan kareler                    ← YENİ: 87 yapım/montaj fotoğrafı
 [karusel; her karede proje adı → proje sayfası]
 Referans mekânlar  (KURUM ADLARI, metin liste — LOGO YOK, izin yok)
 Süreç (5 adım, mevcut) → kısa özet + "Süreç" linki
 CTA bandı
```
Not: Rakam bloğundaki mevcut "2013–2020" aralığı, yeni panolar açılınca **2003–2020** olacak (DB'den hesaplanıyor, kod gerekmez).

### Uart Kurumsal — Proje sayfası (`/projeler/[slug]`, adres aynı)
- Mevcut künye + metin korunur.
- **Yeni "Yapım ve montaj" bölümü:** `exhibition_photos`'tan `yapim-<slug>` fotoğrafları. Bugün okuyan sayfa yok; bu bölüm ekleyince görünür olur, Çağrı onayıyla açılır.
- Heykellerde kurumsal metin (yerleşim önerili, 11.10'da girildi).

### Kurumsal — Projeler · Süreç · Hakkımızda · İletişim
- Yalnız token/kontrast/header değişir; yerleşim aynı.
- Süreç sayfasına yapım fotoğraflarından 5 adımla eşleşen birer kare eklenebilir. Hangi karenin hangi adım olduğu belli değil, sanatçıya sorulmalı (§6).

## 3. Spode deseni → U-Art karşılığı

| Spode | U-Art Galeri | U-Art Kurumsal | Not |
|---|---|---|---|
| EB Garamond + Jost, krem zemin | ✅ aynen eşleşme, kendi paletimizle | ✗ (Inter + Plex Mono, soğuk zemin) | Kurumsal bilinçli ayrışır |
| Buzlu yapışkan header | ✅ krem | ✅ soğuk beyaz | |
| Hero'da tek serif cümle | ✅ (cümle §6) | Mevcut başlık zaten tek cümle | |
| Koleksiyon sekmeleri + yatay kartlar | ✅ seriler arası | ✅ pano / heykel | Görevdeki 2. madde |
| "Tükendi" rozeti | ⚠️ yalnız **Satıldı** mümkün (`is_sold` var, şu an 0 eser) | — | "Sergide · Özel koleksiyonda" için **veri alanı yok**. Veri modeline dokunma yasak → ileride. |
| "Sofralardan kareler" | ✅ **Sergiden kareler** (36 fotoğraf, 8 sergi) | ✅ **Yapım ve montajdan kareler** (87) | Spode'daki altındaki "Sepete ekle" alınmıyor |
| Koleksiyonlar 2'li büyük blok | ✅ | — | |
| Gelenek bölümü | ✅ "Toprağın hafızası" (mevcut terra + Hakkımızda metni) | Süreç özeti | Yeni metin yazılmaz |
| Blog | ✗ | ✗ | İçerik yok; boş bölüm açılmaz |
| SSS | ✗ (öneri: ileride) | ✗ | Uydurma soru-cevap yazılmaz |
| WhatsApp yüzen buton | Mevcut iletişim düğmesi kalır | ✗ | Sanatçıların WhatsApp alanı DB'de boş |
| Klasik/modern önce-sonra sürgüsü | ✗ | (ileride: pano öncesi duvar / sonrası) | Malzeme belirsiz |
| **Sepet, hesap, fiyat, indirim, Mesafeli Satış, İade, Sipariş Sorgula** | ✗ **ALINMAZ** | ✗ | Görev kuralı |

## 4. Değişmeyecekler
- **Adresler:** Hiçbir URL değişmez (`/galeri`, `/koleksiyonlar/[kategori]`, `/urun/[slug]`, `/projeler/[slug]` …). 10.10'daki yönlendirmeler (`/teknik` 301, pano → kurumsal) aynen kalır.
- **Veri ve içerik:** Veri modeli, eser kayıtları, Drive içeriği, metinler. Bu bir tasarım işi.
- **Yapı:** İki Vercel projesi, `UART_SITE` ayrımı, ürün bazlı kategori eşlemesi.
- **Marka ve admin:** Logo (iki sitede aynı), admin paneli.
- **Gizlilik:** Gizli (is_visible=false) 20 eser gizli kalır. Tasarım bunları açmaz; açılış ayrı onay.

## 5. SEO
- **URL değişmiyor → bu turda yeni 301 gerekmiyor.** `feedback_seo_migration_on_redesign`'a göre kontrol edildi: değişen yalnız görünüm.
- **Eksik (bu turda eklenmeli):**
  - `sitemap.xml` ve `robots.txt` yok. Şu an ikisi de proxy tarafından `/tr`'ye yönleniyor (307). Her site kendi sitemap'ini üretecek, proxy bunları muaf tutacak.
  - Eser/proje sayfalarına JSON-LD (`VisualArtwork`).
  - `hreflang` tr/en.
- **Asıl SEO riski domain bağlama anında.** `uarttasarim.com` bugün ikas'ta; ikas mağazasının Google'da indeksli URL'leri varsa, domain Vercel'e geçerken bunların 301 haritası gerekir. **ikas tarafında hangi URL'lerin indeksli olduğunu doğrulayamadım** (Search Console erişimi yok).

## 6. Riskler ve bilmediklerim
1. **Hero cümlesi içerik ister.** Uydurmamak için aday olarak sanatçının kendi ifadeleri var: "Toprağın Hafızası" (terra metni başlığı) ve "Masalın Hafızası". Cümleyi Çağrı/sanatçı seçmeli; ben slogan yazmıyorum.
2. **Sergiden kareler künyesiz kalabilir.** Sergi adı, mekân ve yıl Şeref'in CV'sinde var ama `exhibitions` tablosu boş, o satırları girmek veri işi (bu görev dışında). İki yol var:
   - Künye SQL'ini ayrıca onaylatmak.
   - Bölümü künyesiz açmak.

   Hangi sergide Melike'nin de işi olduğu belirsiz.
3. **Rozet:** Yalnız "Satıldı" verisi var ve 0 eser satılmış. "Sergide · Özel koleksiyonda" için alan eklemek veri modeli değişikliği, görev kuralı gereği yapılmaz.
4. **Görsel regresyon:** Font değişimi (Newsreader → EB Garamond, Inter → Jost) galerinin tüm sayfalarını etkiler. Satır kırılmaları ve başlık uzunlukları değişir. Önce/sonra görüntüleriyle sayfa sayfa karşılaştırılacak.
5. **Karusel erişilebilirliği:** Klavye ok tuşları, `aria-roledescription`, otomatik oynatma yok. Skill: yatay sayfa kaydırması olmamalı, kaydırma kart şeridinin içinde kalır.
6. **Buzlu header performansı:** `backdrop-filter` eski mobil cihazlarda pahalı. Desteklenmeyen tarayıcıda %98 opak zemine düşer.
7. **İçerik boşlukları:**
   - Sanatçı biyografileri DB'de boş. CV metinleri hazır ama girilmedi (veri işi).
   - Süreç adımlarına foto eşlemesi için sanatçıya sorulmalı.
8. **Paylaşımlı DB:** Bu tasarım işi DB'ye yazmıyor. Ama yapım ve sergi fotoğraflarını gösteren bölümler eklendiğinde, deploy edilen site bu (bugün okunmayan) fotoğrafları anında gösterir. Bölüm açılışı Çağrı onayına bağlanır.

## 7. Uygulama sırası (onaydan sonra)
1. **Token + font + kontrast** (iki tema). Önce/sonra görüntüleri.
2. **Header (buzlu, yapışkan) + mobil menü odak düzeni.**
3. **Galeri ana sayfa:** hero, seri sekmeleri ve kart şeridi, koleksiyon blokları, hikâye bölümü.
4. **Kurumsal ana sayfa:** hero görsel düzeltmesi, pano/heykel sekmeleri, referans mekânlar.
5. Görünürlük onayıyla açılacaklar: "Sergiden kareler" ve proje sayfasında "Yapım ve montaj".
6. **SEO:** sitemap, robots, JSON-LD, hreflang.
7. **Doğrulama:**
   - testler + tip kontrolü + build
   - skill'in teslim öncesi kontrol listesi (kontrast, focus, aria-label, klavye, reduced-motion, 375/768/1024/1440)
   - önce/sonra görüntüleri (masaüstü + 390)
8. **Deploy:** Onaydan sonra iki projeye; `vercel ls` + HTTP kodlarıyla doğrulanır.

## 8. Çağrı'nın onaylaması gerekenler
1. Galeri font değişimi: **EB Garamond + Jost** (Newsreader + Inter yerine). Kurumsal aynı kalır.
2. Galeri zemini krem **`#F7F4EF`** (aksan yine yok).
3. Hero cümlesi: aday ifadelerden hangisi? Ya da sanatçı yazsın.
4. "Sergiden kareler" ve "Yapım ve montajdan kareler" bölümleri: tasarım onayı + görünürlük onayı. Sergi künye SQL'i yazılsın mı?
5. Kurumsal "Referans mekânlar" listesi kurum adlarıyla (logosuz) olsun mu?
