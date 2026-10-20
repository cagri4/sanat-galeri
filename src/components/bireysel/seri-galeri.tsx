'use client'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import { NextImageSlide } from '@/components/gallery/next-image-slide'

/**
 * Bireysel sitede bir eser serisi: eşit kare grid + aynı sayfada büyük görünüm (lightbox).
 * Bilinçli olarak SAYFA DIŞINA LİNK YOK (rc 20 Eki bug: kareler uart-kurumsal'a gidiyordu; ziyaretçi
 * sanatçının sitesinden atılıyordu). Bireysel sitede eser detay rotası da yok (kopya içerik) — detay burada açılır.
 */
export type SeriKare = { src: string; full: string; alt: string; caption?: string; title?: string; description?: string }

export default function SeriGaleri({ items, header, acmaEtiketi }: { items: SeriKare[]; header?: ReactNode; acmaEtiketi?: string }) {
  const [index, setIndex] = useState(-1)
  return (
    <>
      {header !== undefined && (
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <div>{header}</div>
          {acmaEtiketi && (
            <button type="button" onClick={() => setIndex(0)} className="inline-flex min-h-11 cursor-pointer items-center text-[length:var(--text-meta)] text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline">
              {acmaEtiketi} &rarr;
            </button>
          )}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((it, i) => (
          <li key={it.src}>
            <button type="button" onClick={() => setIndex(i)} aria-label={`${it.alt} — ${i + 1}/${items.length}`} className="group block w-full cursor-pointer text-left">
              <span className="relative block aspect-square overflow-hidden bg-[#F1F0EE]">
                <Image src={it.src} alt={it.alt} fill className="object-cover transition-opacity duration-300 group-hover:opacity-85" sizes="(max-width: 1024px) 50vw, 300px" />
              </span>
              {it.caption && <span className="mt-2 block text-[length:var(--text-meta)] text-[var(--muted)]">{it.caption}</span>}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={items.map((it) => ({ src: it.full, alt: it.alt, width: 1600, height: 1600, title: it.title, description: it.description }))}
        plugins={[Zoom, Captions]}
        render={{ slide: NextImageSlide }}
        animation={{ fade: 400, swipe: 400 }}
        styles={{ container: { backgroundColor: '#FAFAFA' }, button: { color: '#111', filter: 'none' }, captionsTitle: { color: '#111', fontSize: '0.875rem' }, captionsDescription: { color: '#555', fontSize: '0.8125rem' }, captionsTitleContainer: { background: 'transparent' }, captionsDescriptionContainer: { background: 'transparent' } }}
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: items.length <= 1 }}
      />
    </>
  )
}
