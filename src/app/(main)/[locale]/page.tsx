import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/queries/gallery'
import InstagramSection from '@/components/gallery/instagram-section'
import { ARTIST_AVATARS, AVATAR_CLASS } from '@/lib/artist-avatars'
import { getCrossDomainLinks } from '@/components/shared/navbar'
import { CATEGORIES, CATEGORY_SLUGS } from '@/lib/categories'
import { categoriesForSite, isOnSite } from '@/lib/site'
import { yeniIcerikAcik, SERGI_KUNYE, SERGI_AFISI } from '@/lib/yeni-icerik'
import { getExhibitionPhotosBySlugs } from '@/lib/queries/exhibition-photos'
import SeriesTabs from '@/components/shared/series-tabs'
import CardRail from '@/components/shared/card-rail'
import Reveal from '@/components/motion/reveal'
import { staggerDelay } from '@/lib/motion'

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
  const tg = await getTranslations({ locale, namespace: 'gallery' })
  const tcol = await getTranslations({ locale, namespace: 'collectionsPage' })
  const tcom = await getTranslations({ locale, namespace: 'commissions' })
  const th = await getTranslations({ locale, namespace: 'home' })
  const ta = await getTranslations({ locale, namespace: 'about' })
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
  // Ana sayfa bölümleri (Son Eserler / Instagram / Sanatçılar) tek koleksiyona
  // sıkışmasın diye kategoriler arası DÖNÜŞÜMLÜ seçilir — "sadece bunu
  // üretiyorlar" izlenimini kırar. Yalnızca mevcut gerçek eserler.
  // Galeri sitesi: yalnız galeri kategorileri (panolar kurumsalda, lib/site.ts).
  const allWithImage = allProducts.filter((p) => p.images?.[0]?.url)
  const withImage = allWithImage.filter((p) => isOnSite(p.category, 'galeri'))
  const CATS = categoriesForSite('galeri', CATEGORIES)
  const byCat = (cat: string) => withImage.filter((p) => p.category === cat)

  // Her kategoriden startIdx'ten perCat eser al, dönüşümlü diz (A, Z, M, A, Z, M…).
  const pickDiverse = (startIdx: number, perCat: number) => {
    const pools = CATS.map(byCat)
    const out: typeof withImage = []
    for (let i = startIdx; i < startIdx + perCat; i++) {
      for (const pool of pools) if (pool[i]) out.push(pool[i])
    }
    return out
  }


  // Sanatçı kartı GEÇİCİ görselleri artık her sanatçının ALANINI temsil eden
  // farklı koleksiyonlardan: Melike → resimli seramik (Zamansız), Şeref → mimari
  // pano. Atıf DOĞRULANMIŞ (kap altı imzası / pano dokümanları). alt="" dekoratif;
  // gerçek portre/atölye fotoğrafı gelince değişecek.
  const artistPlaceholders = [
    byCat('Resimli Seramikler')[5]?.images?.[0]?.url,
    // Şeref'in atfı doğrulanmış işi panolar; pano kurumsal sitede olsa da
    // dekoratif sanatçı görseli olarak buradan alınır (eser listelenmez).
    allWithImage.filter((p) => p.category === 'Mimari Duvar Panoları')[5]?.images?.[0]?.url,
  ].filter(Boolean) as string[]

  // Hero seçimi ADMIN PANELINDEN de yönlendirilebilir (products.hero_order);
  // seçim yoksa görünür eserlerin sırasına düşer, bölüm boş kalmaz.
  const pickSlots = (key: 'heroOrder' | 'instagramOrder', limit: number) => {
    const chosen = withImage
      .filter((p) => typeof p[key] === 'number' && p[key] !== null)
      .sort((a, b) => (a[key] as number) - (b[key] as number))
    return (chosen.length > 0 ? chosen : withImage).slice(0, limit)
  }

  // Instagram: CANLI FEED DEGIL (bkz. instagram-section.tsx). Admin
  // instagram_order ayarlamışsa onu kullanır; yoksa kategoriler arası dönüşümlü
  // 9 eser — "Son Eserler"den farklı index'lerden alınır (tekrar olmasın).
  const instagramCurated = withImage
    .filter((p) => typeof p.instagramOrder === 'number' && p.instagramOrder !== null)
    .sort((a, b) => (a.instagramOrder as number) - (b.instagramOrder as number))
  const instagramProducts =
    instagramCurated.length > 0 ? instagramCurated.slice(0, 9) : pickDiverse(2, 3)
  const instagramItems = instagramProducts.map((p) => ({
    src: p.images[0].url,
    alt: isTr ? p.titleTr : p.titleEn,
  }))

  // Hero: TEK görsel (PLAN-TASARIM §2 — slider yerine tek kısa serif cümle +
  // tek eser). Admin'deki hero_order'ın ilki; yoksa görünür ilk eser.
  // Eser fotoğrafları çoğunlukla kare/dik (tabak, kap): 16:9 kırpma eseri kesiyordu.
  // Bu yüzden hero_order'ın ilk 3'ü 4:5 üçlü; mobilde yalnız ilki.
  const heroes = pickSlots('heroOrder', 3)

  // Koleksiyon seçkileri: SERİ bazlı sekmeler (Spode deseni). Seri = koleksiyon
  // adının ana kısmı ("Masalın Hafızası — Anka Serisi" → "Masalın Hafızası");
  // koleksiyonu olmayan eser kategorisiyle gruplanır. Yalnız görünür eserler —
  // gizli heykeller açılınca sekmeleri kendiliğinden gelir.
  const seriesMap = new Map<string, typeof withImage>()
  for (const p of withImage) {
    const key = p.collection ? p.collection.split(' — ')[0] : p.category
    seriesMap.set(key, [...(seriesMap.get(key) ?? []), p])
  }
  const seriesGroups = [...seriesMap.entries()].map(([key, items]) => ({
    key,
    label: key === items[0].category && tg.has(`categories.${key}`) ? tg(`categories.${key}`) : key,
    items: items.slice(0, 12),
  }))

  // Sergiden kareler — fotoğraflar gizli içerikle birlikte açılır (lib/yeni-icerik).
  const sergiFotolari = yeniIcerikAcik()
    ? (await getExhibitionPhotosBySlugs(Object.keys(SERGI_KUNYE))).filter((f) => f.titleTr !== SERGI_AFISI)
    : []

  // Koleksiyon teaser: her kategori icin ilk gorsel (varsa). Bos kategori
  // notr bir doku ile gosterilir — "yakinda" hissi, kirik gorunmez.
  const collectionBlocks = CATS.map((cat) => ({
    cat,
    label: tg.has(`categories.${cat}`) ? tg(`categories.${cat}`) : cat,
    cover: withImage.find((p) => p.category === cat)?.images[0]?.url ?? null,
  })).filter((b) => b.cover) // boş kategori ana sayfada "yakında" kutusu olarak durmaz

  return (
    <main>
      {/* Hero — tek kısa serif cümle + tek eser görseli (Spode deseni). */}
      <Reveal as="section" className="pt-12 sm:pt-16">
        <h1 className="text-center text-4xl leading-[1.1] text-[var(--foreground)] sm:text-6xl">
          {th('heroTitle')}
        </h1>
        {heroes.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {heroes.map((h, i) => (
              <Link
                key={h.id}
                href={`/${locale}/urun/${h.slug}`}
                className={`hover-card hover-media relative block aspect-[4/5] overflow-hidden bg-[#ece7de] ${i > 0 ? 'hidden sm:block' : ''}`}
              >
                <Image
                  src={h.images[0].url}
                  alt={(isTr ? h.images[0].altTr : h.images[0].altEn) ?? (isTr ? h.titleTr : h.titleEn)}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/koleksiyonlar`}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--foreground)] px-6 text-[length:var(--text-meta)] text-[var(--foreground)] transition-colors duration-[var(--dur-micro)] hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            {th('heroCta')}
          </Link>
        </div>
      </Reveal>

      {/* Koleksiyon seçkileri — seriler arası sekme + yatay kart şeridi */}
      {seriesGroups.length > 0 && (
        <Reveal as="section" className="py-20 sm:py-24">
          <h2 className="mb-8 text-center text-3xl text-[var(--foreground)] sm:text-4xl">{th('highlights')}</h2>
          <SeriesTabs
            label={th('highlightsTabs')}
            groups={seriesGroups.map((g) => ({
              key: g.key,
              label: g.label,
              content: (
                <CardRail label={g.label} prevLabel={th('railPrev')} nextLabel={th('railNext')}>
                  {g.items.map((p, i) => (
                    <Reveal
                      key={p.id}
                      delay={staggerDelay(i)}
                      className="w-[70%] shrink-0 snap-start sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]"
                    >
                    <Link href={`/${locale}/urun/${p.slug}`} className="hover-card group block">
                      <div className="hover-media relative aspect-[4/5] overflow-hidden bg-[#ece7de]">
                        <Image
                          src={p.images[0].url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                      <h3 className="hover-title mt-3 text-lg leading-snug text-[var(--foreground)]">{isTr ? p.titleTr : p.titleEn}</h3>
                      {p.isSold && (
                        <span className="mt-1 inline-block text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--muted)]">
                          {tg('sold')}
                        </span>
                      )}
                    </Link>
                    </Reveal>
                  ))}
                </CardRail>
              ),
            }))}
          />
        </Reveal>
      )}

      {/* Koleksiyonlar — 2'li büyük blok (Spode deseni), koleksiyon sayfasına girer */}
      <Reveal as="section" className="border-t border-[var(--border)] py-20 sm:py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="text-2xl font-medium text-[#2C2C2C] sm:text-3xl">{tcol('title')}</h2>
          <Link
            href={`/${locale}/koleksiyonlar`}
            className="shrink-0 text-[13px] uppercase tracking-[0.15em] text-[#6b6b6b] transition-colors hover:text-[#2C2C2C]"
          >
            {t('viewAll')} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {collectionBlocks.map(({ cat, label, cover }, i) => (
            <Reveal key={cat} delay={staggerDelay(i)}>
            <Link
              href={`/${locale}/koleksiyonlar/${CATEGORY_SLUGS[cat]}`}
              className="hover-card hover-media group relative block aspect-[4/3] overflow-hidden bg-[#ece7de]"
            >
              {cover && (
                <Image
                  src={cover}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              {!cover && (
                <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b]">
                  {tcol('comingSoonTag')}
                </span>
              )}
              <h3 className="absolute inset-x-0 bottom-0 p-6 text-3xl text-white sm:p-8 sm:text-4xl">
                {label}
              </h3>
            </Link>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Sergiden kareler — Spode "Sofralardan kareler"in karşılığı. Fotoğraflar
          gizli içerikle birlikte açılır (UART_YENI_ICERIK). Künye: Şeref Doğan CV. */}
      {sergiFotolari.length > 0 && (
        <Reveal as="section" className="border-t border-[var(--border)] py-20 sm:py-24">
          <h2 className="mb-10 text-3xl text-[var(--foreground)] sm:text-4xl">{th('fromExhibitions')}</h2>
          <CardRail label={th('fromExhibitions')} prevLabel={th('railPrev')} nextLabel={th('railNext')}>
            {sergiFotolari.map((f, i) => {
              const k = SERGI_KUNYE[f.exhibitionSlug]
              return (
                <Reveal as="figure" key={f.id} delay={staggerDelay(i)} className="w-[80%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#ece7de]">
                    <Image src={f.url} alt={k ? `${k.title} — ${k.place}, ${k.year}` : ''} fill className="object-cover" sizes="(max-width: 640px) 80vw, 33vw" />
                  </div>
                  {k && (
                    <figcaption className="mt-3 text-[length:var(--text-meta)] leading-relaxed text-[var(--muted)]">
                      <span className="text-[var(--foreground)]">{k.title}</span> · {k.place} · {k.year}
                    </figcaption>
                  )}
                </Reveal>
              )
            })}
          </CardRail>
        </Reveal>
      )}

      {/* Hikâyemiz — mevcut, doğrulanmış metin (Hakkımızda girişi); yeni metin yok. */}
      <Reveal as="section" className="border-t border-[var(--border)] py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl text-[var(--foreground)] sm:text-4xl">{th('story')}</h2>
          <p className="mx-auto mt-8 max-w-[62ch] text-[length:var(--text-lead)] leading-[1.8] text-[#4a4a4a]">
            {ta('lead')}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3">
            <Link href={`/${locale}/hakkimizda`} className="inline-flex min-h-11 items-center border-b border-[var(--foreground)] text-[length:var(--text-meta)] text-[var(--foreground)]">
              {th('storyCta')}
            </Link>
            <Link href={`/${locale}/koleksiyonlar/antik-donem-replikalari#terra-sigillata`} className="inline-flex min-h-11 items-center text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--foreground)]">
              {th('techniqueCta')} &rarr;
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Instagram — curated (canli feed degil), "Son Eserler" sonrasi */}
      <InstagramSection locale={locale} items={instagramItems} />

      {/* Artists — side by side with large images */}
      <Reveal as="section" className="py-20 border-t border-[var(--border)] sm:py-24">
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
                className="object-cover group-hover:scale-[1.03] transition-transform duration-[var(--dur-move)]"
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
                className="object-cover group-hover:scale-[1.03] transition-transform duration-[var(--dur-move)]"
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
      </Reveal>

      {/* Özel Sipariş bandı — hafif tanıtım + İletişim'e yönlendirme.
          Ayrı sipariş sistemi DEĞİL (vitrin). */}
      <Reveal as="section" className="full-bleed border-t border-[var(--border)] bg-[#f2f1ec]">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:py-24">
          <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">
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
      </Reveal>
    </main>
  )
}
