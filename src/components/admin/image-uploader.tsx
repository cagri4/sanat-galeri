'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { addProductImage, deleteProductImage } from '@/lib/actions/product-image'

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const { upload } = await import('@vercel/blob/client')

      for (const file of files) {
        // Resize before upload
        const optimized = await resizeImage(file)

        const blob = await upload(optimized.name, optimized, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })

        const result = await addProductImage({
          productId,
          url: blob.url,
          altTr: '',
          altEn: '',
          sortOrder: existingImages.length,
        })

        if (!result.success) {
          setUploadError('Görsel kaydedilemedi.')
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {existingImages
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((image) => (
              <div key={image.id} className="relative group">
                <div className="relative aspect-square rounded-md overflow-hidden bg-neutral-100 border border-neutral-200">
                  <Image
                    src={image.url}
                    alt={image.altTr ?? 'Ürün görseli'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                </div>
                <button
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                  aria-label="Görseli sil"
                >
                  {deletingId === image.id ? '...' : '×'}
                </button>
              </div>
            ))}
        </div>
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
