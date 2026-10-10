import { kurumsalText, projectStats } from '@/lib/kurumsal'

const base = { descriptionTr: 'galeri metni', descriptionEn: 'gallery text', descriptionKurumsalTr: null, descriptionKurumsalEn: null }

describe('kurumsalText — aynı eser, iki ayrı metin (karar 2)', () => {
  it('esere özel kurumsal metin varsa o kullanılır', () => {
    expect(kurumsalText({ ...base, category: 'Seramik Heykeller', descriptionKurumsalTr: 'ölçü, malzeme' }, true)).toBe('ölçü, malzeme')
  })
  it('heykelde kurumsal metin yoksa galeri metni KULLANILMAZ', () => {
    expect(kurumsalText({ ...base, category: 'Seramik Heykeller' }, true)).toBeNull()
    expect(kurumsalText({ ...base, category: 'Seramik Heykeller' }, false)).toBeNull()
  })
  it('yalnız-kurumsal panoda tek metin kurumsal metindir', () => {
    expect(kurumsalText({ ...base, category: 'Mimari Duvar Panoları' }, false)).toBe('gallery text')
  })
})

describe('projectStats — yalnız gerçek kayıtlardan', () => {
  it('yıl aralığı ve mekân sayısı', () => {
    expect(projectStats([
      { year: 2016, collection: 'A' }, { year: 2020, collection: 'B' }, { year: null, collection: 'A' },
    ])).toEqual({ count: 3, yearRange: [2016, 2020], places: 2 })
  })
})
