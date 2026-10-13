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
