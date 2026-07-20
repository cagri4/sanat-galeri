'use server'
import { z } from 'zod'
import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { deleteImage } from '@/lib/storage'

/**
 * Sergi fotograflari — Bozcaada 2010 ve sonraki sergiler.
 *
 * Bu bolum eskiden TAMAMEN KODDA SABITTI (`PHOTO_COUNT = 12`, dosya adlari
 * `bozcaada-N.jpg`, alt yazilar ceviri dosyasinda). Sanatcidan kalan 9
 * fotografin aciklamasi gelince kod degistirmek gerekiyordu; artik panelden
 * girilir.
 */

const photoSchema = z.object({
  titleTr: z.string().optional(),
  titleEn: z.string().optional(),
  captionTr: z.string().optional(),
  captionEn: z.string().optional(),
  sortOrder: z.number().optional(),
})

type PhotoInput = z.infer<typeof photoSchema>

const nn = (v: string | undefined) => {
  const t = v?.trim()
  return t ? t : null
}

export async function addExhibitionPhoto(data: {
  exhibitionSlug: string
  url: string
  sortOrder?: number
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('exhibition_photos').insert({
    exhibition_slug: data.exhibitionSlug,
    url: data.url,
    sort_order: data.sortOrder ?? 0,
  })

  if (error) {
    console.error('addExhibitionPhoto:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateExhibitionPhoto(
  id: number,
  data: PhotoInput
): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = photoSchema.safeParse(data)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors }

  const patch: Record<string, unknown> = {
    title_tr: nn(parsed.data.titleTr),
    title_en: nn(parsed.data.titleEn),
    caption_tr: nn(parsed.data.captionTr),
    caption_en: nn(parsed.data.captionEn),
  }
  if (parsed.data.sortOrder !== undefined) patch.sort_order = parsed.data.sortOrder

  const { error } = await supabase.from('exhibition_photos').update(patch).eq('id', id)
  if (error) {
    console.error('updateExhibitionPhoto:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteExhibitionPhoto(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const { data: row } = await supabase
    .from('exhibition_photos')
    .select('url')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('exhibition_photos').delete().eq('id', id)
  if (error) {
    console.error('deleteExhibitionPhoto:', error)
    return { success: false, error: error.message }
  }

  // Yalnizca panelden yuklenmis dosyalar silinir; toplu yuklenen eski
  // `bozcaada-N.jpg` dosyalari da ayni kovada oldugu icin bilerek kaldirilir.
  if (row?.url) await deleteImage(row.url)

  revalidatePath('/', 'layout')
  return { success: true }
}
