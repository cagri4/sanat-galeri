'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProduct, deleteProduct, updateProduct } from '@/lib/actions/product'

const productFormSchema = z.object({
  titleTr: z.string().min(1, 'Baslik (TR) zorunludur'),
  titleEn: z.string().min(1, 'Title (EN) is required'),
  category: z.string().min(1, 'Kategori zorunludur'),
  artistId: z.number().optional(),
  descriptionTr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  year: z.number().optional(),
  mediumTr: z.string().optional(),
  mediumEn: z.string().optional(),
  dimensionsTr: z.string().optional(),
  dimensionsEn: z.string().optional(),
  isSold: z.boolean().optional(),
  isVisible: z.boolean().optional(),
})

type ProductFormData = z.infer<typeof productFormSchema>

const CATEGORIES = [
  { value: 'resim', label: 'Resim' },
  { value: 'heykel', label: 'Heykel' },
  { value: 'seramik', label: 'Seramik' },
  { value: 'diger', label: 'Diger' },
]

interface ProductData {
  id: number
  titleTr: string
  titleEn: string
  category: string
  artistId: number | null
  descriptionTr: string | null
  descriptionEn: string | null
  price: string | null
  currency: string | null
  year: number | null
  mediumTr: string | null
  mediumEn: string | null
  dimensionsTr: string | null
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
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      titleTr: product?.titleTr ?? '',
      titleEn: product?.titleEn ?? '',
      category: product?.category ?? '',
      artistId: product?.artistId ?? undefined,
      descriptionTr: product?.descriptionTr ?? '',
      descriptionEn: product?.descriptionEn ?? '',
      price: product?.price ?? '',
      currency: product?.currency ?? 'TRY',
      year: product?.year ?? undefined,
      mediumTr: product?.mediumTr ?? '',
      mediumEn: product?.mediumEn ?? '',
      dimensionsTr: product?.dimensionsTr ?? '',
      dimensionsEn: product?.dimensionsEn ?? '',
      isSold: product?.isSold ?? false,
      isVisible: product?.isVisible ?? true,
    },
  })

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
      `"${product.titleTr}" eserini silmek istediginizden emin misiniz? Bu islemi geri alamazsiniz.`
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
                <option key={cat.value} value={cat.value}>
                  {cat.label}
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

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isSold')}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
            />
            <span className="text-sm text-neutral-700">Satildi</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isVisible')}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
            />
            <span className="text-sm text-neutral-700">Gorунур (sitede goster)</span>
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
