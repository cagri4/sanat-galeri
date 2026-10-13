import type { MetadataRoute } from 'next'
import type { SiteKey } from '@/lib/site'
import { CATEGORY_SLUGS } from '@/lib/categories'
import { galleryCollections } from '@/lib/series'

const LOCALES = ['tr', 'en'] as const

/**
 * Site başına sitemap (SEO-GECIS-KONTROL §4). Her site YALNIZ kendi sayfalarını
 * listeler; kurumsal adresler URL'de /kurumsal öneki olmadan (proxy rewrite).
 * Ürünler çağırandan gelir — yalnız görünür (is_visible) ve bu siteye ait olanlar.
 * Kaldırılan sayfalar (/ozel-siparis, /surec, /teknik) listede yok: 301'ler.
 */
export function sitemapEntries(
  site: SiteKey,
  base: string,
  data: { productSlugs: string[]; categories: string[] },
): MetadataRoute.Sitemap {
  const origin = base.replace(/\/$/, '')
  const paths =
    site === 'kurumsal'
      ? ['', '/projeler', ...data.productSlugs.map((s) => `/projeler/${s}`), '/hakkimizda', '/iletisim']
      : [
          '',
          '/galeri',
          '/koleksiyonlar',
          // Heykeller iki seri sayfası; eski /koleksiyonlar/seramik-heykeller 301.
          ...galleryCollections(data.categories, CATEGORY_SLUGS).map((c) => `/koleksiyonlar/${c.slug}`),
          ...data.productSlugs.map((s) => `/urun/${s}`),
          '/hakkimizda',
          '/sergiler',
          '/sergi/bozcaada-2010',
          '/iletisim',
          '/melike',
          '/seref',
        ]

  return paths.flatMap((path) =>
    LOCALES.map((loc) => ({
      url: `${origin}/${loc}${path}`,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${origin}/${l}${path}`])),
      },
    })),
  )
}
