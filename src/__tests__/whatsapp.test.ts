/**
 * Unit tests for buildWhatsAppHref utility.
 * Tests URL construction, phone number normalization, and text encoding.
 */

import { buildWhatsAppHref } from '@/lib/utils/whatsapp'

describe('buildWhatsAppHref()', () => {
  it('strips non-digits from phone number with +90 prefix and spaces', () => {
    const href = buildWhatsAppHref('+90 555 123 45 67', 'Mavi Akın', 'https://example.com/urun/mavi-akin')
    expect(href).toContain('wa.me/905551234567')
  })

  it('strips non-digits from phone with dashes', () => {
    const href = buildWhatsAppHref('90-555-987-65-43', 'Eser', 'https://example.com/urun/eser')
    expect(href).toContain('wa.me/905559876543')
  })

  it('works with already clean number (digits only)', () => {
    const href = buildWhatsAppHref('905551234567', 'Tablo', 'https://example.com/urun/tablo')
    expect(href).toContain('wa.me/905551234567')
  })

  it('uses wa.me domain', () => {
    const href = buildWhatsAppHref('905551234567', 'Eser', 'https://example.com')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })

  it('URL-encodes the text parameter', () => {
    const href = buildWhatsAppHref('905551234567', 'Mavi Akın', 'https://example.com/urun/mavi-akin')
    // Should contain ?text= with encoded content
    expect(href).toContain('?text=')
    // URL should not contain raw spaces or quotes
    const textPart = href.split('?text=')[1]
    expect(textPart).not.toContain(' ')
    expect(textPart).not.toContain('"')
  })

  it('includes the artwork title in the text', () => {
    const href = buildWhatsAppHref('905551234567', 'Mavi Akın', 'https://example.com/urun/mavi-akin')
    const decoded = decodeURIComponent(href.split('?text=')[1])
    expect(decoded).toContain('Mavi Akın')
  })

  it('includes the page URL in the text', () => {
    const href = buildWhatsAppHref('905551234567', 'Eser', 'https://example.com/urun/eser')
    const decoded = decodeURIComponent(href.split('?text=')[1])
    expect(decoded).toContain('https://example.com/urun/eser')
  })
})
