# U-Art Tasarım — Sanat Atölyesi Web Projesi

## What This Is

İki sanatçının (Melike ve Şeref) ortak sanat atölyesi için çok alanlı (multi-domain) web platformu. Ana site (uarttasarim.com) kategori filtreli eser vitrini, lightbox galerisi ve WhatsApp/form ile iletişim sunar. Her sanatçının kendi subdomain'i (melike.uarttasarim.com, seref.uarttasarim.com) profesyonel CV/portfolyo sayfası olarak çalışır — biyografi, sergiler, ödüller, eğitim, sanatçı beyanı ve basın bölümleri ile. Admin panelinden eser CRUD, CV düzenleme ve mesaj yönetimi yapılır. Tüm sayfalar TR + EN olarak erişilebilir.

## Core Value

Sanatçıların eserlerini sade, galeri kalitesinde bir vitrinde sergileyip potansiyel alıcılarla iletişim kurmasını sağlamak.

## Requirements

### Validated

- ✓ Ana site: ürün vitrini (kategorili, fiyatlı, görselli) — v1.0
- ✓ Ana site: iletişim/WhatsApp yönlendirmesi (satın alma için) — v1.0
- ✓ Sanatçı CV sayfaları: biyografi + fotoğraf — v1.0
- ✓ Sanatçı CV sayfaları: portfolyo galerisi — v1.0
- ✓ Sanatçı CV sayfaları: sergiler/etkinlikler/ödüller listesi — v1.0
- ✓ Sanatçı CV sayfaları: sanatçıya özel iletişim formu — v1.0
- ✓ Admin paneli: ürün yönetimi (CRUD + fotoğraf yükleme) — v1.0
- ✓ Admin paneli: CV içerik düzenleme — v1.0
- ✓ Admin paneli: gelen mesajları görüntüleme — v1.0
- ✓ Çoklu dil desteği (TR + EN) — v1.0
- ✓ Multi-domain yapı (ana site + 2 subdomain) — v1.0
- ✓ Minimal beyaz, tipografi odaklı tasarım — v1.0

### Active

(Next milestone — to be defined with `/gsd:new-milestone`)

### Out of Scope

- Online ödeme entegrasyonu — vitrin modeli yeterli, talep doğrulanınca değerlendirilecek
- Sipariş takip sistemi — ödeme olmadığı için gereksiz
- Üyelik/kayıt sistemi — sadece admin girişi yeterli
- Blog/haber bölümü — sergi listesi ve sanatçı beyanı aynı amaca hizmet ediyor
- Mobil uygulama — responsive web yeterli

## Context

- v1.0 shipped: 5,967 LOC TypeScript/TSX, 97 automated tests
- Tech stack: Next.js 16.2 + Drizzle ORM + Neon Postgres + Vercel Blob + next-intl 4.8 + next-auth v5
- İki sanatçı: Melike ve Şeref — karma ürün yelpazesi (tablo, heykel, seramik, baskı vb.)
- Vitrin modeli: kullanıcı ürünü beğenirse WhatsApp/form ile iletişim kurar
- Multi-domain: uarttasarim.com (ana) + melike/seref subdomain'leri
- İleride subdomain'ler bağımsız domain'lere yönlendirilecek (DNS alias — altyapı hazır)
- DB migrations (`0001` + `0002`) uygulanması ve seed data yüklenmesi gerekiyor
- Admin auth: CVE-2025-29927 defense-in-depth (middleware + server-side session check)

## Constraints

- **Tech stack**: Next.js 16.2, React 19, TypeScript, Tailwind CSS v4
- **Hosting**: Vercel (otomatik deploy)
- **Repository**: GitHub
- **Database**: Neon Postgres (Drizzle ORM)
- **Görsel depolama**: Vercel Blob Storage
- **Domain yapısı**: 3 subdomain → ileride 3 bağımsız domain

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vitrin modeli (ödeme yok) | v1 için basitlik, sanatçılar kişisel iletişim tercih ediyor | ✓ Good |
| Multi-domain Next.js middleware routing | Tek codebase, host header ile domain routing | ✓ Good |
| Neon Postgres + Drizzle ORM | Vercel-native, hafif, serverless uyumlu | ✓ Good |
| TR + EN çoklu dil (next-intl) | Uluslararası erişim, domain-based routing desteği | ✓ Good |
| _tr/_en bilingual DB columns | 2 dilde join table gereksiz, basit ve hızlı | ✓ Good |
| CVE-2025-29927 defense-in-depth | Middleware + server-side auth check her admin sayfada | ✓ Good |
| parseProductContext client extraction | Server Action'dan ayrıldı (client/server boundary) | ✓ Good |

---
*Last updated: 2026-03-26 after v1.0 milestone*
