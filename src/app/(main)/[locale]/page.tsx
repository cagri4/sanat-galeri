import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/queries/gallery'
import HeroSlideshow, { type HeroSlide } from '@/components/gallery/hero-slideshow'
import InstagramSection from '@/components/gallery/instagram-section'
import { ARTIST_AVATARS, AVATAR_CLASS } from '@/lib/artist-avatars'
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

  // Sanatci kartlari icin GECICI gorseller: figursuz geometrik eserler
  // secildi — mitolojik figurlu eserler bir sanatciyi cagristirabilir,
  // atama ise hala gecici. Portre/atolye fotografi gelince degisecek.
  const artistPlaceholders = ['geometrik-donem-tabak', 'geometrik-donem-toren-kabi']
    .map((slug) => allProducts.find((p) => p.slug === slug)?.images?.[0]?.url)
    .filter(Boolean) as string[]

  // Ana sayfa yerlesimleri artik ADMIN PANELINDEN secilir
  // (/admin/ana-sayfa -> products.hero_order / instagram_order).
  // Kodda sabit slug listesi YOK; panelde hic secim yapilmamissa gorunur
  // eserlerin sirasina duserek bolum bos kalmaz.
  const withImage = allProducts.filter((p) => p.images?.[0]?.url)

  const pickSlots = (key: 'heroOrder' | 'instagramOrder', limit: number) => {
    const chosen = withImage
      .filter((p) => typeof p[key] === 'number' && p[key] !== null)
      .sort((a, b) => (a[key] as number) - (b[key] as number))
    return (chosen.length > 0 ? chosen : withImage).slice(0, limit)
  }

  // Instagram: CANLI FEED DEGIL; bu gorsellerin belirli IG gonderileri oldugu
  // iddia edilmiyor (bkz. instagram-section.tsx duruluk notu).
  const instagramItems = pickSlots('instagramOrder', 9).map((p) => ({
    src: p.images[0].url,
    alt: isTr ? p.titleTr : p.titleEn,
  }))

  const heroSlides: HeroSlide[] = pickSlots('heroOrder', 5).map((p) => {
    const title = isTr ? p.titleTr : p.titleEn
    return {
      slug: p.slug,
      title,
      image: p.images[0].url,
      alt: (isTr ? p.images[0].altTr : p.images[0].altEn) ?? title,
      category: p.category,
    }
  })

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
          // Uydurma eser adlari ("Mavi Dusler" vb.) ve stok fotograflardan
          // olusan yedek izgara kaldirildi — veri yoksa sessiz bos durum.
          <p className="py-16 text-center text-[length:var(--text-meta)] text-[#999]">
            {isTr ? 'Eserler yakında burada olacak.' : 'Works will appear here shortly.'}
          </p>
        )}
      </section>

      {/* Instagram — curated (canli feed degil), "Son Eserler" sonrasi */}
      <InstagramSection locale={locale} items={instagramItems} />

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
              {/* GECICI GORSEL: elimizde sanatci portresi/atolye fotografi yok.
                  Eser->sanatci atamasi da hala gecici oldugu icin figursuz,
                  belirli bir sanatciya baglanmayan notr bir eser gorseli
                  kullaniliyor. alt="" -> dekoratif; bu gorselin sanatciya ait
                  oldugu IDDIA EDILMIYOR (ad zaten baslikta).
                  Atolye/calisirken fotografi gelince degistirilecek. */}
              <Image
                src={artistPlaceholders[0]}
                alt=""
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-3">
                {/* Kucuk yuvarlak atolye gorseli — kaynak dusuk cozunurluklu
                    oldugu icin buyuk kullanilmiyor (bkz. lib/artist-avatars).
                    Yuksek cozunurluklu orijinal gelince degistirilecek. */}
                <Image
                  src={ARTIST_AVATARS.melike.src}
                  alt={isTr ? ARTIST_AVATARS.melike.alt.tr : ARTIST_AVATARS.melike.alt.en}
                  width={320}
                  height={320}
                  className={`h-14 w-14 shrink-0 ${AVATAR_CLASS}`}
                />
                <h3 className="font-[family-name:var(--font-serif)] text-2xl font-light text-[#1a1a1a]">
                  Melike Doğan
                </h3>
              </div>
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
              {/* GECICI GORSEL — yukaridaki notun aynisi gecerli.
                  Atolye/calisirken fotografi gelince degistirilecek. */}
              <Image
                src={artistPlaceholders[1]}
                alt=""
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-3">
                {/* Kucuk yuvarlak atolye gorseli — kaynak dusuk cozunurluklu
                    oldugu icin buyuk kullanilmiyor (bkz. lib/artist-avatars).
                    Yuksek cozunurluklu orijinal gelince degistirilecek. */}
                <Image
                  src={ARTIST_AVATARS.seref.src}
                  alt={isTr ? ARTIST_AVATARS.seref.alt.tr : ARTIST_AVATARS.seref.alt.en}
                  width={320}
                  height={320}
                  className={`h-14 w-14 shrink-0 ${AVATAR_CLASS}`}
                />
                <h3 className="font-[family-name:var(--font-serif)] text-2xl font-light text-[#1a1a1a]">
                  Şeref Doğan
                </h3>
              </div>
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
