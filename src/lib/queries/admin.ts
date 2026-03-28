import { supabase } from '@/lib/db/supabase'

function mapProduct(p: any) {
  return {
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
    artist: p.artist ? { ...p.artist, nameTr: p.artist.name_tr, nameEn: p.artist.name_en } : null,
  }
}

function mapArtist(a: any) {
  return {
    ...a,
    nameTr: a.name_tr,
    nameEn: a.name_en,
    bioTr: a.bio_tr,
    bioEn: a.bio_en,
    photoUrl: a.photo_url,
    statementTr: a.statement_tr,
    statementEn: a.statement_en,
    createdAt: a.created_at,
  }
}

function mapMessage(m: any) {
  return {
    ...m,
    senderName: m.sender_name,
    senderEmail: m.sender_email,
    isRead: m.is_read,
    createdAt: m.created_at,
    artistId: m.artist_id,
    artist: m.artist ? { ...m.artist, nameTr: m.artist.name_tr, nameEn: m.artist.name_en } : null,
  }
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), artist:artists(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapProduct)
}

export async function getProductById(id: number) {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), artist:artists(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return data ? mapProduct(data) : null
}

export async function getAllArtists() {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name_tr')
  if (error) throw error
  return (data ?? []).map(mapArtist)
}

export async function getAdminArtistBySlug(slug: string) {
  const { data, error } = await supabase
    .from('artists')
    .select('*, exhibitions(*), portfolio_items(*), press_items(*)')
    .eq('slug', slug)
    .single()
  if (error) return null
  if (!data) return null
  return {
    ...mapArtist(data),
    exhibitions: (data.exhibitions ?? []).map((e: any) => ({
      ...e, titleTr: e.title_tr, titleEn: e.title_en, artistId: e.artist_id, sortOrder: e.sort_order,
    })),
    portfolioItems: (data.portfolio_items ?? []).map((p: any) => ({
      ...p, titleTr: p.title_tr, titleEn: p.title_en, mediumTr: p.medium_tr, mediumEn: p.medium_en,
      imageUrl: p.image_url, artistId: p.artist_id, sortOrder: p.sort_order,
    })),
    pressItems: (data.press_items ?? []).map((p: any) => ({
      ...p, artistId: p.artist_id, sortOrder: p.sort_order,
    })),
  }
}

export async function getAllMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*, artist:artists(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapMessage)
}
