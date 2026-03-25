'use server'
import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function markMessageRead(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db
    .update(messages)
    .set({ isRead: true })
    .where(eq(messages.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Extracts product context prefix from message body.
 * Format: "[Eser: slug]\n\nrest of message"
 */
export function parseProductContext(body: string): {
  productSlug: string | null
  cleanBody: string
} {
  const match = body.match(/^\[Eser: ([^\]]+)\]\n\n([\s\S]*)$/)
  if (match) {
    return {
      productSlug: match[1],
      cleanBody: match[2],
    }
  }
  return {
    productSlug: null,
    cleanBody: body,
  }
}
