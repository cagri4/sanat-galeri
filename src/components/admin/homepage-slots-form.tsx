'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { updateHomepageSlots } from '@/lib/actions/product'

/**
 * Ana sayfa yerlesimi: hero slaytlari (5) ve Instagram izgarasi (9).
 *
 * Ikisi de eskiden KODDA SABIT slug listesiydi. Artik her eserin
 * `hero_order` / `instagram_order` degeri buradan verilir; bos birakilan
 * eser o bolumde gosterilmez.
 */

const HERO_LIMIT = 5
const IG_LIMIT = 9

export interface SlotProduct {
  id: number
  titleTr: string
  isVisible: boolean | null
  imageUrl: string | null
  heroOrder: number | null
  instagramOrder: number | null
}

export default function HomepageSlotsForm({ products }: { products: SlotProduct[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(products)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const set = (id: number, key: 'heroOrder' | 'instagramOrder', value: number | null) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)))

  const heroCount = rows.filter((r) => r.heroOrder !== null).length
  const igCount = rows.filter((r) => r.instagramOrder !== null).length

  async function save() {
    setStatus('saving')
    setError(null)
    const result = await updateHomepageSlots(
      rows.map((r) => ({ id: r.id, heroOrder: r.heroOrder, instagramOrder: r.instagramOrder }))
    )
    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
      router.refresh()
    } else {
      setStatus('error')
      setError(result.error ?? 'Kaydedilemedi.')
    }
  }

  const numberCell = (
    row: SlotProduct,
    key: 'heroOrder' | 'instagramOrder',
    limit: number
  ) => (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={row[key] !== null}
        aria-label={key === 'heroOrder' ? 'Hero’da göster' : 'Instagram’da göster'}
        onChange={(e) =>
          set(row.id, key, e.target.checked ? rows.filter((r) => r[key] !== null).length : null)
        }
        className="h-4 w-4 rounded border-neutral-300"
      />
      <input
        type="number"
        min={0}
        max={limit - 1}
        value={row[key] ?? ''}
        disabled={row[key] === null}
        aria-label={key === 'heroOrder' ? 'Hero sırası' : 'Instagram sırası'}
        onChange={(e) => set(row.id, key, e.target.value === '' ? null : Number(e.target.value))}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm disabled:bg-neutral-50 disabled:text-neutral-300"
      />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="hidden grid-cols-[1fr_10rem_10rem] gap-4 border-b border-neutral-200 px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500 sm:grid">
          <span>Eser</span>
          <span>Hero slaytı</span>
          <span>Instagram</span>
        </div>
        <ul className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <li
              key={row.id}
              className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[1fr_10rem_10rem] sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                  {row.imageUrl && (
                    <Image src={row.imageUrl} alt="" fill className="object-cover" sizes="48px" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-neutral-900">{row.titleTr}</p>
                  {!row.isVisible && (
                    <p className="text-xs text-amber-600">Gizli — ana sayfada görünmez</p>
                  )}
                  {!row.imageUrl && <p className="text-xs text-neutral-400">Görseli yok</p>}
                </div>
              </div>
              <div>
                <span className="mr-2 text-xs text-neutral-500 sm:hidden">Hero:</span>
                {numberCell(row, 'heroOrder', HERO_LIMIT)}
              </div>
              <div>
                <span className="mr-2 text-xs text-neutral-500 sm:hidden">Instagram:</span>
                {numberCell(row, 'instagramOrder', IG_LIMIT)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
        >
          {status === 'saving' ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {status === 'success' && <span className="text-sm font-medium text-green-600">Kaydedildi!</span>}
        {error && <span className="text-sm font-medium text-red-600">{error}</span>}
        <span className="text-sm text-neutral-500">
          Hero: {heroCount}/{HERO_LIMIT} · Instagram: {igCount}/{IG_LIMIT}
        </span>
      </div>

      <p className="max-w-2xl text-xs text-neutral-500">
        Küçük sıra numarası önce gösterilir. Hero en fazla {HERO_LIMIT}, Instagram
        en fazla {IG_LIMIT} eser kullanır; fazlası yok sayılır. Hiç seçim
        yapılmazsa bölümler görünür eserlerin sırasına düşer, boş kalmaz.
      </p>
    </div>
  )
}
