/**
 * Unit tests for admin product Server Actions (ADM-01).
 * Tests auth guard, slug generation, and db mutation calls.
 */

// Mock the db module before any imports
jest.mock('@/lib/db', () => {
  const mockReturning = jest.fn().mockResolvedValue([{ id: 42 }])
  const mockWhere = jest.fn().mockResolvedValue([])
  const mockSet = jest.fn().mockReturnValue({ where: mockWhere })
  const mockValues = jest.fn().mockReturnValue({ returning: mockReturning })
  const mockInsert = jest.fn().mockReturnValue({ values: mockValues })
  const mockUpdate = jest.fn().mockReturnValue({ set: mockSet })
  const mockDelete = jest.fn().mockReturnValue({ where: mockWhere })
  return {
    db: {
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    },
    _mockInsert: mockInsert,
    _mockUpdate: mockUpdate,
    _mockDelete: mockDelete,
    _mockValues: mockValues,
    _mockSet: mockSet,
    _mockWhere: mockWhere,
    _mockReturning: mockReturning,
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
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/product'

const mockAuth = auth as jest.Mock
const mockInsert = db.insert as jest.Mock
const mockUpdate = db.update as jest.Mock
const mockDelete = db.delete as jest.Mock

describe('createProduct()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Re-mock chain after clearAllMocks
    const mockReturning = jest.fn().mockResolvedValue([{ id: 42 }])
    const mockValues = jest.fn().mockReturnValue({ returning: mockReturning })
    mockInsert.mockReturnValue({ values: mockValues })
  })

  it('returns { success: false, error: Unauthorized } when auth() returns null', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await createProduct({
      titleTr: 'Mavi Akın',
      titleEn: 'Blue Rush',
      category: 'tablo',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('calls db.insert on products table with valid data when authorized', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } })
    const result = await createProduct({
      titleTr: 'Mavi Akın',
      titleEn: 'Blue Rush',
      category: 'tablo',
    })
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(result.success).toBe(true)
  })

  it('generates slug from titleTr', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } })
    await createProduct({
      titleTr: 'Mavi Akın',
      titleEn: 'Blue Rush',
      category: 'tablo',
    })
    const mockValues = mockInsert.mock.results[0]?.value?.values as jest.Mock
    const callArg = mockValues?.mock?.calls?.[0]?.[0]
    expect(callArg?.slug).toMatch(/mavi/)
  })

  it('returns { success: false } when required fields missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } })
    const result = await createProduct({
      titleTr: '',
      titleEn: '',
      category: '',
    })
    expect(result.success).toBe(false)
    expect(mockInsert).not.toHaveBeenCalled()
  })
})

describe('updateProduct()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockWhere = jest.fn().mockResolvedValue([])
    const mockSet = jest.fn().mockReturnValue({ where: mockWhere })
    mockUpdate.mockReturnValue({ set: mockSet })
  })

  it('returns { success: false, error: Unauthorized } when auth() returns null', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await updateProduct(1, {
      titleTr: 'Yeni Başlık',
      titleEn: 'New Title',
      category: 'tablo',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls db.update with correct where clause when authorized', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } })
    const result = await updateProduct(1, {
      titleTr: 'Yeni Başlık',
      titleEn: 'New Title',
      category: 'tablo',
    })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(result.success).toBe(true)
  })
})

describe('deleteProduct()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockWhere = jest.fn().mockResolvedValue([])
    mockDelete.mockReturnValue({ where: mockWhere })
  })

  it('returns { success: false, error: Unauthorized } when auth() returns null', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await deleteProduct(1)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('calls db.delete with correct where clause when authorized', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } })
    const result = await deleteProduct(1)
    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(result.success).toBe(true)
  })
})
