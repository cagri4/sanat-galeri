'use client'

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

  const handleAll = () => {
    router.replace(pathname)
  }

  const handleCategory = (cat: string) => {
    const params = new URLSearchParams()
    params.set('category', cat)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      <button
        onClick={handleAll}
        className={`px-4 py-2 text-[13px] uppercase tracking-[0.1em] transition-colors ${
          active == null
            ? 'bg-[#1a1a1a] text-white'
            : 'bg-[#f0ece4] text-[#6b6b6b] hover:text-[#1a1a1a]'
        }`}
      >
        {t('filterAll')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleCategory(cat)}
          className={`px-4 py-2 text-[13px] uppercase tracking-[0.1em] transition-colors ${
            active === cat
              ? 'bg-[#1a1a1a] text-white'
              : 'bg-[#f0ece4] text-[#6b6b6b] hover:text-[#1a1a1a]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
