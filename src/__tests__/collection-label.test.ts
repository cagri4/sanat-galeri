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

import { collectionAbout } from '@/lib/categories'

describe('collectionAbout', () => {
  it('Zamansız Manzaralar TR/EN, "yok" satırları alt alta', () => {
    const tr = collectionAbout('Zamansız Manzaralar', 'tr')!
    expect(tr).toContain('Perspektif yok,\nsabit zaman yok,\ntek bakış noktası yok,\nnet sınırlar yok.')
    expect(tr.replace(/\s+/g, ' ')).toBe('Doğayı temsil etmekten çok, doğanın maddesel hafızasını ve insanda bıraktığı şiirsel etkileri araştırıyorum. Perspektif yok, sabit zaman yok, tek bakış noktası yok, net sınırlar yok. Bu yüzden bir zamana ait değiller; gelip geçen bir an, hafızanın izleri.')
    expect(collectionAbout('Zamansız Manzaralar', 'en')!.replace(/\s+/g, ' ')).toBe('Rather than representing nature, I explore its material memory and the poetic traces it leaves in us. No perspective, no fixed time, no single point of view, no clear borders. That is why they belong to no time: a passing moment, traces of memory.')
  })
  it('açıklaması olmayan koleksiyon', () => {
    expect(collectionAbout('Masalın Hafızası', 'tr')).toBeNull()
    expect(collectionAbout(null, 'en')).toBeNull()
  })
})
