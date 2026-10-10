/**
 * İki site, tek kod tabanı: Uart Galeri (bireysel alıcı) + Uart Kurumsal
 * (mimar, müteahhit, otel, kurum). KARARLAR-2026-10-10.md.
 *
 * Ayrım SANATÇIYA göre DEĞİL, ÜRÜNE (kategoriye) göre. Bir eserin hangi
 * sitede görüneceği yalnızca CATEGORY_SITES'tan okunur.
 *
 * Bu dosya proxy'den de import edilir: DB/Next sunucu API'si kullanmaz.
 */

export type SiteKey = 'galeri' | 'kurumsal'

/**
 * Alan adları TEK yerden: ortam değişkenleri. Alan adı belli olunca Vercel'de
 * bu iki değişken set edilir, kodda değişiklik gerekmez. Boşsa o site henüz
 * kendi alan adına bağlı değil demektir (önizleme: yol bazlı çalışır).
 */
export function siteDomains(): Record<SiteKey, string | null> {
  return {
    galeri: normalizeHost(process.env.UART_GALERI_DOMAIN),
    kurumsal: normalizeHost(process.env.UART_KURUMSAL_DOMAIN),
  }
}

function normalizeHost(value: string | undefined | null): string | null {
  if (!value) return null
  const host = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  return host || null
}

/** `www.` öneki ve port farkı aynı site sayılır. */
function sameHost(a: string, b: string): boolean {
  const strip = (h: string) => h.toLowerCase().split(':')[0].replace(/^www\./, '')
  return strip(a) === strip(b)
}

/** Kategori → yer aldığı siteler. Seramik heykeller İKİ sitede (karar 2). */
export const CATEGORY_SITES: Record<string, readonly SiteKey[]> = {
  'Antik Dönem Replikaları': ['galeri'],
  'Resimli Seramikler': ['galeri'],
  'Seramik Heykeller': ['galeri', 'kurumsal'],
  'Mimari Duvar Panoları': ['kurumsal'],
}

export function isOnSite(category: string, site: SiteKey): boolean {
  return (CATEGORY_SITES[category] ?? ['galeri']).includes(site)
}

/** Kategori yalnızca kurumsal sitede mi (ör. panolar)? */
export function isKurumsalOnly(category: string): boolean {
  const sites = CATEGORY_SITES[category] ?? ['galeri']
  return sites.length === 1 && sites[0] === 'kurumsal'
}

/** Kurumsal sayfaların uygulama içindeki yolu (route group altında). */
export const KURUMSAL_SEGMENT = 'kurumsal'

/** Host hangi siteye ait? Bilinmeyen host (vercel.app, localhost) → null. */
export function siteForHost(host: string): SiteKey | null {
  const d = siteDomains()
  if (d.kurumsal && sameHost(host, d.kurumsal)) return 'kurumsal'
  if (d.galeri && sameHost(host, d.galeri)) return 'galeri'
  return null
}

/**
 * Eski sanatçı-bazlı adresler. Yeni yapı ürün bazlı olduğu için bunlar artık
 * site değil; galerideki sanatçı sayfasına 301 ile gider.
 */
export const LEGACY_ARTIST_HOSTS: Record<string, string> = {
  'melike.uarttasarim.com': 'melike',
  'seref.uarttasarim.com': 'seref',
  'melikedogan.com': 'melike',
  'www.melikedogan.com': 'melike',
  'serefdogan.com': 'seref',
  'www.serefdogan.com': 'seref',
}

/**
 * Kurumsal sayfalara giden bağlantıların öneki. Kurumsal alan adında URL'de
 * `/kurumsal` görünmez (proxy rewrite eder); önizlemede yol bazlıdır.
 */
export function kurumsalPath(host: string, locale: string, path = ''): string {
  const tail = path && !path.startsWith('/') ? `/${path}` : path
  if (siteForHost(host) === 'kurumsal') return `/${locale}${tail}`
  const d = siteDomains()
  // Galeri alan adındayken kurumsal başka bir alan adıdır → mutlak URL.
  if (d.kurumsal && siteForHost(host) === 'galeri') {
    return `https://${d.kurumsal}/${locale}${tail}`
  }
  return `/${locale}/${KURUMSAL_SEGMENT}${tail}`
}

/** Kurumsal sitedeyken galeriye giden bağlantılar. */
export function galeriPath(host: string, locale: string, path = ''): string {
  const tail = path && !path.startsWith('/') ? `/${path}` : path
  const d = siteDomains()
  if (d.galeri && siteForHost(host) === 'kurumsal') {
    return `https://${d.galeri}/${locale}${tail}`
  }
  return `/${locale}${tail}`
}
