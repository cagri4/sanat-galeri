'use server'
import { z } from 'zod'
import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

/**
 * NEDEN SUPABASE REST (drizzle degil)
 *
 * `DATABASE_URL` Supabase'in DOGRUDAN baglantisini gosteriyor
 * (`db.<ref>.supabase.co:5432`). Bu adres yalnizca IPv6 uzerinden erisilebilir;
 * Vercel'in fonksiyonlari IPv4 oldugu icin oradan ACILMIYOR. Okuma sorgulari bu
 * yuzden daha once REST'e tasinmisti; yazma islemleri drizzle'da kalinca panelde
 * "Kaydet" canlida 500 donuyordu (2026-07-20 denetimi). Artik okuma ve yazma ayni
 * yolu kullaniyor.
 */

const productSchema = z.object({
  titleTr: z.string().min(1),
  titleEn: z.string().min(1),
  category: z.string().min(1),
  collection: z.string().optional(),
  descriptionTr: z.string().optional(),
  descriptionEn: z.string().optional(),
  aboutTr: z.string().optional(),
  aboutEn: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  year: z.number().optional(),
  mediumTr: z.string().optional(),
  mediumEn: z.string().optional(),
  dimensionsTr: z.string().optional(),
  dimensionsEn: z.string().optional(),
  formTr: z.string().optional(),
  formEn: z.string().optional(),
  periodTr: z.string().optional(),
  periodEn: z.string().optional(),
  subjectTr: z.string().optional(),
  subjectEn: z.string().optional(),
  artistId: z.number().optional(),
  sortOrder: z.number().optional(),
  isSold: z.boolean().optional(),
  isVisible: z.boolean().optional(),
})

type ProductInput = z.infer<typeof productSchema>

/** Bos string -> NULL. Panelde bosaltilan alan sitede gizlenmeli. */
const nn = (v: string | undefined) => {
  const t = v?.trim()
  return t ? t : null
}

const TR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o',
  ş: 's', Ş: 's', ü: 'u', Ü: 'u',
}

/**
 * Turkce karakterleri harf kaybetmeden cevirir.
 * Eski surum `[^a-z0-9-]` ile siliyordu: "Çan Krater" -> "an-krater".
 */
function generateSlug(titleTr: string): string {
  return titleTr
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => TR_MAP[c] ?? c)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Ayni slug varsa sonuna -2, -3 ... ekler. */
async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  const { data } = await supabase.from('products').select('id, slug').like('slug', `${base}%`)
  const taken = new Set((data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug))
  if (!taken.has(base)) return base
  for (let i = 2; i < 200; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`
  return `${base}-${Date.now()}`
}

function toRow(d: ProductInput) {
  return {
    title_tr: d.titleTr.trim(),
    title_en: d.titleEn.trim(),
    category: d.category,
    collection: nn(d.collection),
    description_tr: nn(d.descriptionTr),
    description_en: nn(d.descriptionEn),
    about_tr: nn(d.aboutTr),
    about_en: nn(d.aboutEn),
    price: nn(d.price),
    currency: d.currency ?? 'TRY',
    year: d.year ?? null,
    medium_tr: nn(d.mediumTr),
    medium_en: nn(d.mediumEn),
    dimensions_tr: nn(d.dimensionsTr),
    dimensions_en: nn(d.dimensionsEn),
    form_tr: nn(d.formTr),
    form_en: nn(d.formEn),
    period_tr: nn(d.periodTr),
    period_en: nn(d.periodEn),
    subject_tr: nn(d.subjectTr),
    subject_en: nn(d.subjectEn),
    artist_id: d.artistId ?? null,
    sort_order: d.sortOrder ?? 0,
    is_sold: d.isSold ?? false,
    is_visible: d.isVisible ?? true,
  }
}

export async function createProduct(
  data: ProductInput
): Promise<{ success: boolean; id?: number; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = productSchema.safeParse(data)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors }

  const slug = await uniqueSlug(generateSlug(parsed.data.titleTr))
  const { data: row, error } = await supabase
    .from('products')
    .insert({ slug, ...toRow(parsed.data) })
    .select('id')
    .single()

  if (error) {
    console.error('createProduct:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, id: row?.id }
}

export async function updateProduct(
  id: number,
  data: ProductInput
): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = productSchema.safeParse(data)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors }

  const { error } = await supabase.from('products').update(toRow(parsed.data)).eq('id', id)

  if (error) {
    console.error('updateProduct:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteProduct(id: number): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    console.error('deleteProduct:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Ana sayfa yerlesimi: hero (5) ve Instagram (9) siralarini toplu gunceller.
 * NULL gonderilen eser o bolumden cikar.
 */
export async function updateHomepageSlots(
  slots: { id: number; heroOrder: number | null; instagramOrder: number | null }[]
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  for (const s of slots) {
    const { error } = await supabase
      .from('products')
      .update({ hero_order: s.heroOrder, instagram_order: s.instagramOrder })
      .eq('id', s.id)
    if (error) {
      console.error('updateHomepageSlots:', error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
