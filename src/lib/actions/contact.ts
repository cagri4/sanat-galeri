'use server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { messages, artists } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const contactSchema = z.object({
  senderName: z.string().min(2).max(100),
  senderEmail: z.string().email(),
  body: z.string().min(10).max(2000),
  productSlug: z.string().optional(),
})

export type ContactFormState = {
  success: boolean
  errors?: Record<string, string[]>
}

export async function submitContact(data: z.infer<typeof contactSchema>): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }
  const bodyWithContext = parsed.data.productSlug
    ? `[Eser: ${parsed.data.productSlug}]\n\n${parsed.data.body}`
    : parsed.data.body
  await db.insert(messages).values({
    artistId: null,
    senderName: parsed.data.senderName,
    senderEmail: parsed.data.senderEmail,
    body: bodyWithContext,
  })
  return { success: true }
}

export const artistContactSchema = z.object({
  senderName: z.string().min(2).max(100),
  senderEmail: z.string().email(),
  body: z.string().min(10).max(2000),
  artistSlug: z.string(),
})

export async function submitArtistContact(
  data: z.infer<typeof artistContactSchema>
): Promise<ContactFormState> {
  const parsed = artistContactSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }
  const artist = await db.query.artists.findFirst({
    where: eq(artists.slug, parsed.data.artistSlug),
  })
  if (!artist) return { success: false }
  await db.insert(messages).values({
    artistId: artist.id,
    senderName: parsed.data.senderName,
    senderEmail: parsed.data.senderEmail,
    body: parsed.data.body,
  })
  return { success: true }
}
