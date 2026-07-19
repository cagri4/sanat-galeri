import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LightboxViewer from '@/components/gallery/lightbox-viewer'

/**
 * Bozcaada 2010 sergi sayfasi.
 *
 * Metin sanatcinin kendi yazdigi "Internet site duzeni.docx" dosyasindan alindi.
 * Fotograflarin TEK TEK aciklamalari sanatcidan gelmedi — uydurulmadi, notrl
 * numaralandirma kullanildi.
 */

const PHOTO_COUNT = 12
const BUCKET = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/eserler`

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

  const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => ({
    src: `${BUCKET}/bozcaada-${i + 1}.jpg`,
    alt: `${t('title')} — ${t('installation')} ${i + 1}`,
    width: 1600,
    height: 1200,
    title: `${t('installation')} ${i + 1}`,
  }))

  return (
    <main className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#999]">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-light tracking-wide text-[#1a1a1a]">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-[#6b6b6b]">{t('venue')}</p>
        <p className="mt-6 text-[15px] leading-[1.75] text-[#4a4a4a]">{t('lead')}</p>
      </header>

      <div className="mt-12">
        <LightboxViewer slides={photos} thumbnails={photos.map((p) => ({ src: p.src, alt: p.alt }))} />
      </div>

      <p className="mt-10 max-w-2xl border-l-2 border-[#e8e2d8] pl-4 text-sm leading-relaxed text-[#999]">
        {t('captionNote')}
      </p>
    </main>
  )
}
