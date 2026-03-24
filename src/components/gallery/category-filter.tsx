'use client'

import { useRouter, usePathname } from 'next/navigation'

interface CategoryFilterProps {
  categories: string[]
  active: string | null
}

export default function CategoryFilter({ categories, active }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleAll = () => {
    router.replace(pathname)
  }

  const handleCategory = (cat: string) => {
    const params = new URLSearchParams()
    params.set('category', cat)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={handleAll}
        className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
          active == null
            ? 'bg-neutral-900 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        }`}
      >
        Tümünü Göster
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleCategory(cat)}
          className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            active === cat
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
