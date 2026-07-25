import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LightboxViewer from '@/components/gallery/lightbox-viewer'
import Reveal from '@/components/motion/reveal'
import { getExhibitionPhotos } from '@/lib/queries/exhibition-photos'

/**
 * Bozcaada 2010 sergi sayfasi.
 *
 * Sayfa metni sanatcinin kendi yazdigi "Internet site duzeni.docx" dosyasindan.
 *
 * FOTOGRAFLAR ARTIK DB'DEN: `exhibition_photos` tablosu, /admin/sergi-fotograflari
 * ekranindan yonetilir. Onceden dosya adlari ve alt yazilar kodda sabitti;
 * sanatcidan kalan 9 aciklama gelince kod degistirmek gerekiyordu.
 *
 * Alt yazisi olmayan fotograf icin uydurma metin YAZILMAZ — yalnizca basligi
 * gosterilir.
 */

const SLUG = 'bozcaada-2010'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'exhibition' })
  return { title: t('title'), description: t('lead') }
}

export default async function BozcaadaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'exhibition' })

  const isTr = locale === 'tr'
  const rows = await getExhibitionPhotos(SLUG)

  const photos = rows.map((row, i) => {
    const label = (isTr ? row.titleTr : row.titleEn) ?? `${t('installation')} ${i + 1}`
    const caption = (isTr ? row.captionTr : row.captionEn) ?? undefined
    return {
      src: row.url,
      alt: caption ? `${label} — ${caption}` : `${t('title')} — ${label}`,
      width: 1600,
      height: 1200,
      title: label,
      description: caption,
    }
  })

  const missingCaptions = photos.some((p) => !p.description)

  return (
    <main className="py-16 sm:py-24">
      <Reveal as="section" className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#999]">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 text-4xl font-medium leading-[1.1] tracking-[-0.01em] text-[#2C2C2C] sm:text-5xl lg:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-[#6b6b6b]">{t('venue')}</p>
        <p className="mt-8 text-[length:var(--text-lead)] leading-[1.8] text-[#4a4a4a]">
          {t('lead')}
        </p>
      </Reveal>

      {photos.length > 0 && (
        <Reveal className="mt-16">
          <LightboxViewer slides={photos} thumbnails={photos.map((p) => ({ src: p.src, alt: p.alt }))} />
        </Reveal>
      )}

      {missingCaptions && (
        <p className="mt-16 max-w-2xl border-l border-[var(--rule)] pl-5 text-[length:var(--text-meta)] leading-relaxed text-[#999]">
          {t('captionNote')}
        </p>
      )}
    </main>
  )
}
