# PLAN — Bireysel sanatçı siteleri (Melike Doğan, Şeref Doğan) · 16 Ekim 2026

> **Kaynak:** Çağrı ile sanatçının 16 Eki görüşmesi. Sanatçı "hem kurumsal hem bireysel" dedi ve onayladı. Çağrı referans siteleri bugün gönderecek; ardından hepsi asıl alan adlarında yayına alınacak.
> **Durum:** Yalnız plan. Kod, deploy ve alan adı alımı yok. Rakamlar 16 Eki'de veritabanından, canlı siteden ve `whois`/`dig` ile ölçüldü.

---

## 1. Envanter: 4 site

| # | Site | Durum | Amaç | Kitle |
|---|---|---|---|---|
| 1 | **Uart Galeri** (`uart-galeri.vercel.app`) | Var, canlı, noindex | Atölyenin eserlerini koleksiyon olarak sunmak, eser hakkında iletişim almak | Bireysel alıcı, koleksiyoner, hediye arayan |
| 2 | **Uart Kurumsal** (`uart-kurumsal.vercel.app`) | Var, canlı, noindex | Mimari seramik panolar ve heykeller için proje almak | Mimar, müteahhit, otel, belediye ve kurum |
| 3 | **Melike Doğan** (bireysel) | **Yeni** | Sanatçı kimliği: biyografi, sanatçı beyanı, seriler, sergiler, basın | Küratör, galeri, sergi daveti, akademi, basın, ismini arayan |
| 4 | **Şeref Doğan** (bireysel) | **Yeni** | Aynı amaç, Şeref için | Aynı kitle; ayrıca kamusal pano projelerini sanatçı adıyla arayanlar |

**Fark:**
- 1 ve 2 **atölyenin** (Uarttasarım) siteleri; ayrım ürün kategorisine göre.
- 3 ve 4 **kişinin** siteleri; ayrım sanatçıya göre. Satış ya da teklif sitesi değil, CV/portfolyo sitesi.
- Bu fark hem tasarımı hem SEO'yu belirler (§3).

**Bugün zaten olan parça:** Galeri sitesinde sanatçı sayfaları var ve canlıda 200 dönüyor: `/tr/melike`, `/tr/seref` ve altında `/portfolyo`, `/sergiler`, `/iletisim`. Kod: `src/app/(artist)/[locale]/[artist]/`. Bireysel siteler sıfırdan değil, bu sayfaların bağımsız bir siteye dönüşmüş hâli olarak kurulabilir.

---

## 2. İçerik yeterli mi?

### Ölçüm (veritabanı, 16 Eki)
| | Melike Doğan | Şeref Doğan |
|---|---|---|
| Biyografi | ✅ TR 2.617 / EN 2.748 karakter | ✅ TR 2.189 / EN 2.310 karakter |
| Sanatçı beyanı (`statement`) | ❌ boş | ❌ boş |
| Portre fotoğrafı (`photo_url`) | ❌ yok | ❌ yok |
| Eserler (`products.artist_id`) | **33:** 16 heykel (Masalın Hafızası), 13 resimli seramik, 4 antik replika | **18:** 11 mimari pano, 6 antik replika, 1 heykel (Anadolu Ekininde Güzeller) |
| Eser künyesi | Heykellerde 15/16 yıl ve ölçü var (Anka V yılı eksik). Resimli 13 ve antik 4 eserde **yıl ve ölçü yok** | Panolarda yıl ve ölçü tam. Antik 6 eserde ve Anadolu'da **yıl ve ölçü yok** |
| Sergiler (`exhibitions`) | ❌ **0 kayıt** | ✅ 11 kişisel sergi (2008–2017) |
| Ödüller | ❌ 0 kayıt | ✅ 3 (1996, 2000, 2002) |
| Eğitim / akademik | ❌ yok | ❌ yok (tabloda alan da yok) |
| Basın (`press_items`) | ❌ 0 | ❌ 0 |
| Portfolyo (`portfolio_items`) | 0 (eserler kullanılıyor) | 0 |
| Sergi fotoğrafları | 158 kare, 18 grupta. Sanatçıya bağlı değil, sergi adıyla duruyor | Aynı tablo |
| Atölye fotoğrafları | 14 kare, ikisinin ortak atölyesi. Fotoğraftaki kişiler doğrulanmadan isim yazılmıyor | Aynı |

### Eserler ayrılabiliyor mu?
**Evet, büyük ölçüde.**
- Her eserde `artist_id` var.
- Sanatçı sayfaları bugün bu alanla süzülüyor.

**İki istisna, karar gerektiriyor:**
1. **Antik Dönem Replikaları ortak üretim.** Formu Şeref yapıyor, resimlemeyi Melike (sitede yazıyor). Ama veritabanında her replika tek sanatçıya bağlı (4 Melike, 6 Şeref). Bireysel sitede "kimin eseri" sorusu çıkacak. Öneri: ikisinin sitesinde de "ortak üretim" etiketiyle görünsün.
2. **Mimari panolar Şeref'e bağlı.** Kurumsal sitedeki "yapım ve montaj" fotoğraflarında ve bazı projelerde Melike'nin de emeği olabilir. Doğrulanmadı.

### Eksikler, sanatçılara sorulacak
| | Melike | Şeref |
|---|---|---|
| **Kritik (site boş görünür)** | Sergi listesi; "Yolculuk" afişlerindeki ortak sergiler karar bekliyor (TODO) | — |
| **Kritik** | Portre fotoğrafı | Portre fotoğrafı |
| Önemli | Eğitim, ödüller, sanatçı beyanı | Eğitim, sanatçı beyanı |
| Önemli | Resimli seramiklerin yıl ve ölçüsü (13 eser) | Antik replikaların yıl ve ölçüsü |
| Önemli | Anka V belgesi (bekleniyor) | Anadolu Ekininde Güzeller'in eser bazında bilgisi (bekleniyor) |
| İyi olur | Basın, katalog, yayın | Basın; kamusal projelerin listesi (panolar dışında varsa) |
| İyi olur | Kişisel Instagram var mı? (bugün yalnız @uarttasarim) | Aynı |

**Sonuç:**
- Şeref'in içeriği bireysel site için **bugün yeterli** (biyografi, 11 sergi, 3 ödül, 18 eser).
- Melike'nin eseri bol ama **sergi ve ödül listesi yok**. Bu gelmeden Melike'nin sitesi "CV" ayağı boş kalır.

---

## 3. Alan adı yapısı (en kritik karar)

### Bugün ne var (whois/dig, 16 Eki)
| Alan adı | Durum | Bizim mi? |
|---|---|---|
| `uarttasarim.com` | Kayıtlı 2017, GoDaddy, bitiş 07.2027. NS `domaincontrol.com`. Bugün ikas'a gidiyor; açılınca `accounts.ikas.com`'a yönleniyor, mağaza açık görünmüyor | **Evet** (Çağrı'nın) |
| `melikedogan.com` | Kayıtlı **27.11.2024**, Cloudflare, bitiş 11.2027. Web sitesi yanıt vermiyor | **Bilinmiyor.** 10 Eki planında "alınmadı" yazıyordu; bu kayıt bizim mi, başkasının mı? |
| `serefdogan.com` | Kayıtlı **2015**, ODTÜ Geliştirme Vakfı, bitiş 01.2027. NS `sanalnet.com`. Web sitesi yanıt vermiyor | **Bilinmiyor.** 2015'ten beri kayıtlı; Şeref'in eski kaydı olabilir. Sorulmalı |
| `uartkurumsal.com` | **Boş** (kayıtlı değil) | Alınabilir |
| `melikedogan.art`, `serefdogan.art` | **Boş** | Alınabilir |
| `.com.tr` uzantıları | whois yanıt vermedi | **Doğrulanamadı** |

### Seçenekler (bireysel siteler için)
| | Örnek | Artı | Eksi |
|---|---|---|---|
| **A. Ayrı alan adı** | `melikedogan.com` / `serefdogan.com` (ya da `.art`) | Sanatçı adıyla aramada en güçlü sinyal: alan adı ile kişi adı aynı. Sanatçı kimliği atölyeden bağımsız taşınabilir. Kartvizitte ve sergi afişinde kısa ve akılda kalır | Alan adı lazım (`.com`'lar kayıtlı, sahipleri belirsiz). Her sitenin otoritesi sıfırdan başlar. 4 Search Console mülkü |
| **B. Alt alan adı** | `melike.uarttasarim.com` | Satın alma yok, DNS'te bir kayıt. Uarttasarım markasıyla bağ görünür | Google alt alan adlarını çoğunlukla ayrı site gibi değerlendirir, yani otorite paylaşımı avantajı sınırlı. Kişi adı alan adında değil |
| **C. Alt dizin** | `uarttasarim.com/melike` | Tüm otorite tek alan adında birikir. Bugünkü yapı zaten bu | "Bireysel site" olmaz, galerinin bir sayfası olur. Çağrı'nın "bu tarzda 2 site" isteğine uymaz |

### Öneri: **A (ayrı alan adı)**, alınamazsa **B**
**Gerekçe:**
- Bu sitelerin işi kişinin adını taşımak. Küratör, gazeteci ya da sergi daveti "Melike Doğan seramik" diye arar.
- Kişi adıyla eşleşen alan adı ve `Person` yapılandırılmış verisi bu aramada en doğrudan sinyal.
- C bu amaca hizmet etmez. B işe yarar ama A'nın ad eşleşmesini vermez.

Tahmini yazmıyorum: arama sıralamasına etkisini ölçecek verimiz yok. Gerekçe yalnız işleve dayanıyor.

### Önerilen 4'lü dağılım (Çağrı karar verir)
| Site | Öneri | Not |
|---|---|---|
| Uart Galeri | `uarttasarim.com` | Mevcut marka; ikas'taki eski URL'ler için 301 kontrolü (SEO-GECIS-KONTROL §9) |
| Uart Kurumsal | Yeni alan adı (`uartkurumsal.com` boş) **ya da** `kurumsal.uarttasarim.com` | Kurumsal alıcı markayı "Uarttasarım" olarak tanıyorsa alt alan adı da yeterli |
| Melike Doğan | `melikedogan.com` (bizimse) → değilse `melikedogan.art` | Önce kaydın kime ait olduğu öğrenilmeli |
| Şeref Doğan | `serefdogan.com` (bizimse) → değilse `serefdogan.art` | Aynı |

### SEO'da dikkat edilecek tek büyük risk: **kopya içerik**
Aynı eser bugün galeride (`/urun/x`) ve bazı heykeller kurumsalda var. Bireysel sitelerde de olursa **aynı eser 3 sitede** görünür.

**Öneri:**
- **Eser detayının tek indekslenen sahibi** atölye siteleri: galeri ya da kurumsal, SEO-GECIS-KONTROL §7 gibi.
- Bireysel sitede eserler seri ve portfolyo olarak gösterilir. Detay sayfası ya hiç olmaz (galeriye bağlanır) ya da varsa `canonical` galeriye gösterir.
- Bireysel sitenin **özgün** ve indekslenecek içeriği: biyografi, beyan, sergi listesi, ödüller, basın, seri metinleri.
- Bugünkü `/tr/melike` ve `/tr/seref` sayfaları bireysel site yayına girince **301** ile yeni alan adına yönlenir.
- SEO-GECIS-KONTROL.md'deki 10 adım **her site için ayrı** uygulanır: 4 GSC mülkü, 4 sitemap, 4 robots, 4 × noindex kaldırma. Geçişte 4 ayrı tablo tutulur.

---

## 4. Teknik

### Mevcut mimari
- **Tek kod tabanı, iki Vercel projesi:** `uart-galeri` ve `uart-kurumsal`, aynı repo.
- Hangi sitenin açılacağına `UART_SITE` ortam değişkeni karar verir. Alan adı gelince `UART_GALERI_DOMAIN` / `UART_KURUMSAL_DOMAIN` ile host'a göre (`src/lib/site.ts`, `src/proxy.ts`).
- Bu, 10 Eki'deki Çağrı kararı (PLAN-IKI-SITE).
- Ortak veritabanı (Supabase), ortak Cloudinary ve ortak admin paneli.
- Sanatçı sayfaları bugün galeri içinde ayrı bir route group: `(artist)`.

### 4. siteyi taşıyabilir mi? **Evet, aynı desenle.**
**Öneri: tek kod + 4 Vercel projesi.** `UART_SITE=galeri|kurumsal|melike|seref`.

**Neden:**
- Veritabanı, admin ve eser verisi ortak. Eser bir kez girilir, dört sitede doğru yerde görünür; ayrı kod tabanında içerik çoğalır ve kopyalar birbirinden kayar.
- Bugünkü ayrım fonksiyonları (`siteForHost`, `isOnSite`) genişletilebilir. Kurumsal sitede zaten kanıtlanmış bir desen.
- Her proje ayrı deploy, ayrı alan adı, ayrı ortam değişkeni: biri bozulursa diğerleri etkilenmez.

**Yapılacak kod işleri (insa aşamasında):**
1. `SiteKey`'e `melike` ve `seref`; `siteDomains()` / `siteForHost()`'a iki yeni alan adı değişkeni.
2. Bireysel siteler için **sanatçıya göre** süzme (`artist_id`). Galeri/kurumsal ürüne göre süzmeye devam eder. İki kural birbirine karışmamalı.
3. `(artist)` sayfalarını kök site olarak açan proxy rewrite (kurumsal'daki `/kurumsal` deseninin aynısı).
4. Site başına sitemap, robots, noindex, metadataBase, canonical, `Person` JSON-LD.
5. Referans sitelere göre tasarım: yeni bir tema katmanı (galeri ve kurumsalın kendi teması var).
6. Testler: proxy, site ayrımı, sitemap (bugünkü 147 testin kalıbında).
7. Vercel'de 2 yeni proje (Hobby/Pro limitleri ve faturası Çağrı'nın hesabında; kontrol edilmeli).

**Risk:** Ortak veritabanı = ortak hata. Bir veri değişikliği 4 sitede birden canlıya çıkar (bugün de böyle). Uygulama: her değişiklik için yedek ve GERI-AL alışkanlığı sürer.

---

## 5. Sıra ve süre

Süreler bu oturumdaki benzer işlerden çıkardığım **tahminler**. Sanatçıdan içerik gelme süresi dahil değil.

| Adım | İş | Tahmin | Bağımlılık |
|---|---|---|---|
| 0 | Çağrı'nın referans sitelerini incele; ölçü, renk, yapı ve sayfa listesini çıkar (Hanna Miadzvedzeva ölçümündeki gibi) | 0,5 gün | Referanslar |
| 1 | Kararlar: alan adları (§3), antik replikaların sahipliği, kopya içerik kuralı | Çağrı | — |
| 2 | Sanatçılara eksik listesi (§2) | Çağrı iletir | — |
| 3 | Altyapı: 4-site `SiteKey`, proxy, sanatçıya göre süzme, sitemap/robots/canonical, testler | 1 gün | 1 |
| 4 | **Şeref sitesi** (içeriği tam olan önce): tema, sayfalar, önizleme ekran görüntüleri | 1,5–2 gün | 0, 3 |
| 5 | **Melike sitesi**: aynı şablon, Melike'nin içeriğiyle | 1 gün (+ sergi listesi gelince 0,5) | 4, sergi listesi |
| 6 | Önizleme turu: 4 site birlikte, sanatçı ve Çağrı onayı, düzeltmeler | 0,5–1 gün | 4, 5 |
| 7 | **Alan adı günü:** 4 site × SEO-GECIS-KONTROL; DNS, 301, GSC, sitemap | 1 gün + 1–2 hafta GSC izleme | 1, 6 |

**Toplam iş:** yaklaşık 5,5–7 iş günü. Takvimi belirleyen asıl şey sanatçıdan gelecek içerik ve alan adı kararı.

**Şeref önce, neden:**
- Sergi, ödül ve biyografisi veritabanında tam.
- Şablon onunla kurulur, Melike'nin içeriği gelirken boşa beklenmez.

**Alternatif:** İçerik değil görünürlük öncelikse Melike önce (eseri daha çok: 33'e 18).

---

## 6. Çağrı'dan gerekenler

1. **Referans siteler** (bugün gelecek): "bu tarzda" derken hangi yönü? Sayfa yapısı mı, renk mi, ölçek mi?
2. **Alan adı kararları:**
   - `melikedogan.com` (2024, Cloudflare) ve `serefdogan.com` (2015, ODTÜ) **bizim mi?** Değilse `.art` ya da başka uzantı mı?
   - Kurumsal: yeni alan adı (`uartkurumsal.com` boş) mı, `kurumsal.uarttasarim.com` mu?
   - `uarttasarim.com` → galeri teyidi.
   - Alımı ve DNS'i kim yapacak? (`uarttasarim.com` GoDaddy'de, bizde erişim var mı?)
3. **İçerik eksikleri** (§2 tablosu): Melike'nin sergi ve ödül listesi, iki portre, beyanlar, eğitim.
4. **Antik replikalar ve panolarda emek paylaşımı:** bireysel sitelerde nasıl görünsün?
5. **Kopya içerik kuralı onayı:** eser detayı tek yerde indekslenir (galeri/kurumsal), bireysel site oraya kanonik verir.
6. **Vercel:** 2 yeni proje açmak hesap planına uyuyor mu?
7. **E-posta:** bireysel sitelerin iletişim formu nereye düşsün? (`melike@uarttasarim.com` / `seref@uarttasarim.com` belgede geçiyor; gerçekten çalışıyor mu doğrulanmadı.)
