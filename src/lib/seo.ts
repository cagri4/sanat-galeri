/**
 * Arama motoru görünürlüğü — TEK anahtar (Çağrı kararı, 11.10.2026).
 *
 * Adresler geçici (*.vercel.app) ve içerik yarım olduğu için iki site de
 * İNDEKSLENMEZ: robots meta "noindex, nofollow" + X-Robots-Tag başlığı +
 * robots.txt "Disallow: /". Siteler açık kalır (şifre yok) — sanatçıya
 * gösterilebilir, yalnız arama motorları görmez.
 *
 * Gerçek alan adına geçişte Vercel'de UART_INDEXABLE=true yapılır ve yeniden
 * deploy edilir. Geriye kalan adımlar: SEO-GECIS-KONTROL.md.
 */
export function isIndexable(): boolean {
  return process.env.UART_INDEXABLE === 'true'
}

/** Proxy'nin ziyaretçi yolunu sayfaya taşıdığı istek başlığı. */
export const PATH_HEADER = 'x-uart-path'

const LOCALES = ['tr', 'en'] as const

/**
 * Kanonik adres + dil alternatifleri (SEO-GECIS-KONTROL §7–8). `path`
 * ziyaretçinin gördüğü yol (/tr/galeri gibi). Kanonik her zaman sitenin
 * kendi alan adındadır (metadataBase); vercel.app asla kanonik olmaz.
 * Locale'siz ya da tanınmayan yolda null döner (o sayfa kanonik basmaz).
 */
export function alternatesFor(path: string | null | undefined) {
  if (!path) return null
  const m = path.match(/^\/(tr|en)(\/.*)?$/)
  if (!m) return null
  const rest = (m[2] ?? '').replace(/\/+$/, '')
  const at = (l: string) => `/${l}${rest}`
  return {
    canonical: at(m[1]),
    languages: { ...Object.fromEntries(LOCALES.map((l) => [l, at(l)])), 'x-default': at('tr') },
  }
}
