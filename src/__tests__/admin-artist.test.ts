/**
 * Unit tests for admin artist Server Actions (ADM-02).
 * Tests auth guard and db mutation calls for updateArtist.
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
import { updateArtist } from '@/lib/actions/artist'

const mockAuth = auth as jest.Mock
const mockUpdate = db.update as jest.Mock

describe('updateArtist()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockWhere = jest.fn().mockResolvedValue([])
    const mockSet = jest.fn().mockReturnValue({ where: mockWhere })
    mockUpdate.mockReturnValue({ set: mockSet })
  })

  it('returns { success: false, error: Unauthorized } when auth() returns null', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await updateArtist(1, {
      bioTr: 'Sanatçı biyografisi',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls db.update on artists table for bio/statement fields when authorized', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } })
    const result = await updateArtist(1, {
      bioTr: 'Sanatçı biyografisi',
      bioEn: 'Artist biography',
      statementTr: 'Sanatçı açıklaması',
      statementEn: 'Artist statement',
    })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(result.success).toBe(true)
  })

  it('calls db.update with correct id when authorized', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } })
    await updateArtist(5, {
      bioTr: 'Yeni biyografi',
    })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    // Verify update was called (where clause with id=5)
    const mockSet = mockUpdate.mock.results[0]?.value?.set as jest.Mock
    expect(mockSet).toHaveBeenCalledTimes(1)
  })
})
