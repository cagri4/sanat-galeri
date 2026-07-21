import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { CATEGORIES } from '@/lib/categories'
import Link from 'next/link'
import CategoryFilter from '@/components/gallery/category-filter'
import ArtworkGrid from '@/components/gallery/artwork-grid'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('galleryTitle'), description: t('galleryDesc') }
}

interface GaleriPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function GaleriPage({ params, searchParams }: GaleriPageProps) {
  const { locale } = await params
  const { category } = await searchParams
  const t = await getTranslations({ locale, namespace: 'gallery' })
  const tc = await getTranslations({ locale, namespace: 'collection' })

  // Kategori listesi sabit: bos kategoriler de filtrede gorunur (bkz. lib/categories).
  const categories = [...CATEGORIES]
  let products: Awaited<ReturnType<typeof getProducts>> = []

  try {
    products = await getProducts(category)
  } catch {
    // DB not available — show empty state
  }

  // Antik Donem Replikalari icin sanatcinin ortak-uretim aciklamasi
  // (SANATCI-ESER-ACIKLAMALARI.md / Edit Talepleri satir 5). Hem gruplu
  // gorunumde hem de kategori secildiginde ayni yerde gosterilir.
  const antikIntro = (
    <div className="mt-6 max-w-[68ch] space-y-4">
      <p className="text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]">
        {tc('jointProduction')}
      </p>
      <Link
        href={`/${locale}/teknik`}
        className="group inline-flex min-h-11 items-center text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#6b6b6b] transition-colors duration-[var(--dur-micro)] hover:text-[#1a1a1a]"
      >
        {tc('techniqueCta')}
      </Link>
    </div>
  )

  const heading = (cat: string) =>
    t.has(`categories.${cat}`) ? t(`categories.${cat}`) : cat

  return (
    <main className="py-16 sm:py-24">
      {/* Baslik olcegi buyutuldu ve tracking sikilastirildi: iri + ince
          serif, "Exaggerated Minimalism" dilinin sakin yorumu. */}
      <h1 className="font-[family-name:var(--font-serif)] text-4xl font-light leading-[1.1] tracking-[-0.01em] text-[#1a1a1a] sm:text-5xl lg:text-6xl">
        {t('title')}
      </h1>

      {categories.length > 0 && (
        <Suspense fallback={<div className="h-12" />}>
          <CategoryFilter categories={categories} active={category ?? null} />
        </Suspense>
      )}

      {category ? (
        // TEK KATEGORI — filtre secili. Baslik + (Antik ise) ortak uretim metni.
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-light text-[#1a1a1a] sm:text-3xl">
            {heading(category)}
          </h2>
          {category === 'Antik Dönem Replikaları' && antikIntro}
          <div className="mt-10">
            <ArtworkGrid products={products} locale={locale} category={category} />
          </div>
        </section>
      ) : (
        // TUMU — eserler kategori BASLIKLARINA ayrilir (Edit Talepleri satir 4).
        // Sanatcinin sirasi korunur; bos kategori zarif "icerik yakinda" ile durur.
        <div className="mt-14 space-y-20">
          {categories.map((cat) => {
            const items = products.filter((p) => p.category === cat)
            return (
              <section key={cat}>
                <div className="flex items-baseline gap-4">
                  <h2 className="font-[family-name:var(--font-serif)] text-2xl font-light text-[#1a1a1a] sm:text-3xl">
                    {heading(cat)}
                  </h2>
                  {items.length > 0 && (
                    <span className="text-[length:var(--text-meta)] text-[#b5aea3]">
                      {items.length}
                    </span>
                  )}
                </div>
                {cat === 'Antik Dönem Replikaları' && antikIntro}
                <div className="mt-10">
                  <ArtworkGrid products={items} locale={locale} category={cat} />
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}
