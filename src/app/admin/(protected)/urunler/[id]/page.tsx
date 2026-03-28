import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllArtists, getProductById } from '@/lib/queries/admin'
import ProductForm from '@/components/admin/product-form'
import ImageUploader from '@/components/admin/image-uploader'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UrunDuzenlePage({ params }: PageProps) {
  const { id } = await params
  const productId = parseInt(id, 10)

  if (isNaN(productId)) {
    notFound()
  }

  const [product, artists] = await Promise.all([
    getProductById(productId),
    getAllArtists(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/urunler"
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          &larr; Eserler
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">
          Eser Duzenle: {product.titleTr}
        </h1>
      </div>

      <div className="space-y-6">
        <ProductForm product={product} artists={artists} />
        <ImageUploader productId={product.id} existingImages={product.images} />
      </div>
    </div>
  )
}
