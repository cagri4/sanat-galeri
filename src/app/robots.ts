import type { MetadataRoute } from 'next'
import { isIndexable } from '@/lib/seo'
import { ownDomain } from '@/lib/site'

// Gerçek alan adına geçene kadar tüm site kapalı (lib/seo.ts, SEO-GECIS-KONTROL.md).
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  // SEO-GECIS-KONTROL §3: kendi alan adının sitemap'i.
  const domain = ownDomain()
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ...(domain ? { sitemap: `https://${domain}/sitemap.xml` } : {}),
  }
}
