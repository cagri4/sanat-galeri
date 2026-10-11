import type { MetadataRoute } from 'next'
import { isIndexable } from '@/lib/seo'

// Gerçek alan adına geçene kadar tüm site kapalı (lib/seo.ts, SEO-GECIS-KONTROL.md).
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] } }
}
