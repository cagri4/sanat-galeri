import Link from 'next/link'
import Image from 'next/image'
import { getAllProducts } from '@/lib/queries/admin'

export default async function UrunlerPage() {
  const products = await getAllProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">
          Eserler ({products.length})
        </h1>
        <Link
          href="/admin/urunler/yeni"
          className="px-4 py-2 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-700 transition-colors"
        >
          + Yeni Eser
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500">Henüz eser eklenmemiş.</p>
          <Link
            href="/admin/urunler/yeni"
            className="mt-4 inline-block text-sm text-neutral-700 underline"
          >
            İlk eseri ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const firstImage = product.images?.[0]
            const createdAt = product.createdAt
              ? new Date(product.createdAt).toLocaleDateString('tr-TR')
              : '—'

            return (
              <Link
                key={product.id}
                href={`/admin/urunler/${product.id}`}
                className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-neutral-100">
                  {firstImage ? (
                    <Image
                      src={firstImage.url}
                      alt={firstImage.altTr ?? product.titleTr}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-neutral-300 text-sm">Görsel yok</span>
                    </div>
                  )}
                  {/* Visibility badge */}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.isVisible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {product.isVisible ? 'Görünür' : 'Gizli'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h2 className="font-medium text-neutral-900 text-sm">
                    {product.titleTr}
                  </h2>
                  {product.artist && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {product.artist.nameTr}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-neutral-400 capitalize">
                      {product.category}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {createdAt}
                    </span>
                  </div>
                  {product.price && (
                    <p className="text-sm font-medium text-neutral-700 mt-2">
                      {Number(product.price).toLocaleString('tr-TR')} {product.currency ?? 'TRY'}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
