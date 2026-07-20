'use server'
import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// Supabase REST kullanma gerekcesi icin bkz. `actions/product.ts` bas notu.

export async function markMessageRead(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id)
  if (error) {
    console.error('markMessageRead:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/mesajlar')
  return { success: true }
}

export async function deleteMessage(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('messages').delete().eq('id', id)
  if (error) {
    console.error('deleteMessage:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/mesajlar')
  return { success: true }
}
