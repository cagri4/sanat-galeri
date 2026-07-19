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
  let eser: Awaited<ReturnType<typeof getProductBySlug>> | null = null
  try { eser = await getProductBySlug(slug) } catch {}
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
  let eser: Awaited<ReturnType<typeof getProductBySlug>> | null = null
  try { eser = await getProductBySlug(slug) } catch {}

  if (!eser) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'gallery' })
  const isTr = locale === 'tr'

  const title = isTr ? eser.titleTr : eser.titleEn
  const description = isTr ? eser.descriptionTr : eser.descriptionEn
  const medium = isTr ? eser.mediumTr : eser.mediumEn
  const dimensions = isTr ? eser.dimensionsTr : eser.dimensionsEn
  const form = isTr ? eser.formTr : eser.formEn
  const period = isTr ? eser.periodTr : eser.periodEn
  const subject = isTr ? eser.subjectTr : eser.subjectEn
  const artistName = eser.artist ? (isTr ? eser.artist.nameTr : eser.artist.nameEn) : null

  // Katalog satırları — sanatçının istediği sıra. Değeri olmayan alan gizlenir.
  const catalogRows = [
    { label: t('form'), value: form },
    { label: t('period'), value: period },
    { label: t('medium'), value: medium },
    { label: t('subject'), value: subject },
    { label: t('dimensions'), value: dimensions },
    { label: t('year'), value: eser.year ? String(eser.year) : null },
  ].filter((r) => r.value)

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

  // Katalog modeli: fiyat yoksa fiyat satırı hiç gösterilmez ("fiyat için
  // iletişime geçin" de yazılmaz). Fiyatlı eserlerde satır görünür.
  const priceDisplay = eser.price
    ? new Intl.NumberFormat(isTr ? 'tr-TR' : 'en-US', {
        style: 'currency',
        currency: eser.currency ?? 'TRY',
        maximumFractionDigits: 0,
      }).format(parseFloat(eser.price))
    : null

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
        <div className="space-y-8">
          <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-light tracking-tight text-[#1a1a1a]">
            {title}
          </h1>

          {/* Katalog künyesi */}
          <dl className="divide-y divide-[#e8e2d8] border-y border-[#e8e2d8]">
            {artistName && (
              <div className="py-3 grid grid-cols-[minmax(0,9rem)_1fr] gap-4">
                <dt className="text-[11px] uppercase tracking-[0.15em] text-[#999]">{t('artist')}</dt>
                <dd className="text-sm text-[#1a1a1a]">
                  {eser.artist?.slug ? (
                    <a href={`/${locale}/${eser.artist.slug}`} className="hover:underline">
                      {artistName}
                    </a>
                  ) : (
                    artistName
                  )}
                </dd>
              </div>
            )}

            {catalogRows.map((row) => (
              <div key={row.label} className="py-3 grid grid-cols-[minmax(0,9rem)_1fr] gap-4">
                <dt className="text-[11px] uppercase tracking-[0.15em] text-[#999]">{row.label}</dt>
                <dd className="text-sm leading-relaxed text-[#1a1a1a]">{row.value}</dd>
              </div>
            ))}

            {(priceDisplay || eser.isSold) && (
              <div className="py-3 grid grid-cols-[minmax(0,9rem)_1fr] gap-4">
                <dt className="text-[11px] uppercase tracking-[0.15em] text-[#999]">{t('price')}</dt>
                <dd className="text-sm text-[#1a1a1a]">
                  {eser.isSold ? <span className="text-[#8a6d3b]">{t('sold')}</span> : priceDisplay}
                </dd>
              </div>
            )}
          </dl>

          {/* Açıklama — paragraflar korunur */}
          {description && (
            <div className="space-y-4">
              {String(description).split('\n\n').filter(Boolean).map((para: string, i: number) => (
                <p key={i} className="text-[15px] leading-[1.75] text-[#4a4a4a]">
                  {para}
                </p>
              ))}
            </div>
          )}

          {/* Replika Hakkında — sanatçının katalog şemasındaki sabit bölüm */}
          <div className="border-l-2 border-[#e8e2d8] pl-4">
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#999]">{t('about')}</h2>
            <p className="mt-2 text-[15px] leading-[1.75] text-[#4a4a4a]">{t('aboutText')}</p>
          </div>

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
          <div className="pt-6 border-t border-[#e8e2d8]">
            <h2 className="font-[family-name:var(--font-serif)] text-xl font-light text-[#1a1a1a] mb-4">
              {t('contactTitle')}
            </h2>
            <ContactForm productSlug={slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
