/**
 * Unit tests for admin message Server Actions (ADM-03).
 * Tests auth guard, markMessageRead, and parseProductContext utility.
 */

// Mock the db module before any imports
jest.mock('@/lib/db', () => {
  const mockWhere = jest.fn().mockResolvedValue([])
  const mockSet = jest.fn().mockReturnValue({ where: mockWhere })
  const mockUpdate = jest.fn().mockReturnValue({ set: mockSet })
  return {
    db: {
      update: mockUpdate,
    },
    _mockUpdate: mockUpdate,
    _mockSet: mockSet,
    _mockWhere: mockWhere,
  }
})

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { markMessageRead } from '@/lib/actions/message'
import { parseProductContext } from '@/lib/utils/message-utils'

const mockAuth = auth as jest.Mock
const mockUpdate = db.update as jest.Mock

describe('markMessageRead()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockWhere = jest.fn().mockResolvedValue([])
    const mockSet = jest.fn().mockReturnValue({ where: mockWhere })
    mockUpdate.mockReturnValue({ set: mockSet })
  })

  it('returns { success: false, error: Unauthorized } when auth() returns null', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await markMessageRead(1)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls db.update setting isRead=true when authorized', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } })
    const result = await markMessageRead(1)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    const mockSet = mockUpdate.mock.results[0]?.value?.set as jest.Mock
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ isRead: true }))
    expect(result.success).toBe(true)
  })
})

describe('parseProductContext()', () => {
  it('extracts slug from body prefix and returns clean body', () => {
    const result = parseProductContext('[Eser: mavi-akin]\n\nMesaj')
    expect(result.productSlug).toBe('mavi-akin')
    expect(result.cleanBody).toBe('Mesaj')
  })

  it('returns { productSlug: null, cleanBody } for normal message without prefix', () => {
    const result = parseProductContext('Normal mesaj')
    expect(result.productSlug).toBeNull()
    expect(result.cleanBody).toBe('Normal mesaj')
  })

  it('handles multi-line body correctly after prefix', () => {
    const result = parseProductContext('[Eser: guzel-tablo]\n\nBu eser hakkında bilgi almak istiyorum.\nFiyat nedir?')
    expect(result.productSlug).toBe('guzel-tablo')
    expect(result.cleanBody).toBe('Bu eser hakkında bilgi almak istiyorum.\nFiyat nedir?')
  })
})
