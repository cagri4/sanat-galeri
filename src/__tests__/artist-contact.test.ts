/**
 * Unit tests for submitArtistContact Server Action.
 * Tests artist slug lookup, db.insert call, and validation.
 */

// Mock the db module before any imports
jest.mock('@/lib/db', () => {
  const mockValues = jest.fn().mockResolvedValue([])
  const mockInsert = jest.fn().mockReturnValue({ values: mockValues })
  const mockFindFirst = jest.fn()

  return {
    db: {
      insert: mockInsert,
      query: {
        artists: {
          findFirst: mockFindFirst,
        },
      },
    },
    _mockValues: mockValues,
    _mockInsert: mockInsert,
    _mockFindFirst: mockFindFirst,
  }
})

import { db } from '@/lib/db'
import { submitArtistContact, artistContactSchema } from '@/lib/actions/contact'

const mockInsert = db.insert as jest.Mock
const mockFindFirst = db.query.artists.findFirst as jest.Mock
const getMockValues = () => (mockInsert.mock.results[0]?.value?.values as jest.Mock)

describe('artistContactSchema', () => {
  it('validates correctly with all required fields', () => {
    const result = artistContactSchema.safeParse({
      senderName: 'Ali Veli',
      senderEmail: 'ali@test.com',
      body: 'Sergi hakkında bilgi almak istiyorum.',
      artistSlug: 'melike',
    })
    expect(result.success).toBe(true)
  })

  it('fails when artistSlug is missing', () => {
    const result = artistContactSchema.safeParse({
      senderName: 'Ali Veli',
      senderEmail: 'ali@test.com',
      body: 'Sergi hakkında bilgi almak istiyorum.',
    })
    expect(result.success).toBe(false)
  })
})

describe('submitArtistContact()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockValues = jest.fn().mockResolvedValue([])
    mockInsert.mockReturnValue({ values: mockValues })
    mockFindFirst.mockResolvedValue(null)
  })

  describe('validation failures', () => {
    it('returns { success: false } when senderName is too short', async () => {
      const result = await submitArtistContact({
        senderName: 'A',
        senderEmail: 'test@example.com',
        body: 'Sergi hakkında bilgi almak istiyorum, detayları öğrenmek istiyorum.',
        artistSlug: 'melike',
      })
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('returns { success: false } when senderEmail is invalid', async () => {
      const result = await submitArtistContact({
        senderName: 'Ali Veli',
        senderEmail: 'not-an-email',
        body: 'Sergi hakkında bilgi almak istiyorum, detayları öğrenmek istiyorum.',
        artistSlug: 'melike',
      })
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('returns { success: false } when body is too short', async () => {
      const result = await submitArtistContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Kisa',
        artistSlug: 'melike',
      })
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('does not call db.insert on validation failure', async () => {
      await submitArtistContact({
        senderName: 'A',
        senderEmail: 'bad',
        body: 'x',
        artistSlug: 'melike',
      })
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('invalid artist slug', () => {
    it('returns { success: false } when artist not found', async () => {
      mockFindFirst.mockResolvedValue(undefined)
      const result = await submitArtistContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Sergi hakkında bilgi almak istiyorum, detayları öğrenmek istiyorum.',
        artistSlug: 'nonexistent-artist',
      })
      expect(result.success).toBe(false)
    })

    it('does not call db.insert when artist not found', async () => {
      mockFindFirst.mockResolvedValue(undefined)
      await submitArtistContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Sergi hakkında bilgi almak istiyorum, detayları öğrenmek istiyorum.',
        artistSlug: 'nonexistent-artist',
      })
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('success path', () => {
    it('returns { success: true } with valid data and valid artist', async () => {
      mockFindFirst.mockResolvedValue({ id: 1, slug: 'melike' })
      const result = await submitArtistContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Sergi hakkında bilgi almak istiyorum, detayları öğrenmek istiyorum.',
        artistSlug: 'melike',
      })
      expect(result.success).toBe(true)
    })

    it('calls db.insert with correct artistId', async () => {
      mockFindFirst.mockResolvedValue({ id: 42, slug: 'melike' })
      await submitArtistContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Sergi hakkında bilgi almak istiyorum, detayları öğrenmek istiyorum.',
        artistSlug: 'melike',
      })
      expect(mockInsert).toHaveBeenCalledTimes(1)
      const mockValues = getMockValues()
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          artistId: 42,
          senderName: 'Ali Veli',
          senderEmail: 'ali@test.com',
        })
      )
    })

    it('looks up artist by slug before inserting', async () => {
      mockFindFirst.mockResolvedValue({ id: 7, slug: 'seref' })
      await submitArtistContact({
        senderName: 'Ayse Hanım',
        senderEmail: 'ayse@test.com',
        body: 'Seramik eserlerinizi merak ediyorum, bilgi verir misiniz lütfen.',
        artistSlug: 'seref',
      })
      expect(mockFindFirst).toHaveBeenCalledTimes(1)
      const callArg = mockFindFirst.mock.calls[0][0]
      expect(callArg).toHaveProperty('where')
    })
  })
})
