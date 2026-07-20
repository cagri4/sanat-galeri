'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  addExhibitionPhoto,
  deleteExhibitionPhoto,
  updateExhibitionPhoto,
} from '@/lib/actions/exhibition-photo'
import type { ExhibitionPhoto } from '@/lib/queries/exhibition-photos'

/**
 * Sergi fotograflari yoneticisi.
 *
 * Her fotografin BASLIGI ve FOTO ALTI ACIKLAMASI (TR/EN) buradan girilir.
 * Bozcaada'da kalan 9 fotografin aciklamasi sanatcidan gelince kod
 * degistirmeden buradan yazilir.
 */

interface Props {
  exhibitionSlug: string
  photos: ExhibitionPhoto[]
}

const input =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400'

export default function ExhibitionPhotoManager({ exhibitionSlug, photos }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [savedId, setSavedId] = useState<number | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    setError(null)
    let order = photos.length

    for (const file of files) {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', 'sergi')
      const res = await fetch('/api/upload', { method: 'POST', body })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) {
        setError(json.error ?? 'Yükleme başarısız.')
        continue
      }
      const result = await addExhibitionPhoto({
        exhibitionSlug,
        url: json.url,
        sortOrder: order++,
      })
      if (!result.success) setError(result.error ?? 'Kayıt başarısız.')
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    router.refresh()
  }

  async function handleSave(id: number, form: HTMLFormElement) {
    const fd = new FormData(form)
    setSavingId(id)
    setSavedId(null)
    const result = await updateExhibitionPhoto(id, {
      titleTr: String(fd.get('titleTr') ?? ''),
      titleEn: String(fd.get('titleEn') ?? ''),
      captionTr: String(fd.get('captionTr') ?? ''),
      captionEn: String(fd.get('captionEn') ?? ''),
      sortOrder: Number(fd.get('sortOrder') ?? 0),
    })
    setSavingId(null)
    if (result.success) {
      setSavedId(id)
      setTimeout(() => setSavedId(null), 3000)
      router.refresh()
    } else {
      setError(result.error ?? 'Kaydedilemedi.')
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) return
    const result = await deleteExhibitionPhoto(id)
    if (!result.success) setError(result.error ?? 'Silinemedi.')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
        <label
          className={`flex items-center justify-center rounded-md border-2 border-dashed px-4 py-6 transition-colors ${
            uploading
              ? 'cursor-not-allowed border-neutral-200 bg-neutral-50'
              : 'cursor-pointer border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
          }`}
        >
          <div className="text-center">
            <p className="text-sm text-neutral-600">
              {uploading ? 'Yükleniyor...' : 'Sergi fotoğrafı eklemek için tıklayın'}
            </p>
            <p className="mt-1 text-xs text-neutral-400">JPEG, PNG, WEBP — birden fazla seçilebilir</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-neutral-400">Henüz fotoğraf eklenmemiş.</p>
      ) : (
        <ul className="space-y-4">
          {photos.map((photo) => (
            <li key={photo.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave(photo.id, e.currentTarget)
                }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 sm:h-28 sm:w-40">
                  <Image
                    src={photo.url}
                    alt={photo.titleTr ?? 'Sergi fotoğrafı'}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_6rem]">
                    <input name="titleTr" defaultValue={photo.titleTr ?? ''} className={input} placeholder="Başlık (TR)" />
                    <input name="titleEn" defaultValue={photo.titleEn ?? ''} className={input} placeholder="Title (EN)" />
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={photo.sortOrder}
                      className={input}
                      placeholder="Sıra"
                      aria-label="Sıra"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <textarea
                      name="captionTr"
                      rows={2}
                      defaultValue={photo.captionTr ?? ''}
                      className={input}
                      placeholder="Foto altı açıklama (TR) — boş bırakılırsa sitede açıklama gösterilmez"
                    />
                    <textarea
                      name="captionEn"
                      rows={2}
                      defaultValue={photo.captionEn ?? ''}
                      className={input}
                      placeholder="Caption (EN)"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={savingId === photo.id}
                      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
                    >
                      {savingId === photo.id ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    {savedId === photo.id && (
                      <span className="text-sm font-medium text-green-600">Kaydedildi!</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(photo.id)}
                      className="ml-auto rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
