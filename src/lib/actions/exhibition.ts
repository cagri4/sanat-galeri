'use server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { exhibitions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

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

export async function createExhibition(
  data: ExhibitionInput
): Promise<{ success: boolean; id?: number; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = exhibitionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const rows = await db
    .insert(exhibitions)
    .values({
      artistId: parsed.data.artistId,
      type: parsed.data.type,
      titleTr: parsed.data.titleTr,
      titleEn: parsed.data.titleEn,
      location: parsed.data.location,
      year: parsed.data.year,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning({ id: exhibitions.id })

  revalidatePath('/', 'layout')
  return { success: true, id: rows[0]?.id }
}

export async function updateExhibition(
  id: number,
  data: ExhibitionInput
): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = exhibitionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  await db
    .update(exhibitions)
    .set({
      artistId: parsed.data.artistId,
      type: parsed.data.type,
      titleTr: parsed.data.titleTr,
      titleEn: parsed.data.titleEn,
      location: parsed.data.location,
      year: parsed.data.year,
      sortOrder: parsed.data.sortOrder,
    })
    .where(eq(exhibitions.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteExhibition(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.delete(exhibitions).where(eq(exhibitions.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}
