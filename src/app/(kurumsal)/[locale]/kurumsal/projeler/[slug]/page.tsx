import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getProductBySlug } from '@/lib/queries/gallery'
import { galeriPath, isOnSite, kurumsalPath } from '@/lib/site'
import { kurumsalText } from '@/lib/kurumsal'
import LightboxViewer from '@/components/gallery/lightbox-viewer'
import RichText from '@/components/shared/rich-text'
import SpecTable from '@/components/kurumsal/spec-table'
import Image from 'next/image'
import { getExhibitionPhotos } from '@/lib/queries/exhibition-photos'
import { yeniIcerikAcik } from '@/lib/yeni-icerik'
import Reveal from '@/components/motion/reveal'
import { staggerDelay } from '@/lib/motion'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

async function load(slug: string) {
  try {
    const p = await getProductBySlug(slug)
    // Galeriye özel eserler (replika, resimli seramik) kurumsalda yok.
    return p && isOnSite(p.category, 'kurumsal') ? p : null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const p = await load(slug)
  if (!p) return {}
  return { title: locale === 'tr' ? p.titleTr : p.titleEn }
}

export default async function ProjeDetay({ params }: PageProps) {
  const { locale, slug } = await params
  const p = await load(slug)
  if (!p) notFound()

  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'kurumsal' })
  const tg = await getTranslations({ locale, namespace: 'gallery' })
  const host = (await headers()).get('host') ?? ''

  const title = isTr ? p.titleTr : p.titleEn
  const text = kurumsalText(p, isTr)
  const alsoInGaleri = isOnSite(p.category, 'galeri')
  const isPanel = p.category === 'Mimari Duvar Panoları'
  const artistName = p.artist ? (isTr ? p.artist.nameTr : p.artist.nameEn) : null

  const slides = p.images.map((img: { url: string; altTr?: string | null; altEn?: string | null }) => ({
    src: img.url,
    alt: (isTr ? img.altTr : img.altEn) ?? title,
    width: 1200,
    height: 1600,
    title,
  }))
  // Yapım ve montaj fotoğrafları (exhibition_photos 'yapim-<slug>') — gizli
  // içerikle birlikte açılır (lib/yeni-icerik).
  const yapim = yeniIcerikAcik() ? await getExhibitionPhotos(`yapim-${p.slug}`) : []
  const thumbnails = slides.map(({ src, alt }: { src: string; alt: string }) => ({ src, alt }))

  return (
    <main className="py-12 lg:py-16">
      <a href={kurumsalPath(host, locale, '/projeler')} className="text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--accent)]">
        &larr; {t('nav.projects')}
      </a>
      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {slides.length > 0 && <LightboxViewer slides={slides} thumbnails={thumbnails} />}
        </div>
        <div className="space-y-10 lg:col-span-5">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[var(--tracking-label)] text-[var(--accent)]">
              {tg.has(`categories.${p.category}`) ? tg(`categories.${p.category}`) : p.category}
            </p>
            <h1 className="mt-3 text-3xl leading-[1.12] sm:text-4xl">{title}</h1>
          </div>

          <div>
            <h2 className="mb-3 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--muted)]">{t('specTitle')}</h2>
            <SpecTable
              rows={[
                // SADE künye (Çağrı 13 Eki, GOREV-A-LISTESI düzeltme): ad · yer · yıl ·
                // ölçü · yapan kişi. Fazlası yok. Boş değer satırı gösterilmez.
                // Panolarda `collection` uygulama YERİNİ tutar; heykellerde seri adıdır,
                // yer değildir → heykelde yer satırı boş kalır (uydurulmaz).
                { label: t('specName'), value: title },
                { label: t('specLocation'), value: isPanel ? p.collection : null },
                { label: t('specYear'), value: p.year ? String(p.year) : null },
                { label: t('specSize'), value: isTr ? p.dimensionsTr : p.dimensionsEn },
                { label: t('specArtist'), value: artistName },
              ]}
            />
          </div>

          {text ? (
            <RichText
              text={text}
              className="space-y-4"
              paragraphClassName="max-w-[64ch] text-[length:var(--text-body)] leading-[1.75] text-[var(--foreground)]/80"
            />
          ) : (
            // Kurumsal metin yok: galeri metni KULLANILMAZ (karar 2), uydurulmaz.
            <p className="border-l-2 border-[var(--rule)] pl-4 text-[length:var(--text-meta)] text-[var(--muted)]">
              {t('descPending')}
            </p>
          )}

          {alsoInGaleri && (
            <a href={galeriPath(host, locale, `/urun/${p.slug}`)} className="inline-block text-[length:var(--text-meta)] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--accent)]">
              {t('galeriLink')} &rarr;
            </a>
          )}

          <div className="border-t border-[var(--foreground)] pt-6">
            <h2 className="text-xl">{t('ctaTitle')}</h2>
            <p className="mt-2 max-w-[52ch] text-[length:var(--text-meta)] leading-relaxed text-[var(--muted)]">{t('ctaLead')}</p>
            <a
              href={kurumsalPath(host, locale, '/iletisim')}
              className="mt-5 inline-flex min-h-11 items-center bg-[var(--accent)] px-6 text-[length:var(--text-meta)] text-white hover:opacity-90"
            >
              {t('ctaButton')}
            </a>
          </div>
        </div>
      </div>

      {yapim.length > 0 && (
        <Reveal as="section" className="mt-20 border-t border-[var(--rule)] pt-12">
          <h2 className="mb-8 text-2xl sm:text-3xl">{t('makingProject')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {yapim.map((f, i) => (
              <Reveal key={f.id} delay={staggerDelay(i)} className="relative aspect-[4/3] overflow-hidden bg-[#e6e9e8]">
                <Image src={f.url} alt={`${title} — ${t('makingProject')} ${i + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}
    </main>
  )
}
