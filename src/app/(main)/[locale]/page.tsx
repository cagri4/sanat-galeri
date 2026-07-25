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
  const tg = await getTranslations({ locale, namespace: 'gallery' })
  const tcol = await getTranslations({ locale, namespace: 'collectionsPage' })
  const tcom = await getTranslations({ locale, namespace: 'commissions' })
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

  // Koleksiyon teaser: her kategori icin ilk gorsel (varsa). Bos kategori
  // notr bir doku ile gosterilir — "yakinda" hissi, kirik gorunmez.
  const CATS = ['Antik Dönem Replikaları', 'Resimli Seramikler', 'Mimari Duvar Panoları']
  const collectionBlocks = CATS.map((cat) => ({
    cat,
    label: tg.has(`categories.${cat}`) ? tg(`categories.${cat}`) : cat,
    cover: withImage.find((p) => p.category === cat)?.images[0]?.url ?? null,
  }))

  return (
    <main>
      {/* Hero — full-bleed, yazisiz slider */}
      <HeroSlideshow slides={heroSlides} locale={locale} ctaLabel={tc('cta')} />

      {/* Lirik giris — dar, ortali, bol bosluk */}
      <section className="mx-auto max-w-2xl px-6 py-24 text-center sm:py-32">
        <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
          {tc('eyebrow')}
        </p>
        <h2 className="mt-5 text-3xl font-medium leading-tight text-[#2C2C2C] sm:text-4xl">
          {tc('title')}
        </h2>
        <p className="mx-auto mt-8 max-w-[62ch] text-[length:var(--text-lead)] leading-[1.85] text-[#4a4a4a]">
          {tc('short')}
        </p>
        <Link
          href={`/${locale}/galeri`}
          className="group mt-10 inline-flex min-h-11 items-center gap-2 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#2C2C2C]"
        >
          <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-micro)] ease-out group-hover:bg-[length:100%_1px]">
            {tc('cta')}
          </span>
          <span aria-hidden className="transition-transform duration-[var(--dur-micro)] group-hover:translate-x-1">→</span>
        </Link>
      </section>

      {/* Koleksiyonlar teaser — 3 buyuk blok, galeriye filtreli girer */}
      <section className="border-t border-[var(--border)] py-20 sm:py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="text-2xl font-medium text-[#2C2C2C] sm:text-3xl">{tcol('title')}</h2>
          <Link
            href={`/${locale}/koleksiyonlar`}
            className="shrink-0 text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] transition-colors hover:text-[#2C2C2C]"
          >
            {t('viewAll')} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
          {collectionBlocks.map(({ cat, label, cover }) => (
            <Link
              key={cat}
              href={`/${locale}/galeri?category=${encodeURIComponent(cat)}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-[#eceae3]"
            >
              {cover && (
                <Image
                  src={cover}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-[var(--dur-image)] group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <h3 className="absolute inset-x-0 bottom-0 p-5 text-lg font-medium text-white">
                {label}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Son Eserler — ciplak kare grid, altyazi hover'da */}
      <section className="border-t border-[var(--border)] py-20 sm:py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="text-2xl font-medium text-[#2C2C2C] sm:text-3xl">{t('recentWorks')}</h2>
          <Link
            href={`/${locale}/galeri`}
            className="shrink-0 text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] transition-colors hover:text-[#2C2C2C]"
          >
            {t('viewAll')} &rarr;
          </Link>
        </div>

        {recentProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                href={`/${locale}/urun/${product.slug}`}
                aria-label={isTr ? product.titleTr : product.titleEn}
                className="media-zoom group relative block aspect-square overflow-hidden bg-[#f0efe9]"
              >
                {product.images?.[0] && (
                  <img
                    src={product.images[0].url}
                    alt={isTr ? (product.images[0].altTr ?? product.titleTr) : (product.images[0].altEn ?? product.titleEn)}
                    className="h-full w-full object-cover group-hover:scale-[1.02]"
                  />
                )}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/55 to-transparent px-4 pb-4 pt-10 opacity-0 transition-all duration-[var(--dur-micro)] ease-out group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <h3 className="text-base font-medium text-white">
                    {isTr ? product.titleTr : product.titleEn}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-[length:var(--text-meta)] text-[#999]">
            {isTr ? 'Eserler yakında burada olacak.' : 'Works will appear here shortly.'}
          </p>
        )}
      </section>

      {/* Instagram — curated (canli feed degil), "Son Eserler" sonrasi */}
      <InstagramSection locale={locale} items={instagramItems} />

      {/* Artists — side by side with large images */}
      <section className="py-20 border-t border-[var(--border)] sm:py-24">
        <h2 className="mb-14 text-center text-2xl font-medium text-[#2C2C2C] sm:text-3xl">
          {t('meetArtists')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Melike */}
          <a
            href={domainLinks.melike}
            className="group block"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-[#f0efe9]">
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
                <h3 className="text-2xl font-medium text-[#2C2C2C]">
                  Melike Doğan
                </h3>
              </div>
              <span className="mt-3 inline-block text-[13px] uppercase tracking-[0.15em] text-[#2C2C2C] group-hover:text-[#1f1f1f] transition-colors">
                {t('viewPortfolio')} &rarr;
              </span>
            </div>
          </a>

          {/* Seref */}
          <a
            href={domainLinks.seref}
            className="group block"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-[#f0efe9]">
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
                <h3 className="text-2xl font-medium text-[#2C2C2C]">
                  Şeref Doğan
                </h3>
              </div>
              <span className="mt-3 inline-block text-[13px] uppercase tracking-[0.15em] text-[#2C2C2C] group-hover:text-[#1f1f1f] transition-colors">
                {t('viewPortfolio')} &rarr;
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Özel Sipariş bandı — hafif tanıtım + İletişim'e yönlendirme.
          Ayrı sipariş sistemi DEĞİL (vitrin). */}
      <section className="full-bleed border-t border-[var(--border)] bg-[#f2f1ec]">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:py-24">
          <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
            {tcom('title')}
          </p>
          <p className="mx-auto mt-6 max-w-[58ch] text-[length:var(--text-lead)] leading-[1.85] text-[#4a4a4a]">
            {tcom('lead')}
          </p>
          <Link
            href={`/${locale}/ozel-siparis`}
            className="mt-9 inline-flex min-h-11 items-center border border-[#2C2C2C] px-7 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#2C2C2C] transition-colors duration-[var(--dur-micro)] hover:bg-[#2C2C2C] hover:text-white"
          >
            {tcom('cta')}
          </Link>
        </div>
      </section>
    </main>
  )
}
