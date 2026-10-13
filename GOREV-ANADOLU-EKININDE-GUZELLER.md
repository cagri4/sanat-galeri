# GÖREV — "Anadolu Ekininde Güzeller" serisini ayır + fotoğraflarını yenile
13 Ekim 2026, 18:47 · Sanatçıdan WhatsApp ile geldi.

## Mesajlar — birebir
> [13/10 18:47] Çağrı heykeller kısmındaki **Anadolu ekininde güzeller** serisini
> **yeniledim, resimler değişti**
> [13/10 18:48] Ama hepsi **masalın hafızasında gibi görünüyor**, ondan **ayrılması** lazım

## İki ayrı iş var

### 1) Seriyi ayır
Şu an "Anadolu Ekininde Güzeller" sitede **Masalın Hafızası**'nın içinde görünüyor.
Sanatçı ayrı bir seri olarak durmasını istiyor.
- **ÖNCE mevcut yapıyı çıkar:** veritabanında bu nasıl modellenmiş? Koleksiyon mu,
  ürün grubu mu, etiket mi? Masalın Hafızası'nın altında hangi eserler var,
  Anadolu Ekininde Güzeller'e ait olanlar hangileri?
- Ayırmanın veri modelinde karşılığı ne — yeni koleksiyon mu, alt-seri alanı mı?
- **Plan çıkar, uygulamadan önce bana (rc) göster.** Yanlış ayırma veri karıştırır.

### 2) Fotoğrafları yenile
Sanatçı Drive'da bu serinin görsellerini **değiştirmiş**.
- Drive'da `Galeri/Heykeller` (ya da ilgili klasör) içinde bu seriye ait **yeni**
  dosyalar hangileri, tarihleri ne? Önce **karşılaştır**: Drive'da ne var, DB'de ne var.
- ⚠️ **Hiçbir fotoğrafı SİLME.** Eskiyi `is_visible=false` ile gizle, yenisini ekle.
  Sanatçı "değişti" diyor ama hangi kareyi çıkarmak istediğini söylemedi —
  silersen geri dönüşü yok.
- Yeni dosya yoksa ya da eşleşmiyorsa **dur ve sor**, tahminle içeri aktarma.

## Dikkat
- Bugün A listesi canlıya alındı. Bu iş onun üstüne geliyor; menü yapısını bozma.
- Künye eksikleri duruyor: 16 heykelin yapım yılı, 11'inin ölçüsü yok. Bu seride de
  eksikse **uydurma**, boş bırak.
- Değişiklik sonrası ekran görüntüsü + onay, sonra deploy. Doğrudan deploy YOK.
- Canlıya alırsan `bash ~/bin/vercel-bekle.sh <klasör> <commit-hash>` — hash'i HEP ver.

## Çıktı
Önce kısa bir **durum raporu**: bugünkü yapı nasıl, ayırmanın maliyeti ne,
Drive'da hangi yeni dosyalar var. Sonra onayla uygulama.
`TODO.md`'ye maddeleri önce yaz, bitenlere tik at, liste bitince dur ve raporla.
