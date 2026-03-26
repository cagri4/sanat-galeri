import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getProducts } from '@/lib/queries/gallery'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('homeTitle'), description: t('homeDesc') }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'

  // Try to load recent works — gracefully handle DB not available
  let recentProducts: Awaited<ReturnType<typeof getProducts>> = []
  try {
    recentProducts = await getProducts()
    recentProducts = recentProducts.slice(0, 4)
  } catch {
    // DB not available
  }

  const isTr = locale === 'tr'

  return (
    <main>
      {/* Hero Section */}
      <section className="py-16 sm:py-24 lg:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900">
          {tCommon('siteTitle')}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto">
          {t('heroSubtitle')}
        </p>
        <div className="mt-8">
          <Link
            href={`/${locale}/galeri`}
            className="inline-block border border-neutral-900 px-8 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            {t('exploreGallery')}
          </Link>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-12 sm:py-16 border-t border-neutral-100">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 text-center">
          {t('meetArtists')}
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Melike */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-4xl font-light text-neutral-400">M</span>
            </div>
            <h3 className="mt-4 text-xl font-medium text-neutral-900">Melike Yıldız</h3>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
              {t('melikeBio')}
            </p>
            <a
              href={`${MELIKE_URL}/${locale}`}
              className="mt-4 inline-block text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-900"
            >
              {t('viewPortfolio')} &rarr;
            </a>
          </div>
          {/* Seref */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-4xl font-light text-neutral-400">Ş</span>
            </div>
            <h3 className="mt-4 text-xl font-medium text-neutral-900">Şeref Kaya</h3>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
              {t('serefBio')}
            </p>
            <a
              href={`${SEREF_URL}/${locale}`}
              className="mt-4 inline-block text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-900"
            >
              {t('viewPortfolio')} &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Recent Works Section */}
      <section className="py-12 sm:py-16 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">
            {t('recentWorks')}
          </h2>
          <Link
            href={`/${locale}/galeri`}
            className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-4"
          >
            {t('viewAll')} &rarr;
          </Link>
        </div>
        {recentProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                href={`/${locale}/urun/${product.slug}`}
                className="group"
              >
                <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={isTr ? (product.images[0].altTr ?? product.titleTr) : (product.images[0].altEn ?? product.titleEn)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-neutral-300 text-sm">
                        {isTr ? product.titleTr : product.titleEn}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                  {isTr ? product.titleTr : product.titleEn}
                </h3>
                {product.price && (
                  <p className="text-xs text-neutral-500">
                    {Number(product.price).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')} {product.currency ?? 'TRY'}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 py-16 text-center">
            <p className="text-neutral-400 text-sm">
              {isTr ? 'Yakında eserler eklenecek.' : 'Artworks coming soon.'}
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
