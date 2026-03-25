'use server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

const productSchema = z.object({
  titleTr: z.string().min(1),
  titleEn: z.string().min(1),
  category: z.string().min(1),
  descriptionTr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  year: z.number().optional(),
  mediumTr: z.string().optional(),
  mediumEn: z.string().optional(),
  dimensionsTr: z.string().optional(),
  dimensionsEn: z.string().optional(),
  artistId: z.number().optional(),
  isSold: z.boolean().optional(),
  isVisible: z.boolean().optional(),
})

type ProductInput = z.infer<typeof productSchema>

function generateSlug(titleTr: string): string {
  return titleTr
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export async function createProduct(
  data: ProductInput
): Promise<{ success: boolean; id?: number; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const slug = generateSlug(parsed.data.titleTr)
  const rows = await db
    .insert(products)
    .values({
      slug,
      titleTr: parsed.data.titleTr,
      titleEn: parsed.data.titleEn,
      category: parsed.data.category,
      descriptionTr: parsed.data.descriptionTr,
      descriptionEn: parsed.data.descriptionEn,
      price: parsed.data.price,
      currency: parsed.data.currency,
      year: parsed.data.year,
      mediumTr: parsed.data.mediumTr,
      mediumEn: parsed.data.mediumEn,
      dimensionsTr: parsed.data.dimensionsTr,
      dimensionsEn: parsed.data.dimensionsEn,
      artistId: parsed.data.artistId,
      isSold: parsed.data.isSold,
      isVisible: parsed.data.isVisible,
    })
    .returning({ id: products.id })

  revalidatePath('/', 'layout')
  return { success: true, id: rows[0]?.id }
}

export async function updateProduct(
  id: number,
  data: ProductInput
): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  await db
    .update(products)
    .set({
      titleTr: parsed.data.titleTr,
      titleEn: parsed.data.titleEn,
      category: parsed.data.category,
      descriptionTr: parsed.data.descriptionTr,
      descriptionEn: parsed.data.descriptionEn,
      price: parsed.data.price,
      currency: parsed.data.currency,
      year: parsed.data.year,
      mediumTr: parsed.data.mediumTr,
      mediumEn: parsed.data.mediumEn,
      dimensionsTr: parsed.data.dimensionsTr,
      dimensionsEn: parsed.data.dimensionsEn,
      artistId: parsed.data.artistId,
      isSold: parsed.data.isSold,
      isVisible: parsed.data.isVisible,
    })
    .where(eq(products.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteProduct(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.delete(products).where(eq(products.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}
