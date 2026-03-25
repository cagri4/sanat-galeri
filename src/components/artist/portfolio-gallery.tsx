'use client'

import LightboxViewer from '@/components/gallery/lightbox-viewer'
import { getArtistPortfolio } from '@/lib/queries/artist'

type PortfolioItem = Awaited<ReturnType<typeof getArtistPortfolio>>[number]

interface PortfolioGalleryProps {
  items: PortfolioItem[]
  locale: string
}

export default function PortfolioGallery({ items, locale }: PortfolioGalleryProps) {
  const slides = items.map((item) => ({
    src: item.imageUrl,
    alt: locale === 'tr' ? (item.titleTr ?? '') : (item.titleEn ?? ''),
    title: locale === 'tr' ? (item.titleTr ?? undefined) : (item.titleEn ?? undefined),
  }))

  const thumbnails = items.map((item) => ({
    src: item.imageUrl,
    alt: locale === 'tr' ? (item.titleTr ?? '') : (item.titleEn ?? ''),
  }))

  return <LightboxViewer slides={slides} thumbnails={thumbnails} />
}
