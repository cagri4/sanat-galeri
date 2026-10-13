import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAllArtists, getAllExhibitions } from '@/lib/queries/artist'
import { getExhibitionPhotosBySlugs, type ExhibitionPhoto } from '@/lib/queries/exhibition-photos'
import { SERGI_AFISI, SERGI_KUNYE, yeniIcerikAcik } from '@/lib/yeni-icerik'
import { sergiBanner } from '@/lib/banner-images'
import PageBanner from '@/components/shared/page-banner'
import Reveal from '@/components/motion/reveal'
import { staggerDelay } from '@/lib/motion'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'exhibitionsPage' })
  return { title: `${t('title')} | Uarttasarım`, description: t('metaDesc') }
}

/** Ayrı detay sayfası olan sergiler (sergi/<slug>). */
const DETAIL_PAGES: Record<string, string> = { 'bozcaada-2010-ek': 'bozcaada-2010' }

/**
 * Stüdyo → Sergiler (sanatçının 11 Eki menüsü). Kaynak: `exhibitions` tablosu
 * (Şeref Doğan özgeçmişi, 11 Eki onaylı). Ödüller sanatçı sayfasında kalır.
 * Fotoğraflar: exhibition_photos — bir sergiyle eşleşmesi SERGI_KUNYE'deki yıl +
 * yer birebir aynıysa (afiş hariç, en çok 3 kare). Eşleşme yoksa satır yalnız
 * künyedir; boş fotoğraf kutusu çizilmez.
 */
export default async function SergilerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'exhibitionsPage' })

  let exhibitions: Awaited<ReturnType<typeof getAllExhibitions>> = []
  let artists: { id: number; nameTr?: string; nameEn?: string; name_tr?: string }[] = []
  try {
    ;[exhibitions, artists] = await Promise.all([getAllExhibitions(), getAllArtists()])
  } catch {
    // DB yoksa boş liste
  }
  const artistName = (id: number | null) => {
    const a = artists.find((x) => x.id === id)
    return a ? (a.nameTr ?? a.name_tr ?? '') : ''
  }

  let photos: ExhibitionPhoto[] = []
  if (yeniIcerikAcik()) {
    try {
      photos = (await getExhibitionPhotosBySlugs(Object.keys(SERGI_KUNYE))).filter((f) => f.titleTr !== SERGI_AFISI)
    } catch {
      photos = []
    }
  }
  const slugFor = (year: number | null, location: string | null) =>
    Object.entries(SERGI_KUNYE).find(([, k]) => k.year === year && k.place === location)?.[0] ?? null

  const banner = await sergiBanner(1)

  // Yıla göre grupla (veri zaten yeniden eskiye sıralı).
  const years = [...new Set(exhibitions.map((e) => e.year))]

  return (
    <main className="pb-16 pt-8 sm:pb-24 sm:pt-10">
      <PageBanner eyebrow={t('eyebrow')} title={t('title')} image={banner} />

      <div className="mt-14 border-t border-[var(--foreground)]">
        {years.map((year) => (
          <Reveal as="section" key={year ?? 'x'} className="grid grid-cols-1 gap-4 border-b border-[var(--border)] py-8 sm:grid-cols-12 sm:gap-8">
            <h2 className="text-2xl text-[var(--foreground)] sm:col-span-2">{year}</h2>
            <ul className="space-y-8 sm:col-span-10">
              {exhibitions
                .filter((e) => e.year === year)
                .map((e) => {
                  const slug = slugFor(e.year, e.location)
                  const kareler = slug ? photos.filter((f) => f.exhibitionSlug === slug).slice(0, 3) : []
                  const detail = slug ? DETAIL_PAGES[slug] : undefined
                  const title = isTr ? e.titleTr : e.titleEn
                  return (
                    <li key={e.id}>
                      <p className="text-xl leading-snug text-[var(--foreground)]">{title}</p>
                      <p className="mt-1 text-[length:var(--text-meta)] text-[var(--muted)]">
                        {[e.location, artistName(e.artistId)].filter(Boolean).join(' · ')}
                      </p>
                      {kareler.length > 0 && (
                        <ul aria-label={`${title} — ${t('photosLabel')}`} className="mt-4 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
                          {kareler.map((f, i) => (
                            <Reveal as="li" key={f.id} delay={staggerDelay(i)} className="relative aspect-[4/3] overflow-hidden bg-[#ece7de]">
                              <Image src={f.url} alt={`${title} — ${e.location ?? ''}`} fill className="object-cover" sizes="(max-width: 640px) 33vw, 190px" />
                            </Reveal>
                          ))}
                        </ul>
                      )}
                      {detail && (
                        <Link
                          href={`/${locale}/sergi/${detail}`}
                          className="mt-3 inline-flex min-h-11 items-center text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          {t('detail')} &rarr;
                        </Link>
                      )}
                    </li>
                  )
                })}
            </ul>
          </Reveal>
        ))}
      </div>
    </main>
  )
}
