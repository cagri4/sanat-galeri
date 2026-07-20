/**
 * Admin eser server-action'ları: createProduct, updateProduct, deleteProduct,
 * updateHomepageSlots.
 *
 * Yetki kontrolü, Türkçe slug üretimi, boş alanların NULL'a çevrilmesi ve
 * doğru tabloya yazma doğrulanır.
 *
 * Eski hali drizzle mock'luyordu. Yazma işlemleri 2026-07-20'de Supabase
 * REST'e taşındı: DATABASE_URL doğrudan (IPv6-only) bağlantıyı gösteriyor ve
 * Vercel oradan erişemiyordu, panelde her "Kaydet" 500 dönüyordu.
 */

jest.mock('@/lib/db/supabase', () => ({ supabase: { from: jest.fn() } }))
jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { mockFrom } from './helpers/supabase-mock'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateHomepageSlots,
} from '@/lib/actions/product'

const mockAuth = auth as unknown as jest.Mock
const VALID = { titleTr: 'Çan Krater', titleEn: 'Bell Krater', category: 'Antik Dönem Replikaları' }

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'Admin' } })
})

describe('yetki kontrolü', () => {
  beforeEach(() => mockAuth.mockResolvedValue(null))

  it('createProduct oturumsuz reddeder', async () => {
    expect(await createProduct(VALID)).toEqual({ success: false, error: 'Unauthorized' })
  })
  it('updateProduct oturumsuz reddeder', async () => {
    expect(await updateProduct(1, VALID)).toEqual({ success: false, error: 'Unauthorized' })
  })
  it('deleteProduct oturumsuz reddeder', async () => {
    expect(await deleteProduct(1)).toEqual({ success: false, error: 'Unauthorized' })
  })
  it('updateHomepageSlots oturumsuz reddeder', async () => {
    expect(await updateHomepageSlots([])).toEqual({ success: false, error: 'Unauthorized' })
  })
})

describe('createProduct()', () => {
  it('products tablosuna ekler ve yeni id döner', async () => {
    // 1. sorgu: slug çakışma kontrolü, 2. sorgu: insert
    const { builder, lastTable } = mockFrom(supabase, [
      { data: [], error: null },
      { data: { id: 42 }, error: null },
    ])
    const res = await createProduct(VALID)

    expect(lastTable()).toBe('products')
    expect(builder.insert).toHaveBeenCalled()
    expect(res).toEqual({ success: true, id: 42 })
  })

  it('Türkçe harfleri koruyarak slug üretir', async () => {
    // Eski üretici [^a-z0-9-] ile siliyordu: "Çan Krater" -> "an-krater"
    const { builder } = mockFrom(supabase, [
      { data: [], error: null },
      { data: { id: 1 }, error: null },
    ])
    await createProduct(VALID)

    const row = builder.argsOf('insert')?.[0] as Record<string, unknown>
    expect(row.slug).toBe('can-krater')
  })

  it('slug çakışırsa sonuna sayı ekler', async () => {
    const { builder } = mockFrom(supabase, [
      { data: [{ id: 7, slug: 'can-krater' }], error: null },
      { data: { id: 8 }, error: null },
    ])
    await createProduct(VALID)
    const row = builder.argsOf('insert')?.[0] as Record<string, unknown>
    expect(row.slug).toBe('can-krater-2')
  })

  it('zorunlu alan eksikse doğrulama hatası döner', async () => {
    mockFrom(supabase, [{ data: [], error: null }])
    const res = await createProduct({ titleTr: '', titleEn: '', category: '' })
    expect(res.success).toBe(false)
    expect(res.errors).toBeDefined()
  })

  it('boş metin alanlarını NULL yazar (sitede gizlensin diye)', async () => {
    const { builder } = mockFrom(supabase, [
      { data: [], error: null },
      { data: { id: 1 }, error: null },
    ])
    await createProduct({ ...VALID, formTr: '   ', subjectTr: 'Afrodit' })

    const row = builder.argsOf('insert')?.[0] as Record<string, unknown>
    expect(row.form_tr).toBeNull()
    expect(row.subject_tr).toBe('Afrodit')
  })

  it('DB hatasında success:false döner', async () => {
    mockFrom(supabase, [
      { data: [], error: null },
      { data: null, error: { message: 'db patladı' } },
    ])
    const res = await createProduct(VALID)
    expect(res.success).toBe(false)
    expect(res.error).toBe('db patladı')
  })
})

describe('updateProduct()', () => {
  it('doğru id ile günceller ve katalog alanlarını taşır', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: null, error: null })
    await updateProduct(9, {
      ...VALID,
      formTr: 'Kylix',
      periodTr: 'MÖ 5. yüzyıl',
      subjectTr: 'Afrodit',
      aboutTr: 'Replika hakkında',
      collection: 'Zamansız Manzaralar',
      artistId: 2,
      sortOrder: 3,
      isVisible: false,
    })

    expect(lastTable()).toBe('products')
    expect(builder.argsOf('eq')).toEqual(['id', 9])
    const row = builder.argsOf('update')?.[0] as Record<string, unknown>
    expect(row.form_tr).toBe('Kylix')
    expect(row.period_tr).toBe('MÖ 5. yüzyıl')
    expect(row.subject_tr).toBe('Afrodit')
    expect(row.about_tr).toBe('Replika hakkında')
    expect(row.collection).toBe('Zamansız Manzaralar')
    expect(row.artist_id).toBe(2)
    expect(row.sort_order).toBe(3)
    expect(row.is_visible).toBe(false)
  })

  it('slug güncellemede değişmez (bağlantılar kırılmasın)', async () => {
    const { builder } = mockFrom(supabase, { data: null, error: null })
    await updateProduct(9, VALID)
    const row = builder.argsOf('update')?.[0] as Record<string, unknown>
    expect(row).not.toHaveProperty('slug')
  })
})

describe('deleteProduct()', () => {
  it('doğru id ile siler', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: null, error: null })
    const res = await deleteProduct(5)

    expect(lastTable()).toBe('products')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.argsOf('eq')).toEqual(['id', 5])
    expect(res).toEqual({ success: true })
  })
})

describe('updateHomepageSlots()', () => {
  it('hero ve instagram sırasını yazar; NULL bölümden çıkarır', async () => {
    const { builder } = mockFrom(supabase, { data: null, error: null })
    await updateHomepageSlots([{ id: 3, heroOrder: 0, instagramOrder: null }])

    const row = builder.argsOf('update')?.[0] as Record<string, unknown>
    expect(row).toEqual({ hero_order: 0, instagram_order: null })
    expect(builder.argsOf('eq')).toEqual(['id', 3])
  })
})
