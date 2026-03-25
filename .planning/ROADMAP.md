# Roadmap: U-Art Tasarım

## Overview

Tek bir Next.js kod tabanından üç domain'e hizmet eden sanat galerisi ve sanatçı CV platformu. Sıralama; her şeyin üzerine inşa edildiği altyapı temelinden başlar, galeri vitriniyle ana değeri teslim eder, i18n ve navigasyonla platform uyumunu sağlar, sanatçı CV sayfalarıyla subdomain deneyimini tamamlar ve admin paneliyle içerik yönetimini mümkün kılar.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Multi-domain routing, veritabanı şeması, görsel depolama ve admin auth altyapısı (completed 2026-03-23)
- [x] **Phase 2: Ana Galeri** - Kategori filtreli ürün vitrini, eser detay sayfası, lightbox, WhatsApp ve iletişim formu (completed 2026-03-24)
- [x] **Phase 3: Platform (i18n + Nav + SEO)** - TR/EN dil desteği, domain arası tutarlı navigasyon ve SEO temelleri (completed 2026-03-25)
- [ ] **Phase 4: Sanatçı CV Subdomainleri** - İki sanatçıya ait biyografi, portfolyo, sergi/ödül/eğitim, artist statement ve iletişim formu
- [ ] **Phase 5: Admin Paneli** - Eser CRUD, CV içerik düzenleme ve mesaj gelen kutusu

## Phase Details

### Phase 1: Foundation
**Goal**: Üç domain'den gelen istekler doğru route group'a ulaşır, veritabanı şeması ve görsle depolama hazırdır, admin girişi güvenlidir
**Depends on**: Nothing (first phase)
**Requirements**: PLT-01, PLT-03, ADM-04
**Success Criteria** (what must be TRUE):
  1. uarttasarim.com, melike.uarttasarim.com ve seref.uarttasarim.com üçü de aynı Vercel deployment'ından doğru içeriği sunar
  2. Lokal geliştirmede `?tenant=` parametresiyle subdomain davranışı simüle edilebilir
  3. Admin `/admin` rotasına giriş yapmadan erişmeye çalışmak login sayfasına yönlendirir ve server-side session kontrolü her admin Server Component'inde çalışır
  4. Tüm sayfalar 320px–1440px ekran genişliğinde bozulmadan görüntülenir
  5. Veritabanı şeması ve migration pipeline çalışır; Vercel Blob'a test görseli yüklenip `next/image` ile görüntülenebilir
**Plans**: 3 plans
Plans:
- [ ] 01-01-PLAN.md — Project scaffold, dependencies, DB schema, test framework, i18n routing
- [ ] 01-02-PLAN.md — Middleware domain routing, responsive placeholder pages, routing tests
- [ ] 01-03-PLAN.md — Admin auth (next-auth v5), login page, server-side session check

### Phase 2: Ana Galeri
**Goal**: Ziyaretçiler eserleri kategoriye göre filtreleyerek inceleyebilir, detay sayfasında tüm bilgileri görebilir ve satın alma için iletişim kurabilir
**Depends on**: Phase 1
**Requirements**: GAL-01, GAL-02, GAL-03, GAL-04, GAL-05
**Success Criteria** (what must be TRUE):
  1. Kullanıcı kategori filtresiyle eserleri daraltabilir ve grid güncellenir
  2. Eser detay sayfasında başlık, teknik, boyut, yıl ve fiyat bilgileri eksiksiz görüntülenir
  3. Kullanıcı görsele tıklandığında lightbox açılır ve pinch-zoom ile tam ekran inceleyebilir
  4. "WhatsApp ile Sor" bağlantısı, eser adı ve sayfa URL'si ön doldurulmuş mesajla WhatsApp'ı açar
  5. Eser sayfasındaki iletişim formu gönderildiğinde mesaj veritabanına kaydedilir ve kullanıcı onay alır
**Plans**: 3 plans
Plans:
- [ ] 02-01-PLAN.md — Schema migration (new product columns), Drizzle relations, seed data, gallery queries, contact action, WhatsApp utility
- [ ] 02-02-PLAN.md — Gallery listing page with category filter and artwork grid
- [ ] 02-03-PLAN.md — Artwork detail page with lightbox, WhatsApp CTA, and contact form

### Phase 3: Platform (i18n + Nav + SEO)
**Goal**: Her sayfa Türkçe ve İngilizce olarak erişilebilir, üç domain arasında tutarlı navigasyon vardır ve temel SEO metadata her sayfada mevcuttur
**Depends on**: Phase 2
**Requirements**: PLT-02, PLT-04, PLT-05
**Success Criteria** (what must be TRUE):
  1. Dil değiştirici ile `/tr/` ve `/en/` yolları arasında geçiş yapılır; seçilen dil korunur
  2. Ana siteden sanatçı subdomain'lerine ve geri ana siteye geçiş linkleri her sayfada çalışır
  3. Her sayfanın benzersiz `<title>` ve meta açıklaması vardır; görsel `alt` metinleri doldurulmuştur
**Plans**: 2 plans
Plans:
- [ ] 03-01-PLAN.md — Translation JSON expansion, inline ternary replacement with t() calls across all components
- [ ] 03-02-PLAN.md — LanguageSwitcher + Navbar components, layout injection, SEO metadata on all pages

### Phase 4: Sanatçı CV Subdomainleri
**Goal**: Melike ve Şeref'in her biri kendi subdomain'inde profesyonel düzeyde biyografi, portfolyo ve CV bilgilerini sunar ve ziyaretçiler sanatçıyla doğrudan iletişim kurabilir
**Depends on**: Phase 3
**Requirements**: CV-01, CV-02, CV-03, CV-04, CV-05, CV-06, CV-07, CV-08
**Success Criteria** (what must be TRUE):
  1. Sanatçı subdomain'i açıldığında biyografi metni ve fotoğraf görüntülenir
  2. Portfolyo galerisi, ana galeriyle paylaşılan lightbox bileşeniyle çalışır
  3. Sergi listesi solo/grup ayrımıyla ters kronolojik sırada görüntülenir; ödüller, eğitim ve artist statement ayrı bölümler olarak mevcuttur
  4. Basın/yayın listesi varsa görüntülenir; yoksa bölüm gizlenir
  5. Sanatçıya özel iletişim formu gönderildiğinde mesaj o sanatçıya atanarak veritabanına kaydedilir
**Plans**: TBD

### Phase 5: Admin Paneli
**Goal**: Admin, eser ekleme/düzenleme/silme, sanatçı CV içeriklerini güncelleme ve gelen mesajları okuma işlemlerini panelden yapabilir
**Depends on**: Phase 4
**Requirements**: ADM-01, ADM-02, ADM-03
**Success Criteria** (what must be TRUE):
  1. Admin yeni eser oluşturabilir, fotoğraf yükleyebilir, bilgileri düzenleyebilir ve eseri silebilir; değişiklikler anında galeride yansır
  2. Admin her sanatçı için biyografi, sergi, ödül, eğitim ve artist statement alanlarını düzenleyebilir; değişiklikler CV sayfasına yansır
  3. Gelen mesajlar listesinde hangi esere veya sanatçıya ait olduğu ve gönderim tarihi görünür; admin mesajı okundu olarak işaretleyebilir
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete    | 2026-03-24 |
| 2. Ana Galeri | 3/3 | Complete    | 2026-03-24 |
| 3. Platform (i18n + Nav + SEO) | 2/2 | Complete    | 2026-03-25 |
| 4. Sanatçı CV Subdomainleri | 0/TBD | Not started | - |
| 5. Admin Paneli | 0/TBD | Not started | - |
