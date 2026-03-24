/**
 * Unit tests for gallery query functions.
 * Tests getProducts(), getProductBySlug(), getCategories()
 * using mocked Drizzle db.query interface.
 */

// Mock the db module before any imports
jest.mock('@/lib/db', () => ({
  db: {
    query: {
      products: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
    selectDistinct: jest.fn(),
  },
}))

import { db } from '@/lib/db'
import { getProducts, getProductBySlug, getCategories } from '@/lib/queries/gallery'
import { products } from '@/lib/db/schema'

const mockFindMany = db.query.products.findMany as jest.Mock
const mockFindFirst = db.query.products.findFirst as jest.Mock
const mockSelectDistinct = db.selectDistinct as jest.Mock

describe('getProducts()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindMany.mockResolvedValue([])
  })

  it('calls findMany with isVisible filter when no category', async () => {
    await getProducts()
    expect(mockFindMany).toHaveBeenCalledTimes(1)
    const callArg = mockFindMany.mock.calls[0][0]
    expect(callArg).toHaveProperty('with')
    expect(callArg.with).toHaveProperty('images')
    expect(callArg).toHaveProperty('orderBy')
  })

  it('calls findMany with category filter when category is provided', async () => {
    await getProducts('Tablo')
    expect(mockFindMany).toHaveBeenCalledTimes(1)
    const callArg = mockFindMany.mock.calls[0][0]
    expect(callArg).toHaveProperty('where')
    expect(callArg).toHaveProperty('with')
  })

  it('returns the result from findMany', async () => {
    const mockData = [{ id: 1, titleTr: 'Eser 1', images: [] }]
    mockFindMany.mockResolvedValue(mockData)
    const result = await getProducts()
    expect(result).toEqual(mockData)
  })
})

describe('getProductBySlug()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindFirst.mockResolvedValue(null)
  })

  it('calls findFirst with slug and isVisible filter', async () => {
    await getProductBySlug('test-slug')
    expect(mockFindFirst).toHaveBeenCalledTimes(1)
    const callArg = mockFindFirst.mock.calls[0][0]
    expect(callArg).toHaveProperty('where')
    expect(callArg).toHaveProperty('with')
    expect(callArg.with).toHaveProperty('images')
    expect(callArg.with).toHaveProperty('artist')
  })

  it('returns the product from findFirst', async () => {
    const mockProduct = {
      id: 1,
      slug: 'test-slug',
      titleTr: 'Eser',
      images: [],
      artist: { id: 1, nameTr: 'Melike' },
    }
    mockFindFirst.mockResolvedValue(mockProduct)
    const result = await getProductBySlug('test-slug')
    expect(result).toEqual(mockProduct)
  })

  it('returns null when product not found', async () => {
    mockFindFirst.mockResolvedValue(null)
    const result = await getProductBySlug('nonexistent')
    expect(result).toBeNull()
  })
})

describe('getCategories()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls selectDistinct and returns category array', async () => {
    const mockChain = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([
        { category: 'Tablo' },
        { category: 'Seramik' },
      ]),
    }
    mockSelectDistinct.mockReturnValue(mockChain)

    const result = await getCategories()
    expect(mockSelectDistinct).toHaveBeenCalledTimes(1)
    expect(result).toEqual(['Tablo', 'Seramik'])
  })
})
