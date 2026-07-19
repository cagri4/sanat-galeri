'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface CategoryFilterProps {
  categories: string[]
  active: string | null
}

export default function CategoryFilter({ categories, active }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('gallery')
  const scrollerRef = useRef<HTMLDivElement>(null)

  // Mobilde satir yatay kaydiginda aktif kategori ekran disinda kalabiliyor;
  // secili ogeyi gorunur alana getir. 'nearest' => sayfa dikeyde ziplamaz.
  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active])

  // Kategoriler DB'de TR kanonik adıyla saklanır; çeviri yoksa ham değere düş.
  const label = (cat: string) => t.has(`categories.${cat}`) ? t(`categories.${cat}`) : cat

  const handleAll = () => {
    router.replace(pathname)
  }

  const handleCategory = (cat: string) => {
    const params = new URLSearchParams()
    params.set('category', cat)
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Dolgulu "pill" yerine ince alt cizgili metin dugmeleri: muze etiketi
  // dili. Aktif olan koyu + alt cizgili, digerleri sessiz.
  // min-h-11 (44px) => dokunmatik hedef boyutu korunur.
  const base =
    'relative inline-flex min-h-11 shrink-0 cursor-pointer items-center whitespace-nowrap px-1 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] transition-colors duration-[var(--dur-micro)] after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:transition-transform after:duration-[var(--dur-micro)] after:ease-out'

  const state = (isActive: boolean) =>
    isActive
      ? 'text-[#1a1a1a] after:bg-[#1a1a1a] after:scale-x-100'
      : 'text-[#999] hover:text-[#1a1a1a] after:bg-[#1a1a1a] after:scale-x-0 hover:after:scale-x-100'

  return (
    // Mobilde tek satir + yatay kaydirma: 4 kategori alt alta dizilince
    // eserler ekranin ~370px altina itiliyordu. Kaydirma kapsayici icinde,
    // sayfa yatay tasmiyor. sm+ ekranlarda normal sarma davranisi.
    <div
      ref={scrollerRef}
      role="group"
      aria-label={t('title')}
      className="filter-scroll mt-8 flex w-full min-w-0 max-w-full items-center gap-x-8 overflow-x-auto border-b border-[var(--rule)] pb-2 sm:flex-wrap sm:gap-y-1 sm:overflow-visible"
    >
      <button
        onClick={handleAll}
        aria-pressed={active == null}
        data-active={active == null}
        className={`${base} ${state(active == null)}`}
      >
        {t('filterAll')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleCategory(cat)}
          aria-pressed={active === cat}
          data-active={active === cat}
          className={`${base} ${state(active === cat)}`}
        >
          {label(cat)}
        </button>
      ))}
    </div>
  )
}
