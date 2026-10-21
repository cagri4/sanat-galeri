'use client'

import { useState } from 'react'
import Image from 'next/image'
import { isImageSlide, useLightboxProps } from 'yet-another-react-lightbox'
import type { RenderFunction, Slide } from 'yet-another-react-lightbox'

/**
 * Lightbox karesi: fotoğraf ekrana sığan EN BÜYÜK boyutta (ABLAM-UART-ISTEK-2 §4, 21 Eki).
 * Eskiden her kare 1200×1600 (3:4) varsayılıyordu → yatay fotoğraflar dikey kutuya sığdırılıp küçük kalıyordu.
 * Artık gerçek oran yüklenince okunur (naturalWidth/Height); o ana kadar alanın tamamı kullanılır.
 * sizes=100vw: ekran genişliğine yetecek çözünürlük (net görüntü). Kutu fotoğraf kadar → kenardaki boşluğa
 * tıklamak kapatır (closeOnBackdropClick).
 */
function SlideImage({ slide, rect }: { slide: Slide & { src: string }; rect: { width: number; height: number } }) {
  const {
    on: { click },
  } = useLightboxProps()
  const [oran, setOran] = useState<number | null>(
    slide.width && slide.height && !(slide.width === 1200 && slide.height === 1600) ? slide.width / slide.height : null,
  )
  const width = oran ? Math.floor(Math.min(rect.width, rect.height * oran)) : rect.width
  const height = oran ? Math.floor(Math.min(rect.height, rect.width / oran)) : rect.height

  return (
    <div style={{ position: 'relative', width, height }}>
      <Image
        fill
        alt={slide.alt ?? ''}
        src={slide.src}
        loading="eager"
        draggable={false}
        style={{ objectFit: 'contain' }}
        sizes="100vw"
        onLoad={(e) => {
          const im = e.currentTarget
          if (im.naturalWidth && im.naturalHeight) setOran(im.naturalWidth / im.naturalHeight)
        }}
        onClick={click ? () => click({ index: 0 }) : undefined}
      />
    </div>
  )
}

export const NextImageSlide: RenderFunction<{ slide: Slide; rect: { width: number; height: number } }> = ({ slide, rect }) => {
  if (!isImageSlide(slide)) return undefined
  return <SlideImage key={slide.src} slide={slide} rect={rect} />
}
