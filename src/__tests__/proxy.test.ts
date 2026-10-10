/**
 * İki site yönlendirmesi (KARARLAR-2026-10-10.md):
 * - ürün/kategori → site eşlemesi
 * - kurumsal alan adında rewrite, eski sanatçı alan adlarından 301, /teknik 301
 */
import { NextRequest, NextResponse } from 'next/server'

const mockIntl = jest.fn(() => NextResponse.next())
jest.mock('next-intl/middleware', () => ({ __esModule: true, default: jest.fn(() => mockIntl) }))
// next-intl ESM paketi jest'te yüklenmez; routing sabitini taklit et
jest.mock('@/lib/i18n/routing', () => ({ routing: { locales: ['tr', 'en'], defaultLocale: 'tr' } }))

const ENV = { ...process.env }
function withDomains(galeri?: string, kurumsal?: string, def?: string) {
  process.env = { ...ENV }
  if (def) process.env.UART_SITE = def
  else delete process.env.UART_SITE
  if (galeri) process.env.UART_GALERI_DOMAIN = galeri
  else delete process.env.UART_GALERI_DOMAIN
  if (kurumsal) process.env.UART_KURUMSAL_DOMAIN = kurumsal
  else delete process.env.UART_KURUMSAL_DOMAIN
}
afterAll(() => { process.env = ENV })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { decideRoute } = require('@/lib/site-routing') as typeof import('@/lib/site-routing')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const site = require('@/lib/site') as typeof import('@/lib/site')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const proxy = require('@/proxy').default as (r: NextRequest) => NextResponse

function req(url: string, host: string, cookies: Record<string, string> = {}) {
  const r = new NextRequest(url, { headers: { host } })
  for (const [k, v] of Object.entries(cookies)) r.cookies.set(k, v)
  return r
}

describe('kategori → site (ürüne göre, sanatçıya göre değil)', () => {
  it('panolar yalnız kurumsal, replika/resimli yalnız galeri', () => {
    expect(site.isOnSite('Mimari Duvar Panoları', 'kurumsal')).toBe(true)
    expect(site.isOnSite('Mimari Duvar Panoları', 'galeri')).toBe(false)
    expect(site.isOnSite('Antik Dönem Replikaları', 'kurumsal')).toBe(false)
    expect(site.isOnSite('Resimli Seramikler', 'galeri')).toBe(true)
    expect(site.isKurumsalOnly('Mimari Duvar Panoları')).toBe(true)
  })
  it('seramik heykeller İKİ sitede (karar 2)', () => {
    expect(site.isOnSite('Seramik Heykeller', 'galeri')).toBe(true)
    expect(site.isOnSite('Seramik Heykeller', 'kurumsal')).toBe(true)
    expect(site.isKurumsalOnly('Seramik Heykeller')).toBe(false)
  })
})

describe('decideRoute — alan adı yokken (önizleme)', () => {
  beforeEach(() => withDomains())
  it('her şey next-intl\'e gider, kurumsal yol bazlı açılır', () => {
    expect(decideRoute('sanat-galeri.vercel.app', '/tr')).toEqual({ type: 'intl' })
    expect(decideRoute('localhost:3000', '/tr/kurumsal/projeler')).toEqual({ type: 'intl' })
  })
  it('/teknik → antik koleksiyon sayfası (301)', () => {
    expect(decideRoute('localhost:3000', '/en/teknik')).toEqual({
      type: 'redirect',
      location: '/en/koleksiyonlar/antik-donem-replikalari#terra-sigillata',
    })
  })
  it('eski sanatçı alan adı, galeri alan adı yokken yönlendirilmez', () => {
    expect(decideRoute('melike.uarttasarim.com', '/tr')).toEqual({ type: 'intl' })
  })
})

describe('decideRoute — iki alan adı tanımlıyken', () => {
  beforeEach(() => withDomains('galeri.test', 'kurumsal.test'))
  it('kurumsal alan adında yol /kurumsal altına rewrite edilir', () => {
    expect(decideRoute('kurumsal.test', '/tr/projeler/gonul-gozu')).toEqual({
      type: 'rewrite', pathname: '/tr/kurumsal/projeler/gonul-gozu', locale: 'tr',
    })
    expect(decideRoute('www.kurumsal.test', '/en')).toEqual({
      type: 'rewrite', pathname: '/en/kurumsal', locale: 'en',
    })
  })
  it('kurumsal alan adında locale yoksa önce next-intl', () => {
    expect(decideRoute('kurumsal.test', '/')).toEqual({ type: 'intl' })
  })
  it('kurumsal alan adında /kurumsal öneki 301 ile atılır', () => {
    expect(decideRoute('kurumsal.test', '/tr/kurumsal/surec')).toEqual({
      type: 'redirect', location: '/tr/surec',
    })
  })
  it('galeri alan adında /kurumsal → kurumsal alan adı (301)', () => {
    expect(decideRoute('galeri.test', '/tr/kurumsal/projeler', '?x=1')).toEqual({
      type: 'redirect', location: 'https://kurumsal.test/tr/projeler?x=1',
    })
  })
  it('galeri alan adındaki normal sayfalar next-intl\'e', () => {
    expect(decideRoute('galeri.test', '/tr/galeri')).toEqual({ type: 'intl' })
  })
  it('melike./seref. ve eski kişisel alan adları → galeri sanatçı sayfası (301)', () => {
    expect(decideRoute('melike.uarttasarim.com', '/')).toEqual({
      type: 'redirect', location: 'https://galeri.test/tr/melike',
    })
    expect(decideRoute('seref.uarttasarim.com', '/en/sergiler')).toEqual({
      type: 'redirect', location: 'https://galeri.test/en/seref/sergiler',
    })
    expect(decideRoute('www.serefdogan.com', '/portfolyo')).toEqual({
      type: 'redirect', location: 'https://galeri.test/tr/seref/portfolyo',
    })
  })
  it('kurumsal alan adında /teknik galerideki koleksiyona gider', () => {
    expect(decideRoute('kurumsal.test', '/tr/teknik')).toEqual({
      type: 'redirect',
      location: 'https://galeri.test/tr/koleksiyonlar/antik-donem-replikalari#terra-sigillata',
    })
  })
  it('kurumsalPath / galeriPath bağlantı önekleri', () => {
    expect(site.kurumsalPath('kurumsal.test', 'tr', '/projeler')).toBe('/tr/projeler')
    expect(site.kurumsalPath('galeri.test', 'tr', '/projeler')).toBe('https://kurumsal.test/tr/projeler')
    expect(site.galeriPath('kurumsal.test', 'en', '/galeri')).toBe('https://galeri.test/en/galeri')
    expect(site.galeriPath('galeri.test', 'en', '/galeri')).toBe('/en/galeri')
  })
})

describe('decideRoute — iki ayrı Vercel projesi (UART_SITE), alan adı yok', () => {
  it('kurumsal projenin her adresi kurumsal siteyi açar', () => {
    withDomains(undefined, undefined, 'kurumsal')
    expect(decideRoute('uart-kurumsal-abc123.vercel.app', '/tr/projeler')).toEqual({
      type: 'rewrite', pathname: '/tr/kurumsal/projeler', locale: 'tr',
    })
  })
  it('galeri projesi normal next-intl akışı; /kurumsal yolu galeriye ait değil ama alan adı yoksa açık kalır', () => {
    withDomains(undefined, undefined, 'galeri')
    expect(decideRoute('uart-galeri.vercel.app', '/tr/galeri')).toEqual({ type: 'intl' })
  })
  it('alan adları env\'e girince (vercel.app adresleri dahil) çapraz bağlantı mutlak olur', () => {
    withDomains('uart-galeri.vercel.app', 'uart-kurumsal.vercel.app', 'galeri')
    expect(site.kurumsalPath('uart-galeri.vercel.app', 'tr', '/projeler'))
      .toBe('https://uart-kurumsal.vercel.app/tr/projeler')
    expect(decideRoute('uart-galeri.vercel.app', '/tr/kurumsal/surec')).toEqual({
      type: 'redirect', location: 'https://uart-kurumsal.vercel.app/tr/surec',
    })
  })
})

describe('proxy', () => {
  beforeEach(() => { withDomains('galeri.test', 'kurumsal.test'); mockIntl.mockClear() })
  it('301 durum kodu döner', () => {
    const res = proxy(req('http://localhost/tr/teknik', 'galeri.test'))
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe(
      'http://localhost/tr/koleksiyonlar/antik-donem-replikalari#terra-sigillata',
    )
  })
  it('rewrite locale başlığını taşır', () => {
    const res = proxy(req('http://kurumsal.test/en/projeler', 'kurumsal.test'))
    expect(res.headers.get('x-middleware-rewrite')).toBe('http://kurumsal.test/en/kurumsal/projeler')
    expect(res.headers.get('x-middleware-request-x-next-intl-locale')).toBe('en')
  })
  it('admin oturumsuz → login; /api dokunulmaz', () => {
    expect(proxy(req('http://localhost/admin/dashboard', 'localhost')).headers.get('location'))
      .toBe('http://localhost/admin/login')
    proxy(req('http://localhost/api/contact', 'localhost'))
    expect(mockIntl).not.toHaveBeenCalled()
  })
  it('önizleme hostunda next-intl çalışır', () => {
    proxy(req('http://localhost/tr/kurumsal', 'localhost'))
    expect(mockIntl).toHaveBeenCalledTimes(1)
  })
})
