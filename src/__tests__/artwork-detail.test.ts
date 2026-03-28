/**
 * Wave 0 contract test for artwork detail page.
 * Tests that getProductBySlug returns data matching the expected shape
 * for the detail page to render (title, medium, dimensions, year, price, images, artist).
 *
 * This is a contract test — actual rendering is verified visually in Plan 03.
 */

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      products: {
        findFirst: jest.fn(),
      },
    },
  },
}))

import { db } from '@/lib/db'
import { getProductBySlug } from '@/lib/queries/gallery'

const mockFindFirst = db.query.products.findFirst as jest.Mock

const sampleProduct = {
  id: 1,
  slug: 'mavi-akin',
  titleTr: 'Mavi Akın',
  titleEn: 'Blue Flow',
  category: 'Tablo',
  year: 2023,
  mediumTr: 'Tuval üzerine yağlıboya',
  mediumEn: 'Oil on canvas',
  dimensionsTr: '100x80 cm',
  dimensionsEn: '100x80 cm',
  price: '4500.00',
  currency: 'TRY',
  isSold: false,
  isVisible: true,
  descriptionTr: 'Mavi tonlarda bir akar eser.',
  descriptionEn: 'A flowing artwork in blue tones.',
  artistId: 1,
  createdAt: new Date(),
  images: [
    {
      id: 1,
      productId: 1,
      url: 'https://placehold.co/800x600.webp',
      altTr: 'Mavi Akın - Ana Görsel',
      altEn: 'Blue Flow - Main Image',
      sortOrder: 0,
    },
  ],
  artist: {
    id: 1,
    slug: 'melike',
    nameTr: 'Melike Doğan',
    nameEn: 'Melike Dogan',
    whatsapp: '905551234567',
  },
}

describe('Artwork detail page (contract)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindFirst.mockResolvedValue(sampleProduct)
  })

  it('getProductBySlug returns product with all required fields', async () => {
    const product = await getProductBySlug('mavi-akin')
    expect(product).not.toBeNull()
    expect(product).toBeDefined()
  })

  it('product has titleTr and titleEn fields', async () => {
    const product = await getProductBySlug('mavi-akin')
    expect(product).toHaveProperty('titleTr')
    expect(product).toHaveProperty('titleEn')
  })

  it('product has year, mediumTr, mediumEn fields', async () => {
    const product = await getProductBySlug('mavi-akin')
    expect(product).toHaveProperty('year', 2023)
    expect(product).toHaveProperty('mediumTr', 'Tuval üzerine yağlıboya')
    expect(product).toHaveProperty('mediumEn', 'Oil on canvas')
  })

  it('product has dimensionsTr and dimensionsEn fields', async () => {
    const product = await getProductBySlug('mavi-akin')
    expect(product).toHaveProperty('dimensionsTr', '100x80 cm')
    expect(product).toHaveProperty('dimensionsEn', '100x80 cm')
  })

  it('product has price field', async () => {
    const product = await getProductBySlug('mavi-akin')
    expect(product).toHaveProperty('price', '4500.00')
  })

  it('product has images array', async () => {
    const product = await getProductBySlug('mavi-akin')
    expect(product).toHaveProperty('images')
    expect(Array.isArray(product!.images)).toBe(true)
    expect(product!.images.length).toBeGreaterThan(0)
  })

  it('product has artist object with whatsapp field', async () => {
    const product = await getProductBySlug('mavi-akin')
    expect(product).toHaveProperty('artist')
    expect(product!.artist).toHaveProperty('whatsapp', '905551234567')
  })

  it('returns null for nonexistent product', async () => {
    mockFindFirst.mockResolvedValue(null)
    const product = await getProductBySlug('nonexistent')
    expect(product).toBeNull()
  })
})
