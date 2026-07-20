/**
 * Galeri sorguları — getProducts, getProductBySlug, getProductsByArtist,
 * getCategories.
 *
 * NOT: Bu testler eskiden drizzle'ın `db.query.*` arayüzünü mock'luyordu.
 * Sorgular Supabase REST'e taşındığında güncellenmemişlerdi; import sırasında
 * düştükleri için de fark edilmemişti (bkz. jest.setup.ts). Artık gerçek
 * uygulamayı doğruluyorlar: hangi filtreler uygulanıyor ve snake_case sütunlar
 * camelCase alanlara doğru eşleniyor mu.
 */

jest.mock('@/lib/db/supabase', () => ({ supabase: { from: jest.fn() } }))

import { supabase } from '@/lib/db/supabase'
import { mockFrom } from './helpers/supabase-mock'
import {
  getProducts,
  getProductBySlug,
  getProductsByArtist,
  getCategories,
} from '@/lib/queries/gallery'

const ROW = {
  id: 1,
  slug: 'test-slug',
  title_tr: 'Eser',
  title_en: 'Artwork',
  description_tr: 'Açıklama',
  description_en: 'Description',
  about_tr: 'Replika hakkında',
  about_en: 'About the replica',
  collection: 'Zamansız Manzaralar',
  category: 'Resimli Seramikler',
  medium_tr: 'Terra sigillata',
  medium_en: 'Terra sigillata',
  dimensions_tr: '20 cm',
  dimensions_en: '20 cm',
  form_tr: 'Kylix',
  form_en: 'Kylix',
  period_tr: 'MÖ 5. yüzyıl',
  period_en: '5th century BC',
  subject_tr: 'Afrodit',
  subject_en: 'Aphrodite',
  hero_order: 0,
  instagram_order: 3,
  artist_id: 2,
  is_visible: true,
  is_sold: false,
  created_at: '2026-01-01',
  images: [{ id: 9, url: 'u', alt_tr: 'a', alt_en: 'b', sort_order: 1, product_id: 1 }],
  artist: { id: 2, slug: 'seref', name_tr: 'Şeref Doğan', name_en: 'Seref Dogan' },
}

describe('getProducts()', () => {
  it('yalnızca görünür eserleri ister ve sanatçı sırasına göre sıralar', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: [], error: null })
    await getProducts()

    expect(lastTable()).toBe('products')
    expect(builder.argsOf('eq')).toEqual(['is_visible', true])
    expect(builder.calls.filter((c) => c.method === 'order')[0].args[0]).toBe('sort_order')
  })

  it('kategori verildiğinde kategori filtresi ekler', async () => {
    const { builder } = mockFrom(supabase, { data: [], error: null })
    await getProducts('Antik Dönem Replikaları')

    const eqCalls = builder.calls.filter((c) => c.method === 'eq')
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['category', 'Antik Dönem Replikaları'] })
  })

  it('snake_case sütunları camelCase alanlara eşler', async () => {
    mockFrom(supabase, { data: [ROW], error: null })
    const [p] = await getProducts()

    expect(p.titleTr).toBe('Eser')
    expect(p.collection).toBe('Zamansız Manzaralar')
    expect(p.heroOrder).toBe(0)
    expect(p.instagramOrder).toBe(3)
    expect(p.images[0].altTr).toBe('a')
  })

  it('hata durumunda fırlatır (sessizce boş dönmez)', async () => {
    mockFrom(supabase, { data: null, error: { message: 'boom' } })
    await expect(getProducts()).rejects.toBeDefined()
  })
})

describe('getProductBySlug()', () => {
  it('slug + görünürlük filtresiyle tek kayıt ister', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: ROW, error: null })
    await getProductBySlug('test-slug')

    expect(lastTable()).toBe('products')
    const eqCalls = builder.calls.filter((c) => c.method === 'eq')
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['slug', 'test-slug'] })
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['is_visible', true] })
    expect(builder.single).toHaveBeenCalled()
  })

  it('katalog ve "Replika Hakkında" alanlarını eşler', async () => {
    mockFrom(supabase, { data: ROW, error: null })
    const p = await getProductBySlug('test-slug')

    expect(p?.formTr).toBe('Kylix')
    expect(p?.periodTr).toBe('MÖ 5. yüzyıl')
    expect(p?.subjectTr).toBe('Afrodit')
    expect(p?.aboutTr).toBe('Replika hakkında')
    expect(p?.aboutEn).toBe('About the replica')
    expect(p?.artist?.nameTr).toBe('Şeref Doğan')
  })

  it('bulunamayan eser için null döner (gizli eser dahil)', async () => {
    mockFrom(supabase, { data: null, error: { code: 'PGRST116' } })
    expect(await getProductBySlug('yok')).toBeNull()
  })
})

describe('getProductsByArtist()', () => {
  it('sanatçıya ve görünürlüğe göre filtreler', async () => {
    const { builder } = mockFrom(supabase, { data: [], error: null })
    await getProductsByArtist(2)

    const eqCalls = builder.calls.filter((c) => c.method === 'eq')
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['artist_id', 2] })
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['is_visible', true] })
    expect(builder.limit).not.toHaveBeenCalled()
  })

  it('limit verildiğinde uygular', async () => {
    const { builder } = mockFrom(supabase, { data: [], error: null })
    await getProductsByArtist(2, 4)
    expect(builder.limit).toHaveBeenCalledWith(4)
  })
})

describe('getCategories()', () => {
  it('benzersiz kategori listesi döner', async () => {
    mockFrom(supabase, {
      data: [{ category: 'A' }, { category: 'B' }, { category: 'A' }],
      error: null,
    })
    expect(await getCategories()).toEqual(['A', 'B'])
  })
})
