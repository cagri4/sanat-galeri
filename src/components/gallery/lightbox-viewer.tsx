'use client'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import { NextImageSlide } from './next-image-slide'

interface LightboxSlide {
  src: string
  alt: string
  width?: number
  height?: number
  title?: string
}

interface ThumbnailImage {
  src: string
  alt: string
}

interface LightboxViewerProps {
  slides: LightboxSlide[]
  thumbnails: ThumbnailImage[]
}

export default function LightboxViewer({ slides, thumbnails }: LightboxViewerProps) {
  const [index, setIndex] = useState(-1)

  return (
    <>
      {/* gap-2 -> gap-3, rounded-md -> keskin kose: galeri asma duzeni
          yuvarlak koseli "urun" kartlarindan cok pasparto hissi versin. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`${thumb.alt} — ${i + 1}/${thumbnails.length}`}
            className={`media-zoom group relative aspect-[3/4] cursor-pointer overflow-hidden bg-[#f0ece4] ${
              i === 0 ? 'col-span-2 row-span-2' : ''
            }`}
          >
            <Image
              src={thumb.src}
              alt={thumb.alt}
              fill
              className="object-cover group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[#1a1a1a] opacity-0 transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[0.06]"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom, Captions]}
        render={{ slide: NextImageSlide }}
        /* Sakin acilis: varsayilan 250ms/500ms yerine daha yavas ve
           yumusak. Swipe suresi de uzatildi ki gecis "sicramasin". */
        animation={{ fade: 400, swipe: 400, easing: { fade: 'ease-out', swipe: 'ease-out' } }}
        /* Arka plan tam siyah degil: eserin sicak tonlarini bogmayan
           koyu murekkep tonu. */
        styles={{
          container: { backgroundColor: 'rgba(16, 14, 13, 0.96)' },
          captionsTitle: { fontSize: '0.875rem', letterSpacing: '0.05em' },
        }}
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: slides.length <= 1 }}
      />
    </>
  )
}
