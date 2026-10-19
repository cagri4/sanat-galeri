import { alternatesFor } from '@/lib/seo'

describe('alternatesFor', () => {
  it('TR sayfası: kanonik kendisi, EN alternatifi, x-default TR', () => {
    expect(alternatesFor('/tr/urun/anka-v-yeniden-varolus')).toEqual({
      canonical: '/tr/urun/anka-v-yeniden-varolus',
      languages: { tr: '/tr/urun/anka-v-yeniden-varolus', en: '/en/urun/anka-v-yeniden-varolus', 'x-default': '/tr/urun/anka-v-yeniden-varolus' },
    })
  })
  it('kök locale ve sondaki eğik çizgi', () => {
    expect(alternatesFor('/en/')?.canonical).toBe('/en')
    expect(alternatesFor('/en')?.languages).toEqual({ tr: '/tr', en: '/en', 'x-default': '/tr' })
  })
  it('locale\'siz ya da boş yol → null', () => {
    expect(alternatesFor('/admin')).toBeNull()
    expect(alternatesFor(null)).toBeNull()
    expect(alternatesFor('/trx')).toBeNull()
  })
})
