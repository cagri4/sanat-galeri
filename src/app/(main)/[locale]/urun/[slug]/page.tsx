import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getProductBySlug } from '@/lib/queries/gallery'
import LightboxViewer from '@/components/gallery/lightbox-viewer'
import ContactForm from '@/components/gallery/contact-form'
import Reveal from '@/components/motion/reveal'
import RichText from '@/components/shared/rich-text'

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
    <div className="py-12 lg:py-20">
      {/* lg:gap-20 — gorsel ile kunye arasinda muze etiketi mesafesi */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Image gallery */}
        {slides.length > 0 && (
          <Reveal>
            <LightboxViewer slides={slides} thumbnails={thumbnails} />
          </Reveal>
        )}

        {/* Metadata + CTAs */}
        <Reveal delay={0.08} className="space-y-10">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl font-light leading-[1.1] tracking-[-0.01em] text-[#1a1a1a] sm:text-5xl">
            {title}
          </h1>

          {/* Katalog künyesi */}
          <dl className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
            {artistName && (
              <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-6 py-4">
                <dt className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">{t('artist')}</dt>
                <dd className="text-[length:var(--text-body)] text-[#1a1a1a]">
                  {eser.artist?.slug ? (
                    <a
                      href={`/${locale}/${eser.artist.slug}`}
                      className="underline decoration-[var(--rule)] underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:decoration-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {artistName}
                    </a>
                  ) : (
                    artistName
                  )}
                </dd>
              </div>
            )}

            {catalogRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[minmax(0,8rem)_1fr] gap-6 py-4">
                <dt className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">{row.label}</dt>
                <dd className="text-[length:var(--text-body)] leading-relaxed text-[#1a1a1a]">{row.value}</dd>
              </div>
            ))}

            {(priceDisplay || eser.isSold) && (
              <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-6 py-4">
                <dt className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">{t('price')}</dt>
                <dd className="text-[length:var(--text-body)] text-[#1a1a1a]">
                  {eser.isSold ? <span className="text-[#8a6d3b]">{t('sold')}</span> : priceDisplay}
                </dd>
              </div>
            )}
          </dl>

          {/* Açıklama / ikonografik çözümleme — sanatçının kendi metni,
              paragrafları ve vurguları korunarak basılır. */}
          {description && (
            <RichText
              text={String(description)}
              className="space-y-5"
              paragraphClassName="max-w-[68ch] text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]"
            />
          )}

          {/* Replika Hakkında — sanatçının katalog şemasındaki sabit bölüm */}
          <div className="border-l border-[var(--rule)] pl-5">
            <h2 className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">{t('about')}</h2>
            <p className="mt-3 max-w-[68ch] text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]">{t('aboutText')}</p>
          </div>


          {/* Contact Form */}
          <div className="pt-6 border-t border-[#e8e2d8]">
            <h2 className="font-[family-name:var(--font-serif)] text-xl font-light text-[#1a1a1a] mb-4">
              {t('contactTitle')}
            </h2>
            <ContactForm productSlug={slug} />
          </div>
        </Reveal>
      </div>
    </div>
  )
}
