/**
 * Sanatçı sorguları — getArtistBySlug, getAllArtists, getArtistPortfolio,
 * getArtistExhibitions, getArtistPressItems.
 *
 * Eski hali drizzle mock'luyordu; sorgular REST'e taşınınca güncellenmemişti.
 */

jest.mock('@/lib/db/supabase', () => ({ supabase: { from: jest.fn() } }))

import { supabase } from '@/lib/db/supabase'
import { mockFrom } from './helpers/supabase-mock'
import {
  getArtistBySlug,
  getAllArtists,
  getArtistPortfolio,
  getArtistExhibitions,
  getArtistPressItems,
} from '@/lib/queries/artist'

const ARTIST = {
  id: 1,
  slug: 'melike',
  name_tr: 'Melike Doğan',
  name_en: 'Melike Dogan',
  bio_tr: 'Biyografi',
  bio_en: 'Biography',
  statement_tr: 'Beyan',
  statement_en: 'Statement',
  photo_url: 'https://x/p.jpg',
  email: 'melike@uarttasarim.com',
  created_at: '2026-01-01',
}

describe('getArtistBySlug()', () => {
  it('doğru slug ile tek kayıt ister', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: ARTIST, error: null })
    await getArtistBySlug('melike')

    expect(lastTable()).toBe('artists')
    expect(builder.argsOf('eq')).toEqual(['slug', 'melike'])
    expect(builder.single).toHaveBeenCalled()
  })

  it('biyografi, beyan ve fotoğraf alanlarını camelCase eşler', async () => {
    mockFrom(supabase, { data: ARTIST, error: null })
    const a = await getArtistBySlug('melike')

    expect(a).toHaveProperty('bioTr', 'Biyografi')
    expect(a).toHaveProperty('bioEn', 'Biography')
    expect(a).toHaveProperty('statementTr', 'Beyan')
    expect(a).toHaveProperty('photoUrl', 'https://x/p.jpg')
    expect(a).toHaveProperty('nameTr', 'Melike Doğan')
  })

  it('bulunamayınca null döner', async () => {
    mockFrom(supabase, { data: null, error: { code: 'PGRST116' } })
    expect(await getArtistBySlug('yok')).toBeNull()
  })

  it('biyografi henüz girilmemişse null taşır (uydurma metin yok)', async () => {
    mockFrom(supabase, { data: { ...ARTIST, bio_tr: null, bio_en: null }, error: null })
    const a = await getArtistBySlug('melike')
    expect(a?.bioTr).toBeNull()
    expect(a?.bioEn).toBeNull()
  })
})

describe('getAllArtists()', () => {
  it('id sırasına göre listeler', async () => {
    const { builder } = mockFrom(supabase, { data: [ARTIST], error: null })
    const list = await getAllArtists()
    expect(builder.order).toHaveBeenCalledWith('id', { ascending: true })
    expect(list[0].nameTr).toBe('Melike Doğan')
  })
})

describe('getArtistPortfolio()', () => {
  it('sanatçıya göre filtreler ve sıraya göre diz', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: [], error: null })
    await getArtistPortfolio(1)

    expect(lastTable()).toBe('portfolio_items')
    expect(builder.argsOf('eq')).toEqual(['artist_id', 1])
    expect(builder.order).toHaveBeenCalledWith('sort_order', { ascending: true })
  })

  it('kayıt yoksa boş dizi döner', async () => {
    mockFrom(supabase, { data: [], error: null })
    expect(await getArtistPortfolio(1)).toEqual([])
  })
})

describe('getArtistExhibitions()', () => {
  it('yıla göre tersten sıralar', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: [], error: null })
    await getArtistExhibitions(1)

    expect(lastTable()).toBe('exhibitions')
    expect(builder.order).toHaveBeenCalledWith('year', { ascending: false })
  })

  it('tüm CV türlerini taşır (solo_sergi, grup_sergi, odul, egitim)', async () => {
    const rows = ['solo_sergi', 'grup_sergi', 'odul', 'egitim'].map((type, i) => ({
      id: i, artist_id: 1, type, title_tr: 'T', title_en: 'T', year: 2010, sort_order: i,
    }))
    mockFrom(supabase, { data: rows, error: null })
    const list = await getArtistExhibitions(1)
    expect(list.map((e: any) => e.type)).toEqual(['solo_sergi', 'grup_sergi', 'odul', 'egitim'])
    expect(list[0].titleTr).toBe('T')
  })
})

describe('getArtistPressItems()', () => {
  it('basın kayıtlarını yıla göre tersten getirir', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: [], error: null })
    await getArtistPressItems(1)
    expect(lastTable()).toBe('press_items')
    expect(builder.order).toHaveBeenCalledWith('year', { ascending: false })
  })

  it('kayıt yoksa boş dizi döner (boş durum)', async () => {
    mockFrom(supabase, { data: [], error: null })
    expect(await getArtistPressItems(1)).toEqual([])
  })
})
