import type { Metadata } from 'next'
import { createElement } from 'react'
import Link from 'next/link'
import Script from 'next/script'

/**
 * İÇ KIYAS SAYFASI (19 Eki 2026, Çağrı onayı) — menüde/sitemap'te YOK, canlıya alınmaz.
 * Anka V: (A) gerçek videodan fotogrametri  vs  (B) Replicate hyper3d/rodin Gen-2 (yapay zekâ).
 * İkisi de künyedeki 55 cm yüksekliğe ölçeklendi (B'nin ham yüksekliği 1,7096 birim → scale 0,3217).
 */
const MODELLER = [
  {
    src: '/3d/anka-v-yeniden-varolus.glb',
    scale: '1 1 1',
    baslik: 'A · Fotogrametri (gerçek ölçüm)',
    not: 'Sanatçının telefonla çektiği 35 sn videonun 128 karesinden COLMAP + OpenMVS ile, yerel ve ücretsiz. Yalnız kameranın gördüğü yüzeyler var; uydurma yok. Video 480×856 olduğu için yüzey yumuşak, kaide eksik.',
  },
  {
    src: '/3d/anka-v-ai-rodin.glb',
    scale: '0.3217 0.3217 0.3217',
    baslik: 'B · Yapay zekâ (Rodin Gen-2, Replicate)',
    not: 'Aynı videodan seçilen 4 karenin arka planı temizlenip modele verildi. Görmediği yüzeyleri TAHMİN eder; gerçek esere birebir sadık olması garanti değildir. Maliyet: 1 çıktı × 0,40 $.',
  },
]

export const metadata: Metadata = { title: 'Anka V — 3B kıyas | Uarttasarım', robots: { index: false, follow: false } }

export default async function Kiyas3BPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js" strategy="afterInteractive" />
      <p className="text-[length:var(--text-meta)] uppercase tracking-[0.15em] text-[var(--muted)]">İç kıyas · yayında değil</p>
      <h1 className="mt-3 text-3xl text-[var(--foreground)] sm:text-4xl">Anka V – Yeniden Varoluş: iki 3B yöntem</h1>
      <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-[#4a4a4a]">
        Soldaki gerçek ölçümden, sağdaki yapay zekâdan. İkisi de künyedeki 55 cm yüksekliğe ayarlı; “Odanda gör” ile aynı boyutta karşılaştırılabilir.
        Gerçek eser için <Link href={`/${locale}/urun/anka-v-yeniden-varolus`} className="underline">eser sayfasındaki fotoğraflara</Link> bakın.
      </p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {MODELLER.map((m) => (
          <section key={m.src}>
            <h2 className="text-lg text-[var(--foreground)]">{m.baslik}</h2>
            <div className="relative mt-3 aspect-square w-full overflow-hidden bg-[#ece7de]">
              {createElement(
                'model-viewer',
                {
                  src: m.src,
                  scale: m.scale,
                  alt: m.baslik,
                  'camera-controls': '',
                  'touch-action': 'pan-y',
                  'auto-rotate': '',
                  'rotation-per-second': '20deg',
                  'shadow-intensity': '1',
                  ar: '',
                  'ar-modes': 'webxr scene-viewer quick-look',
                  'ar-placement': 'floor',
                  'ar-scale': 'fixed',
                  style: { width: '100%', height: '100%', background: 'transparent' },
                },
                createElement('button', { slot: 'ar-button', className: 'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--foreground)] px-6 py-3 text-[15px] text-[var(--background)] shadow-lg' }, 'Odanda gör (AR)'),
              )}
            </div>
            <p className="mt-3 text-[length:var(--text-meta)] leading-relaxed text-[var(--muted)]">{m.not}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
