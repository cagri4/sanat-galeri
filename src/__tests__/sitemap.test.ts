import { sitemapEntries } from '@/lib/sitemap'

describe('sitemapEntries — her site kendi sayfaları', () => {
  const galeri = sitemapEntries('galeri', 'https://galeri.test/', {
    productSlugs: ['afrodit-ve-kaz'],
    categories: ['Resimli Seramikler', 'Seramik Heykeller', 'Antik Dönem Replikaları'],
  })
  const kurumsal = sitemapEntries('kurumsal', 'https://kurumsal.test', {
    productSlugs: ['gonul-gozu'],
    categories: [],
  })
  const urls = (e: typeof galeri) => e.map((x) => x.url)

  it('galeri: koleksiyonlar, eserler, sergiler; kaldırılanlar yok', () => {
    expect(urls(galeri)).toContain('https://galeri.test/tr/koleksiyonlar/resimli-seramikler')
    expect(urls(galeri)).toContain('https://galeri.test/en/urun/afrodit-ve-kaz')
    expect(urls(galeri)).toContain('https://galeri.test/tr/sergiler')
    expect(urls(galeri).some((u) => /ozel-siparis|surec|teknik|kurumsal|projeler/.test(u))).toBe(false)
  })
  it('kurumsal: /kurumsal öneki yok, projeler var, galeri sayfası yok', () => {
    expect(urls(kurumsal)).toContain('https://kurumsal.test/tr/projeler/gonul-gozu')
    expect(urls(kurumsal)).toContain('https://kurumsal.test/en')
    expect(urls(kurumsal).some((u) => /\/kurumsal\/|surec|galeri|urun/.test(u.replace('https://kurumsal.test', '')))).toBe(false)
  })
  it('her adreste TR/EN alternates', () => {
    const e = kurumsal.find((x) => x.url === 'https://kurumsal.test/tr/projeler')!
    expect(e.alternates?.languages).toEqual({
      tr: 'https://kurumsal.test/tr/projeler',
      en: 'https://kurumsal.test/en/projeler',
    })
  })
})
