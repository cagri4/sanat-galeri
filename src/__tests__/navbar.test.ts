// Mock framework dependencies before importing the component
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(),
}))

jest.mock('../components/shared/language-switcher', () => ({
  default: jest.fn(),
  getLanguageLinks: jest.fn(),
}))

import { getCrossDomainLinks } from '../components/shared/navbar'

describe('getCrossDomainLinks', () => {
  const MAIN = 'https://uarttasarim.com'
  const MELIKE = 'https://melike.uarttasarim.com'
  const SEREF = 'https://seref.uarttasarim.com'

  it('includes locale segment in all links for Turkish', () => {
    const links = getCrossDomainLinks('tr', MAIN, MELIKE, SEREF)
    expect(links.main).toBe('https://uarttasarim.com/tr')
    expect(links.gallery).toBe('https://uarttasarim.com/tr/galeri')
    expect(links.melike).toBe('https://melike.uarttasarim.com/tr')
    expect(links.seref).toBe('https://seref.uarttasarim.com/tr')
  })

  it('includes locale segment in all links for English', () => {
    const links = getCrossDomainLinks('en', MAIN, MELIKE, SEREF)
    expect(links.main).toBe('https://uarttasarim.com/en')
    expect(links.gallery).toBe('https://uarttasarim.com/en/galeri')
    expect(links.melike).toBe('https://melike.uarttasarim.com/en')
    expect(links.seref).toBe('https://seref.uarttasarim.com/en')
  })

  it('uses provided URLs (not hardcoded)', () => {
    const links = getCrossDomainLinks(
      'tr',
      'http://localhost:3000',
      'http://localhost:3000?tenant=melike',
      'http://localhost:3000?tenant=seref'
    )
    expect(links.main).toBe('http://localhost:3000/tr')
    expect(links.gallery).toBe('http://localhost:3000/tr/galeri')
    // Locale segment is appended to the base URL string
    expect(links.melike).toContain('/tr')
    expect(links.seref).toContain('/tr')
  })
})
