'use server'
import { z } from 'zod'
import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// Supabase REST kullanma gerekcesi icin bkz. `actions/product.ts` bas notu.
//
// NOT: WhatsApp alani BILEREK kaldirildi. Kisisel cep numaralari siteden
// cikarildi (2026-07-19, Cagri); alanin panelde durmasi numaranin yeniden
// yayimlanabilecegi izlenimi veriyordu. DB sutunu duruyor, panelden yazilmiyor.

const artistSchema = z.object({
  bioTr: z.string().optional(),
  bioEn: z.string().optional(),
  statementTr: z.string().optional(),
  statementEn: z.string().optional(),
  photoUrl: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

type ArtistInput = z.infer<typeof artistSchema>

const nn = (v: string | undefined) => {
  const t = v?.trim()
  return t ? t : null
}

export async function updateArtist(
  id: number,
  data: ArtistInput
): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = artistSchema.safeParse(data)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('artists')
    .update({
      bio_tr: nn(parsed.data.bioTr),
      bio_en: nn(parsed.data.bioEn),
      statement_tr: nn(parsed.data.statementTr),
      statement_en: nn(parsed.data.statementEn),
      photo_url: nn(parsed.data.photoUrl),
      email: nn(parsed.data.email),
    })
    .eq('id', id)

  if (error) {
    console.error('updateArtist:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
