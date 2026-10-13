import { groupBySeries, seriesName } from '@/lib/series'

describe('heykel serileri', () => {
  it('alt seri ana seriye bağlanır, Anadolu ayrı kalır', () => {
    expect(seriesName('Masalın Hafızası — Anka Serisi')).toBe('Masalın Hafızası')
    expect(seriesName('Anadolu Ekininde Güzeller')).toBe('Anadolu Ekininde Güzeller')
    expect(seriesName(null)).toBeNull()
  })
  it('gruplar sanatçının sırasını korur', () => {
    const g = groupBySeries([
      { id: 1, collection: 'Masalın Hafızası — Anka Serisi' },
      { id: 2, collection: 'Masalın Hafızası' },
      { id: 3, collection: 'Anadolu Ekininde Güzeller' },
      { id: 4, collection: 'Masalın Hafızası — Şahmaran Serisi' },
    ])
    expect(g.map((x) => [x.series, x.items.map((i) => i.id)])).toEqual([
      ['Masalın Hafızası', [1, 2, 4]],
      ['Anadolu Ekininde Güzeller', [3]],
    ])
  })
})

import { galleryCollections, itemsFor, seriesPageBySlug } from '@/lib/series'

describe('heykeller iki ayrı sayfa', () => {
  const SLUGS = { 'Resimli Seramikler': 'resimli-seramikler', 'Seramik Heykeller': 'seramik-heykeller', 'Antik Dönem Replikaları': 'antik-donem-replikalari' }
  it('heykel kategorisi yerine iki seri sayfası, sıra korunur', () => {
    expect(galleryCollections(['Resimli Seramikler', 'Seramik Heykeller', 'Antik Dönem Replikaları'], SLUGS).map((c) => c.slug)).toEqual([
      'resimli-seramikler', 'masalin-hafizasi', 'anadolu-ekininde-guzeller', 'antik-donem-replikalari',
    ])
  })
  it('seri sayfası yalnız kendi eserlerini alır (alt seriler dahil)', () => {
    const items = [
      { id: 1, category: 'Seramik Heykeller', collection: 'Masalın Hafızası — Anka Serisi' },
      { id: 2, category: 'Seramik Heykeller', collection: 'Anadolu Ekininde Güzeller' },
      { id: 3, category: 'Resimli Seramikler', collection: 'Masalın Hafızası' },
    ]
    expect(itemsFor(items, seriesPageBySlug('masalin-hafizasi')!).map((p) => p.id)).toEqual([1])
    expect(itemsFor(items, seriesPageBySlug('anadolu-ekininde-guzeller')!).map((p) => p.id)).toEqual([2])
    expect(seriesPageBySlug('seramik-heykeller')).toBeNull()
  })
})
