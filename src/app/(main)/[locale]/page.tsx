import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('common')
  return (
    <main className="py-8 sm:py-12 lg:py-16">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight">
        {t('siteTitle')}
      </h1>
      <p className="mt-4 text-base sm:text-lg text-neutral-600">
        Galeri sayfasi yapilandirilacak.
      </p>
    </main>
  )
}
