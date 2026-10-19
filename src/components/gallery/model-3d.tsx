import { createElement } from 'react'
import Script from 'next/script'
import type { Model3D } from '@/lib/models-3d'

/** Eser sayfasında 3B görünüm: döndür, yakınlaştır, mobilde "Odanda gör" (AR). */
export default function Model3DViewer({ model, title, poster, isTr }: { model: Model3D; title: string; poster?: string; isTr: boolean }) {
  return (
    <section className="mt-10" aria-label={isTr ? '3B görünüm' : '3D view'}>
      <Script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js" strategy="afterInteractive" />
      <h2 className="text-[length:var(--text-meta)] uppercase tracking-[0.15em] text-[var(--muted)]">{isTr ? '3B görünüm' : '3D view'}</h2>
      <div className="relative mt-3 aspect-square w-full overflow-hidden bg-[#ece7de]">
        {createElement(
          'model-viewer',
          {
            src: model.src,
            alt: isTr ? `${title}, 3B model` : `${title}, 3D model`,
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
            'ar-scale': 'fixed',
            poster,
            style: { width: '100%', height: '100%', background: 'transparent' },
          },
          createElement(
            'button',
            {
              slot: 'ar-button',
              className: 'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--foreground)] px-6 py-3 text-[15px] text-[var(--background)] shadow-lg',
            },
            isTr ? 'Odanda gör (AR)' : 'View in your room (AR)',
          ),
        )}
      </div>
      <p className="mt-3 text-[length:var(--text-meta)] leading-relaxed text-[var(--muted)]">{isTr ? model.noteTr : model.noteEn}</p>
    </section>
  )
}
