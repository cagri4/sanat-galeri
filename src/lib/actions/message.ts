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

