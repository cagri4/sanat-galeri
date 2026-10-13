import type { BannerImage } from '@/components/shared/page-banner'
import { getExhibitionPhotosBySlugs } from '@/lib/queries/exhibition-photos'
import { SERGI_AFISI, SERGI_KUNYE, yeniIcerikAcik } from '@/lib/yeni-icerik'

/**
 * Stüdyo sayfaları (Hakkımızda, Sergiler) için banner: sergi fotoğrafları
 * (afiş hariç). Atölye fotoğrafı gelince Hakkımızda onu kullanır; o zamana
 * kadar sergi karesi. Fotoğraflar gizli içerik bayrağına bağlı (lib/yeni-icerik).
 */
export async function sergiBanner(index = 0): Promise<BannerImage | null> {
  if (!yeniIcerikAcik()) return null
  try {
    const photos = (await getExhibitionPhotosBySlugs(Object.keys(SERGI_KUNYE))).filter((f) => f.titleTr !== SERGI_AFISI)
    const f = photos[index] ?? photos[0]
    if (!f) return null
    const k = SERGI_KUNYE[f.exhibitionSlug]
    return { src: f.url, alt: k ? `${k.title} — ${k.place}, ${k.year}` : '' }
  } catch {
    return null
  }
}
