'use server'
import { z } from 'zod'
import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// Supabase REST kullanma gerekcesi icin bkz. `actions/product.ts` bas notu.

const exhibitionSchema = z.object({
  artistId: z.number(),
  type: z.string().min(1),
  titleTr: z.string().min(1),
  titleEn: z.string().min(1),
  location: z.string().optional(),
  year: z.number().optional(),
  sortOrder: z.number().optional(),
})

type ExhibitionInput = z.infer<typeof exhibitionSchema>

const nn = (v: string | undefined) => {
  const t = v?.trim()
  return t ? t : null
}

const toRow = (d: ExhibitionInput) => ({
  artist_id: d.artistId,
  type: d.type,
  title_tr: d.titleTr.trim(),
  title_en: d.titleEn.trim(),
  location: nn(d.location),
  year: d.year ?? null,
  sort_order: d.sortOrder ?? 0,
})

export async function createExhibition(
  data: ExhibitionInput
): Promise<{ success: boolean; id?: number; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = exhibitionSchema.safeParse(data)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors }

  const { data: row, error } = await supabase
    .from('exhibitions')
    .insert(toRow(parsed.data))
    .select('id')
    .single()

  if (error) {
    console.error('createExhibition:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, id: row?.id }
}

export async function updateExhibition(
  id: number,
  data: ExhibitionInput
): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = exhibitionSchema.safeParse(data)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors }

  const { error } = await supabase.from('exhibitions').update(toRow(parsed.data)).eq('id', id)
  if (error) {
    console.error('updateExhibition:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteExhibition(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('exhibitions').delete().eq('id', id)
  if (error) {
    console.error('deleteExhibition:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
