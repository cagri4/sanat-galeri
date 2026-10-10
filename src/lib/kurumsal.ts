import type { getProducts } from '@/lib/queries/gallery'
import { isKurumsalOnly } from '@/lib/site'

type Product = Awaited<ReturnType<typeof getProducts>>[number]

/**
 * Kurumsal sitedeki açıklama metni (KARARLAR-2026-10-10 madde 2):
 * - Esere özel kurumsal metin varsa o.
 * - Yalnız-kurumsal kategoride (panolar) tek metin zaten proje dilinde → o.
 * - İki sitede olan kategoride (heykeller) kurumsal metin yoksa GALERİ METNİ
 *   KULLANILMAZ — fark metinden gelmeli; null döner, sayfa yalnız künye gösterir.
 */
export function kurumsalText(p: Pick<Product, 'category' | 'descriptionTr' | 'descriptionEn' | 'descriptionKurumsalTr' | 'descriptionKurumsalEn'>, isTr: boolean): string | null {
  const own = isTr ? p.descriptionKurumsalTr : p.descriptionKurumsalEn
  if (own) return own
  if (isKurumsalOnly(p.category)) return (isTr ? p.descriptionTr : p.descriptionEn) ?? null
  return null
}

/** Proje numarası: 01, 02 … (sıra sanatçının sort_order'ı). */
export function projectNo(i: number): string {
  return String(i + 1).padStart(2, '0')
}

/** Ana sayfadaki rakamlar — yalnız DB'deki gerçek kayıtlardan hesaplanır. */
export function projectStats(products: Pick<Product, 'year' | 'collection'>[]) {
  const years = products.map((p) => p.year).filter((y): y is number => typeof y === 'number')
  const places = new Set(products.map((p) => p.collection).filter(Boolean))
  return {
    count: products.length,
    yearRange: years.length ? [Math.min(...years), Math.max(...years)] as const : null,
    places: places.size,
  }
}
