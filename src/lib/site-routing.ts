import { routing } from '@/lib/i18n/routing'
import { KURUMSAL_SEGMENT, LEGACY_ARTIST_HOSTS, siteDomains, siteForHost } from '@/lib/site'

/**
 * Proxy'nin karar mantığı — saf fonksiyon (test edilebilsin diye proxy.ts'ten
 * ayrı). Girdi: host + yol + query; çıktı: ne yapılacağı.
 */
export type RouteDecision =
  | { type: 'redirect'; location: string }        // 301
  | { type: 'rewrite'; pathname: string; locale: string }
  | { type: 'intl' }                               // next-intl'e bırak

/** /teknik kaldırıldı (Edit Talepleri satır 11); metni antik koleksiyon sayfasında. */
export const TEKNIK_TARGET = 'koleksiyonlar/antik-donem-replikalari#terra-sigillata'

function splitLocale(pathname: string): { locale: string | null; rest: string } {
  const seg = pathname.split('/')[1] ?? ''
  if ((routing.locales as readonly string[]).includes(seg)) {
    const rest = pathname.slice(seg.length + 1)
    return { locale: seg, rest: rest === '/' ? '' : rest }
  }
  return { locale: null, rest: pathname === '/' ? '' : pathname }
}

export function decideRoute(host: string, pathname: string, search = ''): RouteDecision {
  const hostname = host.toLowerCase().split(':')[0]
  const domains = siteDomains()
  const { locale, rest } = splitLocale(pathname)
  const loc = locale ?? routing.defaultLocale

  // 1. Eski sanatçı alan adları → galerideki sanatçı sayfası (301).
  const artist = LEGACY_ARTIST_HOSTS[hostname]
  if (artist && domains.galeri) {
    return {
      type: 'redirect',
      location: `https://${domains.galeri}/${loc}/${artist}${rest}${search}`,
    }
  }

  const site = siteForHost(hostname)

  // 2. /teknik → antik koleksiyon sayfasındaki terra sigillata bölümü (301).
  if (locale && /^\/teknik\/?$/.test(rest)) {
    const base = site === 'kurumsal' && domains.galeri ? `https://${domains.galeri}` : ''
    return { type: 'redirect', location: `${base}/${loc}/${TEKNIK_TARGET}` }
  }

  const kurumsalPrefix = new RegExp(`^/${KURUMSAL_SEGMENT}(?=/|$)`)

  // 3. Kurumsal alan adı: URL'de /kurumsal görünmez.
  if (site === 'kurumsal') {
    if (!locale) return { type: 'intl' } // önce /tr'ye yönlensin
    if (kurumsalPrefix.test(rest)) {
      return { type: 'redirect', location: `/${loc}${rest.replace(kurumsalPrefix, '')}${search}` }
    }
    return { type: 'rewrite', pathname: `/${loc}/${KURUMSAL_SEGMENT}${rest}`, locale: loc }
  }

  // 4. Galeri alan adında kurumsal yol istenirse kurumsal alan adına (301).
  if (site === 'galeri' && domains.kurumsal && locale && kurumsalPrefix.test(rest)) {
    return {
      type: 'redirect',
      location: `https://${domains.kurumsal}/${loc}${rest.replace(kurumsalPrefix, '')}${search}`,
    }
  }

  return { type: 'intl' }
}
