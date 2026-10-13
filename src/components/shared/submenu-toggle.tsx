'use client'

import { useState } from 'react'

/**
 * Alt menü oku — ayrı düğme. Fareyle üzerine gelince panel zaten açılır
 * (CSS group-hover); bu düğme dokunmatik ekran (hover yok) ve klavye için.
 * Açık durum üstteki <li>'ye data-open olarak yazılır, panel onu dinler.
 */
export default function SubmenuToggle({ label }: { label: string }) {
  const [open, setOpen] = useState(false)

  const set = (btn: HTMLButtonElement, next: boolean) => {
    const li = btn.closest('li')
    if (!li) return
    if (next) {
      // Aynı anda tek panel açık kalsın.
      li.parentElement?.querySelectorAll('li[data-open]').forEach((o) => o !== li && o.removeAttribute('data-open'))
      li.setAttribute('data-open', '')
    } else li.removeAttribute('data-open')
    setOpen(next)
  }

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={label}
      onClick={(e) => set(e.currentTarget, !open)}
      onKeyDown={(e) => e.key === 'Escape' && set(e.currentTarget, false)}
      onBlur={(e) => {
        const li = e.currentTarget.closest('li')
        if (li && !li.contains(e.relatedTarget as Node | null)) set(e.currentTarget, false)
      }}
      className="-ml-1 inline-flex h-11 w-7 items-center justify-center text-current"
    >
      <svg aria-hidden="true" viewBox="0 0 10 6" className={`h-1.5 w-2.5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:rotate-180 ${open ? 'rotate-180' : ''}`}>
        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  )
}
