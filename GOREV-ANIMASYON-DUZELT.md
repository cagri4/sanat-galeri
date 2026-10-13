# GÖREV: Animasyonları spodeharmony seviyesine çıkar
Tarih: 11 Ekim 2026 · Sahibi: sanat worker

## Çağrı'nın itirazı
"O siteyi güzel yapan zaten animasyonlardı. Tamam tasarım da iyiydi ama
**böyle dümdüz HTML CSS site gibi olmuş.**"

## Orkestratörün hatası — bunu bilerek düzeltiyoruz
Önceki brief'te *"ölçülü motion — eser fotoğrafı öne çıksın, animasyon değil"*
yazmıştım. Bu seni animasyondan uzaklaştırdı. **Talimat yanlıştı, geri alıyorum.**
Ayrıca spodeharmony'yi incelerken tipografi ve renge baktım, **hareketine hiç bakmadım.**

## ÖLÇÜM — spodeharmony.com, canlı sayfadan alındı (11 Eki 2026)
**Animasyon kütüphanesi YOK.** GSAP yok, Lenis yok, Framer Motion yok, Swiper yok.
Saf Next.js + Tailwind, sadece CSS geçişleri. **Yani senin CSS tercihin DOĞRUYDU.**

Fark teknikte değil, **yoğunlukta**:

| | spodeharmony | bizim site |
|---|---|---|
| Geçişi olan öge | **131** | ~7 bildirim |
| CSS keyframe | 0 | 1 |

**Ölçülen geçiş profili (birebir uygula):**
| Ne | Süre | Kaç ögede |
|---|---|---|
| `transform, translate, scale, rotate` | **0.5s** | 39 |
| renk/arka plan/kenarlık/fill/stroke | **0.15s** | 33 |
| `opacity` | **0.5s** | 32 |
| `opacity` | 0.15s | 10 |
| `transform` | 0.15s | 6 |
| `box-shadow` | 0.15s | 3 |
| `opacity, transform` birlikte (büyük bölümler) | **0.7s** | 2 |

- Yumuşatma eğrisi **tek ve tutarlı**: `cubic-bezier(0.4, 0, 0.2, 1)`
- `html { scroll-behavior: smooth }` açık

## YAPILACAK
1. **İki hızlı bir sistem kur**, Spode'daki gibi:
   - **0.15s** → küçük tepkiler: üstüne gelince renk, kenarlık, gölge, buton, bağlantı
   - **0.5s** → büyük hareketler: beliriş, kayma, ölçek, görsel
   - **0.7s** → sayfa/bölüm düzeyinde büyük belirişler
   - Tek eğri: `cubic-bezier(0.4, 0, 0.2, 1)`. Token olarak tanımla, her yerde onu kullan.
2. **Yoğunluğu artır.** Hedef: kart, görsel, buton, bağlantı, sekme, başlık, rozet, menü —
   **etkileşime giren ve beliren her öge** geçişli olsun. 7 değil, Spode seviyesinde.
3. **Hover durumları.** Eser kartında görsel hafif ölçeklensin, gölge derinleşsin,
   başlık rengi değişsin. Şu an bunların çoğu yok.
4. `html { scroll-behavior: smooth }` ekle.
5. **Mevcut `reveal.tsx` yaklaşımını KORU.** Sunucu HTML'i tam görünür kalsın,
   gizleme yalnızca istemcide. O karar doğruydu, bozma — sadece hareketi zenginleştir.
6. **Kademeli beliriş (stagger):** kart ızgarasında kartlar aynı anda değil,
   küçük gecikmelerle belirsin (ör. 60-80ms aralıkla).

## SINIRLAR
- Kütüphane **ekleme**. Spode'da da yok, bizde de olmayacak. Saf CSS.
- `prefers-reduced-motion` desteği **devam etsin**, hepsi kapansın.
- Eser fotoğrafı hâlâ başroldedir — hareket onu **sunmalı**, gölgelememeli.
  Dönen, zıplayan, dikkat çeken efekt yok. Spode'da da yok; orada her şey
  yumuşak beliriş ve hafif ölçek.
- Performans: `transform` ve `opacity` dışında bir şeyi animasyonlama
  (layout tetikleyen özellikler sayfayı yavaşlatır).
- `noindex` kalacak, veri modeline ve içeriğe dokunma.

## KANIT
- Geçişi olan öge sayısını **ölçerek** göster (Spode'da ölçtüğüm yöntemle:
  `document.querySelectorAll('*')` üzerinde `transitionDuration !== '0s'` say).
  Hedef: iki sitede de **100'ün üzeri**.
- Öncesi/sonrası ekran görüntüsü yetmez — hareket gösteren **2-3 ardışık kare** al
  (kart hover, kaydırmada beliriş).
- `prefers-reduced-motion` açıkken hiçbir hareket olmadığının kanıtı.
- Commit hash + iki canlı URL.
