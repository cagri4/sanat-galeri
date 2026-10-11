# GERÇEK ALAN ADINA GEÇİŞ — SEO KONTROL LİSTESİ

> ⚠️ **Bu liste bitmeden alan adı geçişi "bitti" sayılmaz.**
> Kaynak: Çağrı kararı (11.10.2026) + hafıza kuralı `feedback_seo_migration_on_redesign`.
> Xanthos dersi (28.05.2026): Redesign'da 301, sitemap ve GSC yapılmadı → eski URL'ler kırıldı, sitelinks gitti. Üçü birlikte şart.

## Bugünkü durum (11.10.2026)
- **Adresler geçici:**
  - https://uart-galeri.vercel.app — Vercel projesi `uart-galeri`
  - https://uart-kurumsal.vercel.app — Vercel projesi `uart-kurumsal`
- **İki site de bilerek İNDEKSLENMİYOR.** Gerekçe: Adres geçici, içerik yarım (heykeller, sergiler ve biyografiler eksik). Yarım içerik "ince içerik" izlenimi verir ve gerçek alan adına geçince iki adres birbiriyle yarışır.
- **noindex üç katmanda:**
  - `<meta name="robots" content="noindex, nofollow">`: `src/app/layout.tsx`
  - `X-Robots-Tag: noindex, nofollow` başlığı (görseller dahil her yanıtta): `next.config.ts`
  - `/robots.txt` → `Disallow: /`: `src/app/robots.ts`
- **Tek anahtar:** `UART_INDEXABLE` (`src/lib/seo.ts`). `true` değilse üçü de aktif.
- **Siteler açık, şifre yok:** Sanatçıya gösterilebilir, yalnızca arama motorları görmez.

## Geçiş günü — sırayla

### 1. Alan adını bağla
- [ ] Vercel'de domain ekle. Hangi proje: galeri mi, kurumsal mı? Çağrı'nın kararı (muhtemelen `uarttasarim.com` → galeri).
- [ ] DNS'i ikas'tan Vercel'e çevir (GoDaddy, `ns53/54.domaincontrol.com`).
- [ ] Projenin env'ini güncelle: `UART_GALERI_DOMAIN` / `UART_KURUMSAL_DOMAIN` = gerçek alan adları. **İki projede de.** Çapraz linkler bunlarla kurulur.

### 2. noindex'i kaldır
- [ ] İki projede `UART_INDEXABLE=true` → **yeniden deploy**. Env tek başına yetmez; meta ve başlık build'de okunur.
- [ ] Doğrula:
  - `curl -sI https://<alan-adi>/tr | grep -i x-robots` → **boş** olmalı
  - `curl -s https://<alan-adi>/tr | grep -i 'name="robots"'` → **boş** olmalı

### 3. robots.txt'yi düzelt
- [ ] `curl https://<alan-adi>/robots.txt` → `Allow: /`, `/admin` ve `/api` Disallow.
- [ ] Sonuna `Sitemap: https://<alan-adi>/sitemap.xml` satırı eklensin (`src/app/robots.ts`).

### 4. sitemap.xml oluştur ve gönder
- [ ] `src/app/sitemap.ts`: her site **kendi** sayfalarını listeler.
  - Galeri: ana sayfa, galeri, koleksiyonlar, eserler, sanatçılar, sergi.
  - Kurumsal: projeler, süreç vb.
  - `is_visible=false` kayıtlar listeye girmez.
- [ ] TR ve EN adresleri, `alternates.languages` ile.
- [ ] `curl https://<alan-adi>/sitemap.xml` → 200 ve XML.

### 5. Google Search Console
- [ ] Her alan adı için **ayrı mülk** ekle (Domain property, DNS TXT ile doğrula).
- [ ] Sitemap'i gönder.
- [ ] Ana sayfa + koleksiyon/proje sayfaları için "URL denetimi → Dizine eklenmeyi iste".
- [ ] 1–2 hafta "Sayfalar" raporunda kırık ya da "noindex nedeniyle hariç" kalan var mı izle.

### 6. vercel.app adreslerinden gerçek alan adına 301
- [ ] `uart-galeri.vercel.app/*` → `https://<galeri-alan-adi>/*` (yol ve query korunarak) **301**.
- [ ] `uart-kurumsal.vercel.app/*` → `https://<kurumsal-alan-adi>/*` **301**.
- [ ] Nasıl:
  - Vercel → Project → Domains → vercel.app alanında "Redirect to" (308/301 seçimi), **ya da**
  - `src/proxy.ts`'e host kuralı.
- [ ] Doğrula: `curl -sI https://uart-galeri.vercel.app/tr/galeri` → `301` + `location: https://<alan-adi>/tr/galeri`.
- [ ] Eski tek-site demosu `sanat-galeri.vercel.app` (proje `sanat-galeri`): Kapatılsın mı, galeriye mi yönlensin? Karar Çağrı'nın.

### 7. canonical etiketleri
- [ ] Root layout'a `metadataBase: new URL('https://<alan-adi>')`. Proje başına, `UART_*_DOMAIN`'den.
- [ ] Her sayfaya `alternates.canonical`. Kanonik adres **her zaman gerçek alan adı**; vercel.app asla kanonik olmaz.
- [ ] Heykeller iki sitede var. Kanonik kendi sitesinde kalır, çünkü metinler farklı ve birbirinin kopyası değiller. Her biri kendi alan adını gösterir.

### 8. hreflang
- [ ] `alternates.languages: { tr: …/tr/…, en: …/en/… }` + `x-default` → `/tr`.
- [ ] (Bugün hreflang **yok**. Eklenince bu madde kontrol edilir.)

### 9. Eski ikas mağazası URL'leri
- [ ] `uarttasarim.com` bugün ikas'ta.
  - Google'da indeksli ikas URL'leri var mı? `site:uarttasarim.com` ve GSC'de eski mülk varsa oradan bak.
  - Varsa, bunlar için **301 haritası** çıkar: ürün → `/urun/<slug>` veya ilgili koleksiyon, diğerleri → ana sayfa.
  - **Bugün doğrulanamadı.**

### 10. Son kontrol
- [ ] JSON-LD (`VisualArtwork` / `CreativeWork`) eser ve proje sayfalarında.
- [ ] Her sayfanın özgün `<title>` + `description` değeri var.
- [ ] Bir hafta sonra GSC'de dizine eklenen sayfa sayısı ile sitemap sayısını karşılaştır.
