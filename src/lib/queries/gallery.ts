import { supabase } from '@/lib/db/supabase'
import { isOnSite, type SiteKey } from '@/lib/site'

/**
 * `site` verilirse yalnızca o sitede yer alan kategoriler döner
 * (ürün bazlı ayrım, bkz. lib/site.ts). Veri küçük; süzme JS tarafında.
 */
/**
 * Sitede gösterilecek görseller: gizlenenler (is_visible=false, 0007) dışarıda,
 * sanatçının sırası (sort_order, eşitlikte id). Kolon yoksa (eski DB) hepsi görünür.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function publicImages(images: any[] | null | undefined) {
  return (images ?? [])
    .filter((img) => img.is_visible !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id)
    .map((img) => ({
      ...img,
      altTr: img.alt_tr,
      altEn: img.alt_en,
      sortOrder: img.sort_order,
      productId: img.product_id,
    }))
}

export async function getProducts(category?: string, site?: SiteKey) {
  let query = supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_visible', true)
    // Sanatcinin verdigi sira (SANATCI-SITE-DUZENI.md); esitlikte yeni once.
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  const rows = site ? (data ?? []).filter((p) => isOnSite(p.category, site)) : (data ?? [])
  return rows.map(p => ({
    ...p,
    titleTr: p.title_tr,
    titleEn: p.title_en,
    descriptionTr: p.description_tr,
    descriptionEn: p.description_en,
    // Kolon henüz yoksa (migration 0006 uygulanmadıysa) undefined → null.
    descriptionKurumsalTr: p.description_kurumsal_tr ?? null,
    descriptionKurumsalEn: p.description_kurumsal_en ?? null,
    collection: p.collection,
    heroOrder: p.hero_order,
    instagramOrder: p.instagram_order,
    mediumTr: p.medium_tr,
    mediumEn: p.medium_en,
    dimensionsTr: p.dimensions_tr,
    dimensionsEn: p.dimensions_en,
    artistId: p.artist_id,
    isVisible: p.is_visible,
    isSold: p.is_sold,
    createdAt: p.created_at,
    images: publicImages(p.images),
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
    descriptionKurumsalTr: data.description_kurumsal_tr ?? null,
    descriptionKurumsalEn: data.description_kurumsal_en ?? null,
    mediumTr: data.medium_tr,
    mediumEn: data.medium_en,
    dimensionsTr: data.dimensions_tr,
    dimensionsEn: data.dimensions_en,
    formTr: data.form_tr,
    formEn: data.form_en,
    periodTr: data.period_tr,
    periodEn: data.period_en,
    subjectTr: data.subject_tr,
    subjectEn: data.subject_en,
    aboutTr: data.about_tr,
    aboutEn: data.about_en,
    collection: data.collection,
    artistId: data.artist_id,
    isVisible: data.is_visible,
    isSold: data.is_sold,
    createdAt: data.created_at,
    images: publicImages(data.images),
    artist: data.artist ? {
      ...data.artist,
      nameTr: data.artist.name_tr,
      nameEn: data.artist.name_en,
    } : null,
  }
}

export async function getProductsByArtist(artistId: number, limit?: number, site?: SiteKey) {
  let query = supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_visible', true)
    .eq('artist_id', artistId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Site süzgeci varken limit JS'te uygulanır (aksi halde süzülen kayıtlar
  // limiti yer, sayfada eksik eser görünürdü).
  if (limit && !site) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  let rows = site ? (data ?? []).filter((p) => isOnSite(p.category, site)) : (data ?? [])
  if (limit && site) rows = rows.slice(0, limit)
  return rows.map(p => ({
    ...p,
    titleTr: p.title_tr,
    titleEn: p.title_en,
    mediumTr: p.medium_tr,
    mediumEn: p.medium_en,
    dimensionsTr: p.dimensions_tr,
    dimensionsEn: p.dimensions_en,
    artistId: p.artist_id,
    isVisible: p.is_visible,
    isSold: p.is_sold,
    createdAt: p.created_at,
    images: publicImages(p.images),
  }))
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
