'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

export interface SeriesTabGroup {
  key: string
  label: string
  content: ReactNode
}

/**
 * Seriler arası sekme (Spode "Koleksiyon seçkileri" deseni, PLAN-TASARIM §3).
 * WAI-ARIA tabs: role=tablist/tab/tabpanel, ←/→/Home/End ile gezinme,
 * yalnız seçili sekme sekme-sırasında (roving tabindex).
 * Tek grup varsa sekme çubuğu çizilmez — boş/tek seçenekli sekme olmaz.
 * Görünüm siteye göre token'lardan gelir (galeri/kurumsal).
 */
export default function SeriesTabs({ groups, label }: { groups: SeriesTabGroup[]; label: string }) {
  const [active, setActive] = useState(0)
  const base = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  if (groups.length === 0) return null
  if (groups.length === 1) return <div>{groups[0].content}</div>

  const focusTab = (i: number) => {
    const n = (i + groups.length) % groups.length
    setActive(n)
    tabs.current[n]?.focus()
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusTab(i + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusTab(i - 1) }
    else if (e.key === 'Home') { e.preventDefault(); focusTab(0) }
    else if (e.key === 'End') { e.preventDefault(); focusTab(groups.length - 1) }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-x-8 overflow-x-auto border-b border-[var(--rule)] [scrollbar-width:none]"
      >
        {groups.map((g, i) => (
          <button
            key={g.key}
            ref={(el) => { tabs.current[i] = el }}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`-mb-px inline-flex min-h-11 shrink-0 cursor-pointer items-center border-b-2 text-[length:var(--text-meta)] transition-colors duration-[var(--dur-micro)] ${
              active === i
                ? 'border-[var(--foreground)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      {groups.map((g, i) => (
        <div
          key={g.key}
          role="tabpanel"
          id={`${base}-panel-${i}`}
          aria-labelledby={`${base}-tab-${i}`}
          hidden={active !== i}
          className="pt-8"
        >
          {g.content}
        </div>
      ))}
    </div>
  )
}
