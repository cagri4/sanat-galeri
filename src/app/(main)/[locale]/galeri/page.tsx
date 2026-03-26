import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { getProducts, getCategories } from '@/lib/queries/gallery'
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

  let categories: string[] = []
  let products: Awaited<ReturnType<typeof getProducts>> = []

  try {
    ;[categories, products] = await Promise.all([
      getCategories(),
      getProducts(category),
    ])
  } catch {
    // DB not available — show empty state
  }

  return (
    <main className="py-12 sm:py-16">
      <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-light tracking-wide text-[#1a1a1a]">
        {t('title')}
      </h1>

      {categories.length > 0 && (
        <Suspense fallback={<div className="h-12" />}>
          <CategoryFilter categories={categories} active={category ?? null} />
        </Suspense>
      )}

      <div className="mt-8">
        <ArtworkGrid products={products} locale={locale} />
      </div>
    </main>
  )
}
