import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/queries/gallery'
import { getCrossDomainLinks } from '@/components/shared/navbar'

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
  const isTr = locale === 'tr'

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'
  const domainLinks = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)

  let recentProducts: Awaited<ReturnType<typeof getProducts>> = []
  try {
    recentProducts = await getProducts()
    recentProducts = recentProducts.slice(0, 6)
  } catch {
    // DB not available
  }

  return (
    <main>
      {/* Hero — full width image with overlay text */}
      <section className="relative -mx-6 sm:-mx-10 lg:-mx-16 overflow-hidden">
        <div className="aspect-[16/7] sm:aspect-[16/6] relative">
          <Image
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80"
            alt={isTr ? 'U-Art Tasarım Atölyesi' : 'U-Art Design Studio'}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl lg:text-7xl font-light text-white tracking-wide">
              U-Art Tasarım
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/80 tracking-[0.2em] uppercase">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Intro text */}
      <section className="py-20 sm:py-28 max-w-3xl mx-auto text-center">
        <p className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-light leading-relaxed text-[#1a1a1a]">
          {isTr
            ? 'Geleneksel sanat formlarını çağdaş yaklaşımlarla buluşturan özgün eserler. Tablo, heykel, seramik ve baskı resimlerden oluşan koleksiyonumuzu keşfedin.'
            : 'Original works that blend traditional art forms with contemporary approaches. Explore our collection of paintings, sculptures, ceramics, and prints.'}
        </p>
        <Link
          href={`/${locale}/galeri`}
          className="mt-10 inline-block bg-[#612E49] text-white text-[13px] uppercase tracking-[0.15em] px-10 py-4 rounded-full hover:bg-[#4f243b] transition-colors"
        >
          {t('exploreGallery')}
        </Link>
      </section>

      {/* Featured works — 3 column grid */}
      <section className="py-16 border-t border-[#e8e4de]">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-light text-[#1a1a1a]">
            {t('recentWorks')}
          </h2>
          <Link
            href={`/${locale}/galeri`}
            className="text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            {t('viewAll')} &rarr;
          </Link>
        </div>

        {recentProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                href={`/${locale}/urun/${product.slug}`}
                className="group"
              >
                <div className="aspect-[3/4] bg-[#f0ece4] overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={isTr ? (product.images[0].altTr ?? product.titleTr) : (product.images[0].altEn ?? product.titleEn)}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[#999] text-sm font-[family-name:var(--font-serif)] italic">
                        {isTr ? product.titleTr : product.titleEn}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-sm text-[#1a1a1a]">
                  {isTr ? product.titleTr : product.titleEn}
                </h3>
                {product.price && (
                  <p className="text-[13px] text-[#6b6b6b]">
                    {Number(product.price).toLocaleString(isTr ? 'tr-TR' : 'en-US')} {product.currency ?? 'TRY'}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80', title: isTr ? 'Mavi Düşler' : 'Blue Dreams' },
              { src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80', title: isTr ? 'Sonbahar Işığı' : 'Autumn Light' },
              { src: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500&q=80', title: isTr ? 'Toprak ve Form' : 'Earth & Form' },
              { src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&q=80', title: isTr ? 'Doğanın Sesi' : 'Voice of Nature' },
              { src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=500&q=80', title: isTr ? 'Sessiz Şehir' : 'Silent City' },
              { src: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=500&q=80', title: isTr ? 'Renk Çalışması' : 'Color Study' },
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-[#f0ece4] overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill={false}
                    width={500}
                    height={667}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <h3 className="mt-3 text-sm text-[#1a1a1a]">{item.title}</h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Artists — side by side with large images */}
      <section className="py-20 border-t border-[#e8e4de]">
        <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-light text-[#1a1a1a] text-center mb-14">
          {t('meetArtists')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Melike */}
          <a
            href={domainLinks.melike}
            className="group block"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-[#f0ece4]">
              <Image
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=700&q=80"
                alt="Melike Doğan"
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="mt-5">
              <h3 className="font-[family-name:var(--font-serif)] text-2xl font-light text-[#1a1a1a]">
                Melike Doğan
              </h3>
              <p className="mt-2 text-[13px] text-[#6b6b6b] leading-relaxed max-w-sm">
                {t('melikeBio')}
              </p>
              <span className="mt-3 inline-block text-[13px] uppercase tracking-[0.15em] text-[#612E49] group-hover:text-[#4f243b] transition-colors">
                {t('viewPortfolio')} &rarr;
              </span>
            </div>
          </a>

          {/* Seref */}
          <a
            href={domainLinks.seref}
            className="group block"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-[#f0ece4]">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=700&q=80"
                alt="Şeref Doğan"
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="mt-5">
              <h3 className="font-[family-name:var(--font-serif)] text-2xl font-light text-[#1a1a1a]">
                Şeref Doğan
              </h3>
              <p className="mt-2 text-[13px] text-[#6b6b6b] leading-relaxed max-w-sm">
                {t('serefBio')}
              </p>
              <span className="mt-3 inline-block text-[13px] uppercase tracking-[0.15em] text-[#612E49] group-hover:text-[#4f243b] transition-colors">
                {t('viewPortfolio')} &rarr;
              </span>
            </div>
          </a>
        </div>
      </section>
    </main>
  )
}
