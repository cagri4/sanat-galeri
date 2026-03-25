'use server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { artists } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

const artistSchema = z.object({
  bioTr: z.string().optional(),
  bioEn: z.string().optional(),
  statementTr: z.string().optional(),
  statementEn: z.string().optional(),
  photoUrl: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
})

type ArtistInput = z.infer<typeof artistSchema>

export async function updateArtist(
  id: number,
  data: ArtistInput
): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = artistSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  await db
    .update(artists)
    .set({
      bioTr: parsed.data.bioTr,
      bioEn: parsed.data.bioEn,
      statementTr: parsed.data.statementTr,
      statementEn: parsed.data.statementEn,
      photoUrl: parsed.data.photoUrl,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
    })
    .where(eq(artists.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}
