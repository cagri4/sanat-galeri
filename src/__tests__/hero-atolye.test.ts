import { HERO_ATOLYE, SEREF_KART_ATOLYE, pickAtolye, pickOne } from '@/lib/hero-atolye'

const f = (slug: string, file: string, id = 1) => ({ id, exhibitionSlug: slug, url: `https://res.cloudinary.com/x/image/upload/v1/uarttasarim/mimari-yapim/${file}.jpg` })

describe('atölye kareleri', () => {
  it('dosya adıyla birebir eşler (-1 ile -10 karışmaz)', () => {
    const photos = [f(SEREF_KART_ATOLYE.slug, 'canakkale-sehitleri-anisina-10', 1), f(SEREF_KART_ATOLYE.slug, 'canakkale-sehitleri-anisina-1', 2)]
    expect(pickOne(photos, SEREF_KART_ATOLYE)?.id).toBe(2)
  })
  it('hero sırası korunur, bulunmayan atlanır', () => {
    const photos = [f(HERO_ATOLYE[2].slug, HERO_ATOLYE[2].file, 3), f(HERO_ATOLYE[0].slug, HERO_ATOLYE[0].file, 1)]
    expect(pickAtolye(photos).map((p) => p.id)).toEqual([1, 3])
  })
})
