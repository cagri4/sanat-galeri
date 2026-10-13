import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/queries/gallery'
import { CATEGORIES } from '@/lib/categories'
import { categoriesForSite, defaultSite, siteDomains } from '@/lib/site'
import { sitemapEntries } from '@/lib/sitemap'

/**
 * /sitemap.xml — projenin kendi sitesi (UART_SITE) ve kendi alan adı.
 * noindex sürerken de üretilir; robots.txt Disallow ve X-Robots-Tag aynen
 * kalır (lib/seo.ts). Gerçek alan adına geçişte robots.txt'ye Sitemap satırı
 * eklenecek (SEO-GECIS-KONTROL §3).
 */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = defaultSite() ?? 'galeri'
  const domain = siteDomains()[site]
  const base = domain ? `https://${domain}` : (process.env.NEXT_PUBLIC_MAIN_URL ?? 'https://uarttasarim.com')

  let productSlugs: string[] = []
  try {
    productSlugs = (await getProducts(undefined, site)).map((p) => p.slug as string)
  } catch {
    // DB yoksa yalnız sabit sayfalar
  }
  return sitemapEntries(site, base, { productSlugs, categories: categoriesForSite(site, CATEGORIES) })
}
