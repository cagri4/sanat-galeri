import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { CATEGORIES, CATEGORY_SLUGS, COLLECTIONS } from '@/lib/categories'
import PageBanner, { bannerFromProducts } from '@/components/shared/page-banner'
import { galleryCollections, itemsFor } from '@/lib/series'
import { categoriesForSite } from '@/lib/site'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'collectionsPage' })
  const isTr = locale === 'tr'
  return {
    title: `${t('title')} | ${isTr ? 'Uarttasarım' : 'Uarttasarım'}`,
    description: t('lead'),
  }
}

export default async function KoleksiyonlarPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'collectionsPage' })
  const tg = await getTranslations({ locale, namespace: 'gallery' })

  let products: Awaited<ReturnType<typeof getProducts>> = []
  try {
    products = await getProducts(undefined, 'galeri')
  } catch {
    // DB yoksa sessiz bos durum
  }

  // Yalnız galeri kategorileri (panolar kurumsalda); heykeller iki seri sayfası.
  const blocks = galleryCollections(categoriesForSite('galeri', CATEGORIES), CATEGORY_SLUGS).map((c) => {
    const items = itemsFor(products, c)
    return {
      cat: c.slug,
      slug: c.slug,
      label: c.series ?? (tg.has(`categories.${c.category}`) ? tg(`categories.${c.category}`) : c.category),
      cover: items.find((p) => p.images?.[0]?.url)?.images[0]?.url ?? null,
      count: items.length,
      subCollections: c.series ? [] : (COLLECTIONS[c.category] ?? []).map((x) => (isTr ? x.tr : x.en)),
    }
  })

  return (
    <main className="pb-16 pt-8 sm:pb-24 sm:pt-10">
      <PageBanner title={t('title')} image={bannerFromProducts(products, locale, 1)} />
      <p className="mt-10 max-w-[62ch] text-[length:var(--text-lead)] leading-[1.85] text-[#4a4a4a]">
        {t('lead')}
      </p>

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {blocks.map(({ cat, slug, label, cover, count, subCollections }, i) => (
          <Link
            key={cat}
            href={`/${locale}/koleksiyonlar/${slug}`}
            // Blok sayısı tekse ilk blok geniş (ritim); çiftse 2×2 düz ızgara
            // (heykeller iki seri olunca 4 blok — sonda yalnız blok kalmasın).
            className={`hover-card hover-media group relative block overflow-hidden bg-[#ece7de] ${
              i === 0 && blocks.length % 2 === 1 ? 'sm:col-span-2 aspect-[16/10]' : 'aspect-[4/5]'
            }`}
          >
            {cover && (
              <Image
                src={cover}
                alt=""
                fill
                priority={i === 0}
                className="object-cover"
                sizes={i === 0 && blocks.length % 2 === 1 ? '100vw' : '(max-width: 640px) 100vw, 50vw'}
              />
            )}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            {count === 0 && (
              <span className="absolute left-6 top-6 rounded-full bg-white/80 px-3 py-1 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b]">
                {t('comingSoonTag')}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <h2 className="text-xl font-medium text-white sm:text-2xl">{label}</h2>
              <p className="mt-1.5 flex items-center gap-3 text-[length:var(--text-meta)] text-white/80">
                <span>
                  {count > 0
                    ? `${count} ${isTr ? 'eser' : count === 1 ? 'work' : 'works'}`
                    : t('emptyNote')}
                </span>
                {subCollections.length > 0 && (
                  <span className="text-white/60">· {subCollections.join(', ')}</span>
                )}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-white/90">
                {t('viewCollection')}
                <span aria-hidden className="transition-transform duration-[var(--dur-micro)] group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
