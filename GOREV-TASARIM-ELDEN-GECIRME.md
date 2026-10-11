# GÖREV: U-Art sitelerinin tasarımını elden geçir — örnek: spodeharmony.com
Tarih: 11 Ekim 2026 · İsteyen: Çağrı · Sahibi: sanat worker
⏳ **SIRADAKİ İŞ** — önce eldeki işi bitir (3 SQL · Drive içe aktarma · heykel kurumsal metinleri).

## Çağrı'nın isteği
"Şu siteyi incele, güzel özellikleri var. Uart sitelerini elden geçirme önerimdir."
→ https://spodeharmony.com/

## Ön inceleme (orkestratör yaptı, doğrula ve genişlet)
- Tipografi: başlık **EB Garamond** (serif) · gövde **Jost** (geometrik sans)
- Zemin beyaz değil, **sıcak krem `#ECE7DE`**. Galeri hissi buradan geliyor.
- Yapışkan yarı saydam üst şerit (frosted)
- 12 bölüm. Hero'da **tek kısa serif cümle**: "Zarif sofralar, Spode ile."
- "Koleksiyon seçkilerimiz" → **koleksiyonlar arası SEKME geçişi** (Blue Italian / Heritage)
  + yatay kart karuseli, kartlarda durum rozeti ("Tükendi")
- "Sofralardan kareler" → ürünlerin **gerçek ortamdaki** fotoğrafları
- "İngiliz porselen geleneği" → marka hikâyesi / gelenek bölümü
- Blog + SSS · WhatsApp yüzen buton

## ALINACAKLAR — U-Art karşılıkları
1. **Serif + geometrik sans eşleşmesi, krem zemin.** Sanat/seramik sitesinin doğru kaydı bu.
2. **Seriler arası sekme geçişi** → **Masalın Hafızası / Anadolu Ekininde Güzeller**.
   Heykeller için birebir karşılığı var. Panolarda da seri varsa aynısı.
3. **"Sergiden kareler" bölümü** (Spode'daki "Sofralardan kareler"in karşılığı).
   ⚠️ Sanatçı dedi ki: *"koyduğum fotoğraflarda sergiden çekilmiş olanlar"* —
   bu bölümün malzemesi **zaten elimizde**. Bkz. `SANATCIDAN-BILGI-2026-10-11.md`.
4. **Hikâye/gelenek bölümü** → sanatçının hikâyesi, tekniği, Anadolu seramik geleneği.
   Galeri sitesinde insanı bağlayan şey bu.
5. **Hero'da tek kısa serif cümle.** Slogan yığını yok.
6. **Durum rozeti** → "Tükendi" yerine: *Satıldı · Sergide · Özel koleksiyonda*.

## ALINMAYACAKLAR — bilerek
Spode bir **e-ticaret** sitesi. U-Art online satış yapmıyor.
**Taşıma:** sepet ikonu, hesap ikonu, Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu,
İade/İptal Politikası, Sipariş Sorgula. Bunlar TR e-ticaret mevzuatı; siteyi galeri değil
**dükkân** gibi gösterir. Satış kararı verilirse ayrıca konuşulur.

## ui-ux-pro-max ZORUNLU
`~/.claude/skills/ui-ux-pro-max` — **skill'i aç ve kullan.**
Hafıza kararı (13 Haz 2026): *"ui-ux-pro-max + ölçülü motion tüm SaaS'ın standart
tasarım dili. Yeni UI işlerinde varsayılan."*
U-Art siteleri bu skill'den **geçmemişti** (dün font'u kendi kafandan seçtin) — şimdi geçsin.
- Spode'u kopyalama, **referans al**. Skill'in palet/tipografi/stil sisteminden seç,
  **neden seçtiğini yaz**. Sonuç Spode'un kopyası değil, U-Art'ın kendi dili olsun.
- Skill'in CRITICAL maddeleri uygulanacak: kontrast ≥ 4.5:1, görünür focus halkası,
  ikon butonlarda aria-label, klavye sırası.
- **Ölçülü motion.** Eser fotoğrafı öne çıksın, animasyon değil.

## İKİ SİTE AYRI KALACAK
Çağrı'nın 10 Ekim kararı: **ürün bazlı** ayrım.
- **Uart Kurumsal** — mimari işler + seramik duvar panoları · ölçülü, teknik dil
- **Uart Galeri** — diğerleri · sıcak, eser odaklı
Aynı tasarım sistemi, **farklı uygulama**. Tek tasarım yapıp ikisine basma.
Seramik heykeller **ikisinde de** var, metinleri farklı (kurumsal kayıt / galeri anlatımı).

## ÖNCE PLAN — koda geçme
İki site de **canlı**. Doğrudan değiştirme. Şunları içeren bir plan çıkar ve **DUR**:
1. Seçilen palet · font eşleşmesi · stil — her biri için gerekçe
2. Sayfa sayfa yeni yerleşim (kaba taslak yeter), iki site için ayrı
3. Spode'dan alınan her desenin U-Art karşılığı
4. Nelerin **değişmeyeceği** (mevcut içerik, adresler, veri modeli)
5. SEO: adres değişecek mi? Değişecekse **301 planı** şart (hafıza: `feedback_seo_migration_on_redesign`)
6. Riskler ve bilmediklerin

## Kurallar
- Veri modeline, Drive içeriğine, eser kayıtlarına **dokunma** — bu bir tasarım işi.
- İçerik uydurma. Boş bölüm varsa "içerik bekleniyor" de, doldurma.
- Testler geçmeden deploy yok. Push ≠ live — `vercel ls` ile doğrula.
- Kanıt: iki sitenin öncesi/sonrası ekran görüntüleri (masaüstü + 390px telefon).
