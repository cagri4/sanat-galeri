# Kırık link / görsel raporu — 18 Kas 2026 (salt okuma, düzeltme yapılmadı)

Tarayıcı: `scripts/kirik-link-tara.py` (sitemap + /tr, /en'den başlayıp site içi tüm linkleri gezer; her `<a href>`, `<img src/srcset>`, og:image ve preload görselinin HTTP durumunu ölçer). Ham çıktı scratch'te (`kirik/tara.json`, `kirik/kurumsal.json`).

## Özet

| Site | Taranan sayfa | Kırık sayfa linki | Kırık görsel adresi | Etkilenen sayfa |
|---|---|---|---|---|
| uarttasarim.com (TR+EN) | 114 | **0** | **28** (4 fotonun bazı boyutları) | 4 (mainad TR/EN, the-trees-first-home TR/EN) |
| uart-kurumsal.vercel.app (duvar panoları buraya yönleniyor) | 70 | **0** | **2.341 / 2.455** (235 fotonun 234'ü, logo dahil) | **70 / 70** |

- **404/500 dönen sayfa linki yok.** Menü, footer, eser, koleksiyon ve sergi linklerinin hepsi 200 dönüyor. Duvar panosu linkleri Kurumsal'a 308 ile yönleniyor ve orada 200 dönüyor.
- **Kırıkların tamamı tek sebepten:** HTTP **402**, `x-vercel-error: OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`.

## Sebep

Sitedeki görseller Next.js `<Image>` ile Vercel'in görsel optimizasyonundan (`/_next/image?url=…`) geçiyor. Vercel hesabının (team_XERq…) **görsel optimizasyon kotası dolmuş**. Vercel artık yeni boyut üretmiyor, 402 dönüyor.

- **Kaynak dosyalar sağlam.** Cloudinary'deki asıl dosyalar 200 dönüyor (ör. `uarttasarim-mainad-sigillata-replica-2.jpg`). Hiçbir dosya silinmemiş.
- **uarttasarim.com neden çoğunlukla çalışıyor:** görseller daha önce üretilip Vercel önbelleğine girmiş (`x-vercel-cache: HIT`). Kırılanlar, hiç önbelleğe girmemiş boyutlar:
  - **mainad** eserinin 3 karesi (`mainad-sigillata-replica-2`, `-3`, `mainad-terra-sigillata-replica`), tüm boyutlarda. Bu kareler 10 Kas'ta yüklenmişti. Şu an Mainad sayfasında 4 fotonun 3'ü görünmüyor.
  - **the-trees-first-home-4.jpg** yalnız 2048 px boyutunda; büyük ekranda büyütülünce görünmez.
- **Kurumsal neden tamamen kırık:** trafiği az olduğu için önbellekte neredeyse hiçbir şey yok; logo bile 402.

**Tahmin edilen sebeplerin durumu:**
- **14 Kas Drive senkronu (29 takas):** sebep değil. Takasla görünür olan karelerin hepsi 200 dönüyor; 14 Kas'ta açıp önbelleğe aldığımız için.
- **Ad/slug değişikliği:** sebep değil. Kırık sayfa linki yok.
- **Silinmiş Blob dosyası:** sebep değil. Kaynak dosyalar duruyor.
- **2017–2022 eski site adresleri:** siteden bunlara link yok. Doğrudan açılınca `/galeri.asp` ve `/default.asp` → 307 → 404, `/siteresim/…` → 404. Bu bilinen durum (Yandex maddesi); kırık iç link değil.

**Doğrulanmadı:**
- Kotanın ne zaman dolduğu.
- Ay başında sıfırlanıp sıfırlanmadığı.
- Planın tam limiti.

Bunlar Vercel panelinde (Usage → Image Optimization) görünür; CLI'dan bakamadım.

**Risk:** Önbellekteki görseller süresi dolunca yeniden üretilmek istenecek ve 402 alacak. Kota yenilenmezse uarttasarim.com'daki görseller zamanla tek tek kırılır.

## Ablam'ın 14 Kas istekleri uygulanırsa bu kırıklar düzelir mi?

**Hayır, tersine çoğalır.** Ablam'ın planı (`scripts/sql/2026-11-18-ablam-drive.sql`) 27 yeni kare yüklüyor. Bunlar hiç önbelleğe girmediği için hepsi 402 ile kırık görünür. **Görsel sorunu ayrı bir düzeltme ister ve Ablam'ın foto planından ÖNCE yapılmalı.**

## Önerilen düzeltme (Çağrı onayı + deploy gerekir)

**Seçenek A — önerilen, ücretsiz.** Görselleri Vercel yerine Cloudinary'nin kendi boyutlandırmasından geçir:
- `next.config.ts` içinde `images: { loader: 'custom', loaderFile: './src/lib/cloudinary-loader.ts' }`.
- Loader, `res.cloudinary.com` adreslerine `/upload/f_auto,q_auto,w_<genişlik>/` ekler. Yerel dosyaları (`/brand/uart-logo.png` vb.) olduğu gibi döner.
- Denendi: `…/upload/f_auto,q_auto,w_640/…/mainad-sigillata-replica-2.jpg` → **200**.
- Kod iki sitede ortak; galeri ve kurumsal projelerinin ikisine de deploy gerekir.
- Cloudinary ücretsiz planının dönüşüm kredisi bu trafiği karşılar mı: **doğrulanmadı**. Site küçük olduğu için büyük olasılıkla karşılar.

**Seçenek B — ücretli.** Vercel Pro'ya geçmek ya da kota satın almak. Ücretli olduğu için Çağrı kararı.

**Seçenek C — geçici.** `images: { unoptimized: true }`. Görseller tam boy iner, sayfalar ağırlaşır. Önerilmez.

**Geri alma notu:**
- A ve C tek commit'tir. Geri almak için `git revert <commit>` ve iki projeye yeniden `vercel deploy --prod`.
- Veritabanına dokunmaz; görsel adresleri DB'de değişmez.

## Sıra önerisi
1. Seçenek A: kod, preview, Çağrı onayı, iki projeye prod deploy. Ardından tarayıcıyı yeniden çalıştırıp 402 = 0 doğrulanır.
2. Sonra Ablam'ın foto planı: `scripts/g18-yukle.py`, ardından SQL. Önizleme: https://claude.ai/artifact/PNsH7ycKiZbJK6X9nP1iDu

## UYGULANDI — 18 Kas (Çağrı onayı)

**1) Görsel düzeltmesi (Seçenek A)** — commit `27177f3`. `src/lib/cloudinary-loader.ts` (`f_auto,q_auto,c_limit,w_<genişlik>`) + `next.config.ts` loader satırları.
- galeri ve kurumsal projelerine prod deploy; ikisi de `vercel-bekle.sh` ile READY, commit eşleşti.
- Yeniden tarama (tarayıcının srcset ayrıştırıcısı da düzeltildi: Cloudinary adresindeki virgül URL'ye ait):

| Site | Önce kırık görsel adresi | Sonra | Foto |
|---|---|---|---|
| uarttasarim.com | 28 (4 foto) | **0** / 3.054 | 308 foto, hepsi 200; eski 4 kırık (mainad ×3, trees-first-home-4) 200 |
| uart-kurumsal | 2.341 (234 foto) | **0** / 2.342 | 235 foto (logo dahil), hepsi 200 |

- Sayfalarda artık `/_next/image` yok; Vercel görsel kotası kullanılmıyor.
- **Geri alma:** `git revert 27177f3` → iki projeye `vercel deploy --prod` (scratch worktree + `.vercel/project.json`). DB'ye dokunmaz.
- **Kapsam dışı, açık:** `uart-seref.vercel.app` (Şeref şablonu, ayrı proje) aynı 402 ile kırık (52/52 görsel). "Şeref'e dokunma" gereği deploy edilmedi. Çağrı kararı.

**2) Ablam foto planı + başlıklar** — `scripts/sql/2026-11-18-ablam-drive.sql` uygulandı.
- Yedek: `arsiv/yedek-2026-11-18/` (product_images 503, products 51 satır, CSV).
- 27 kare Cloudinary'ye yüklendi (`g18-yukle.py`, 27/27 → 200). SQL: 27 INSERT + 62 UPDATE, hepsi 1 satır.
- DB↔plan: 12 eserde görünür sıra planla **0 fark**.
- Başlıklar: the-turning-sky → **Dünya Dönerken / As the World Turns**; volutlu-krater → **Volütlü Krater (Fransua Vazosu) / Volute Krater (François Vase)**.
- Canlı: 10 antik eser TR+EN sayfasında yeni karelerin hepsi var, görseller 200; Troya sayfasında (Kurumsal) Drive'daki 5 kare var, gizlenen 6 yok.
- **Not:** Şeref sayfasının seçimindeki (`seref-studio.ts`) Troya 229/232/237/241, Çan Krater 483 ve Tören Kabı 518 artık gizli. Sayfa kodu bu durumda eserin ilk görünür karelerine düşüyor; kod değiştirilmedi.
- **Geri alma:** `psql "$DB" -f scripts/sql/2026-11-18-ablam-drive-GERI-AL.sql` (başlıklar dahil; yeni 27 satırı siler, eski görünürlük/sıra döner). Cloudinary'deki 27 dosya referanssız kalır, silinmesi gerekmez.
