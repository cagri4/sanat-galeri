/**
 * Admin sanatçı server-action'ı: updateArtist.
 *
 * Yetki kontrolü, biyografi/beyan alanlarının yazılması ve WhatsApp alanının
 * KALDIRILMIŞ olduğu doğrulanır.
 *
 * Eski hali drizzle mock'luyordu; yazma işlemleri 2026-07-20'de Supabase
 * REST'e taşındı (bkz. actions/product.ts baş notu).
 */

jest.mock('@/lib/db/supabase', () => ({ supabase: { from: jest.fn() } }))
jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { mockFrom } from './helpers/supabase-mock'
import { updateArtist } from '@/lib/actions/artist'

const mockAuth = auth as unknown as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'Admin' } })
})

describe('updateArtist()', () => {
  it('oturum yoksa reddeder', async () => {
    mockAuth.mockResolvedValue(null)
    expect(await updateArtist(1, { bioTr: 'x' })).toEqual({
      success: false,
      error: 'Unauthorized',
    })
  })

  it('artists tablosuna doğru id ile yazar', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: null, error: null })
    const res = await updateArtist(5, { bioTr: 'Yeni biyografi' })

    expect(lastTable()).toBe('artists')
    expect(builder.update).toHaveBeenCalled()
    expect(builder.argsOf('eq')).toEqual(['id', 5])
    expect(res.success).toBe(true)
  })

  it('biyografi ve beyanı iki dilde kaydeder', async () => {
    const { builder } = mockFrom(supabase, { data: null, error: null })
    await updateArtist(1, {
      bioTr: 'Biyografi',
      bioEn: 'Biography',
      statementTr: 'Beyan',
      statementEn: 'Statement',
      email: 'melike@uarttasarim.com',
    })

    const row = builder.argsOf('update')?.[0] as Record<string, unknown>
    expect(row.bio_tr).toBe('Biyografi')
    expect(row.bio_en).toBe('Biography')
    expect(row.statement_tr).toBe('Beyan')
    expect(row.statement_en).toBe('Statement')
    expect(row.email).toBe('melike@uarttasarim.com')
  })

  it('WhatsApp numarası YAZMAZ (kişisel numara siteden kaldırıldı)', async () => {
    const { builder } = mockFrom(supabase, { data: null, error: null })
    await updateArtist(1, { bioTr: 'x', whatsapp: '+90 555 000 00 00' } as never)

    const row = builder.argsOf('update')?.[0] as Record<string, unknown>
    expect(row).not.toHaveProperty('whatsapp')
  })

  it('boşaltılan alanı NULL yazar (sitede gizlensin)', async () => {
    const { builder } = mockFrom(supabase, { data: null, error: null })
    await updateArtist(1, { bioTr: '   ', photoUrl: '' })

    const row = builder.argsOf('update')?.[0] as Record<string, unknown>
    expect(row.bio_tr).toBeNull()
    expect(row.photo_url).toBeNull()
  })

  it('geçersiz e-posta için doğrulama hatası döner', async () => {
    mockFrom(supabase, { data: null, error: null })
    const res = await updateArtist(1, { email: 'gecersiz' })
    expect(res.success).toBe(false)
    expect(res.errors).toBeDefined()
  })

  it('DB hatasında success:false döner', async () => {
    mockFrom(supabase, { data: null, error: { message: 'patladı' } })
    const res = await updateArtist(1, { bioTr: 'x' })
    expect(res).toEqual({ success: false, error: 'patladı' })
  })
})
