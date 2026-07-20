'use server'
import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { deleteImage } from '@/lib/storage'

// Supabase REST kullanma gerekcesi icin bkz. `actions/product.ts` bas notu.
// Depo tarafi icin bkz. `lib/storage.ts`.

export async function addProductImage(data: {
  productId: number
  url: string
  altTr?: string
  altEn?: string
  sortOrder?: number
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('product_images').insert({
    product_id: data.productId,
    url: data.url,
    alt_tr: data.altTr?.trim() || null,
    alt_en: data.altEn?.trim() || null,
    sort_order: data.sortOrder ?? 0,
  })

  if (error) {
    console.error('addProductImage:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateProductImage(
  id: number,
  data: { altTr?: string; altEn?: string; sortOrder?: number }
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const patch: Record<string, unknown> = {}
  if (data.altTr !== undefined) patch.alt_tr = data.altTr.trim() || null
  if (data.altEn !== undefined) patch.alt_en = data.altEn.trim() || null
  if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder

  const { error } = await supabase.from('product_images').update(patch).eq('id', id)
  if (error) {
    console.error('updateProductImage:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteProductImage(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const { data: image } = await supabase
    .from('product_images')
    .select('url')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('product_images').delete().eq('id', id)
  if (error) {
    console.error('deleteProductImage:', error)
    return { success: false, error: error.message }
  }

  // Satir silindikten sonra dosyayi da kaldir. Dosya silinemezse kayit yine
  // gitmis olur — yetim dosya, kirik gorselden iyidir.
  if (image?.url) await deleteImage(image.url)

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function reorderProductImages(
  images: { id: number; sortOrder: number }[]
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  for (const image of images) {
    const { error } = await supabase
      .from('product_images')
      .update({ sort_order: image.sortOrder })
      .eq('id', image.id)
    if (error) {
      console.error('reorderProductImages:', error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
