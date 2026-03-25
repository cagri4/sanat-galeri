'use server'
import { db } from '@/lib/db'
import { productImages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'

export async function addProductImage(data: {
  productId: number
  url: string
  altTr?: string
  altEn?: string
  sortOrder?: number
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.insert(productImages).values({
    productId: data.productId,
    url: data.url,
    altTr: data.altTr,
    altEn: data.altEn,
    sortOrder: data.sortOrder ?? 0,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteProductImage(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const image = await db.query.productImages.findFirst({
    where: eq(productImages.id, id),
  })

  if (image?.url) {
    await del(image.url)
  }

  await db.delete(productImages).where(eq(productImages.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function reorderProductImages(
  images: { id: number; sortOrder: number }[]
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  for (const image of images) {
    await db
      .update(productImages)
      .set({ sortOrder: image.sortOrder })
      .where(eq(productImages.id, image.id))
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
