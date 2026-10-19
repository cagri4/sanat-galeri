import { routing } from '@/lib/i18n/routing'
import { BIREYSEL_SEGMENT, KURUMSAL_SEGMENT, LEGACY_ARTIST_HOSTS, artistSite, siteDomains, siteForHost } from '@/lib/site'

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

/** 13 Eki kaldırılanlar (GOREV-A-LISTESI-UYGULA): özel sipariş → iletişim,
 *  süreç anlatısı → kurumsal projeler (sade künye proje sayfalarında). */
export const OZEL_SIPARIS_TARGET = 'iletisim'
/** 13 Eki: heykeller iki seri sayfası; eski tek sayfa → iki serinin yan yana durduğu /koleksiyonlar. */
export const HEYKELLER_ESKI = 'koleksiyonlar/seramik-heykeller'
export const HEYKELLER_HEDEF = 'koleksiyonlar'
export const SUREC_TARGET = '/projeler'

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

  // 1b. Bireysel sanatçı sitesi: kök = CV sayfası; diğer her yol galeriye (301) —
  //     eser detayları ve koleksiyonlar galeride kalır, kopya içerik oluşmaz.
  const bireysel = artistSite()
  if (bireysel) {
    if (!locale) return { type: 'intl' }
    if (rest === '' || rest === '/') {
      return { type: 'rewrite', pathname: `/${loc}/${BIREYSEL_SEGMENT}/${bireysel}`, locale: loc }
    }
    if (domains.galeri) return { type: 'redirect', location: `https://${domains.galeri}/${loc}${rest}${search}` }
    return { type: 'redirect', location: `/${loc}` }
  }

  // 1c. Galeri/kurumsal sitede bireysel sayfa doğrudan açılmaz → sanatçının galeri sayfası.
  const bireyselYol = locale ? rest.match(new RegExp(`^/${BIREYSEL_SEGMENT}/(seref|melike)(?=/|$)`)) : null
  if (bireyselYol) return { type: 'redirect', location: `/${loc}/${bireyselYol[1]}` }

  const site = siteForHost(hostname)

  // 2. /teknik → antik koleksiyon sayfasındaki terra sigillata bölümü (301).
  if (locale && /^\/teknik\/?$/.test(rest)) {
    const base = site === 'kurumsal' && domains.galeri ? `https://${domains.galeri}` : ''
    return { type: 'redirect', location: `${base}/${loc}/${TEKNIK_TARGET}` }
  }

  const kurumsalPrefix = new RegExp(`^/${KURUMSAL_SEGMENT}(?=/|$)`)

  if (locale) {
    const prefixed = kurumsalPrefix.test(rest)
    const inner = prefixed ? rest.replace(kurumsalPrefix, '') : rest

    // 3a. /surec (her iki sitede, /kurumsal önekli ya da değil) → kurumsal projeler (301).
    if (/^\/surec\/?$/.test(inner)) {
      if (site === 'kurumsal') return { type: 'redirect', location: `/${loc}${SUREC_TARGET}` }
      if (domains.kurumsal) return { type: 'redirect', location: `https://${domains.kurumsal}/${loc}${SUREC_TARGET}` }
      return { type: 'redirect', location: `/${loc}/${KURUMSAL_SEGMENT}${SUREC_TARGET}` }
    }

    // 3c. Eski heykel koleksiyonu (tek sayfa) → /koleksiyonlar (301). Galeri sayfası;
    //     kurumsal alan adında istenirse galeriye gönderilir.
    if (inner.replace(/\/$/, '') === `/${HEYKELLER_ESKI}`) {
      const base = site === 'kurumsal' && domains.galeri ? `https://${domains.galeri}` : ''
      return { type: 'redirect', location: `${base}/${loc}/${HEYKELLER_HEDEF}` }
    }

    // 3b. /ozel-siparis → aynı sitenin iletişim sayfası (301).
    if (/^\/ozel-siparis\/?$/.test(inner)) {
      let base = `/${loc}`
      if (prefixed && site !== 'kurumsal') {
        base = domains.kurumsal ? `https://${domains.kurumsal}/${loc}` : `/${loc}/${KURUMSAL_SEGMENT}`
      }
      return { type: 'redirect', location: `${base}/${OZEL_SIPARIS_TARGET}` }
    }
  }

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
