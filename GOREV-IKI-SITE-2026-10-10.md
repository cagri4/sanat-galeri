# GÖREV — Tek siteyi İKİYE böl (10 Ekim 2026, Çağrı kararı)

## Karar
Ayrım **SANATÇIYA göre DEĞİL, ÜRÜNE göre.**

| Site | Kapsam | Hedef kitle |
|---|---|---|
| **Uart Kurumsal** | Mimari işler, seramik duvar panoları | Mimar, müteahhit, otel, ofis, kurum |
| **Uart Galeri** | Diğer tüm işler (resimli seramikler, heykeller, replikalar) | Bireysel alıcı |

Çağrı'nın cümlesi: *"Mimari işler seramik panolar bunlar kurumsaldur. Diğerleri bireysel.
Site temaları aynı olabilir ama tasarımlarla fark ettir ve 2 site yap."*

⚠️ Mevcut `melike.` / `seref.` subdomain yapısı **sanatçı bazlı** — bu yeni ayrımla aynı şey
DEĞİL. Bugün üst üste düşüyorlar (Melike resimli seramik, Şeref mimari pano) ama yarın bir
sanatçı diğer türde iş yaparsa yapı bozulur. Ayrım **ürün/koleksiyon alanından** okunmalı,
sanatçıdan değil.

## İstenen
- Tema ortak kalabilir, **tasarım dili farklılaşsın.** Kurumsal taraf daha ölçülü, teknik,
  referans/proje odaklı; galeri tarafı daha sıcak, eser odaklı. Nasıl fark ettireceğini
  **sen öner** — Çağrı kendi önerilerini de istedi.
- İki ayrı site gibi görünsün ama tek kod tabanından çıksın (mevcut middleware + route group
  yapısı buna uygun: `src/middleware.ts` DOMAIN_MAP, `(main)` ve `(artist)` grupları).

## Google Drive — yeni içerik geldi, İNCELE
Sanatçı (sibyllamc@gmail.com) Eylül sonu/Ekim başında yükledi:
- `Masalın Hafızası — Anadolu'dan Günümüze Seramik Bedenler` (16 Eyl) — 1TXPsDv7I78HS51a9GL5QFCbpxRknLZnC
- `"Anadolu Ekininde Güzeller" Seramik Heykel Serisi` (1 Eki) — 1747MUHiE8rQkYGfI7SbVbCuxLlEXpRoq
- Sergi klasörleri (2 Eki): Armagrandi/Bozcaada · Polart Ankara · Bozcaada Sanat Galerisi · Arkeo Pera İstanbul
- Eski yapı: `uarttasarım` → `Resimli seramikler` · `mimari duvar panoları`

Bunların hangisi kurumsala, hangisi galeriye gider — envanterini çıkar.

## ÖNCE PLAN, SONRA KOD
Kod yazmadan önce şunu üret ve Çağrı'ya sun:
1. Drive envanteri (hangi içerik hangi siteye)
2. İki sitenin bilgi mimarisi (sayfa listesi, hangi sayfa nerede)
3. Tasarım farklılaşması önerin — somut (tipografi, ızgara, renk, hareket), laf değil
4. Adres planı önerin (alt alan adı mı, yol mu) — Çağrı onaylayacak

## Kurallar
- Canlı müşteri. Deploy, DNS, dışa giden hiçbir şey **Çağrı onayı olmadan YOK.**
- İçerik **uydurma.** Sanatçı biyografisi/eser açıklaması yoksa boş bırak ve eksik olarak bildir.
- "Bitti" demeden önce doğrula; iş bitti raporuna **kanıt** koy (commit hash, URL+HTTP kodu).
  Hazırlanan ≠ yapılan ≠ teyit edilen.
- Bağlamın %70'i dolunca haber ver ve bağlamı compact et.
