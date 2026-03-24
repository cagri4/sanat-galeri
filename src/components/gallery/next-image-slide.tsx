'use client'

import Image from 'next/image'
import { isImageSlide, useLightboxProps } from 'yet-another-react-lightbox'
import type { RenderFunction, Slide } from 'yet-another-react-lightbox'

export const NextImageSlide: RenderFunction<{ slide: Slide; rect: { width: number; height: number } }> = ({
  slide,
  rect,
}) => {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps()

  if (!isImageSlide(slide)) return undefined

  const width = Math.ceil(
    Math.min(rect.width, (rect.height / (slide.height || 1)) * (slide.width || 1))
  )
  const height = Math.ceil(
    Math.min(rect.height, (rect.width / (slide.width || 1)) * (slide.height || 1))
  )

  return (
    <div style={{ position: 'relative', width, height }}>
      <Image
        fill
        alt={slide.alt ?? ''}
        src={slide.src}
        loading="eager"
        draggable={false}
        style={{ objectFit: imageFit === 'contain' ? 'contain' : 'cover' }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={click ? () => click({ index: 0 }) : undefined}
      />
    </div>
  )
}
