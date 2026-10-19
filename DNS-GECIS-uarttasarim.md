# uarttasarim.com → Vercel (uart-galeri) geçişi · 19 Ekim 2026

> Durum: **hazırlık**. Hiçbir DNS/NS/Vercel ayarı değişmedi. GoDaddy'ye girilmedi.

## 1. Hangi site
`uarttasarim.com` + `www` → **Uart Galeri** (Vercel projesi `uart-galeri`, prj_k9YoBnIUlgQsmLtP0j0QJpX4pkGs).
Gerekçe: PLAN-IKI-SITE-2026-10-10 §5 ve SEO-GECIS-KONTROL §1 ("uarttasarim.com → galeri"); bireysel siteler henüz kurulmadı (PLAN-BIREYSEL-SITELER).
Production deploy hazır: ed19199, READY. Deployment Protection: `all_except_custom_domains` → özel alan adında **giriş duvarı yok** (değişiklik gerekmez).

## 2. GoDaddy'deki mevcut kayıtlar (dig @ns53 ve @ns54.domaincontrol.com, ikisi aynı)
| Ad | Tür | Değer | Ne |
|---|---|---|---|
| @ | A | 75.2.120.200 | ikas (AWS Global Accelerator). Bugün accounts.ikas.com'a yönlendiriyor, mağaza açık değil |
| www | CNAME | dns.myikas.com | ikas |
| @ | TXT | google-site-verification=DD_1Fyp8D7WKj8crwAU2r9i1kKDN72A8s7c1-auSNbw | **Google Search Console sahiplik kaydı — korunmalı** |
| _domainconnect | CNAME | _domainconnect.gd.domaincontrol.com | GoDaddy'ye özgü Domain Connect; GoDaddy dışında işlevi yok, taşınmaz |
| @ | MX | **yok** | Bu alan adında e-posta YOK (melike@/seref@uarttasarim.com çalışmıyor) |
| @ | AAAA, CAA, SRV | yok | |
SOA: ns53.domaincontrol.com, seri 2024030700. 60+ yaygın alt alan adı denendi (mail, webmail, autodiscover, _dmarc, *._domainkey, shop…) → yok.
Sertifika şeffaflık kaydı (certspotter): yalnız `uarttasarim.com` ve `www.uarttasarim.com`.

## 3. Cloudflare'e taşınacaklar
**Aşama A — birebir kopya (NS değişimi tek başına hiçbir şeyi değiştirmesin):**
- A `@` 75.2.120.200 (DNS only)
- CNAME `www` dns.myikas.com (DNS only)
- TXT `@` google-site-verification=DD_1Fyp8D7WKj8crwAU2r9i1kKDN72A8s7c1-auSNbw

**Aşama B — ikas → Vercel (rc onayıyla, Cloudflare'de geri alınabilir kayıt değişikliği):**
- A `@` → **76.76.21.21** (DNS only — Vercel SSL'i kendisi verir)
- CNAME `www` → **cname.vercel-dns.com** (DNS only)
- TXT google-site-verification **aynen kalır**
(Vercel API önerisi: recommendedIPv4 76.76.21.21, recommendedCNAME cname.vercel-dns.com)

## 4. Vercel tarafı (Aşama B ile birlikte)
- uart-galeri projesine domain ekle: `uarttasarim.com` (ana) + `www.uarttasarim.com` → 308 ana adrese
- Env, **iki projede**: `UART_GALERI_DOMAIN=uarttasarim.com` → yeniden deploy (çapraz linkler ve host yönlendirmesi). DNS geçmeden yapılırsa linkler ikas'a gider — o yüzden aynı anda.
- `NEXT_PUBLIC_MAIN_URL` değeri de gözden geçirilmeli.

## 5. Açık karar — noindex
Site bugün bilerek **noindex** (UART_INDEXABLE yok). Alan adına geçince de noindex kalırsa Google'da görünmez.
SEO-GECIS-KONTROL §2–5: noindex kaldırma + sitemap + GSC aynı gün. **Çağrı kararı.**

## 6. Engel
CF-api token'ında `zone.create` yetkisi yok ("Requires permission com.cloudflare.api.account.zone.create").
Çözüm (Çağrı, biri): (a) Cloudflare panel → Add a domain → uarttasarim.com → Free plan → "manually add records" (kayıtları ben eklerim), ya da (b) token'a Account › Zone › Edit (zone oluşturma) yetkisi ver.
Zone açılınca Cloudflare 2 nameserver atar; GoDaddy'de NS değişimi Çağrı'nın adımı.

## 7. Güncelleme (19 Eki, rc talimatı)
rc kararı: Aşama A (ikas kopyası) YOK — Cloudflare'e doğrudan Vercel kayıtları + GSC TXT kurulacak.
Hazır script: `scripts/cf-uarttasarim.sh` (zone'u açmayı dener, 3 kaydı kurar, silmez, NS'leri yazdırır).
Vercel değerleri 19 Eki'de API'den yeniden doğrulandı: A 76.76.21.21, CNAME cname.vercel-dns.com.
Engel sürüyor: token'da zone.create yok; Chrome'da Cloudflare oturumu açık değil (giriş yapılmadı).
