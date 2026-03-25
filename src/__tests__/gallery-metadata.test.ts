// Mock all framework dependencies
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/lib/queries/gallery', () => ({
  getProducts: jest.fn().mockResolvedValue([]),
  getCategories: jest.fn().mockResolvedValue([]),
}))

jest.mock('@/components/gallery/category-filter', () => ({
  default: jest.fn(),
}))

jest.mock('@/components/gallery/artwork-grid', () => ({
  default: jest.fn(),
}))

import { getTranslations } from 'next-intl/server'
import { generateMetadata } from '../app/(main)/[locale]/galeri/page'

describe('Gallery page generateMetadata', () => {
  it('returns locale-aware title and description for TR', async () => {
    const mockT = (key: string) => `tr:${key}`
    ;(getTranslations as jest.Mock).mockResolvedValue(mockT)

    const result = await generateMetadata({
      params: Promise.resolve({ locale: 'tr' }),
    })

    expect(result.title).toBeDefined()
    expect(result.description).toBeDefined()
    expect(typeof result.title).toBe('string')
    expect(typeof result.description).toBe('string')
  })

  it('calls getTranslations with meta namespace', async () => {
    const mockT = (key: string) => `en:${key}`
    ;(getTranslations as jest.Mock).mockResolvedValue(mockT)

    await generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    })

    expect(getTranslations).toHaveBeenCalledWith({
      locale: 'en',
      namespace: 'meta',
    })
  })

  it('returns title from galleryTitle key and description from galleryDesc key', async () => {
    const mockT = (key: string) => `mocked:${key}`
    ;(getTranslations as jest.Mock).mockResolvedValue(mockT)

    const result = await generateMetadata({
      params: Promise.resolve({ locale: 'tr' }),
    })

    expect(result.title).toBe('mocked:galleryTitle')
    expect(result.description).toBe('mocked:galleryDesc')
  })
})
