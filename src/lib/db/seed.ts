/**
 * Seed script for development data.
 * Creates 2 artists, 5 products across 3 categories, with images.
 * Run with: npx tsx src/lib/db/seed.ts
 *
 * Idempotent: uses ON CONFLICT DO NOTHING via insertIgnore pattern.
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { sql } from 'drizzle-orm'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const connection = neon(DATABASE_URL)
const db = drizzle(connection, { schema })

async function seed() {
  console.log('Seeding database...')

  // Insert artists (idempotent via ON CONFLICT DO NOTHING)
  await db.execute(sql`
    INSERT INTO artists (slug, name_tr, name_en, bio_tr, bio_en, statement_tr, statement_en, whatsapp)
    VALUES
      ('melike', 'Melike Yıldız', 'Melike Yildiz',
       'İstanbul''lu ressam. Renk ve doku üzerine çalışmalar.',
       'Istanbul-based painter. Works on color and texture.',
       'Rengim benim dilim. Her fırça darbesiyle yaşadığım duyguları tuvale aktarıyor, seyirciye içimden geçenleri göstermeye çalışıyorum. Işık ve rengin iç içe geçtiği bu yolculuk, benim için hem bir keşif hem de bir özgürlük.',
       'Color is my language. With every brushstroke I transfer my emotions to the canvas, trying to show the viewer what passes through me. This journey where light and color intertwine is both a discovery and a freedom for me.',
       '905551234567'),
      ('seref', 'Şeref Kaya', 'Seref Kaya',
       'Ankara''lı seramik sanatçısı.',
       'Ankara-based ceramic artist.',
       'Toprakla kurduğum bağ, atalarımdan gelen bir miras. Anadolu''nun bin yıllık seramik geleneğini çağdaş formlarla buluşturmak, hem geçmişe saygı hem de geleceğe bir köprü kurmak demek.',
       'My connection with clay is an inheritance from my ancestors. Bringing together the thousand-year-old ceramic tradition of Anatolia with contemporary forms means both respecting the past and building a bridge to the future.',
       '905559876543')
    ON CONFLICT (slug) DO NOTHING
  `)
  console.log('Artists inserted.')

  // Get artist IDs
  const artists = await db.query.artists.findMany()
  const melike = artists.find((a) => a.slug === 'melike')
  const seref = artists.find((a) => a.slug === 'seref')

  if (!melike || !seref) {
    throw new Error('Could not find inserted artists')
  }

  // Insert products (idempotent via ON CONFLICT DO NOTHING)
  await db.execute(sql`
    INSERT INTO products (
      artist_id, slug, title_tr, title_en, category,
      year, medium_tr, medium_en, dimensions_tr, dimensions_en,
      price, currency, is_visible
    )
    VALUES
      (${melike.id}, 'mavi-akin', 'Mavi Akın', 'Blue Flow',
       'Tablo', 2023, 'Tuval üzerine yağlıboya', 'Oil on canvas',
       '100x80 cm', '100x80 cm', '4500.00', 'TRY', true),

      (${melike.id}, 'altin-isik', 'Altın Işık', 'Golden Light',
       'Tablo', 2022, 'Tuval üzerine akrilik', 'Acrylic on canvas',
       '60x90 cm', '60x90 cm', '3200.00', 'TRY', true),

      (${melike.id}, 'sonbahar-senfoni', 'Sonbahar Senfoni', 'Autumn Symphony',
       'Tablo', 2024, 'Tuval üzerine karışık teknik', 'Mixed media on canvas',
       '120x90 cm', '120x90 cm', '6800.00', 'TRY', true),

      (${seref.id}, 'toprak-kase', 'Toprak Kâse', 'Earth Bowl',
       'Seramik', 2023, 'Çark yapımı seramik, sır', 'Wheel-thrown ceramic, glazed',
       '25x25 cm', '25x25 cm', '850.00', 'TRY', true),

      (${seref.id}, 'anatolian-vazo', 'Anadolu Vazo', 'Anatolian Vase',
       'Seramik', 2024, 'El yapımı seramik, oksit boya', 'Hand-built ceramic, oxide paint',
       '40x15 cm', '40x15 cm', '1200.00', 'TRY', true)
    ON CONFLICT (slug) DO NOTHING
  `)
  console.log('Products inserted.')

  // Get product IDs
  const allProducts = await db.query.products.findMany()

  // Insert product images
  for (const product of allProducts) {
    await db.execute(sql`
      INSERT INTO product_images (product_id, url, alt_tr, alt_en, sort_order)
      VALUES
        (${product.id},
         ${'https://placehold.co/800x600.webp'},
         ${`${product.titleTr} - Ana Görsel`},
         ${`${product.titleEn} - Main Image`},
         0)
      ON CONFLICT DO NOTHING
    `)
  }
  console.log('Product images inserted.')

  // Insert exhibitions for CV pages (4 types per artist)
  await db.execute(sql`
    INSERT INTO exhibitions (artist_id, type, title_tr, title_en, location, year)
    VALUES
      (${melike.id}, 'solo_sergi', 'Renk ve Işık', 'Color and Light', 'İstanbul Modern', 2023),
      (${melike.id}, 'grup_sergi', 'Çağdaş Türk Sanatçılar', 'Contemporary Turkish Artists', 'SALT Galata', 2022),
      (${melike.id}, 'odul', 'Genç Sanatçı Ödülü', 'Young Artist Award', 'İstanbul Kültür Sanat Vakfı', 2021),
      (${melike.id}, 'egitim', 'Güzel Sanatlar Fakültesi, Yüksek Lisans', 'MFA, Fine Arts Faculty', 'Mimar Sinan Güzel Sanatlar Üniversitesi', 2019),
      (${seref.id}, 'solo_sergi', 'Toprak ve Ateş', 'Earth and Fire', 'CerModern Ankara', 2023),
      (${seref.id}, 'grup_sergi', 'Anadolu Elleri', 'Hands of Anatolia', 'Pera Müzesi', 2022),
      (${seref.id}, 'odul', 'Geleneksel El Sanatları Ödülü', 'Traditional Crafts Award', 'Kültür Bakanlığı', 2020),
      (${seref.id}, 'egitim', 'Seramik ve Cam Tasarımı Bölümü', 'Ceramics and Glass Design', 'Hacettepe Üniversitesi Güzel Sanatlar Fakültesi', 2018)
    ON CONFLICT DO NOTHING
  `)
  console.log('Exhibitions inserted.')

  // Insert portfolio items for CV pages
  await db.execute(sql`
    INSERT INTO portfolio_items (artist_id, title_tr, title_en, year, medium_tr, medium_en, image_url, sort_order)
    VALUES
      (${melike.id}, 'Kırmızı Serisi No.1', 'Red Series No.1', 2022, 'Tuval üzerine yağlıboya', 'Oil on canvas', 'https://placehold.co/800x600.webp', 1),
      (${melike.id}, 'Mavi Hayal', 'Blue Dream', 2023, 'Tuval üzerine akrilik', 'Acrylic on canvas', 'https://placehold.co/800x600.webp', 2),
      (${seref.id}, 'Kıl Teknik Kase', 'Hair Technique Bowl', 2022, 'Çark yapımı seramik', 'Wheel-thrown ceramic', 'https://placehold.co/800x600.webp', 1),
      (${seref.id}, 'Anadolu Küpü', 'Anatolian Jar', 2023, 'El yapımı seramik, sır', 'Hand-built ceramic, glazed', 'https://placehold.co/800x600.webp', 2)
    ON CONFLICT DO NOTHING
  `)
  console.log('Portfolio items inserted.')

  // Insert press items for melike only (seref gets none — tests empty state for CV-07)
  await db.execute(sql`
    INSERT INTO press_items (artist_id, title, publication, url, year, sort_order)
    VALUES
      (${melike.id}, 'Genç Sanatçılar Yükseliyor', 'Sanat Dünyası Dergisi', 'https://example.com/article1', 2023, 1),
      (${melike.id}, 'Istanbul''un Renk Şairi', 'Cumhuriyet Kültür', 'https://example.com/article2', 2022, 2)
    ON CONFLICT DO NOTHING
  `)
  console.log('Press items inserted.')

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
