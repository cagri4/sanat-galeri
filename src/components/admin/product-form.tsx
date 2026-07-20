'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProduct, deleteProduct, updateProduct } from '@/lib/actions/product'
import { CATEGORIES, COLLECTIONS } from '@/lib/categories'

const productFormSchema = z.object({
  titleTr: z.string().min(1, 'Baslik (TR) zorunludur'),
  titleEn: z.string().min(1, 'Title (EN) is required'),
  category: z.string().min(1, 'Kategori zorunludur'),
  collection: z.string().optional(),
  artistId: z.number().optional(),
  sortOrder: z.number().optional(),
  descriptionTr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  year: z.number().optional(),
  mediumTr: z.string().optional(),
  mediumEn: z.string().optional(),
  dimensionsTr: z.string().optional(),
  dimensionsEn: z.string().optional(),
  formTr: z.string().optional(),
  formEn: z.string().optional(),
  periodTr: z.string().optional(),
  periodEn: z.string().optional(),
  subjectTr: z.string().optional(),
  subjectEn: z.string().optional(),
  aboutTr: z.string().optional(),
  aboutEn: z.string().optional(),
  isSold: z.boolean().optional(),
  isVisible: z.boolean().optional(),
})

type ProductFormData = z.infer<typeof productFormSchema>

// Tek kaynak: lib/categories.ts — site ve panel ayni listeyi kullanir.

interface ProductData {
  id: number
  titleTr: string
  titleEn: string
  category: string
  collection: string | null
  artistId: number | null
  sortOrder: number | null
  descriptionTr: string | null
  descriptionEn: string | null
  price: string | null
  currency: string | null
  year: number | null
  mediumTr: string | null
  mediumEn: string | null
  dimensionsTr: string | null
  formTr: string | null
  formEn: string | null
  periodTr: string | null
  periodEn: string | null
  subjectTr: string | null
  subjectEn: string | null
  aboutTr: string | null
  aboutEn: string | null
  dimensionsEn: string | null
  isSold: boolean | null
  isVisible: boolean | null
}

interface ArtistOption {
  id: number
  nameTr: string
  slug: string
}

interface ProductFormProps {
  product?: ProductData
  artists: ArtistOption[]
}

export default function ProductForm({ product, artists }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      titleTr: product?.titleTr ?? '',
      titleEn: product?.titleEn ?? '',
      category: product?.category ?? '',
      collection: product?.collection ?? '',
      artistId: product?.artistId ?? undefined,
      sortOrder: product?.sortOrder ?? 0,
      descriptionTr: product?.descriptionTr ?? '',
      descriptionEn: product?.descriptionEn ?? '',
      price: product?.price ?? '',
      currency: product?.currency ?? 'TRY',
      year: product?.year ?? undefined,
      mediumTr: product?.mediumTr ?? '',
      mediumEn: product?.mediumEn ?? '',
      dimensionsTr: product?.dimensionsTr ?? '',
      formTr: product?.formTr ?? '',
      formEn: product?.formEn ?? '',
      periodTr: product?.periodTr ?? '',
      periodEn: product?.periodEn ?? '',
      subjectTr: product?.subjectTr ?? '',
      subjectEn: product?.subjectEn ?? '',
      aboutTr: product?.aboutTr ?? '',
      aboutEn: product?.aboutEn ?? '',
      dimensionsEn: product?.dimensionsEn ?? '',
      isSold: product?.isSold ?? false,
      isVisible: product?.isVisible ?? true,
    },
  })

  // Koleksiyon (alt-seri) yalnizca ilgili kategoride anlamli.
  // Or. "Zamansiz Manzaralar" -> "Resimli Seramikler" altinda.
  const selectedCategory = watch('category')
  const collections = COLLECTIONS[selectedCategory] ?? []

  const onSubmit = async (data: ProductFormData) => {
    setSaveStatus('saving')
    setServerErrors({})

    try {
      if (isEdit) {
        const result = await updateProduct(product.id, data)
        if (result.success) {
          setSaveStatus('success')
          setTimeout(() => setSaveStatus('idle'), 3000)
        } else {
          setSaveStatus('error')
          if (result.errors) setServerErrors(result.errors)
        }
      } else {
        const result = await createProduct(data)
        if (result.success && result.id) {
          router.push(`/admin/urunler/${result.id}`)
        } else {
          setSaveStatus('error')
          if (result.errors) setServerErrors(result.errors)
        }
      }
    } catch {
      setSaveStatus('error')
    }
  }

  const handleDelete = async () => {
    if (!product) return
    const confirmed = window.confirm(
      `"${product.titleTr}" eserini silmek istediğinizden emin misiniz? Bu işlemi geri alamazsınız.`
    )
    if (!confirmed) return

    try {
      const result = await deleteProduct(product.id)
      if (result.success) {
        router.push('/admin/urunler')
      }
    } catch {
      // silently fail
    }
  }

  const fieldError = (field: string) =>
    errors[field as keyof ProductFormData]?.message ??
    serverErrors[field]?.[0]

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-medium text-neutral-900 mb-6">
        {isEdit ? 'Eser Bilgileri' : 'Yeni Eser'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title TR + EN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Baslik (TR) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('titleTr')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="Eser basligi"
            />
            {fieldError('titleTr') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('titleTr')}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Title (EN) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('titleEn')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="Artwork title"
            />
            {fieldError('titleEn') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('titleEn')}</p>
            )}
          </div>
        </div>

        {/* Category + Artist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-white"
            >
              <option value="">Kategori secin</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {fieldError('category') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('category')}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Sanatci
            </label>
            <select
              {...register('artistId', {
                setValueAs: (v) => (v === '' ? undefined : Number(v)),
              })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-white"
            >
              <option value="">Sanatci secin</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.nameTr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Koleksiyon + siralama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Koleksiyon (alt-seri)
            </label>
            <select
              {...register('collection')}
              disabled={collections.length === 0}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-white disabled:bg-neutral-50 disabled:text-neutral-400"
            >
              <option value="">Koleksiyon yok</option>
              {collections.map((c) => (
                <option key={c.tr} value={c.tr}>
                  {c.tr}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              {collections.length === 0
                ? 'Bu kategoride tanimli koleksiyon yok.'
                : 'Bos birakilirsa eser dogrudan kategoride listelenir.'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Siralama
            </label>
            <input
              type="number"
              {...register('sortOrder', {
                setValueAs: (v) => (v === '' ? 0 : Number(v)),
              })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Kucuk sayi once gosterilir. Sanatcinin verdigi eser sirasi buradan ayarlanir.
            </p>
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Aciklama (TR)
            </label>
            <textarea
              {...register('descriptionTr')}
              rows={4}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-vertical"
              placeholder="Eser aciklamasi (Turkce)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description (EN)
            </label>
            <textarea
              {...register('descriptionEn')}
              rows={4}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-vertical"
              placeholder="Artwork description (English)"
            />
          </div>
        </div>

        {/* Price + Currency + Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Fiyat
            </label>
            <input
              type="text"
              {...register('price')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Para Birimi
            </label>
            <select
              {...register('currency')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-white"
            >
              <option value="TRY">TRY</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Yil
            </label>
            <input
              type="number"
              {...register('year', {
                setValueAs: (v) => (v === '' ? undefined : Number(v)),
              })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="2024"
              min="1900"
              max="2100"
            />
          </div>
        </div>

        {/* Medium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Malzeme/Teknik (TR)
            </label>
            <input
              type="text"
              {...register('mediumTr')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="Tuval uzerine yagliboya"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Medium (EN)
            </label>
            <input
              type="text"
              {...register('mediumEn')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="Oil on canvas"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Boyutlar (TR)
            </label>
            <input
              type="text"
              {...register('dimensionsTr')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="50 x 70 cm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Dimensions (EN)
            </label>
            <input
              type="text"
              {...register('dimensionsEn')}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="50 x 70 cm"
            />
          </div>
        </div>

        {/* Katalog bilgileri — eser sayfasindaki kunye satirlari.
            Bos birakilan alan sitede hic gosterilmez. */}
        <div className="pt-6 border-t border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-900 mb-1">Katalog Bilgileri</h3>
          <p className="text-xs text-neutral-500 mb-4">
            Bos birakilan alanlar eser sayfasinda gosterilmez. Emin olmadiginiz
            bilgiyi bos birakin — tahmin yazmayin.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Kap Formu (TR)</label>
                <input
                  type="text"
                  {...register('formTr')}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  placeholder="Kylix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Vessel Form (EN)</label>
                <input
                  type="text"
                  {...register('formEn')}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  placeholder="Kylix"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Donemi (TR)</label>
                <input
                  type="text"
                  {...register('periodTr')}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  placeholder="MO 5. yuzyil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Period (EN)</label>
                <input
                  type="text"
                  {...register('periodEn')}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  placeholder="5th century BC"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Mitolojik Konu (TR)</label>
                <textarea
                  rows={2}
                  {...register('subjectTr')}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  placeholder="Afrodit'in kutsal hayvani kaz ile betimlenisi."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Mythological Subject (EN)</label>
                <textarea
                  rows={2}
                  {...register('subjectEn')}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  placeholder="Aphrodite depicted with the goose, her sacred animal."
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Replika Hakkinda (TR)</label>
              <textarea
                rows={3}
                {...register('aboutTr')}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                placeholder="Bos birakilirsa sitedeki genel replika metni gosterilir."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">About the Replica (EN)</label>
              <textarea
                rows={3}
                {...register('aboutEn')}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                placeholder="Leave empty to use the general replica text."
              />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isSold')}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
            />
            <span className="text-sm text-neutral-700">Satıldı</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isVisible')}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
            />
            <span className="text-sm text-neutral-700">Görünür (sitede göster)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="rounded-md bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === 'saving'
                ? 'Kaydediliyor...'
                : isEdit
                ? 'Degisiklikleri Kaydet'
                : 'Eser Olustur'}
            </button>
            {saveStatus === 'success' && (
              <span className="text-sm text-green-600 font-medium">Kaydedildi!</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600 font-medium">Hata olustu.</span>
            )}
          </div>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-red-300 text-red-600 px-4 py-2 text-sm hover:bg-red-50 transition-colors"
            >
              Eseri Sil
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
