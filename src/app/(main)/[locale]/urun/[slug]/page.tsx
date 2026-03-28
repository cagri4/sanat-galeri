import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getProductBySlug } from '@/lib/queries/gallery'
import LightboxViewer from '@/components/gallery/lightbox-viewer'
import WhatsAppButton from '@/components/gallery/whatsapp-button'
import ContactForm from '@/components/gallery/contact-form'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const eser = await getProductBySlug(slug)
  if (!eser) return {}

  const title = locale === 'tr' ? eser.titleTr : eser.titleEn
  const medium = locale === 'tr' ? eser.mediumTr : eser.mediumEn
  const dimensions = locale === 'tr' ? eser.dimensionsTr : eser.dimensionsEn
  const description = [medium, dimensions].filter(Boolean).join(' — ')

  return {
    title,
    description: description || undefined,
  }
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const { locale, slug } = await params
  const eser = await getProductBySlug(slug)

  if (!eser) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'gallery' })
  const isTr = locale === 'tr'

  const title = isTr ? eser.titleTr : eser.titleEn
  const description = isTr ? eser.descriptionTr : eser.descriptionEn
  const medium = isTr ? eser.mediumTr : eser.mediumEn
  const dimensions = isTr ? eser.dimensionsTr : eser.dimensionsEn
  const artistName = eser.artist ? (isTr ? eser.artist.nameTr : eser.artist.nameEn) : null

  // Build slides and thumbnails from product images
  const slides = eser.images.map((img: any) => ({
    src: img.url,
    alt: (isTr ? img.altTr : img.altEn) ?? title,
    width: 1200,
    height: 1600,
    title: title,
  }))

  const thumbnails = eser.images.map((img: any) => ({
    src: img.url,
    alt: (isTr ? img.altTr : img.altEn) ?? title,
  }))

  // Build current page URL for WhatsApp
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const pageUrl = `${protocol}://${host}/${locale}/urun/${slug}`

  // Format price
  let priceDisplay: string
  if (eser.price) {
    const currency = eser.currency ?? 'TRY'
    const amount = parseFloat(eser.price)
    priceDisplay = new Intl.NumberFormat(isTr ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } else {
    priceDisplay = t('contactForPrice')
  }

  return (
    <div className="py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        {slides.length > 0 && (
          <div>
            <LightboxViewer slides={slides} thumbnails={thumbnails} />
          </div>
        )}

        {/* Metadata + CTAs */}
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{title}</h1>

          {/* Definition list */}
          <dl className="divide-y divide-gray-100">
            {artistName && (
              <div className="py-3 grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  {t('artist')}
                </dt>
                <dd className="text-sm text-gray-900">
                  {eser.artist?.slug ? (
                    <a
                      href={`/${locale}/sanatci/${eser.artist.slug}`}
                      className="hover:underline"
                    >
                      {artistName}
                    </a>
                  ) : (
                    artistName
                  )}
                </dd>
              </div>
            )}

            {medium && (
              <div className="py-3 grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  {t('medium')}
                </dt>
                <dd className="text-sm text-gray-900">{medium}</dd>
              </div>
            )}

            {dimensions && (
              <div className="py-3 grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  {t('dimensions')}
                </dt>
                <dd className="text-sm text-gray-900">{dimensions}</dd>
              </div>
            )}

            {eser.year && (
              <div className="py-3 grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  {t('year')}
                </dt>
                <dd className="text-sm text-gray-900">{eser.year}</dd>
              </div>
            )}

            <div className="py-3 grid grid-cols-2 gap-4">
              <dt className="text-sm font-medium text-gray-500">
                {t('price')}
              </dt>
              <dd className="text-sm font-semibold text-gray-900">
                {eser.isSold ? (
                  <span className="text-red-600">{t('sold')}</span>
                ) : (
                  priceDisplay
                )}
              </dd>
            </div>
          </dl>

          {/* Description */}
          {description && (
            <div className="prose prose-sm max-w-none text-gray-700">
              <p>{description}</p>
            </div>
          )}

          {/* WhatsApp CTA */}
          {eser.artist?.whatsapp && (
            <WhatsAppButton
              phone={eser.artist.whatsapp}
              artworkTitle={title}
              pageUrl={pageUrl}
              locale={locale}
            />
          )}

          {/* Contact Form */}
          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('contactTitle')}
            </h2>
            <ContactForm productSlug={slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
