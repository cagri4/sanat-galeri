'use client'

import { useRef, type ReactNode } from 'react'

/**
 * Yatay kart şeridi (Spode yatay karusel deseni). Kaydırma ŞERİDİN İÇİNDE
 * kalır (sayfa yatay kaymaz — ui-ux-pro-max horizontal-scroll), scroll-snap,
 * otomatik oynatma YOK, oklar aria-label'lı (ikon buton kuralı). Dokunmatikte
 * parmakla kaydırılır; oklar yalnız sm ve üstünde.
 */
export default function CardRail({
  children,
  label,
  prevLabel,
  nextLabel,
}: {
  children: ReactNode
  label: string
  prevLabel: string
  nextLabel: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }
  const arrow =
    'hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-[var(--dur-micro)] hover:border-[var(--foreground)] sm:inline-flex'

  return (
    <div>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:thin] sm:mx-0 sm:gap-6 sm:px-0 sm:scroll-px-0"
      >
        {children}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={() => scroll(-1)} aria-label={prevLabel} className={arrow}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="h-5 w-5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label={nextLabel} className={arrow}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="h-5 w-5"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  )
}
