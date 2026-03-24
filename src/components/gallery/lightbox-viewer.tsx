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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={
              i === 0
                ? 'col-span-2 row-span-2 relative aspect-[3/4] overflow-hidden rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                : 'relative aspect-[3/4] overflow-hidden rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            }
          >
            <Image
              src={thumb.src}
              alt={thumb.alt}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
      />
    </>
  )
}
