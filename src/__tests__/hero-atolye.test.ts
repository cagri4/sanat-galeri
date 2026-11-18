import { ATOLYE_SLUG, HERO_ATOLYE, SEREF_KART_ATOLYE, pickAtolye, pickOne } from '@/lib/hero-atolye'

const f = (file: string, id = 1, slug = ATOLYE_SLUG) => ({ id, exhibitionSlug: slug, url: `https://res.cloudinary.com/x/image/upload/v1/uarttasarim/atolye/${file}.jpg` })

describe('atölye kareleri', () => {
  it('dosya adıyla birebir eşler (-1 ile -11 karışmaz)', () => {
    expect(pickOne([f('atolye-2026-10-17', 1), f(SEREF_KART_ATOLYE.file, 2)], SEREF_KART_ATOLYE)?.id).toBe(2)
    expect(pickOne([f('atolye-2026-10-1', 1)], { slug: ATOLYE_SLUG, file: 'atolye-2026-10-11' })).toBeNull()
  })
  it('başka slug eşleşmez; hero sırası korunur, bulunmayan atlanır', () => {
    expect(pickOne([f(SEREF_KART_ATOLYE.file, 1, 'yapim-x')], SEREF_KART_ATOLYE)).toBeNull()
    const photos = [f(HERO_ATOLYE[2].file, 3), f(HERO_ATOLYE[0].file, 1)]
    expect(pickAtolye(photos).map((p) => p.id)).toEqual([1, 3])
  })
})

describe('SEO adlı atölye kareleri (18 Kas)', () => {
  const yeni = (n: number, id: number) => ({ id, exhibitionSlug: ATOLYE_SLUG, url: `https://res.cloudinary.com/x/image/upload/v1/uarttasarim/sergi-seo/uarttasarim-seramik-atolyesi-${n}.jpg` })
  it('yeni adı da eşler', () => {
    expect(pickOne([yeni(6, 1), yeni(7, 2)], SEREF_KART_ATOLYE)?.id).toBe(2)
    expect(pickAtolye([yeni(2, 1), yeni(6, 2), yeni(8, 3)]).map((x) => x.id)).toEqual([3, 1, 2])
  })
  it('benzer numarayı karıştırmaz', () => {
    expect(pickOne([yeni(17, 1)], SEREF_KART_ATOLYE)).toBeNull()
  })
})
