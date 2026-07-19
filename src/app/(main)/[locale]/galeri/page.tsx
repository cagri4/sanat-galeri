import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { CATEGORIES } from '@/lib/categories'
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

  // Kategori listesi sabit: bos kategoriler de filtrede gorunur (bkz. lib/categories).
  const categories = [...CATEGORIES]
  let products: Awaited<ReturnType<typeof getProducts>> = []

  try {
    products = await getProducts(category)
  } catch {
    // DB not available — show empty state
  }

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

      <div className="mt-14">
        <ArtworkGrid products={products} locale={locale} category={category ?? null} />
      </div>
    </main>
  )
}
