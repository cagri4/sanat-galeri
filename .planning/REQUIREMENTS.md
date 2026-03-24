# Requirements: U-Art Tasarım

**Defined:** 2026-03-23
**Core Value:** Sanatçıların eserlerini sade, galeri kalitesinde bir vitrinde sergileyip potansiyel alıcılarla iletişim kurmasını sağlamak

## v1 Requirements

### Galeri (Ana Site)

- [x] **GAL-01**: Kullanıcı eserleri kategoriye göre filtreleyerek grid'de görüntüleyebilir
- [ ] **GAL-02**: Kullanıcı eser detay sayfasında başlık, teknik, boyut, yıl ve fiyat bilgilerini görebilir
- [ ] **GAL-03**: Kullanıcı eserleri lightbox ile tam ekran zoom yaparak inceleyebilir
- [x] **GAL-04**: Kullanıcı eser sayfasından WhatsApp ile ön doldurulmuş mesajla iletişim kurabilir
- [x] **GAL-05**: Kullanıcı eser sayfasından iletişim formu ile soru gönderebilir

### Sanatçı CV (Subdomain)

- [ ] **CV-01**: Kullanıcı sanatçının biyografisini ve fotoğrafını görebilir
- [ ] **CV-02**: Kullanıcı sanatçının portfolyo galerisini görüntüleyebilir
- [ ] **CV-03**: Kullanıcı sanatçının sergi listesini (solo/grup, ters kronolojik) görebilir
- [ ] **CV-04**: Kullanıcı sanatçının ödüllerini görebilir
- [ ] **CV-05**: Kullanıcı sanatçının eğitim geçmişini görebilir
- [ ] **CV-06**: Kullanıcı sanatçının beyanını (artist statement) okuyabilir
- [ ] **CV-07**: Kullanıcı sanatçının basın/yayın listesini görebilir
- [ ] **CV-08**: Kullanıcı sanatçıya özel iletişim formu ile mesaj gönderebilir

### Platform

- [x] **PLT-01**: Site 3 domain üzerinden çalışır (ana + 2 subdomain)
- [ ] **PLT-02**: Tüm sayfalar Türkçe ve İngilizce olarak görüntülenebilir
- [x] **PLT-03**: Tüm sayfalar mobil cihazlarda düzgün çalışır
- [ ] **PLT-04**: 3 domain arasında tutarlı navigasyon vardır
- [ ] **PLT-05**: SEO temelleri: sayfa başlıkları, meta açıklamalar, görsel alt text

### Admin

- [ ] **ADM-01**: Admin eser ekleyebilir, düzenleyebilir ve silebilir (fotoğraf yükleme dahil)
- [ ] **ADM-02**: Admin sanatçı CV içeriklerini düzenleyebilir
- [ ] **ADM-03**: Admin gelen mesajları görüntüleyebilir
- [x] **ADM-04**: Admin paneline güvenli giriş yapılabilir

## v2 Requirements

### Eser Durumu

- **STAT-01**: Eserlerde Mevcut/Satıldı durum etiketi görüntülenir
- **STAT-02**: Satılmış eserler arşiv olarak görünür kalır

### SEO / Pazarlama

- **SEO-01**: schema.org VisualArtwork yapılandırılmış veri
- **SEO-02**: hreflang etiketleri
- **SEO-03**: Vercel Analytics entegrasyonu

### İçerik

- **CONT-01**: Eser süreç notları (opsiyonel uzun açıklama)

### Domain

- **DOM-01**: Subdomain'ler bağımsız domain'lere yönlendirilir

## Out of Scope

| Feature | Reason |
|---------|--------|
| Online ödeme / checkout | v1'de vitrin modeli; satın alma WhatsApp/form ile |
| Kullanıcı hesapları / wishlist | Düşük trafik hacminde gereksiz karmaşıklık |
| Blog / haber bölümü | İçerik bakım yükü; sergi listesi aynı amaca hizmet eder |
| Sosyal medya auto-posting | API bakım maliyeti yüksek, düşük getiri |
| Canlı sohbet widget | Sayfa yükleme maliyeti; WhatsApp zaten anlık iletişim sağlar |
| Baskı/reprodüksiyon satışı | Orijinal eser odağını korumak için |
| Mobil uygulama | Responsive web yeterli |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GAL-01 | Phase 2 | Complete |
| GAL-02 | Phase 2 | Pending |
| GAL-03 | Phase 2 | Pending |
| GAL-04 | Phase 2 | Complete |
| GAL-05 | Phase 2 | Complete |
| CV-01 | Phase 4 | Pending |
| CV-02 | Phase 4 | Pending |
| CV-03 | Phase 4 | Pending |
| CV-04 | Phase 4 | Pending |
| CV-05 | Phase 4 | Pending |
| CV-06 | Phase 4 | Pending |
| CV-07 | Phase 4 | Pending |
| CV-08 | Phase 4 | Pending |
| PLT-01 | Phase 1 | Complete |
| PLT-02 | Phase 3 | Pending |
| PLT-03 | Phase 1 | Complete |
| PLT-04 | Phase 3 | Pending |
| PLT-05 | Phase 3 | Pending |
| ADM-01 | Phase 5 | Pending |
| ADM-02 | Phase 5 | Pending |
| ADM-03 | Phase 5 | Pending |
| ADM-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after roadmap creation — traceability mapped*
