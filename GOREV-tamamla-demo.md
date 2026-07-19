# Görev: U-Art sanatçı galeri sitesini tamamla → Vercel demo (upu-genel orkestre)

Sen sanat-galeri worker'ısın. upu-genel (Telegram) orkestre eder, Çağrı onaylar. Bu proje `~/Masaüstü/sanat-galeri` (Next.js + Supabase + next-intl TR/EN + next-auth + @vercel/blob). Vercel projesi `sanat-galeri` (cagriandroit-3315). Amaç: siteyi tamamlayıp **Vercel demo linki** hazırlamak → Çağrı onayı → sonra uarttasarim.com'a alınacak (o adımı upu-genel yapacak, SEN yayına/domaine DOKUNMA).

## ÖNCE OKU + DOĞRULA (kanıtlı, boş iskeleti "çalışıyor" sayma)
1. `.planning/PROJECT.md`, `STATE.md`, `src/app/` yapısı — ne inşa edilmiş, ne stub.
2. **DB gerçek durumu:** Supabase'de artwork/eser tablosunda kaç kayıt var, boş mu placeholder mı? Admin panel CRUD gerçekten yazıyor mu? Kısa rapor.
3. Görsel barındırma: kod şu an `@vercel/blob` kullanıyor. **Çağrı Cloudinary öneriyor (Doga projesinde kullanıyoruz).** Doga projesinde Cloudinary cred'lerini bul (grep CLOUDINARY ~/Masaüstü/*/), varsa değerlendir. Galeri (48+ yüksek-çöz foto) için Cloudinary'nin otomatik optimize/resize'ı avantaj. Ama Vercel Blob zaten bağlı — hangisi daha az iş + daha iyi sonuç, sen karar ver, gerekçeni yaz. Karar büyükse upu-genel'e sor.

## FOTOLAR (Google Drive)
Klasör: https://drive.google.com/drive/folders/1AKDmzaJMfV5vUwwFsolrSdrICSkSEivG (sahibi sanatçı sibyllamc@gmail.com). 3 kategori alt-klasör:
- **Antik dönem replikaları** (id 1pN9Sx4C5fZDL4-ERVrX7xIOPR58dO3mI) — ~48 foto: Volütlü Krater(1-5), Kalyx Krater(1-4), Siren(1-4), Thetis(1-4), Europa(1-2), Afrodit ve kaz(2-4), Menad(1-3), Geometrik dönem çanak/tabak, kylix krater kolaj, IMG_2020… serisi
- **Resimli seramikler** (id 12NWtSv0BjASZoFT5Gq1MIWgIGofqUO0Y)
- **Mimari duvar panoları** (id 1EcN8DroJBiMekXwKmXExNayLL5KmGGz5)

İndirme: `gdown --folder "https://drive.google.com/drive/folders/1AKDmzaJMfV5vUwwFsolrSdrICSkSEivG" -O ./drive-fotolar` dene (klasör paylaşımlı). gdown yoksa `pip install gdown`. **İzin hatası alırsan** (public değilse) DUR ve upu-genel'e söyle — upu-genel'in Drive erişimi var, dosyaları indirip sana bırakır. İndirince kategori-klasör yapısını koru.

## İÇERİK YÜKLEME
- Her fotoyu kategorili eser olarak sisteme gir (Cloudinary/Blob'a yükle + DB kaydı). Başlıkları dosya adından temizle ("Volütlü Krater4.jpg" → "Volütlü Krater"). **Aynı eserin çoklu açı çekimlerini (Krater1-5) TEK eser + çok görselli lightbox** olarak grupla, 5 ayrı eser yapma.
- Kategoriler: Antik Dönem Replikaları / Resimli Seramikler / Mimari Duvar Panoları (TR) + EN karşılıkları.

## SANATÇI KİMLİĞİ + CV (DİKKAT — uydurma yok)
- PROJECT.md "Melike & Şeref" diyor ama Drive sahibi **sibyllamc**. Bu tutarsızlığı ÇÖZME, upu-genel'e SOR (hangi sanatçı(lar), isim ne, kaç kişi).
- Biyografi/CV/sergiler/ödüller metni sende YOK. **Uydurma gerçek yazma** (sahte sergi/ödül/tarih koyma). Yer tutucu iskelet bırak + "Çağrı'dan gerçek metin bekleniyor" notu. Gerçekçi ama doğrulanmamış hiçbir biyografik iddia girme.

## DEPLOY (demo, domaine DOKUNMA)
- İçerik girince `vercel --prod` ile taze production deploy. Deploy URL'sini upu-genel'e ver.
- **Deployment Protection / domain / subdomain işine GİRME** — onu upu-genel yapacak (onay sonrası).

## RAPOR (bitince upu-genel'e)
- DB önce/sonra durumu (kaç eser girdi), hangi kategori kaç eser
- Görsel barındırma kararı (Cloudinary mı Blob mı, neden)
- gdown indirme başarılı mı, yoksa upu-genel'den ne lazım
- Taze deploy URL
- AÇIK SORULAR: sanatçı kimliği (Melike/Şeref vs sibylla), CV metni, kategori isimleri onayı

## KURALLAR
Yayın/domain onaysız YOK (sadece Vercel demo). Uydurma içerik yok. Kanıtlı çalış. Secret'ları koda gömme/commit etme.
