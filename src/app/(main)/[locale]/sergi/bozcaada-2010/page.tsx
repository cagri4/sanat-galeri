import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LightboxViewer from '@/components/gallery/lightbox-viewer'
import Reveal from '@/components/motion/reveal'

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
    <main className="py-16 sm:py-24">
      <Reveal as="section" className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#999]">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-serif)] text-4xl font-light leading-[1.1] tracking-[-0.01em] text-[#1a1a1a] sm:text-5xl lg:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-[#6b6b6b]">{t('venue')}</p>
        <p className="mt-8 text-[length:var(--text-lead)] leading-[1.8] text-[#4a4a4a]">
          {t('lead')}
        </p>
      </Reveal>

      <Reveal className="mt-16">
        <LightboxViewer slides={photos} thumbnails={photos.map((p) => ({ src: p.src, alt: p.alt }))} />
      </Reveal>

      <p className="mt-16 max-w-2xl border-l border-[var(--rule)] pl-5 text-[length:var(--text-meta)] leading-relaxed text-[#999]">
        {t('captionNote')}
      </p>
    </main>
  )
}
