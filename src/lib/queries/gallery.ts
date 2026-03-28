import { supabase } from '@/lib/db/supabase'

export async function getProducts(category?: string) {
  let query = supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(p => ({
    ...p,
    titleTr: p.title_tr,
    titleEn: p.title_en,
    descriptionTr: p.description_tr,
    descriptionEn: p.description_en,
    mediumTr: p.medium_tr,
    mediumEn: p.medium_en,
    dimensionsTr: p.dimensions_tr,
    dimensionsEn: p.dimensions_en,
    artistId: p.artist_id,
    isVisible: p.is_visible,
    isSold: p.is_sold,
    createdAt: p.created_at,
    images: (p.images ?? []).map((img: any) => ({
      ...img,
      altTr: img.alt_tr,
      altEn: img.alt_en,
      sortOrder: img.sort_order,
      productId: img.product_id,
    })),
  }))
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), artist:artists(*)')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (error) return null
  if (!data) return null
  return {
    ...data,
    titleTr: data.title_tr,
    titleEn: data.title_en,
    descriptionTr: data.description_tr,
    descriptionEn: data.description_en,
    mediumTr: data.medium_tr,
    mediumEn: data.medium_en,
    dimensionsTr: data.dimensions_tr,
    dimensionsEn: data.dimensions_en,
    artistId: data.artist_id,
    isVisible: data.is_visible,
    isSold: data.is_sold,
    createdAt: data.created_at,
    images: (data.images ?? []).map((img: any) => ({
      ...img,
      altTr: img.alt_tr,
      altEn: img.alt_en,
      sortOrder: img.sort_order,
      productId: img.product_id,
    })),
    artist: data.artist ? {
      ...data.artist,
      nameTr: data.artist.name_tr,
      nameEn: data.artist.name_en,
    } : null,
  }
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_visible', true)

  if (error) throw error
  const unique = [...new Set((data ?? []).map(r => r.category))]
  return unique
}
