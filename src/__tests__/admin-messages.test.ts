/**
 * Admin mesaj server-action'ları: markMessageRead, deleteMessage.
 * Ayrıca mesaj gövdesindeki eser bağlamının ayrıştırılması.
 *
 * Eski hali drizzle mock'luyordu; yazma işlemleri 2026-07-20'de Supabase
 * REST'e taşındı — o tarihe kadar "Okundu" işaretleme canlıda çalışmıyordu.
 */

jest.mock('@/lib/db/supabase', () => ({ supabase: { from: jest.fn() } }))
jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import { supabase } from '@/lib/db/supabase'
import { auth } from '@/auth'
import { mockFrom } from './helpers/supabase-mock'
import { markMessageRead, deleteMessage } from '@/lib/actions/message'
import { parseProductContext } from '@/lib/utils/message-utils'

const mockAuth = auth as unknown as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'Admin' } })
})

describe('markMessageRead()', () => {
  it('oturum yoksa reddeder ve hiçbir şey yazmaz', async () => {
    mockAuth.mockResolvedValue(null)
    const { from } = mockFrom(supabase, { data: null, error: null })
    const res = await markMessageRead(1)

    expect(res).toEqual({ success: false, error: 'Unauthorized' })
    expect(from).not.toHaveBeenCalled()
  })

  it('is_read=true olarak günceller', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: null, error: null })
    const res = await markMessageRead(7)

    expect(lastTable()).toBe('messages')
    expect(builder.argsOf('update')?.[0]).toEqual({ is_read: true })
    expect(builder.argsOf('eq')).toEqual(['id', 7])
    expect(res.success).toBe(true)
  })

  it('DB hatasında success:false döner', async () => {
    mockFrom(supabase, { data: null, error: { message: 'patladı' } })
    expect(await markMessageRead(1)).toEqual({ success: false, error: 'patladı' })
  })
})

describe('deleteMessage()', () => {
  it('oturum yoksa reddeder', async () => {
    mockAuth.mockResolvedValue(null)
    expect(await deleteMessage(1)).toEqual({ success: false, error: 'Unauthorized' })
  })

  it('doğru id ile siler', async () => {
    const { builder, lastTable } = mockFrom(supabase, { data: null, error: null })
    const res = await deleteMessage(3)

    expect(lastTable()).toBe('messages')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.argsOf('eq')).toEqual(['id', 3])
    expect(res.success).toBe(true)
  })
})

describe('parseProductContext()', () => {
  it('gövde önekinden eser slug’ını çıkarır', () => {
    const r = parseProductContext('[Eser: mavi-akin]\n\nMesaj')
    expect(r.productSlug).toBe('mavi-akin')
    expect(r.cleanBody).toBe('Mesaj')
  })

  it('önek yoksa slug null döner', () => {
    const r = parseProductContext('Normal mesaj')
    expect(r.productSlug).toBeNull()
    expect(r.cleanBody).toBe('Normal mesaj')
  })

  it('çok satırlı gövdeyi korur', () => {
    const r = parseProductContext('[Eser: guzel-tablo]\n\nBu eser hakkında bilgi almak istiyorum.\nFiyat nedir?')
    expect(r.productSlug).toBe('guzel-tablo')
    expect(r.cleanBody).toBe('Bu eser hakkında bilgi almak istiyorum.\nFiyat nedir?')
  })
})
