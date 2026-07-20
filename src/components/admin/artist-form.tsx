'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateArtist } from '@/lib/actions/artist'

const artistFormSchema = z.object({
  bioTr: z.string().optional(),
  bioEn: z.string().optional(),
  statementTr: z.string().optional(),
  statementEn: z.string().optional(),
  photoUrl: z.string().optional(),
  email: z.string().email('Gecersiz e-posta').optional().or(z.literal('')),
})

type ArtistFormData = z.infer<typeof artistFormSchema>

interface ArtistData {
  id: number
  slug: string
  nameTr: string
  nameEn: string
  bioTr: string | null
  bioEn: string | null
  statementTr: string | null
  statementEn: string | null
  photoUrl: string | null
  email: string | null
}

interface ArtistFormProps {
  artist: ArtistData
}

export default function ArtistForm({ artist }: ArtistFormProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArtistFormData>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      bioTr: artist.bioTr ?? '',
      bioEn: artist.bioEn ?? '',
      statementTr: artist.statementTr ?? '',
      statementEn: artist.statementEn ?? '',
      photoUrl: artist.photoUrl ?? '',
      email: artist.email ?? '',
    },
  })

  const photoUrl = watch('photoUrl')

  const onSubmit = async (data: ArtistFormData) => {
    setSaveStatus('saving')
    try {
      const result = await updateArtist(artist.id, data)
      if (result.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', 'sanatci')
      const res = await fetch('/api/upload', { method: 'POST', body })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) {
        setUploadError(json.error ?? 'Yükleme başarısız.')
        return
      }
      setValue('photoUrl', json.url, { shouldDirty: true })
    } catch {
      setUploadError('Yükleme başarısız. Tekrar deneyin.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-medium text-neutral-900 mb-4">Sanatci Bilgileri</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Fotograf URL</label>
          <div className="flex gap-3 items-start">
            <input
              type="text"
              {...register('photoUrl')}
              placeholder="https://..."
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <label className="cursor-pointer rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors whitespace-nowrap">
              {isUploading ? 'Yükleniyor...' : 'Dosya Seç'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
          {photoUrl && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Fotograf onizleme"
                className="h-20 w-20 rounded-full object-cover border border-neutral-200"
              />
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Bio (TR)</label>
            <textarea
              {...register('bioTr')}
              rows={6}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-vertical"
              placeholder="Sanatci biyografisi (Turkce)"
            />
            {errors.bioTr && <p className="mt-1 text-sm text-red-600">{errors.bioTr.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Bio (EN)</label>
            <textarea
              {...register('bioEn')}
              rows={6}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-vertical"
              placeholder="Artist biography (English)"
            />
            {errors.bioEn && <p className="mt-1 text-sm text-red-600">{errors.bioEn.message}</p>}
          </div>
        </div>

        {/* Statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Sanatci Aciklamasi (TR)</label>
            <textarea
              {...register('statementTr')}
              rows={6}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-vertical"
              placeholder="Sanatci aciklamasi (Turkce)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Artist Statement (EN)</label>
            <textarea
              {...register('statementEn')}
              rows={6}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-vertical"
              placeholder="Artist statement (English)"
            />
          </div>
        </div>

        {/* Iletisim.
            WhatsApp alani BILEREK yok: kisisel cep numaralari siteden
            kaldirildi (2026-07-19, Cagri). Ziyaretci iletisimi sol alttaki
            modal form -> /api/contact -> Mesajlar ekrani uzerinden yurur. */}
        <div className="max-w-md">
          <label className="block text-sm font-medium text-neutral-700 mb-1">E-posta</label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            placeholder="sanatci@uarttasarim.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="rounded-md bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {saveStatus === 'success' && (
            <span className="text-sm text-green-600 font-medium">Kaydedildi!</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 font-medium">Hata olustu. Tekrar deneyin.</span>
          )}
        </div>
      </form>
    </div>
  )
}
