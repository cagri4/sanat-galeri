import { supabase } from '@/lib/db/supabase'

/** Sergi sayfalarında kullanılan fotoğraf kimlikleri. */
export const EXHIBITIONS = [
  { slug: 'bozcaada-2010', label: 'Bozcaada 2010 — Yolculuklar' },
] as const

export interface ExhibitionPhoto {
  id: number
  exhibitionSlug: string
  url: string
  titleTr: string | null
  titleEn: string | null
  captionTr: string | null
  captionEn: string | null
  sortOrder: number
}

function map(p: any): ExhibitionPhoto {
  return {
    id: p.id,
    exhibitionSlug: p.exhibition_slug,
    url: p.url,
    titleTr: p.title_tr,
    titleEn: p.title_en,
    captionTr: p.caption_tr,
    captionEn: p.caption_en,
    sortOrder: p.sort_order ?? 0,
  }
}

export async function getExhibitionPhotos(slug: string): Promise<ExhibitionPhoto[]> {
  const { data, error } = await supabase
    .from('exhibition_photos')
    .select('*')
    .eq('exhibition_slug', slug)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    console.error('getExhibitionPhotos:', error)
    return []
  }
  return (data ?? []).map(map)
}
