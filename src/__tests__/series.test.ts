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
