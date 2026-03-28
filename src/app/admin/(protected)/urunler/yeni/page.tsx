import { getAllArtists } from '@/lib/queries/admin'
import ProductForm from '@/components/admin/product-form'
import Link from 'next/link'

export default async function YeniUrunPage() {
  const artists = await getAllArtists()

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
          Yeni Eser Ekle
        </h1>
      </div>

      <ProductForm artists={artists} />
    </div>
  )
}
