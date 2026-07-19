import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/queries/gallery'
import HeroSlideshow, { type HeroSlide } from '@/components/gallery/hero-slideshow'
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
  const tc = await getTranslations({ locale, namespace: 'collection' })
  const isTr = locale === 'tr'

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'
  const domainLinks = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)

  let allProducts: Awaited<ReturnType<typeof getProducts>> = []
  try {
    allProducts = await getProducts()
  } catch {
    // DB not available
  }
  const recentProducts = allProducts.slice(0, 6)

  // Hero: 5 FARKLI seriden birer guclu gorsel (sanatcinin sirasindan secildi).
  // Gorsel cesitliligi gozetildi: krater / kylix / figurlu tabak / geometrik.
  const HERO_SLUGS = ['volutlu-krater', 'afrodit-ve-kaz', 'thetis', 'siren', 'geometrik-donem-tabak']
  const heroSlides: HeroSlide[] = HERO_SLUGS.map((slug) => {
    const p = allProducts.find((x) => x.slug === slug)
    if (!p || !p.images?.[0]) return null
    const title = isTr ? p.titleTr : p.titleEn
    return {
      slug: p.slug,
      title,
      image: p.images[0].url,
      alt: (isTr ? p.images[0].altTr : p.images[0].altEn) ?? title,
      category: p.category,
    }
  }).filter(Boolean) as HeroSlide[]

  return (
    <main>
      {/* Hero — sanatcinin 5 eserinden slayt (stok fotograf kaldirildi) */}
      <HeroSlideshow slides={heroSlides} locale={locale} ctaLabel={tc('cta')} />

      {/* Intro text */}
      <section className="py-20 sm:py-28 max-w-3xl mx-auto text-center">
        <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
          {tc('eyebrow')}
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-serif)] text-3xl font-light leading-tight text-[#1a1a1a] sm:text-4xl">
          {tc('title')}
        </h2>
        {/* Sanatcinin kendi koleksiyon tanitim metni */}
        <p className="mx-auto mt-8 max-w-[68ch] text-[length:var(--text-lead)] leading-[1.8] text-[#4a4a4a]">
          {tc('short')}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
          <Link
            href={`/${locale}/galeri`}
            className="group inline-flex min-h-11 items-center gap-2 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#1a1a1a]"
          >
            <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-micro)] ease-out group-hover:bg-[length:100%_1px]">
              {tc('cta')}
            </span>
            <span aria-hidden className="transition-transform duration-[var(--dur-micro)] group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href={`/${locale}/teknik`}
            className="group inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a]"
          >
            {tc('techniqueCta')}
          </Link>
        </div>
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
                src="https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=700&q=80"
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
