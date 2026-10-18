import type { Metadata } from 'next'
import { createElement } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'

/**
 * 3B / AR PİLOTU (Faz A, 17 Eki — Çağrı onayı). Menüde ve sitemap'te YOK; yalnız
 * bağlantıyla açılır. Amaç: model-viewer ile döndür + yakınlaştır + mobilde AR
 * deneyiminin işe yarayıp yaramadığını görmek (UX kanıtı).
 *
 * Model GERÇEK ESERİN TARAMASI DEĞİL: Çan Krater'in tek bir fotoğrafındaki siluet
 * dönel simetri varsayılarak döndürüldü (yapay zekâ yok). Arka yüz ön yüzün
 * aynası, kulplar modelde yok, gerçek ölçü künyede olmadığı için AR boyutu
 * temsilî. Sayfa bunu ziyaretçiye açıkça söyler. Faz B: gerçek çekim
 * (FAZ-B-CEKIM-TALIMATI.md) gelince yalnız MODEL değişir.
 */
const MODEL = '/3d/can-krater-torna.glb'
const PHOTO = 'https://res.cloudinary.com/df0henatz/image/upload/v1785069022/uarttasarim/antik/can-krater-1.jpg'

export const metadata: Metadata = {
  title: '3B / AR pilotu | Uarttasarım',
  robots: { index: false, follow: false },
}

export default async function Pilot3BPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tr = locale !== 'en'

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js" strategy="afterInteractive" />

      <p className="text-[length:var(--text-meta)] uppercase tracking-[0.15em] text-[var(--muted)]">
        {tr ? 'Pilot · 3B ve artırılmış gerçeklik' : 'Pilot · 3D and augmented reality'}
      </p>
      <h1 className="mt-3 text-3xl text-[var(--foreground)] sm:text-4xl">Çan Krater</h1>

      {/* Etiket: ziyaretçi modeli gerçek eser sanmamalı. */}
      <div role="note" className="mt-6 border-l-4 border-[#b45309] bg-[#fef3c7] px-4 py-3 text-[15px] leading-relaxed text-[#422006]">
        <strong>{tr ? 'Yaklaşık demo — gerçek eserin 3B taraması değildir.' : 'Approximate demo — not a 3D scan of the real work.'}</strong>{' '}
        {tr
          ? 'Model, eserin tek bir fotoğrafındaki siluetten bilgisayarla çıkarıldı: arka yüz ön yüzün aynasıdır, kulplar modelde yoktur, renk ve desenler yaklaşıktır. Gerçek ölçü bilinmediği için odadaki boyut temsilîdir. Eserin kendisi sağdaki fotoğraftadır.'
          : 'The model was derived by computer from the silhouette in a single photo: the back mirrors the front, the handles are missing, colours and patterns are approximate. The real size is unknown, so the size in your room is only indicative. The work itself is shown in the photo.'}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="relative aspect-square w-full overflow-hidden bg-[#ece7de]">
          {createElement(
            'model-viewer',
            {
              src: MODEL,
              alt: tr ? 'Çan Krater, yaklaşık 3B model' : 'Bell krater, approximate 3D model',
              'camera-controls': '',
              'touch-action': 'pan-y',
              'auto-rotate': '',
              'auto-rotate-delay': '1500',
              'rotation-per-second': '20deg',
              'shadow-intensity': '1',
              exposure: '1.05',
              ar: '',
              'ar-modes': 'webxr scene-viewer quick-look',
              'ar-placement': 'floor',
              'ar-scale': 'auto',
              poster: PHOTO,
              style: { width: '100%', height: '100%', background: 'transparent' },
            },
            createElement(
              'button',
              {
                slot: 'ar-button',
                className:
                  'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--foreground)] px-6 py-3 text-[15px] text-[var(--background)] shadow-lg',
              },
              tr ? 'Odanda gör (AR)' : 'View in your room (AR)',
            ),
          )}
        </div>

        <div>
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ece7de]">
            <Image src={PHOTO} alt={tr ? 'Çan Krater — eserin fotoğrafı' : 'Bell krater — photo of the work'} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
          </div>
          <p className="mt-2 text-[length:var(--text-meta)] text-[var(--muted)]">{tr ? 'Eserin gerçek fotoğrafı' : 'Real photo of the work'}</p>
          <Link href={`/${locale}/urun/can-krater`} className="mt-4 inline-flex min-h-11 items-center border-b border-[var(--foreground)] text-[15px] text-[var(--foreground)]">
            {tr ? 'Eser sayfasına git →' : 'Go to the work page →'}
          </Link>
        </div>
      </div>

      <section className="mt-12 max-w-[62ch] text-[15px] leading-[1.8] text-[#4a4a4a]">
        <h2 className="text-xl text-[var(--foreground)]">{tr ? 'Nasıl kullanılır' : 'How to use'}</h2>
        <ul className="mt-3 list-disc pl-5">
          <li>{tr ? 'Bilgisayarda: sürükleyerek döndürün, tekerlekle yakınlaştırın.' : 'Desktop: drag to rotate, scroll to zoom.'}</li>
          <li>{tr ? 'Telefonda: tek parmakla döndürün, iki parmakla yakınlaştırın.' : 'Phone: rotate with one finger, pinch to zoom.'}</li>
          <li>{tr ? '“Odanda gör” düğmesi: kamerayı zemine tutun, model yere yerleşir; iki parmakla boyutunu değiştirebilirsiniz. (Android: ARCore destekli telefon; iPhone: Safari.)' : '“View in your room”: point the camera at the floor and the model is placed; pinch to resize. (Android: ARCore-capable phone; iPhone: Safari.)'}</li>
        </ul>
      </section>
    </main>
  )
}
