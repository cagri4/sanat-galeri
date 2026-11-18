import { collectionLabel } from '@/lib/categories'

describe('collectionLabel', () => {
  it('TR aynen', () => {
    expect(collectionLabel('Zamansız Manzaralar', 'tr')).toBe('Zamansız Manzaralar')
    expect(collectionLabel('Masalın Hafızası — Anka Serisi', 'tr')).toBe('Masalın Hafızası — Anka Serisi')
  })
  it('EN: menüdeki ad', () => {
    expect(collectionLabel('Zamansız Manzaralar', 'en')).toBe('Timeless Landscapes')
  })
  it('EN: seri adı özel ad, yalnız "Serisi" eki çevrilir', () => {
    expect(collectionLabel('Masalın Hafızası', 'en')).toBe('Masalın Hafızası')
    expect(collectionLabel('Anadolu Ekininde Güzeller', 'en')).toBe('Anadolu Ekininde Güzeller')
    expect(collectionLabel('Masalın Hafızası — Şahmaran Serisi', 'en')).toBe('Masalın Hafızası — Şahmaran Series')
  })
  it('boş', () => {
    expect(collectionLabel(null, 'en')).toBeNull()
    expect(collectionLabel('', 'en')).toBeNull()
  })
})
