# PLAN — Sanatçı düzeltmeleri (WA, 11 Eki) · 13 Ekim 2026 · **güncellendi 13 Eki öğleden sonra**

> **Kaynaklar:**
> - `GOREV-SANATCI-DUZELTMELER-2026-10-13.md`: 11 Ekim mesajları
> - `GOREV-PAZARLAMA-STRATEJISI-2026-10-13.md`: 13 Ekim Çağrı ↔ sanatçı konuşması
>
> **Durum:** Yalnızca plan. Kod, veri ya da deploy değişmedi.

## Güncelleme — 13 Ekim konuşmasının etkisi

**B1 kapandı: iki site kalıyor.**
- 10:52'de sanatçı şöyle dedi: *"tamam neyse, eğer sen iki farklı site yapmak istiyorsan öyle yapalım"*.
- Sanatçı iki siteyi **istemedi**; Çağrı'nın gerekçesine karşı **bırakarak kabul etti** (öncesinde 10:36 "galeri modunda olsun", 10:50 "sadece mimarlar gelmesin").
- Pratik sonuç:
  - Karar uygulanır, 10 Ekim yapısı (iki alan adı, ürün bazlı ayrım) geçerli kalır.
  - Ama sanatçı ikna olmuş değil. Bu yüzden iki sitenin farkı, sanatçının gördüğü ilk ekranlarda kendini açıklamalı. Bkz. `PAZARLAMA-STRATEJISI-2026-10-13.md`.
  - Sanatçının "bireysel taraf kapanmasın" kaygısı galeri sitesiyle karşılanıyor. Bunu kendisine bu şekilde göstermek, kararı sağlamlaştırır.

**Yeni bilgi: "buradan satış olmayacak" (10:36).**
- Site vitrin, dükkân değil. Sitede satışa dönük öğeler tarandı (§2b).

**Süreç ve özel sipariş kalkıyor (10:54).**
- Sanatçının cümlesi: *"yaptığımız işi çok detaylı anlatmak zorunda değiliz, o yüzden süreç ve özel sipariş kısımlarını kaldıralım"*.
- A3 (özel sipariş) teyit edildi.
- A4 değişti: süreç artık **kısaltılmıyor, kaldırılıyor**.

**Etkilenen maddeler:**

| Madde | Önce | Şimdi |
|---|---|---|
| B1 tek/iki site | Karar bekliyor | **Kapandı: iki site** (bırakarak kabul) |
| B2 hangi tasarım dili | Tek site ise sorulacaktı | **Düştü.** İki dil de kalıyor |
| B4 heykel metni | Tek site ise sorulacaktı | **Düştü.** İki metin 10 Eki §2'deki gibi, her site kendi metnini gösterir |
| B5 sanatçı siteleri | Tek sitenin parçasıydı | **Ertelendi.** Sanatçı sayfaları galeri içinde kalır; ayrı alan adı ayrı karar |
| B6 eski demo | Açık | **Duruyor**, B1'e bağlı değildi |
| B3 koyu fon | Açık | **Duruyor.** Hangi siteye uygulanacağı yeni soru (B3) |
| A4 süreç | Kısalt | **Kaldır** (10:54) |
| A5 pano ile açılış | B1'e bağlıydı | Kurumsal zaten panoyla açılıyor (ilk hero: *Gönül Gözü*, mimari pano). Galeri için yeni karar (B7) |
| A6 menü | B1'e bağlıydı | İki siteye bölünmüş haliyle (§2) |
| C1 "kurumsal" çelişkisi | Açık soru | **Düştü.** Sorunun cevabı artık bir şey değiştirmiyor; anlamı kesinleşmedi, karar onu gereksiz kıldı |
| C5 üretim süreçleri fotoğrafı | Açık | **Değişti.** Süreç kalktığı için foto sorusu yerine yeni bir çelişki (C9) |

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

## 2. Sayfa envanteri ve menü — iki siteye bölünmüş hali

**Sanatçının 22:37 menüsü** tek site varsayımıyla yazılmıştı:
- Galeri: Panolar · Resimli · Heykeller
- Object
- Studio: Hakkımızda · Üretim süreçleri · Sergiler
- İletişim + Instagram

İki siteye, 10 Ekim ürün ayrımı bozulmadan bölünmüş önerisi:

**Uart Galeri** (bireysel / sanat):
- **Galeri** ▾ → Resimli Seramikler · Heykeller · *Mimari Duvar Panoları ↗*
  - Panolar galeri sitesinde gösterilmez. Menüde kurumsal siteye giden dış link olarak yer alır.
  - Böylece sanatçının "Galeri altında panolar" isteği karşılanır, ayrım da bozulmaz.
  - Bu bir öneri; B7 ile birlikte Çağrı karar verir.
- **Object** ▾ → Antik Dönem Replikaları (kaşık koleksiyonu fotoğraflar gelince)
- **Studio** ▾ → Hakkımızda · Sergiler (· Üretim süreçleri? → C9)
- **İletişim** + Instagram ikonu (sağ üst)

**Uart Kurumsal** (mimar / kurum):
- **Projeler** (Panolar · Heykeller sekmeleri)
- **Hakkımızda**
- **İletişim** + Instagram ikonu
- ~~Süreç~~ kalkar (10:54).
- Galeriye çapraz link durur.

| Mevcut adres | Site | Yeni durum | İşlem |
|---|---|---|---|
| `/` | galeri | Ana sayfa | Kalır; özel sipariş ve Instagram bölümleri çıkar |
| `/galeri` | galeri | Galeri (tümü) | Kalır |
| `/koleksiyonlar` | galeri | Menü açılırları karşılar | 301 → `/galeri` (ya da kalır, B8) |
| `/koleksiyonlar/[slug]` | galeri | Galeri / Object alt başlıkları | Kalır |
| `/urun/[slug]` | galeri | Eser sayfası | Kalır; "Özel sipariş →" linki çıkar |
| `/hakkimizda` | galeri | Studio → Hakkımızda | Kalır |
| — | galeri | Studio → **Sergiler listesi** | **Yeni** `/sergiler` (veri `exhibitions` tablosunda) |
| `/sergi/bozcaada-2010` | galeri | Sergiler detayı | Kalır |
| `/ozel-siparis` | galeri | **Kalkar** | 301 → `/iletisim` |
| `/` (kurumsal) | kurumsal | Ana sayfa | Kalır; "Süreç" özet bölümü çıkar |
| `/projeler`, `/projeler/[slug]` | kurumsal | Projeler | Kalır |
| `/surec` | kurumsal | **Kalkar** | 301 → `/projeler` |
| `/hakkimizda`, `/iletisim` | kurumsal | | Kalır |
| `/[melike\|seref]/…` | galeri | Sanatçı sayfaları | Kalır (B5 ertelendi) |

**Kaşık koleksiyonu:** Fotoğraf yok → **menüye girmez, boş bölüm açılmaz.**

**SEO kuralı:**
- Her yeni 301 (`/ozel-siparis`, `/surec`, varsa `/koleksiyonlar`) `src/lib/site-routing.ts` içinde, testiyle eklenir.
- `src/app/sitemap.ts` bugün **yok**; site başına kendi sayfalarını listeleyecek şekilde yazılır (SEO-GECIS-KONTROL §4).
- noindex sürer.

## 2b. Satışa dönük öğeler taraması ("buradan satış olmayacak", 10:36)

Ölçüm tarihi: 13 Eki, kod + veritabanı (salt okuma).

| Öğe | Durum | Öneri |
|---|---|---|
| Sepet / ödeme / satın al | **Yok.** Hiç kurulmadı (10 Eki: e-ticaret yok) | — |
| Fiyat | `products.price` alanı var, **0 eserde dolu**. Eser sayfası fiyat yoksa satırı hiç göstermiyor | Değişiklik yok; alan admin'de kalabilir. Görünürde fiyat yok |
| "Satıldı" etiketi | `is_sold` **0 eserde** işaretli | Değişiklik yok |
| "Özel Sipariş" menü linki, footer linki, ana sayfa bölümü, eser sayfasındaki "Özel sipariş →" linki, `/ozel-siparis` sayfası ("Teklif / İletişim" düğmesi) | Var | **Kalkar** (A3) |
| Eser sayfasındaki iletişim formu (`ContactForm productSlug`) | Var | **Kalır.** Satış değil, soru/ilgi kanalı; pazarlama ölçüsü buna dayanıyor (strateji §5) |
| Kurumsal "Proje görüşmesi talep et" düğmesi | Var | **Kalır.** Kurumsal işte teklif/görüşme talebi satış değil, iş başlangıcı. Strateji bunu ana ölçü olarak kullanıyor |
| `currency` sütunu (TRY varsayılan) | Var, kullanılmıyor | Dokunulmaz (veri modeli değişikliği gerekmez) |

## A) Yapılacaklar — net istekler (karar beklemeyenler)

**A1. Instagram üst sağ köşeye (22:24)**
- Header'ın sağına Instagram ikonu eklenir, iki sitede de (44px dokunma alanı, `aria-label`).
- Galeri ana sayfasının ortasındaki Instagram bölümü kalkar. Bileşen ve admin alanı silinmez.
- **Dosyalar:** `navbar.tsx`, `kurumsal-navbar.tsx`, `mobile-menu.tsx`, `(main)/[locale]/page.tsx`. Adres `src/lib/social.ts`'te.
- **İş:** ~1 saat. **Risk:** Düşük.

**A2. Sayfa başlıklarına görselli banner (21:55)**
- Ortak `PageBanner` bileşeni yazılır, iki sitenin iç sayfalarında kullanılır.
- Görsel sayfanın kendi eserlerinden seçilir. İlk seçimi ben yaparım, ekran görüntüsüyle onaya sunarım.
- **İş:** ~3–4 saat. **Risk:** Düşük-orta (görsel seçimi, LCP).

**A3. Özel sipariş kalkar (21:55, teyit 10:54)**
- Kalkacaklar:
  - `/ozel-siparis` sayfası
  - Galeri menü linki
  - Footer linki
  - Ana sayfa bölümü
  - Eser sayfasındaki "Özel sipariş →" linki
- `/ozel-siparis` → `/iletisim` 301.
- Metin `docs/kaldirilan-metinler/` altına arşivlenir.
- **Dosyalar:** `(main)/[locale]/ozel-siparis/`, `navbar.tsx`, `footer.tsx`, `(main)/[locale]/page.tsx`, `urun/[slug]/page.tsx`, `src/messages/*.json`, `site-routing.ts` + test.
- **İş:** ~1 saat. **Risk:** Düşük; gelen mesajlar `messages` tablosunda kalır.

**A4. Süreç kalkar (10:54)** — *dün "kısalt" idi, artık "kaldır"*
- Kalkacaklar:
  - Kurumsal `/surec` sayfası
  - Menü linki
  - Footer linki
  - Ana sayfadaki "Süreç" özet bölümü ve "Süreci incele →" linki
- `/surec` → `/projeler` 301.
- Proje sayfalarındaki **"Yapım ve montaj" fotoğrafları kalır.** Onlar süreç anlatımı değil, işin kanıtı (strateji §3).
- Metin (adımlar s1–s5, TR/EN) `docs/kaldirilan-metinler/` altına arşivlenir.
- **Dosyalar:** `(kurumsal)/[locale]/kurumsal/surec/`, `kurumsal-navbar.tsx`, `kurumsal-footer.tsx`, `kurumsal/page.tsx` (~satır 189), `src/messages/*.json`, `site-routing.ts` + test.
- **İş:** ~1 saat. **Risk:** Düşük.

**A6. Menü (22:37), iki siteye bölünmüş haliyle (§2)**
- Galeri'de açılır menüler: Galeri ▾ · Object ▾ · Studio ▾.
- Yeni `/sergiler` listesi.
- 301'ler + testler, `sitemap.ts`.
- **İş:** ~1 gün. **Risk:** Orta (iç linkler, kırık link taraması şart).
- **Bağımlılık:** C6 (menü adları), C9 (Studio'da süreç var mı) ve B7 (panolar galeri menüsünde dış link mi). Bunlar gelmeden menü iskeleti kurulabilir, etiketler sonra.

## B) Çağrı'nın kararı gerekiyor

**~~B1. Tek site / iki site~~ → KAPANDI: iki site.**
- 10:52, sanatçı Çağrı'ya bırakarak kabul etti; ayrıntı yukarıdaki "Güncelleme" bölümünde.

**~~B2. Tasarım dili~~ → DÜŞTÜ.** İki site, iki dil (10 Eki).

**B3. Koyu fon (21:55 + 21:59) — DURUYOR, kapsamı daraldı**
- Referans: #2F2E2E antrasit, #232323 iç kutu, #DBDBDB metin (§1).
- Referans site bir **sanatçı** sitesi; bireysel tarafa, yani **galeriye** daha yakın.
- Seçenekler:
  - (a) Yalnızca galeri koyu
  - (b) İki site koyu
  - (c) Galeri kısmen koyu (header/hero/footer)
  - (d) Krem kalır
- Bedel ve riskler dünkü gibi:
  - Token'lar ters döner.
  - 13 dosyada sabit renk var.
  - Kurumsal vurgu #1F4E5A koyu fonda 1.48:1, yeni renk gerekir.
  - Logo koyu fonda test edilmeli.
  - Açık fonda çekilmiş eser fotoğrafları kontrol edilmeli.
- Galeri için ~1 gün.
- Önce iki örnek ekran görüntüsü öneririm.

**~~B4. Heykel metni~~ → DÜŞTÜ.** Her site kendi metnini gösteriyor (bugünkü hali).

**B5. Sanatçı siteleri — ERTELENDİ**
- "Ayrı yapılabilir" önerisi tek site fikrinin parçasıydı.
- Sanatçı sayfaları galeri içinde kalır.
- Ayrı alan adına (`melikedogan.com` / `serefdogan.com`) bağlamak bağımsız bir karar; bu turda değil.

**B6. Eski `sanat-galeri.vercel.app` demosu — DURUYOR**
- Kapatılsın mı, galeriye mi yönlensin?

**B7. Galeri ana sayfası panoyla mı açılsın? (22:24) — YENİ**
- Sanatçı bunu tek site varsayımıyla söyledi.
- Kurumsal site zaten panoyla açılıyor.
- Galeri için seçenekler:
  - (a) Galeri kendi eserleriyle açılır. Panolar yalnızca menüdeki dış linkte görünür.
  - (b) Galeri hero'sunda bir pano karesi + "Mimari projeler →" kurumsal linki.
- (b), 10 Ekim ayrımını hafifçe deler ama sanatçının isteğine yakın.
- Benim önerim **(a)**. Gerekçe: Strateji §2'deki "ilk 10 saniyede tek şey" kuralı; bireysel ziyaretçiye ilk ekranda mimari pano göstermek, onu kurumsal tarafa yönlendirir.
- Karar Çağrı'nın.

**B8. `/koleksiyonlar` sayfası kalsın mı? — YENİ, küçük**
- Açılır menü koleksiyonları zaten gösteriyor.
- Seçenekler: sayfa kalır, ya da `/galeri`'ye 301.

## C) Sanatçıya sorulacaklar (soruları Çağrı iletecek)

**~~C1. "Kurumsal" çelişkisi~~ → DÜŞTÜ.**
- İki site kararı soruyu gereksiz kıldı.
- Not: Hangi anlamın kastedildiği hâlâ bilinmiyor; bunu "çözüldü" diye değil, "gereksizleşti" diye kaydediyorum.

**~~C2. Fon rengi ne kadar koyu?~~ → DÜŞTÜ (22 Eki, Çağrı kararı: koyu fon isteği düştü, krem #F7F4EF kalıyor).** (B3 ile birlikte)
> "Örnek sitedeki koyu gri fonu galeri sitesinin **tamamında** mı istiyorsunuz, yoksa giriş/üst kısımda mı? Mimar/kurum sitesinde de olsun mu? Önce bir ekran görüntüsüyle gösterelim mi?"

**C3. Fotoğraf azaltma — DURUYOR**
> "Fotoğrafları azaltma isteği **hangi sayfalar** için? Size her eser için benzer kareleri yan yana gösteren bir sayfa hazırlayalım, çıkarılacakları işaretleyin."

- Ölçüm: Resimli Seramikler'de eser başına en çok 24 fotoğraf. Silme yok, gizleme var.

**C4. Hakkımızda: atölye fotoğrafları — DURUYOR**
> "Atölyede çalışırken fotoğrafları Drive'daki **Studio → Hakkımızda** klasörüne yükleyebilir misiniz?"

- Strateji açısından önemi arttı: bireysel tarafın ana içeriği bu (strateji §4).

**~~C5. Üretim süreçleri fotoğrafı~~ → C9'a dönüştü.**

**C6. Menü adları: "Object" / "Studio" — DURUYOR**
> "Türkçe sayfada 'Object' ve 'Studio' İngilizce mi kalsın, 'Objeler' / 'Stüdyo' mu olsun?"

**C7. Açılışta tek pano mu, birkaç pano mu — kapsamı değişti**
- Yalnızca kurumsal ana sayfa için geçerli.
- Galeri için karar B7.

**C8. Kaşık koleksiyonu** — Hatırlatma; fotoğraflar gelince eklenir.

**C9. "Süreç kaldırılsın" ↔ menüde "Studio → Üretim süreçleri" — YENİ**
- 10:54 (13 Eki): *"süreç ve özel sipariş kısımlarını kaldıralım"*.
- 22:37 (11 Eki) menüsünde ise Studio altında "Üretim süreçleri" başlığı var. Drive'da da `Studio/Üretim süreçleri` klasörü var (boş).
- Yeni mesaj eskisini geçersiz kılıyor olabilir. Ya da kalkan şey kurumsaldaki uzun süreç sayfasıdır, Studio'da kısa bir "üretim" sayfası istenmeye devam ediyordur.
- Kendi başıma karar vermiyorum.
- **Varsayılan, cevap gelene kadar:** Süreç sayfası kalkar, Studio menüsünde "Üretim süreçleri" **yer almaz**. Boş bölüm açmama kuralıyla da tutarlı.
- **Soru:**
  > "Süreç kısmını kaldırıyoruz. Gönderdiğiniz menüde 'Studio' altında 'Üretim süreçleri' başlığı da vardı; o da tamamen kalksın mı, yoksa ileride atölye/üretim fotoğraflarıyla kısa bir sayfa mı olsun?"

## 3. Önerilen sıra

1. **Hemen (karar beklemeyen):**
   - A3 (özel sipariş)
   - A4 (süreç)
   - A1 (Instagram)
   - A2 (banner)
2. **Çağrı:** B3, B6, B7, B8. Sanatçıya C2, C3, C4, C6, C7, C9.
3. **Sonra:**
   - A6 (menü + `/sergiler` + 301 + sitemap)
   - B3'e göre renk
4. **Her adım sonunda:**
   - Testler
   - Kırık link taraması
   - 390 / 1440 ekran görüntüsü
   - noindex kalır; deploy Çağrı onayıyla.

## 4. Çağrı'ya sorular (özet)

1. **A1–A4'e başlayayım mı?** Kararla çelişen bir tarafı kalmadı.
2. **B3:** Koyu fon: yalnızca galeri mi, ikisi mi, kısmi mi? Önce örnek ekran ister misin?
3. **B7:** Galeri ana sayfası panoyla mı açılsın, kendi eserleriyle mi? (Önerim: kendi eserleri.)
4. **B6:** Eski demo kapatılsın mı?
5. **B8:** `/koleksiyonlar` sayfası kalsın mı?
