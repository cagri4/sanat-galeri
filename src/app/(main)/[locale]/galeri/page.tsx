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

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(category),
  ])

  return (
    <main className="py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        {t('title')}
      </h1>

      <Suspense fallback={<div className="h-12" />}>
        <CategoryFilter categories={categories} active={category ?? null} />
      </Suspense>

      <div className="mt-6">
        <ArtworkGrid products={products} locale={locale} />
      </div>
    </main>
  )
}
