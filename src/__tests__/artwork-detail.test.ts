/**
 * Eser detay sayfası sözleşmesi.
 *
 * Sayfanın (`/[locale]/urun/[slug]`) ihtiyaç duyduğu her alanın sorgudan
 * geldiğini doğrular. Görsel yerleşim ayrıca tarayıcıda kontrol ediliyor.
 *
 * Eski hali drizzle mock'luyordu; sorgular REST'e taşınınca güncellenmemişti.
 */

jest.mock('@/lib/db/supabase', () => ({ supabase: { from: jest.fn() } }))

import { supabase } from '@/lib/db/supabase'
import { mockFrom } from './helpers/supabase-mock'
import { getProductBySlug } from '@/lib/queries/gallery'

const ROW = {
  id: 1,
  slug: 'afrodit-ve-kaz',
  title_tr: 'Afrodit ve Kaz',
  title_en: 'Aphrodite and the Goose',
  category: 'Antik Dönem Replikaları',
  collection: null,
  year: 2010,
  medium_tr: 'Terra sigillata',
  medium_en: 'Terra sigillata',
  dimensions_tr: '32 cm',
  dimensions_en: '32 cm',
  form_tr: 'Kylix',
  form_en: 'Kylix',
  period_tr: 'MÖ 5. yüzyıl',
  period_en: '5th century BC',
  subject_tr: 'Afrodit ve kutsal hayvanı kaz',
  subject_en: 'Aphrodite and her sacred goose',
  description_tr: 'İkonografik çözümleme...',
  description_en: 'Iconographic reading...',
  about_tr: null,
  about_en: null,
  price: null,
  currency: 'TRY',
  is_sold: false,
  is_visible: true,
  artist_id: 2,
  created_at: '2026-01-01',
  images: [
    { id: 1, product_id: 1, url: 'https://x/1.jpg', alt_tr: 'Ana görsel', alt_en: 'Main image', sort_order: 0 },
  ],
  artist: { id: 2, slug: 'seref', name_tr: 'Şeref Doğan', name_en: 'Seref Dogan' },
}

describe('Eser detay sayfası sözleşmesi', () => {
  beforeEach(() => mockFrom(supabase, { data: ROW, error: null }))

  it('iki dilde başlık döner', async () => {
    const p = await getProductBySlug('afrodit-ve-kaz')
    expect(p?.titleTr).toBe('Afrodit ve Kaz')
    expect(p?.titleEn).toBe('Aphrodite and the Goose')
  })

  it('sanatçının istediği katalog künyesini döner', async () => {
    const p = await getProductBySlug('afrodit-ve-kaz')
    // Kap Formu / Dönemi / Teknik / Mitolojik Konu — SANATCI-SITE-DUZENI.md
    expect(p?.formTr).toBe('Kylix')
    expect(p?.periodTr).toBe('MÖ 5. yüzyıl')
    expect(p?.mediumTr).toBe('Terra sigillata')
    expect(p?.subjectTr).toBe('Afrodit ve kutsal hayvanı kaz')
    expect(p?.dimensionsTr).toBe('32 cm')
    expect(p?.year).toBe(2010)
  })

  it('açıklama ve "Replika Hakkında" alanlarını taşır', async () => {
    const p = await getProductBySlug('afrodit-ve-kaz')
    expect(p?.descriptionTr).toContain('İkonografik')
    // about_* boşsa sayfa çeviri dosyasındaki genel metne düşer
    expect(p?.aboutTr).toBeNull()
  })

  it('fiyat boşken null döner (katalog modeli — fiyat gösterilmez)', async () => {
    const p = await getProductBySlug('afrodit-ve-kaz')
    expect(p?.price).toBeNull()
    expect(p?.isSold).toBe(false)
  })

  it('görselleri alt metinleriyle döner', async () => {
    const p = await getProductBySlug('afrodit-ve-kaz')
    expect(p?.images).toHaveLength(1)
    expect(p?.images[0].altTr).toBe('Ana görsel')
  })

  it('sanatçı bilgisini bağlar', async () => {
    const p = await getProductBySlug('afrodit-ve-kaz')
    expect(p?.artist?.slug).toBe('seref')
    expect(p?.artist?.nameTr).toBe('Şeref Doğan')
  })

  it('olmayan/gizli eser için null döner', async () => {
    mockFrom(supabase, { data: null, error: { code: 'PGRST116' } })
    expect(await getProductBySlug('yok')).toBeNull()
  })
})
