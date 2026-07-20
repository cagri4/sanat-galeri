'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { addProductImage, deleteProductImage, updateProductImage } from '@/lib/actions/product-image'

const MAX_WIDTH = 1600
const MAX_HEIGHT = 1600
const QUALITY = 0.85

interface ImageData {
  id: number
  url: string
  altTr: string | null
  altEn: string | null
  sortOrder: number | null
}

interface ImageUploaderProps {
  productId: number
  existingImages: ImageData[]
}

async function resizeImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    // Skip non-image or small files
    if (!file.type.startsWith('image/') || file.size < 100_000) {
      resolve(file)
      return
    }

    const img = new window.Image()
    img.onload = () => {
      let { width, height } = img

      // Don't upscale
      if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
        resolve(file)
        return
      }

      // Calculate new dimensions maintaining aspect ratio
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resized = new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
              type: 'image/webp',
            })
            resolve(resized)
          } else {
            resolve(file)
          }
        },
        'image/webp',
        QUALITY
      )
    }
    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}

export default function ImageUploader({ productId, existingImages }: ImageUploaderProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [savedAltId, setSavedAltId] = useState<number | null>(null)

  // Alt metin: gorme engelli kullanicilar ve arama motorlari icin.
  // Bos birakilirsa site eser basligina duser.
  const handleAltSave = async (id: number, altTr: string, altEn: string) => {
    const result = await updateProductImage(id, { altTr, altEn })
    if (result.success) {
      setSavedAltId(id)
      setTimeout(() => setSavedAltId(null), 2500)
      router.refresh()
    } else {
      setUploadError(result.error ?? 'Alt metin kaydedilemedi.')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      let index = existingImages.length

      for (const file of files) {
        // Tarayicida kucult — depoya buyuk dosya gitmesin.
        const optimized = await resizeImage(file)

        const body = new FormData()
        body.append('file', optimized)
        body.append('folder', 'urunler')

        const res = await fetch('/api/upload', { method: 'POST', body })
        const json = await res.json().catch(() => ({}))

        if (!res.ok || !json.url) {
          setUploadError(json.error ?? 'Yükleme başarısız. Tekrar deneyin.')
          continue
        }

        const result = await addProductImage({
          productId,
          url: json.url,
          sortOrder: index++,
        })

        if (!result.success) {
          setUploadError('Görsel kaydedilemedi: ' + (result.error ?? 'bilinmeyen hata'))
        }
      }

      router.refresh()
    } catch (err) {
      setUploadError('Yükleme başarısız. Tekrar deneyin.')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Bu görseli silmek istediğinizden emin misiniz?')
    if (!confirmed) return

    setDeletingId(id)
    try {
      await deleteProductImage(id)
      router.refresh()
    } catch {
      // silently fail
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-medium text-neutral-900 mb-4">Görseller</h2>

      {existingImages.length > 0 && (
        <ul className="mb-6 space-y-3">
          {existingImages
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((image) => (
              <li key={image.id} className="rounded-md border border-neutral-200 p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    handleAltSave(image.id, String(fd.get('altTr') ?? ''), String(fd.get('altEn') ?? ''))
                  }}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
                    <Image
                      src={image.url}
                      alt={image.altTr ?? 'Ürün görseli'}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      name="altTr"
                      defaultValue={image.altTr ?? ''}
                      placeholder="Alt metin (TR)"
                      aria-label="Alt metin (TR)"
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                    <input
                      name="altEn"
                      defaultValue={image.altEn ?? ''}
                      placeholder="Alt text (EN)"
                      aria-label="Alt text (EN)"
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Kaydet
                    </button>
                    {savedAltId === image.id && (
                      <span className="text-sm font-medium text-green-600">✓</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(image.id)}
                      disabled={deletingId === image.id}
                      className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label="Görseli sil"
                    >
                      {deletingId === image.id ? '...' : 'Sil'}
                    </button>
                  </div>
                </form>
              </li>
            ))}
        </ul>
      )}

      {existingImages.length === 0 && (
        <p className="text-sm text-neutral-400 mb-4">Henüz görsel eklenmemiş.</p>
      )}

      <div>
        <label
          className={`flex items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 sm:px-6 sm:py-8 cursor-pointer transition-colors ${
            isUploading
              ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed'
              : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
          }`}
        >
          {isUploading ? (
            <span className="text-sm text-neutral-500">Yükleniyor...</span>
          ) : (
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Görsel eklemek için tıklayın
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                JPEG, PNG, WEBP — otomatik olarak max {MAX_WIDTH}px&apos;e küçültülür
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
      </div>
    </div>
  )
}
