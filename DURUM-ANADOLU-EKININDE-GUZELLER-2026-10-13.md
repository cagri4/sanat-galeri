# DURUM RAPORU — "Anadolu Ekininde Güzeller" · 13 Ekim 2026

> **Kaynak:** `GOREV-ANADOLU-EKININDE-GUZELLER.md`, sanatçının WhatsApp mesajı (13 Eki 18:47–18:48)
> **Durum:** Yalnızca okuma yapıldı. Veritabanı, Drive, Cloudinary ve kod değişmedi.

## 1. Bugünkü yapı

**Veritabanında seri zaten ayrı.** Seriler `products.collection` adlı bir metin alanıyla modellenmiş; ayrı bir koleksiyon tablosu ya da etiket yok.

| Koleksiyon değeri | Eserler |
|---|---|
| `Masalın Hafızası — Anka Serisi` | Anka I–V (5) |
| `Masalın Hafızası — Şahmaran Serisi` | Şahmaran I–IV (4) |
| `Masalın Hafızası` | Derviş, Dev, Devanası, Keloğlan, Padişah, Şehzade (6) |
| `Anadolu Ekininde Güzeller` | **Tek kayıt** (id 56, `anadolu-ekininde-guzeller`), 9 fotoğraf (`product_images` 590–598) |

**Sitede neden "Masalın Hafızası içinde" görünüyor?** Ölçüm canlı sitede, 13 Eki:

| Sayfa | Durum |
|---|---|
| Galeri → Koleksiyonlar → Seramik Heykeller | Ayrı başlık var, ama 15 kartlık Masalın Hafızası ızgarasının altında tek kart; kolay gözden kaçıyor |
| Galeri `/galeri` (Tümü) | **Seri başlığı yok**, 16 heykel tek liste |
| Kurumsal → Projeler → Heykeller | **Seri başlığı yok**, 01–16 numaralı tek liste. Anadolu en sonda "16" olarak duruyor |
| Ana sayfa "Koleksiyon seçkileri" | Ayrı sekme (sorun yok) |
| Eser sayfası | Koleksiyon "Anadolu Ekininde Güzeller" (sorun yok) |

**Sonuç:** Sorun veride değil, gösterimde. Ayrıca seri **tek eser** olarak girilmiş. Bu yüzden 15 ayrı eseri olan Masalın Hafızası'nın yanında "bir eser daha" gibi duruyor.

## 2. Drive'da ne değişmiş

Klasör: `Galeri/Heykeller/"Anadolu Ekininde Güzeller" Seramik Heykel Serisi`. Sanatçı 13 Eki 19:21–19:38 (TR saati) arasında klasörü **tamamen yenilemiş**.

| | 1 Eki (içe aktarılan) | 13 Eki (şimdi) |
|---|---|---|
| Fotoğraf | 9 adet `Anadolu ekininde güzeller*.jpg` (+ hiç alınmamış bir `…10.jpg`) | **17 adet, hepsi yeni** |
| Metin | `Anadolu Güzelleri serisi1.docx` (1 Eki) | `Anadolu Güzelleri serisi.docx` (dosya tarihi 29 Tem, bugün yüklendi) |
| Eskiler | — | Klasörde **yok**. `…7.jpg`'nin bir kopyası `Studio/Sergiler/Nüve Nucleus…` klasöründe duruyor |

**Karşılaştırma (algısal hash, dHash):**
- Yeni 17 karenin hiçbiri eski 9 kareyle aynı değil; en yakın eşleşme bile belirgin şekilde farklı (dHash ≥ 16/64).
- Eski kareler 2008 *Nüve / Nucleus* açık hava sergisinden: Marina, deniz kenarı, kaideler.
- Yeniler eserlerin tek tek, stüdyoda ya da ayrı ayrı çekilmiş fotoğrafları.
- Görseller: scratchpad `aeg-eski.png` ve `aeg-yeni.png`.

**Yeni dosyalar, dosya adına göre gruplanmış hali.** ⚠️ Eser adı olduğu doğrulanmadı; yalnızca dosya adı:

| Görünen eser | Dosyalar |
|---|---|
| Nüve | `Nüve.jpg`, `Nüve.1.jpg` |
| Nüve 2 | `Nüve2.jpg`, `Nüve2.1.jpg` |
| Nüve 3 | `Nüve3.jpg` |
| Nüve 4 | `Nüve4.jpg` |
| Nüve 5 | `Nüve5.jpg`, `Nüve5.1.jpg`, `Nüve5.2.jpg` |
| Nüve 6 | `Nüve6.jpg`, `Nüve6.1.jpg` |
| Üç Güzeller | `üç güzeller17x27x70cm.jpg` (**ölçü dosya adında: 17 × 27 × 70 cm**), `Üç güzeller ayrıntı.jpg`, `…ayrıntı1.jpg` (373 px, küçük) |
| Aşk | `Aşk.jpg` |
| Angel | `Angel.jpg`, `Angel-1.jpg` |

**Yeni metin farklı.**
- Bugünkü sitedeki metin, 1 Eki'deki `serisi1.docx` dosyasından geliyor: uzun, "Nüve / Nucleus" fikri üzerine, TR/EN.
- Yeni `serisi.docx` daha kısa ve başka bir eksene oturuyor: **Anadolu ana tanrıça imgeleri**, dişil varoluş.
- Başlığı da farklı: **"Anadolu Güzelleri"**.
- İngilizcesi yok.

## 3. Ayırmanın seçenekleri ve maliyeti

| | Ne yapılır | Veri değişikliği | İş | Risk |
|---|---|---|---|---|
| **A. Gösterim** | Kurumsal Heykeller sekmesi ve `/galeri` heykel bölümü **seri başlıklarıyla** gruplanır (Masalın Hafızası / Anadolu Ekininde Güzeller); numaralandırma seri içinde başlar. Galeri koleksiyon sayfasında seri başlıkları daha belirgin olur. Menü değişmez | Yok | ~1–2 saat | Düşük |
| **B. Eser bazında bölme** | Tek kayıt yerine her eser ayrı kayıt olur (Anka I–V gibi): ~9 eser | 1 kayıt → ~9 kayıt; eski kayıt gizlenir (silinmez) | ~yarım gün | **Orta-yüksek:** eser adları, ölçüleri ve kurumsal metinler sanatçıdan gelmeli; dosya adından ad uydurmak yasak |
| **C. Menüye ayrı başlık** | Galeri → Heykeller altında iki seri bağlantısı | Yok | ~1 saat | Bugün canlıya alınan menüyü değiştirir; ayrıca onay gerekir |

**Önerim:**
- Hemen **A**, fotoğraflar tek kayıt içinde yenilenir (§4).
- **B**, sanatçı eser adlarını teyit edince yapılır.
- **C** gerekmiyor; A sorunu çözüyor.

## 4. Fotoğraf yenileme planı ("silme, gizle")

⚠️ **Engel:** `product_images` tablosunda **görünürlük alanı yok** (`is_visible` yok). Fotoğraf "gizlemek" bugün mümkün değil. Aynı engel temas tablosu işi için de geçerli.

1. **Küçük şema değişikliği:** `product_images.is_visible boolean not null default true`.
   - Varsayılan `true` olduğu için mevcut hiçbir şey değişmez.
   - Sorgular `is_visible = true` filtresi alır.
   - Geri alma SQL'i yazılır.
   - ~1 saat. **Onay gerekir:** veri modeli değişikliği.
2. **Yükleme:** 17 yeni fotoğraf Cloudinary'ye yüklenir (`uarttasarim/heykel/anadolu-ekininde-guzeller-2026-10-<n>`). Ardından id 56'ya yeni `product_images` satırları eklenir. Kapak `üç güzeller17x27x70cm.jpg` olur (önerim; değiştirilebilir).
3. **Gizleme:** Eski 9 fotoğraf (590–598) `is_visible = false` yapılır. **Silinmez**; Cloudinary'de ve DB'de durur.
4. **Ölçü:** Ölçü yalnız *Üç Güzeller* için var (dosya adından). Seri tek kayıtsa ölçü alanına yazılmaz, çünkü serinin ölçüsü değil. B'de o esere yazılır.
5. **Yayın:** Ekran görüntüsü → onay → deploy → `vercel-bekle.sh <klasör> <hash>`.

## 5. Sorular

**Çağrı için:**
1. A (gösterim) + fotoğraf yenileme ile başlayayım mı?
2. `product_images.is_visible` şema değişikliğini onaylıyor musun? Hem bu iş hem temas tablosu için gerekli.
3. Eski 9 kare 2008 *Nüve / Nucleus* sergisinin fotoğrafları. Gizlemenin yanında Sergiler sayfasındaki 2008 Nüve sergisi karelerine de eklensin mi?

**Sanatçı için (Çağrı iletir):**
4. Serinin adı: **"Anadolu Ekininde Güzeller"** mi (klasör, site, 2017 Bursa sergisi), **"Anadolu Güzelleri"** mi (yeni metnin başlığı)?
5. Metin: Sitedeki uzun metin (Nüve / Nucleus ekseni) yerine yeni kısa metin (ana tanrıça ekseni) mi kullanılsın?
6. Eserler ayrı ayrı mı gösterilsin? Öyleyse adları dosya adlarındaki gibi mi: Nüve, Nüve 2–6, Üç Güzeller, Aşk, Angel? Ölçü ve yıl bilgileri var mı?

## Ek — Ara soru: admin'den dışarıdan düzenleme var mı? (salt okuma)

- **İz alanları:** Tablolarda `updated_at`, "kim değiştirdi" ya da audit alanı **yok**.
  - `created_at` yalnız `products`, `artists`, `exhibition_photos` ve `messages` tablolarında var.
  - `product_images` ve `exhibitions` tablolarında hiç zaman damgası yok.
  - Sonuç: **sonradan yapılan düzenlemeler (UPDATE) veritabanından izlenemez.**
- **Oluşturma tarihleri:** Hepsi bilinen script çalıştırmalarıyla eşleşiyor.
  - `products`: 19 Tem (10), 26 Tem (20), 11 Eki 10:30 (20, bizim Drive içe aktarması)
  - `artists`: 27 Mar (2)
  - `exhibition_photos`: 26 Tem (13), 11 Eki (123)
  - `messages`: 0
- **İçerik karşılaştırması:**
  - 16 heykelin kurumsal metni, bizim yazdığımız JSON ile birebir aynı.
  - Ana sayfa hero sırası (9 eser) seed script'inden farklı. Ancak 26 Tem 15:25'te Çağrı'nın Telegram'dan yönettiği bir "sanat worker" oturumunda değiştirildiği kayıtlı. Yani bizim.
- **Admin kullanıcıları:**
  - Veritabanında kullanıcı **yok**. Giriş, `.env`'deki **tek** kullanıcı adı/şifre çiftiyle yapılıyor (`src/auth.ts`).
  - Supabase `auth.users` 0, `auth.sessions` 0, `audit_log_entries` 0.
  - Giriş kaydı tutulmadığı için **"son giriş" bilinemez**.
  - Vercel istek günlüklerine bakılmadı (saklama süresi kısa).
- **Sonuç:** Dış düzenleme belirtisi yok. Ancak sistem düzenlemeyi kaydetmediği için bu kesin değil, "kanıt yok" demek.
