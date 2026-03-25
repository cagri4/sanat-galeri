// Mock framework dependencies before importing the component
jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  Link: jest.fn(),
  usePathname: jest.fn(),
}))

import { getLanguageLinks } from '../components/shared/language-switcher'

describe('getLanguageLinks', () => {
  it('returns two links for tr and en', () => {
    const links = getLanguageLinks('tr', '/galeri')
    expect(links).toHaveLength(2)
    expect(links[0].locale).toBe('tr')
    expect(links[1].locale).toBe('en')
  })

  it('marks the current locale as active', () => {
    const trLinks = getLanguageLinks('tr', '/galeri')
    expect(trLinks[0].active).toBe(true)
    expect(trLinks[1].active).toBe(false)

    const enLinks = getLanguageLinks('en', '/galeri')
    expect(enLinks[0].active).toBe(false)
    expect(enLinks[1].active).toBe(true)
  })

  it('preserves the same pathname for both locale links', () => {
    const pathname = '/urun/my-artwork'
    const links = getLanguageLinks('tr', pathname)
    expect(links[0].href).toBe(pathname)
    expect(links[1].href).toBe(pathname)
  })

  it('works for root path', () => {
    const links = getLanguageLinks('en', '/')
    expect(links[0].href).toBe('/')
    expect(links[1].href).toBe('/')
    expect(links[1].active).toBe(true)
  })
})
