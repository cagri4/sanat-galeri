import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/queries/gallery'
import { buildDomainLink } from '@/components/shared/navbar'

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
      <section className="relative py-20 sm:py-28 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900 leading-tight">
              {tCommon('siteTitle')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-neutral-500 leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href={`/${locale}/galeri`}
                className="inline-block border border-neutral-900 px-8 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                {t('exploreGallery')}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
              alt={isTr ? 'Sanat atölyesi' : 'Art studio'}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Featured Works Strip */}
      <section className="py-12 border-t border-neutral-100">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80"
              alt={isTr ? 'Soyut resim' : 'Abstract painting'}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="33vw"
            />
          </div>
          <div className="aspect-square relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500&q=80"
              alt={isTr ? 'Seramik heykel' : 'Ceramic sculpture'}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="33vw"
            />
          </div>
          <div className="aspect-square relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=500&q=80"
              alt={isTr ? 'Modern sanat' : 'Modern art'}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="33vw"
            />
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-16 sm:py-20 border-t border-neutral-100">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 text-center mb-12">
          {t('meetArtists')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Melike */}
          <div className="group">
            <div className="aspect-[3/4] relative overflow-hidden bg-neutral-100">
              <Image
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80"
                alt="Melike Yıldız"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <h3 className="mt-6 text-xl font-medium text-neutral-900">Melike Yıldız</h3>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              {t('melikeBio')}
            </p>
            <a
              href={buildDomainLink(MELIKE_URL, `/${locale}`)}
              className="mt-4 inline-block text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-900 transition-colors"
            >
              {t('viewPortfolio')} &rarr;
            </a>
          </div>
          {/* Seref */}
          <div className="group">
            <div className="aspect-[3/4] relative overflow-hidden bg-neutral-100">
              <Image
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80"
                alt="Şeref Kaya"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <h3 className="mt-6 text-xl font-medium text-neutral-900">Şeref Kaya</h3>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              {t('serefBio')}
            </p>
            <a
              href={buildDomainLink(SEREF_URL, `/${locale}`)}
              className="mt-4 inline-block text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-900 transition-colors"
            >
              {t('viewPortfolio')} &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Recent Works Section */}
      <section className="py-16 sm:py-20 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">
            {t('recentWorks')}
          </h2>
          <Link
            href={`/${locale}/galeri`}
            className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-4 transition-colors"
          >
            {t('viewAll')} &rarr;
          </Link>
        </div>
        {recentProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Placeholder artwork cards with Unsplash images */}
            {[
              { src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80', title: isTr ? 'Mavi Düşler' : 'Blue Dreams' },
              { src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&q=80', title: isTr ? 'Sonbahar Işığı' : 'Autumn Light' },
              { src: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=400&q=80', title: isTr ? 'Doğanın Sesi' : 'Voice of Nature' },
              { src: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&q=80', title: isTr ? 'Sessiz Şehir' : 'Silent City' },
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-neutral-100 overflow-hidden relative">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <h3 className="mt-2 text-sm font-medium text-neutral-900">{item.title}</h3>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
