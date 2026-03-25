import { getTranslations } from 'next-intl/server'
import { getArtistPressItems } from '@/lib/queries/artist'

interface PressListProps {
  artistId: number
  locale: string
}

export default async function PressList({ artistId, locale }: PressListProps) {
  const items = await getArtistPressItems(artistId)

  if (items.length === 0) return null

  const t = await getTranslations({ locale, namespace: 'cv' })

  return (
    <section className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-light tracking-tight text-neutral-900 border-b border-neutral-200 pb-2">
        {t('pressTitle')}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-1">
            <div className="flex-1">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base text-neutral-800 hover:text-neutral-600 underline underline-offset-2 transition-colors"
                >
                  {item.title}
                </a>
              ) : (
                <span className="text-sm sm:text-base text-neutral-800">{item.title}</span>
              )}
              {item.publication && (
                <span className="block text-xs sm:text-sm text-neutral-500 mt-0.5">
                  {item.publication}
                </span>
              )}
            </div>
            {item.year && (
              <span className="flex-shrink-0 text-xs sm:text-sm font-mono text-neutral-500 pt-0.5">
                {item.year}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
