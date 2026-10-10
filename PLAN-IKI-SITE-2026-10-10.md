# PLAN — Tek siteyi ikiye bölme (Uart Kurumsal / Uart Galeri)

Hazırlandı: 10.10.2026 · Görev: `GOREV-IKI-SITE-2026-10-10.md` · **Durum: KARARLAR ALINDI (`KARARLAR-2026-10-10.md`, bağlayıcı) — uygulama `iki-site` dalında. Deploy/DNS yok.**

> Güncelleme 10.10.2026: §2, §3, §4, §5, §7 Çağrı'nın kararlarına göre değişti. Eski öneriler (alt alan adı, "Uart Design Studio" kurumsal logosu, heykeller yalnız galeride) **geçersiz**.

Kaynaklar: Drive `uarttasarım` klasörünün tam listesi (rclone `lsjson -R`, 715 öğe), indirilen 12 docx + 2 özgeçmiş görseli,
Supabase salt-okunur sorgu (30 eser / 363 görsel), mevcut kod (`src/middleware.ts`, `src/lib/categories.ts`, `globals.css`).

---

## 0. Drive'da ne değişti (önemli)

Sanatçı 3 Ekim'de klasörü kendisi yeniden düzenlemiş:

```
uarttasarım/
├─ ceramicart/   → Heykeller · Resimli seramikler · mimari duvar panoları
├─ Objects/      → Antik dönem replikaları
├─ Studio/       → Sergiler (8) · Özgeçmişler (2) · Üretim süreçleri (BOŞ)
├─ Editler/      → Edit Talepleri sheet
└─ Hakkımızda.docx · uarttasarım logo.jpg · Uart Design Studio.png
```

⚠️ Sanatçının kendi ayrımı (ceramicart / Objects / Studio) Çağrı'nın ayrımıyla (kurumsal / galeri) **aynı değil**:
mimari panoları heykel ve resimli seramikle aynı "ceramicart" çatısına koymuş. Plan Çağrı'nın kararını izliyor;
sadece sanatçıya anlatılırken bu farkın bilinmesi lazım.

## 1. Drive envanteri → hangi site

| İçerik (Drive) | Görsel | Metin | DB'de? | Site |
|---|---|---|---|---|
| **Mimari duvar panoları** — 7 mevcut proje | 84 | var (her biri docx) | ✅ 7 eser | **Kurumsal** |
| **Mimari panolar — 4 YENİ proje**: Akar'ın Deryası (2016, 24 m² zemin enstalasyonu, Çimenlik Deniz Müzesi) · Bilginin Kaynağı (2016, ÇOMÜ Tıp Araştırma Hst.) · Gizem, Oluşum ve Sonsuzluk (2003, ÇOMÜ Fen-Edebiyat) · Türk Denizcilerinin Sesi (2016, Çimenlik Deniz Müzesi) | 35 | var (künyeli docx) | ❌ | **Kurumsal** |
| **Yapım ve montaj fotoğrafları** (9 projede alt klasör) | 96 | Gizem docx'inde "Yapım Süreci" paragrafı | ❌ | **Kurumsal** (süreç) |
| Resimli seramikler — Zamansız Manzaralar (13 eser) | 225 | var | ✅ 13 eser | **Galeri** |
| Resimli seramikler — `Çanaklar` | 0 | — | — | Galeri (klasör BOŞ) |
| **Heykeller — "Masalın Hafızası"** (Melike Doğan): Anka, Şahmaran, Derviş, Dev, Devanası, Keloğlan, Padişah, Şehzade | 59 | seri genel metni + Anka ve Şahmaran docx'i; **diğer 6 alt-serinin metni YOK** | ❌ | **Galeri** |
| **Heykeller — "Anadolu Ekininde Güzeller"** (Şeref Doğan) | 9 | seri metni var, eser bazında künye YOK | ❌ | **Galeri** |
| Antik dönem replikaları (10 eser) | 67 | var | ✅ 10 eser | **Galeri** |
| **Sergiler** (Studio/Sergiler) — 8 sergi: Yolculuk/Bozcaada · Medeniyetler/Polart · Nüve-Nucleus/Marina · Anadolu Ekininde Güzeller/Akeramos · Bendeki Seramik Olgusu/Arkeo Pera · Sınırsız/Artist 2008 · Yolculuk 2/Akşit · Yolculuklar/Armagrandi | 36 | sadece klasör adları (künye Şeref CV'sinde) | 1 sergi (Bozcaada 2010) | **Galeri** |
| **Özgeçmişler** — Melike (biyografi metni) · Şeref (biyografi + 11 sergi, 3 ödül, 9 pano listesi) | 2 görsel | görsel içinde metin (yazıya dökülmeli) | ❌ (bio alanları boş) | **İkisi de** (sanatçı sayfası) |
| Hakkımızda.docx | — | var | ✅ (edbd1fc) | İkisi de, farklı vurgu |
| Logolar: `uarttasarım logo.jpg`, `Uart Design Studio.png` | 2 | — | TR logo kullanımda | aşağıda §4 |
| Studio/Üretim süreçleri | 0 | — | — | (klasör BOŞ) |

**Toplam yeni görsel:** ~235 (heykel 68 + yeni pano 35 + yapım/montaj 96 + sergi 36). Kurumsal tarafta 11 proje, galeride ~45+ eser olur.

### Eksik / sorulacak (uydurmadan boş kalacaklar)
1. Masalın Hafızası'nda 6 alt-serinin (Derviş, Dev, Devanası, Keloğlan, Padişah, Şehzade) eser metni ve künyesi (ölçü, yıl) yok.
2. Anadolu Ekininde Güzeller: tek tek eser adı/ölçüsü yok, yalnızca seri metni var.
3. `Gönül Gözü/Yapım ve montaj`, `Studio/Üretim süreçleri`, `Resimli seramikler/Çanaklar` klasörleri boş.
4. Melike'nin özgeçmişinde "giyilebilir seramik" ve "işlevsel formlar" geçiyor, Drive'da bunlara ait içerik yok.
5. Sergi fotoğraflarının künyesi (yıl, mekân) yalnızca Şeref'in CV'sinde var. Hangi sergide Melike'nin de işi var, belli değil.
6. Kurumsal site için ayrı logo yok; "Uart Design Studio" logosu sheet'te İngilizce sürüm için istenmişti.

### Bu turda fark edilen veri sorunları (düzeltilmedi, sadece not)
- **Canlıda hâlâ 3 sahte basın kaydı var** (`press_items`, example.com linkleri; 7 Ekim raporu). İki site yayına girmeden silinmeli.
- İki farklı eserin TR adı aynı: `the-turning-sky` ve `the-rotating-sky` ikisi de "Dönen Gökyüzü".
- `Akarın deryası/Yapım ve montaj/Yapım ve montaj` iç içe klasör; içeriği büyük ihtimalle tekrar ediyor, içe aktarmadan önce kontrol edilmeli.
- Yazım: Drive'da "Troia", CV'de "Troya". Doğru yazım sanatçıya sorulmalı.

## 2. Ayrımın veri modeli (KARAR 2: ürüne göre; heykeller iki sitede)

| Kategori | Galeri | Kurumsal |
|---|---|---|
| Antik Dönem Replikaları | ✅ | — |
| Resimli Seramikler | ✅ | — |
| **Seramik Heykeller** (yeni kategori) | ✅ | ✅ |
| Mimari Duvar Panoları | — | ✅ |

- Eşleme tek yerde: `src/lib/site.ts` → `CATEGORY_SITES`. Sanatçıya bakılmaz.
- **Eser kaydı tek, açıklama iki tane:**
  - `description_tr/en`: galeri metni (hikâye, esin kaynağı, seri içindeki yeri).
  - **yeni** `description_kurumsal_tr/en`: kurumsal metin (ölçü, malzeme, uygulama, mekâna yerleşim).
- Kurumsal sayfa kuralı:
  - Kurumsal metin varsa o gösterilir.
  - Yalnız-kurumsal kategoride (panolar) mevcut `description` zaten proje dilinde yazılmış, o kullanılır.
  - **İki sitede olan kategoride kurumsal metin yoksa galeri metni kullanılmaz.** Yalnızca künye görünür ve admin'de eksik olarak işaretlenir. Kurumsal metin uydurulmaz.
- Şema değişikliği yalnızca ekleme (iki nullable kolon). Migration dosyası hazırlanır, **paylaşımlı DB'ye Çağrı onayıyla uygulanır**. Kod, kolon yokken de çalışır.

## 3. Bilgi mimarisi (KARAR 1: iki bağımsız site, iki alan adı)

Tek kod tabanı, iki site:
- `src/proxy.ts` (Next 16'da `middleware` → `proxy`) host'a bakar.
- Alan adları **tek yerden**: `UART_GALERI_DOMAIN`, `UART_KURUMSAL_DOMAIN` ortam değişkenleri. Alan adı gelince Vercel'de bu iki değişken ve domain eklenir, kod değişmez.
- Kurumsal sayfalar `src/app/(kurumsal)/[locale]/kurumsal/…` altında durur:
  - Kurumsal alan adında proxy `/tr/projeler`'i bu klasöre rewrite eder (URL'de `/kurumsal` görünmez).
  - Önizlemede (vercel.app, localhost) aynı sayfalar `/tr/kurumsal/...` yolundan açılır.
  - Galeri alan adında `/kurumsal/...` istenirse kurumsal alan adına 301.

**Uart Galeri:** `/` · `/galeri` · `/koleksiyonlar` · **`/koleksiyonlar/[kategori]`** (yeni; antik sayfasında terra sigillata metni) · `/urun/[slug]` · `/[sanatçı]` (+portfolyo/sergiler/iletişim) · `/sergi/bozcaada-2010` · `/hakkimizda` · `/iletisim` · `/ozel-siparis`.
Mevcut yollar korunur (gereksiz URL değişikliği yok).

**Uart Kurumsal:** `/` · `/projeler` (panolar + heykeller, filtreli) · `/projeler/[slug]` (künye + kurumsal metin + galeri) · `/surec` · `/hakkimizda` · `/iletisim`.

### 301 yönlendirme planı
| Eski | Yeni | Nerede |
|---|---|---|
| `melike.uarttasarim.com/<yol>` | `https://$UART_GALERI_DOMAIN/<locale>/melike/<yol>` | proxy (host) |
| `seref.uarttasarim.com/<yol>` | `https://$UART_GALERI_DOMAIN/<locale>/seref/<yol>` | proxy (host) |
| `(www.)melikedogan.com`, `(www.)serefdogan.com` | aynı mantık (DOMAIN_MAP'te vardı, alınmadılar) | proxy (host) |
| `/<locale>/teknik` | `/<locale>/koleksiyonlar/antik-donem-replikalari#terra-sigillata` | proxy (yol) |
| galeri: `/<locale>/urun/<pano-slug>` | kurumsal: `/<locale>/projeler/<slug>` | sayfa (kategori DB'den okunur) |
| galeri alan adı: `/<locale>/kurumsal/<yol>` | kurumsal alan adı: `/<locale>/<yol>` | proxy |

Not: `melike.` ve `seref.` için bugün DNS kaydı yok. Yönlendirme, alan adları bağlandığında kayıtlar oraya işaret ederse devreye girer.

## 4. Tasarım farklılaşması

**Logo (KARAR 3):** İki sitede aynı logo (`uart-logo.png` + "Uarttasarım"). Fark içerik ve tasarım dilinden gelir.

**Tipografi (KARAR 4, benim kararım, test edildi):**
- **Galeri:** başlıklar **Newsreader** (Production Type, OFL, Google Fonts), gövde Inter.
  - Gerekçe: Newsreader ekran okuması için çizilmiş editoryal bir serif. Müze/katalog etiketi hissi veriyor, orta boylarda (24–48px) da okunaklı. Optik boyut ekseni sayesinde iri başlıkta zarif, küçükte sağlam kalıyor.
  - Elenenler: Cormorant Garamond'da "â î û" şapkaları test görselinde bozuk çıktı, x-yüksekliği de küçük. Fraunces fazla karakterli, eserle yarışır.
- **Kurumsal:** başlık ve gövde **Inter**, künye/ölçü/yıl için **IBM Plex Mono**. Teknik föy hissi verir, rakamlar hizalı durur.
- **Test kanıtı:** `fontTools` ile 7 ailenin cmap'inde `ğĞıİşŞçÇöÖüÜâÂîÎûÛ` tek tek kontrol edildi, hepsi tam. `İ→Idotaccent`, `ı→dotlessi` doğru. Örnek görsel: `preview-shots/font-turkce-test.png`. Tarayıcıda gerçek sayfa ekran görüntüsüyle de doğrulanacak.

| | Galeri | Kurumsal |
|---|---|---|
| Zemin / metin / vurgu | `#FAFAF8` / `#2C2C2C` / **nötr** `#2C2C2C` (25.07 kararı korunur: renk fotoğraftan gelir) | `#F5F6F5` / `#1E2226` / petrol `#1F4E5A` |
| Izgara | mevcut kare duvar, bol boşluk | katı 12 kolon, 4:3 kartlar, 01–NN numaralı projeler, ince çizgiler |
| Künye | serif başlık + etiketler | mono rakamlı spec tablosu öne çıkar |
| Hareket | mevcut yavaş fade/zoom (700ms) | 150ms opaklık, zoom yok |
| CTA | "Bu eser hakkında bilgi al", "Özel sipariş" | "Proje görüşmesi talep et" |

## 5. Adres planı → KARAR: iki ayrı alan adı, iki ayrı Vercel projesi
Çağrı'nın 10.10 netleştirmesi: **şimdilik domain'e takılma.** İki site Vercel'de **iki ayrı proje** olarak durur ve vercel.app adresleriyle gösterilir. Domain bağlama en sona kalır. Muhtemel dağılım: `uarttasarim.com` → galeri; kurumsal için yeni alan adı.

- Projeler: `uart-galeri` (`UART_SITE=galeri`) ve `uart-kurumsal` (`UART_SITE=kurumsal`). Kod tabanı aynı.
- Çapraz bağlantılar için her iki projede `UART_GALERI_DOMAIN` / `UART_KURUMSAL_DOMAIN` = ilgili vercel.app adresi.
- Domain gelince: Vercel'de domain eklenir, bu iki değişken alan adıyla değiştirilir, DNS çevrilir. Kodda değişiklik yok.
- Mevcut `sanat-galeri` projesine (eski tek-site demo) dokunulmadı.

## 6. Uygulama sırası
1. **Kod (bu tur, `iki-site` dalı, push yok):**
   - proxy ve site çözümü, kurumsal sayfalar, galeride kategori süzme
   - `/teknik` kaldırılır, metni `/koleksiyonlar/antik-donem-replikalari`'na taşınır
   - 301'ler, fontlar ve token'lar
   - admin'de kurumsal açıklama alanı
   - migration dosyası ve testler
2. **Çağrı onayı gereken DB işleri** (hazır SQL, uygulanmadı):
   - additive migration
   - Troya/Troia düzeltmesi (TR "Troya", EN "Troia")
   - 3 sahte basın kaydının silinmesi
3. **İçerik (`is_visible=false`):**
   - heykeller (68 fotoğraf) ve 4 yeni pano
   - yapım/montaj fotoğrafları (96)
   - 8 sergi
   - CV'lerden biyografi
4. **Önizleme → Çağrı onayı → prod deploy ve görünürlük aynı turda → domain bağlama.**

## 7. Açık konular (sheet/kararlarla cevaplanmamış olanlar)
- Masalın Hafızası'nın 6 alt-serisinde ve Anadolu Ekininde Güzeller'de eser bazında metin/künye yok. **Kurumsal metinler hiçbir heykel için yok**, yazılması gerekiyor (sanatçı/Çağrı).
- TR açıklamada "Truva Savaşı" geçiyor: sanatçının ifadesi, Troia/Troya kararının konusu değil — DOKUNULMADI.
