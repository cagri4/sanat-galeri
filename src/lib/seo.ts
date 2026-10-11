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
