import { supabase } from '@/lib/db/supabase'

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

function mapExhibition(e: any) {
  return {
    ...e,
    titleTr: e.title_tr,
    titleEn: e.title_en,
    artistId: e.artist_id,
    sortOrder: e.sort_order,
  }
}

function mapPortfolio(p: any) {
  return {
    ...p,
    titleTr: p.title_tr,
    titleEn: p.title_en,
    mediumTr: p.medium_tr,
    mediumEn: p.medium_en,
    imageUrl: p.image_url,
    artistId: p.artist_id,
    sortOrder: p.sort_order,
  }
}

function mapPress(p: any) {
  return {
    ...p,
    artistId: p.artist_id,
    sortOrder: p.sort_order,
  }
}

export async function getArtistBySlug(slug: string) {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return mapArtist(data)
}

export async function getArtistPortfolio(artistId: number) {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('artist_id', artistId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapPortfolio)
}

export async function getArtistExhibitions(artistId: number) {
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('artist_id', artistId)
    .order('year', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapExhibition)
}

export async function getArtistPressItems(artistId: number) {
  const { data, error } = await supabase
    .from('press_items')
    .select('*')
    .eq('artist_id', artistId)
    .order('year', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapPress)
}
