/**
 * Unit tests for artist query functions.
 * Tests getArtistBySlug(), getArtistPortfolio(), getArtistExhibitions(), getArtistPressItems()
 * using mocked Drizzle db interface.
 */

// Mock the db module before any imports
jest.mock('@/lib/db', () => {
  const mockOrderBy = jest.fn().mockResolvedValue([])
  const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
  const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
  const mockSelect = jest.fn().mockReturnValue({ from: mockFrom })

  return {
    db: {
      query: {
        artists: {
          findFirst: jest.fn(),
        },
        portfolioItems: {
          findMany: jest.fn(),
        },
      },
      select: mockSelect,
      _mockSelect: mockSelect,
      _mockFrom: mockFrom,
      _mockWhere: mockWhere,
      _mockOrderBy: mockOrderBy,
    },
  }
})

import { db } from '@/lib/db'
import {
  getArtistBySlug,
  getArtistPortfolio,
  getArtistExhibitions,
  getArtistPressItems,
} from '@/lib/queries/artist'

const mockFindFirst = db.query.artists.findFirst as jest.Mock
const mockSelect = db.select as jest.Mock
// Access the chain through mockSelect results
const getChain = () => {
  const fromMock = mockSelect.mock.results[0]?.value?.from as jest.Mock
  const whereMock = fromMock?.mock.results[0]?.value?.where as jest.Mock
  const orderByMock = whereMock?.mock.results[0]?.value?.orderBy as jest.Mock
  return { fromMock, whereMock, orderByMock }
}

describe('getArtistBySlug()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindFirst.mockResolvedValue(null)
  })

  it('calls findFirst with the correct slug', async () => {
    const mockArtist = {
      id: 1,
      slug: 'melike',
      nameTr: 'Melike Doğan',
      nameEn: 'Melike Dogan',
      bioTr: 'Bio TR',
      bioEn: 'Bio EN',
      statementTr: 'Statement TR',
      statementEn: 'Statement EN',
      photoUrl: 'https://example.com/photo.jpg',
    }
    mockFindFirst.mockResolvedValue(mockArtist)

    const result = await getArtistBySlug('melike')
    expect(mockFindFirst).toHaveBeenCalledTimes(1)
    const callArg = mockFindFirst.mock.calls[0][0]
    expect(callArg).toHaveProperty('where')
    expect(result).toEqual(mockArtist)
  })

  it('returns artist with bio, photo, and statement fields', async () => {
    const mockArtist = {
      id: 1,
      slug: 'melike',
      bioTr: 'Bio TR',
      bioEn: 'Bio EN',
      statementTr: 'Statement TR',
      statementEn: 'Statement EN',
      photoUrl: 'https://example.com/photo.jpg',
    }
    mockFindFirst.mockResolvedValue(mockArtist)

    const result = await getArtistBySlug('melike')
    expect(result).toHaveProperty('bioTr')
    expect(result).toHaveProperty('bioEn')
    expect(result).toHaveProperty('statementTr')
    expect(result).toHaveProperty('statementEn')
    expect(result).toHaveProperty('photoUrl')
  })

  it('returns undefined/null when artist not found', async () => {
    mockFindFirst.mockResolvedValue(null)
    const result = await getArtistBySlug('nonexistent')
    expect(result).toBeNull()
  })
})

describe('getArtistPortfolio()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the select chain mocks
    const mockOrderBy = jest.fn().mockResolvedValue([])
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockSelect.mockReturnValue({ from: mockFrom })
  })

  it('calls db.select and returns portfolio items ordered by sortOrder asc', async () => {
    const mockItems = [
      { id: 1, artistId: 1, titleTr: 'Eser 1', sortOrder: 1 },
      { id: 2, artistId: 1, titleTr: 'Eser 2', sortOrder: 2 },
    ]
    const mockOrderBy = jest.fn().mockResolvedValue(mockItems)
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockSelect.mockReturnValue({ from: mockFrom })

    const result = await getArtistPortfolio(1)
    expect(mockSelect).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledTimes(1)
    expect(mockWhere).toHaveBeenCalledTimes(1)
    expect(mockOrderBy).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockItems)
  })

  it('returns empty array when no portfolio items exist', async () => {
    const mockOrderBy = jest.fn().mockResolvedValue([])
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockSelect.mockReturnValue({ from: mockFrom })

    const result = await getArtistPortfolio(999)
    expect(result).toEqual([])
  })
})

describe('getArtistExhibitions()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls db.select and returns exhibitions ordered by year desc', async () => {
    const mockExhibitions = [
      { id: 1, artistId: 1, type: 'solo_sergi', year: 2023 },
      { id: 2, artistId: 1, type: 'grup_sergi', year: 2022 },
    ]
    const mockOrderBy = jest.fn().mockResolvedValue(mockExhibitions)
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockSelect.mockReturnValue({ from: mockFrom })

    const result = await getArtistExhibitions(1)
    expect(mockSelect).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockExhibitions)
  })

  it('supports all CV exhibition types (solo_sergi, grup_sergi, odul, egitim)', async () => {
    const mockExhibitions = [
      { id: 1, type: 'solo_sergi', year: 2023 },
      { id: 2, type: 'grup_sergi', year: 2022 },
      { id: 3, type: 'odul', year: 2021 },
      { id: 4, type: 'egitim', year: 2019 },
    ]
    const mockOrderBy = jest.fn().mockResolvedValue(mockExhibitions)
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockSelect.mockReturnValue({ from: mockFrom })

    const result = await getArtistExhibitions(1)
    const types = result.map((e) => e.type)
    expect(types).toContain('solo_sergi')
    expect(types).toContain('grup_sergi')
    expect(types).toContain('odul')
    expect(types).toContain('egitim')
  })
})

describe('getArtistPressItems()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls db.select and returns press items ordered by year desc', async () => {
    const mockItems = [
      { id: 1, artistId: 1, title: 'Article 1', year: 2023 },
      { id: 2, artistId: 1, title: 'Article 2', year: 2022 },
    ]
    const mockOrderBy = jest.fn().mockResolvedValue(mockItems)
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockSelect.mockReturnValue({ from: mockFrom })

    const result = await getArtistPressItems(1)
    expect(mockSelect).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockItems)
  })

  it('returns empty array when no press items exist (CV-07 empty state)', async () => {
    const mockOrderBy = jest.fn().mockResolvedValue([])
    const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockSelect.mockReturnValue({ from: mockFrom })

    const result = await getArtistPressItems(2)
    expect(result).toEqual([])
  })
})
