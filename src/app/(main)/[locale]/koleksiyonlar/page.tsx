import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/queries/gallery'
import { CATEGORIES, COLLECTIONS } from '@/lib/categories'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'collectionsPage' })
  const isTr = locale === 'tr'
  return {
    title: `${t('title')} | ${isTr ? 'U-Art Tasarım' : 'U-Art Design'}`,
    description: t('lead'),
  }
}

export default async function KoleksiyonlarPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'collectionsPage' })
  const tg = await getTranslations({ locale, namespace: 'gallery' })

  let products: Awaited<ReturnType<typeof getProducts>> = []
  try {
    products = await getProducts()
  } catch {
    // DB yoksa sessiz bos durum
  }

  const blocks = CATEGORIES.map((cat) => {
    const items = products.filter((p) => p.category === cat)
    return {
      cat,
      label: tg.has(`categories.${cat}`) ? tg(`categories.${cat}`) : cat,
      cover: items.find((p) => p.images?.[0]?.url)?.images[0]?.url ?? null,
      count: items.length,
      subCollections: (COLLECTIONS[cat] ?? []).map((c) => (isTr ? c.tr : c.en)),
    }
  })

  return (
    <main className="py-16 sm:py-24">
      <h1 className="text-4xl font-medium tracking-[-0.015em] text-[#2C2C2C] sm:text-5xl lg:text-6xl">
        {t('title')}
      </h1>
      <p className="mt-6 max-w-[62ch] text-[length:var(--text-lead)] leading-[1.85] text-[#4a4a4a]">
        {t('lead')}
      </p>

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {blocks.map(({ cat, label, cover, count, subCollections }, i) => (
          <Link
            key={cat}
            href={`/${locale}/galeri?category=${encodeURIComponent(cat)}`}
            // Ilk blok genis: gorsel duvarina ritim katar.
            className={`group relative block overflow-hidden bg-[#eceae3] ${
              i === 0 ? 'sm:col-span-2 aspect-[16/10]' : 'aspect-[4/5]'
            }`}
          >
            {cover && (
              <Image
                src={cover}
                alt=""
                fill
                priority={i === 0}
                className="object-cover transition-transform duration-[var(--dur-image)] group-hover:scale-[1.03]"
                sizes={i === 0 ? '(max-width: 640px) 100vw, 100vw' : '(max-width: 640px) 100vw, 50vw'}
              />
            )}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <h2 className="text-xl font-medium text-white sm:text-2xl">{label}</h2>
              <p className="mt-1.5 flex items-center gap-3 text-[length:var(--text-meta)] text-white/80">
                <span>
                  {count > 0
                    ? `${count} ${isTr ? 'eser' : count === 1 ? 'work' : 'works'}`
                    : t('emptyNote')}
                </span>
                {subCollections.length > 0 && (
                  <span className="text-white/60">· {subCollections.join(', ')}</span>
                )}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-white/90">
                {t('viewCollection')}
                <span aria-hidden className="transition-transform duration-[var(--dur-micro)] group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
