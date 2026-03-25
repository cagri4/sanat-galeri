import { getTranslations } from 'next-intl/server'

type Exhibition = {
  id: number
  artistId: number | null
  type: string
  titleTr: string
  titleEn: string
  location: string | null
  year: number | null
  sortOrder: number | null
}

interface ExhibitionListProps {
  exhibitions: Exhibition[]
  locale: string
}

function ExhibitionGroup({
  title,
  items,
  locale,
}: {
  title: string
  items: Exhibition[]
  locale: string
}) {
  if (items.length === 0) return null
  return (
    <section className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-light tracking-tight text-neutral-900 border-b border-neutral-200 pb-2">
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => {
          const title = locale === 'tr' ? item.titleTr : item.titleEn
          return (
            <li key={item.id} className="flex items-start justify-between gap-4 py-1">
              <div className="flex-1">
                <span className="text-sm sm:text-base text-neutral-800">{title}</span>
                {item.location && (
                  <span className="block text-xs sm:text-sm text-neutral-500 mt-0.5">
                    {item.location}
                  </span>
                )}
              </div>
              {item.year && (
                <span className="flex-shrink-0 text-xs sm:text-sm font-mono text-neutral-500 pt-0.5">
                  {item.year}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default async function ExhibitionList({ exhibitions, locale }: ExhibitionListProps) {
  const t = await getTranslations({ locale, namespace: 'cv' })

  const soloExhibitions = exhibitions.filter((e) => e.type === 'solo_sergi')
  const groupExhibitions = exhibitions.filter((e) => e.type === 'grup_sergi')
  const awards = exhibitions.filter((e) => e.type === 'odul')
  const education = exhibitions.filter((e) => e.type === 'egitim')

  return (
    <div className="space-y-10">
      <ExhibitionGroup title={t('soloExhibition')} items={soloExhibitions} locale={locale} />
      <ExhibitionGroup title={t('groupExhibition')} items={groupExhibitions} locale={locale} />
      <ExhibitionGroup title={t('awardsTitle')} items={awards} locale={locale} />
      <ExhibitionGroup title={t('educationTitle')} items={education} locale={locale} />
    </div>
  )
}
