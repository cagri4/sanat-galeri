/**
 * Unit tests for submitContact Server Action.
 * Tests input validation, db.insert call, and productSlug prefix in body.
 */

// Mock the db module before any imports
jest.mock('@/lib/db', () => {
  const mockValues = jest.fn().mockResolvedValue([])
  const mockInsert = jest.fn().mockReturnValue({ values: mockValues })
  return {
    db: {
      insert: mockInsert,
    },
    _mockValues: mockValues,
    _mockInsert: mockInsert,
  }
})

import { db } from '@/lib/db'
import { submitContact } from '@/lib/actions/contact'

// Access mock helpers
const mockInsert = db.insert as jest.Mock
const getMockValues = () => (mockInsert.mock.results[0]?.value?.values as jest.Mock)

describe('submitContact()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Re-mock after clear
    const mockValues = jest.fn().mockResolvedValue([])
    mockInsert.mockReturnValue({ values: mockValues })
  })

  describe('validation failures', () => {
    it('returns { success: false } when senderName is too short', async () => {
      const result = await submitContact({
        senderName: 'A',
        senderEmail: 'test@example.com',
        body: 'Bu bir test mesajıdır ve yeterince uzun olmalı.',
      })
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('returns { success: false } when senderEmail is invalid', async () => {
      const result = await submitContact({
        senderName: 'Ali',
        senderEmail: 'not-an-email',
        body: 'Bu bir test mesajıdır ve yeterince uzun olmalı.',
      })
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('returns { success: false } when body is too short', async () => {
      const result = await submitContact({
        senderName: 'Ali',
        senderEmail: 'ali@example.com',
        body: 'Kısa',
      })
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('does not call db.insert on validation failure', async () => {
      await submitContact({
        senderName: 'A',
        senderEmail: 'bad',
        body: 'x',
      })
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('success path', () => {
    it('returns { success: true } with valid data', async () => {
      const result = await submitContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Eser hakkında bilgi almak istiyorum, fiyat ve boyutlar nedir?',
      })
      expect(result.success).toBe(true)
    })

    it('calls db.insert with correct data', async () => {
      await submitContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Eser hakkında bilgi almak istiyorum, fiyat ve boyutlar nedir?',
      })
      expect(mockInsert).toHaveBeenCalledTimes(1)
      const mockValues = getMockValues()
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          senderName: 'Ali Veli',
          senderEmail: 'ali@test.com',
          artistId: null,
        })
      )
    })

    it('prefixes body with product slug when productSlug is provided', async () => {
      await submitContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Bu eser hakkında bilgi almak istiyorum.',
        productSlug: 'mavi-akin',
      })
      const mockValues = getMockValues()
      const callArg = mockValues.mock.calls[0][0]
      expect(callArg.body).toContain('[Eser: mavi-akin]')
      expect(callArg.body).toContain('Bu eser hakkında bilgi almak istiyorum.')
    })

    it('does not prefix body when no productSlug provided', async () => {
      await submitContact({
        senderName: 'Ali Veli',
        senderEmail: 'ali@test.com',
        body: 'Genel bir sorum var hakkında bilgi almak istiyorum.',
      })
      const mockValues = getMockValues()
      const callArg = mockValues.mock.calls[0][0]
      expect(callArg.body).not.toContain('[Eser:')
    })
  })
})
