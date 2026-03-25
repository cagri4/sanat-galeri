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
          + Yeni Eser Ekle
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500">Henuz eser eklenmemis.</p>
          <Link
            href="/admin/urunler/yeni"
            className="mt-4 inline-block text-sm text-neutral-700 underline"
          >
            Ilk eseri ekle
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">
                  Gorsel
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">
                  Baslik
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">
                  Kategori
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">
                  Gorunurluk
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">
                  Tarih
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const firstImage = product.images?.[0]
                const createdAt = product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString('tr-TR')
                  : '—'

                return (
                  <tr
                    key={product.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3">
                      {firstImage ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-neutral-100">
                          <Image
                            src={firstImage.url}
                            alt={firstImage.altTr ?? product.titleTr}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-neutral-100 flex items-center justify-center">
                          <span className="text-neutral-400 text-xs">—</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-neutral-900">
                        {product.titleTr}
                      </span>
                      {product.artist && (
                        <span className="block text-neutral-500 text-xs mt-0.5">
                          {product.artist.nameTr}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 capitalize">
                      {product.category}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.isVisible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {product.isVisible ? 'Gorунур' : 'Gizli'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{createdAt}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/urunler/${product.id}`}
                        className="text-neutral-600 hover:text-neutral-900 text-xs underline-offset-2 hover:underline"
                      >
                        Duzenle
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
