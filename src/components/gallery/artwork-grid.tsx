import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import ArtworkCard from './artwork-card'

type ProductWithImage = Awaited<ReturnType<typeof getProducts>>[number]

interface ArtworkGridProps {
  products: ProductWithImage[]
  locale: string
}

export default async function ArtworkGrid({ products, locale }: ArtworkGridProps) {
  const t = await getTranslations({ locale, namespace: 'gallery' })

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#999] text-sm">{t('emptyState')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
      {products.map((product) => (
        <ArtworkCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  )
}
