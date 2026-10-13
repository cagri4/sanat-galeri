# GÖREV — Kararlar netleşti, A listesini uygula
13 Ekim 2026 · Çağrı'nın kararları. **Bu sefer uygulama görevi**, plan değil.

## KİLİTLENEN KARARLAR (tartışma kapandı)
1. **İki site kalıyor.** (Sanatçı 10:52'de bıraktı, Çağrı karar verdi.)
2. **Menü TÜRKÇE:** `Galeri` · `Objeler` · `Stüdyo` · `İletişim`
   ("Object/Studio" İngilizce kalmayacak — Çağrı kararı, 13 Eki.)
   - Galeri → Mimari Duvar Panoları · Resimli Seramikler · Heykeller
   - Objeler → Antik Dönem Replikaları
   - Stüdyo → Hakkımızda · Sergiler  ⚠️ **"Üretim Süreçleri" galeri sitesinde YOK**
   - İletişim (en son), yanında Instagram
3. **Fon rengi KREM KALIYOR** (#F7F4EF). Koyuya geçilmeyecek.
   `hanna-miadzvedzeva` ölçümü arşiv olarak kalsın, uygulanmayacak.
4. **Özel sipariş bölümü kalkıyor.**
5. **Süreç: galeri sitesinden kalkıyor.** Kurumsal tarafta ANLATI olarak değil,
   5 satırlık **teknik künye** olarak kalacak (malzeme · uygulanabilir ölçü · montaj yöntemi ·
   dayanıklılık · teslim süresi) + birkaç montaj fotoğrafı kanıt olarak.
   ⚠️ Künyenin **içeriği sanatçıdan gelecek**, henüz yok → yer tutucu bırak, uydurma.
6. **Satış yok.** Site vitrin. Hedef: galeride "bu eser hakkında yazmak",
   kurumsalda "proje görüşmesi talep etmek".
7. **"11 pano işi nasıl geldi" sorusu sanatçıya SORULMAYACAK** (Çağrı kararı).
   Strateji dosyasındaki §7.1 maddesini bu notla kapat.

## YAPILACAKLAR
- [ ] Menüyü yeni yapıya çevir (Türkçe adlarla), her iki sitede tutarlı
- [ ] Instagram ikonu header sağ üste (dil seçicinin yanı, 44px, `aria-label`);
      ana sayfanın ortasındaki Instagram bölümü kaldırılsın
- [ ] Ana sayfa açılışı: seramik panodan tek büyük görsel (hero)
- [ ] `PageBanner` bileşeni: iç sayfa başlıkları görselli banda dönsün.
      Görsel o sayfanın kendi eserlerinden; yeni fotoğraf gerekmez. LCP için `priority`
- [ ] `/ozel-siparis` kaldırılsın → 301 `/iletisim`
- [ ] Süreç galeri sitesinden kaldırılsın → 301 (kurumsaldaki teknik künyeye)
- [ ] `/sergiler` liste sayfası (veri `exhibitions` tablosunda hazır)
- [ ] Tüm 301'ler `src/lib/site-routing.ts`'e **testleriyle** eklensin
- [ ] `src/app/sitemap.ts` yazılsın (bugün yok). noindex ve robots Disallow kalsın
- [ ] Fotoğraf azaltma için **temas tablosu** üret: benzer kareler yan yana, eser başına.
      Çıktı Çağrı'ya gidecek, sanatçı işaretleyecek. **Hiçbir fotoğraf silinmeyecek**,
      yalnızca `is_visible`/sıra ile gizlenecek
- [ ] Türkçe karakter kontrolü (ş/ğ/ı/İ) yeni menü ve banner'larda
- [ ] Mobil 390 px kontrolü
- [ ] Her değişiklik için ekran görüntüsü → Çağrı'ya kanıt dosyası

## SANATÇIDAN BEKLENENLER (yapma, yer tutucu bırak)
- Atölyede çalışırken fotoğrafları (`Studio/Hakkımızda` klasörü şu an 2 özgeçmiş görseli)
- Kurumsal teknik künye bilgileri (malzeme, ölçü, montaj, dayanıklılık, teslim)
- Temas tablosundan hangi fotoğrafların çıkacağı
⚠️ **İçi boş bölüm açma.** Veri yoksa bölüm de olmaz ([[feedback_no_hollow_skeleton_modules]]).

## KURALLAR
- Yayına almadan önce **ekran görüntüsü + onay.** Otomatik deploy yok.
- Vercel'e alırsan `bash ~/bin/vercel-bekle.sh <klasör> <commit-hash>` — hash'i HEP ver.
- Uydurma metin, uydurma fotoğraf, uydurma künye yok.
- `TODO.md`'ye bu maddeleri yaz, bitenlere tik at, liste bitince dur ve raporla.

---

## DÜZELTME — Çağrı, 13 Eki (madde 5'in yerine geçer)
**Kurumsal künye SADE olacak.** "Teknik güvence bandı" (malzeme, dayanıklılık, montaj yöntemi,
teslim süresi) **İPTAL**. Çağrı'nın kararı, birebir:
> "Yok, sadece adı, nerede yapıldı, yapım yılı, ölçü, yapan kişi. Bu kadar."

**Künye alanları (tam liste, fazlasını ekleme):**
`Eser adı` · `Nerede yapıldı / uygulama yeri` · `Yapım yılı` · `Ölçü` · `Yapan kişi`

- Bu veriler çoğunlukla elimizde var (DB `products` + bilinen uygulama yerleri).
  Eksik olanı **boş bırak**, uydurma.
- Montaj fotoğrafı "kanıt bandı" fikri de düştü; fotoğraflar eser galerisinde kalır.
- Sanatçıdan teknik künye bilgisi beklenmeyecek — **o bekleme maddesi kapandı.**

## DÜZELTME — Atölye fotoğrafları
Bu madde **sanatçının kendi isteği** (11 Eki 22:07: "Hakkımızda bölümünde resimler
değişebilir, atölyede çalışırken fotoğraflar konulabilir"). Gelmezse Hakkımızda sayfası
**bugünkü haliyle kalır**, bekleme sebebi değildir. İlerlemeyi durdurma.
