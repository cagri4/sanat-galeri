'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createExhibition, deleteExhibition } from '@/lib/actions/exhibition'

type ExhibitionType = 'solo_sergi' | 'grup_sergi' | 'odul' | 'egitim'

interface Exhibition {
  id: number
  artistId: number | null
  type: string
  titleTr: string
  titleEn: string
  location: string | null
  year: number | null
  sortOrder: number | null
}

interface ExhibitionFormProps {
  artistId: number
  exhibitions: Exhibition[]
}

const TYPE_LABELS: Record<ExhibitionType, string> = {
  solo_sergi: 'Solo Sergiler',
  grup_sergi: 'Grup Sergileri',
  odul: 'Oduller',
  egitim: 'Egitim',
}

const TYPES: ExhibitionType[] = ['solo_sergi', 'grup_sergi', 'odul', 'egitim']

interface NewEntryForm {
  titleTr: string
  titleEn: string
  location: string
  year: string
}

interface SectionProps {
  type: ExhibitionType
  items: Exhibition[]
  artistId: number
  onRefresh: () => void
}

function ExhibitionSection({ type, items, artistId, onRefresh }: SectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<NewEntryForm>({
    titleTr: '',
    titleEn: '',
    location: '',
    year: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!formData.titleTr.trim() || !formData.titleEn.trim()) {
      setError('Balik (TR ve EN) zorunludur.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await createExhibition({
        artistId,
        type,
        titleTr: formData.titleTr.trim(),
        titleEn: formData.titleEn.trim(),
        location: formData.location.trim() || undefined,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
      })
      if (result.success) {
        setFormData({ titleTr: '', titleEn: '', location: '', year: '' })
        setShowForm(false)
        onRefresh()
      } else {
        setError('Kayıt başarısız oldu.')
      }
    } catch {
      setError('Bir hata olustu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteExhibition(id)
      onRefresh()
    } catch {
      // silently fail
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-neutral-900">{TYPE_LABELS[type]}</h3>
        <button
          onClick={() => { setShowForm(!showForm); setError(null) }}
          className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
        >
          {showForm ? 'Iptal' : '+ Yeni Ekle'}
        </button>
      </div>

      {/* Existing entries */}
      {items.length === 0 && !showForm ? (
        <p className="text-sm text-neutral-400">Henuz kayit yok.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 py-2 border-b border-neutral-100 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-800 truncate">{item.titleTr}</p>
                {item.titleEn && item.titleEn !== item.titleTr && (
                  <p className="text-xs text-neutral-500 truncate">{item.titleEn}</p>
                )}
                {(item.location || item.year) && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {[item.location, item.year].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {deletingId === item.id ? '...' : 'Sil'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Inline add form */}
      {showForm && (
        <div className="mt-3 rounded-md bg-neutral-50 border border-neutral-200 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Baslik (TR) *</label>
              <input
                type="text"
                value={formData.titleTr}
                onChange={(e) => setFormData({ ...formData, titleTr: e.target.value })}
                className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Title (EN) *</label>
              <input
                type="text"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Konum</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                placeholder="Istanbul, TR"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Yil</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                placeholder="2024"
                min="1900"
                max="2100"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleAdd}
            disabled={isSubmitting}
            className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
      )}
    </section>
  )
}

export default function ExhibitionForm({ artistId, exhibitions }: ExhibitionFormProps) {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-medium text-neutral-900 mb-4">Sergi / Odul / Egitim</h2>
      <div className="space-y-4">
        {TYPES.map((type) => (
          <ExhibitionSection
            key={type}
            type={type}
            items={exhibitions.filter((e) => e.type === type)}
            artistId={artistId}
            onRefresh={handleRefresh}
          />
        ))}
      </div>
    </div>
  )
}
