import { z } from 'zod'

/**
 * İletişim formu şemaları.
 *
 * Bu şemalar bilerek `lib/actions/contact.ts` dışında tutulur: o dosya
 * `'use server'` ile işaretli ve bir server-action modülü yalnızca async
 * fonksiyon export edebilir. Şema oradan export edilirse istemci gerçek Zod
 * nesnesi yerine bir action referansı alır ve `zodResolver` çalışma anında
 * "Invalid input: not a Zod schema" hatası verir.
 */
export const contactSchema = z.object({
  senderName: z.string().min(2).max(100),
  senderEmail: z.string().email(),
  body: z.string().min(10).max(2000),
  productSlug: z.string().optional(),
})

export const artistContactSchema = z.object({
  senderName: z.string().min(2).max(100),
  senderEmail: z.string().email(),
  body: z.string().min(10).max(2000),
  artistSlug: z.string(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ArtistContactInput = z.infer<typeof artistContactSchema>
