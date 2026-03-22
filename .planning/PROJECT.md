# U-Art Tasarım — Sanat Atölyesi Web Projesi

## What This Is

İki sanatçının (Melike ve Şeref) ortak sanat atölyesi için çok alanlı (multi-domain) web platformu. Ana site (uarttasarim.com) ürün vitrini ve e-shop işlevi görürken, her sanatçının kendi subdomain'i (melike.uarttasarim.com, seref.uarttasarim.com) kişisel CV/portfolyo sayfası olarak çalışır. İleride subdomain'ler bağımsız domain'lere yönlendirilecek. Admin panelinden ürünler, CV içerikleri ve gelen mesajlar yönetilir.

## Core Value

Sanatçıların eserlerini sade, galeri kalitesinde bir vitrinde sergileyip potansiyel alıcılarla iletişim kurmasını sağlamak.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Ana site: ürün vitrini (kategorili, fiyatlı, görselli)
- [ ] Ana site: iletişim/WhatsApp yönlendirmesi (satın alma için)
- [ ] Sanatçı CV sayfaları: biyografi + fotoğraf
- [ ] Sanatçı CV sayfaları: portfolyo galerisi
- [ ] Sanatçı CV sayfaları: sergiler/etkinlikler/ödüller listesi
- [ ] Sanatçı CV sayfaları: sanatçıya özel iletişim formu
- [ ] Admin paneli: ürün yönetimi (CRUD + fotoğraf yükleme)
- [ ] Admin paneli: CV içerik düzenleme
- [ ] Admin paneli: gelen mesajları görüntüleme
- [ ] Çoklu dil desteği (TR + EN)
- [ ] Multi-domain yapı (ana site + 2 subdomain)
- [ ] Minimal beyaz, tipografi odaklı tasarım

### Out of Scope

- Online ödeme entegrasyonu — v1'de vitrin modeli, satın alma iletişimle
- Sipariş takip sistemi — ödeme olmadığı için gereksiz
- Üyelik/kayıt sistemi — sadece admin girişi yeterli
- Blog/haber bölümü — odak ürün vitrini ve CV'lerde
- Mobil uygulama — responsive web yeterli

## Context

- İki sanatçı: Melike ve Şeref — karma ürün yelpazesi (tablo, heykel, seramik, baskı vb.)
- Ürünler kategorilere ayrılacak, her ürünün fiyatı ve görselleri olacak
- Vitrin modeli: kullanıcı ürünü beğenirse iletişim kurar (WhatsApp/form)
- Subdomain yapısı: uarttasarim.com (ana), melike.uarttasarim.com, seref.uarttasarim.com
- İleride subdomain'ler farklı ana domain'lere yönlendirilecek (DNS alias)
- Tasarım: minimal beyaz zemin, bol boşluk, tipografi odaklı — galeri estetiği

## Constraints

- **Tech stack**: Next.js, React, TypeScript, Tailwind CSS
- **Hosting**: Vercel (otomatik deploy)
- **Repository**: GitHub
- **Database**: Vercel ekosisteminden seçilecek (Vercel Postgres veya uygun alternatif)
- **Görsel depolama**: Vercel Blob Storage veya uygun çözüm
- **Domain yapısı**: 3 subdomain → ileride 3 bağımsız domain

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vitrin modeli (ödeme yok) | v1 için basitlik, sanatçılar kişisel iletişim tercih ediyor | — Pending |
| Multi-domain Next.js | Tek codebase, middleware ile domain routing | — Pending |
| Vercel ekosistemi DB | Supabase fazla, Vercel-native çözüm daha entegre | — Pending |
| TR + EN çoklu dil | Uluslararası erişim için İngilizce gerekli | — Pending |

---
*Last updated: 2026-03-22 after initialization*
