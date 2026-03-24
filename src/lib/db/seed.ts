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
    INSERT INTO artists (slug, name_tr, name_en, bio_tr, bio_en, whatsapp)
    VALUES
      ('melike', 'Melike Yıldız', 'Melike Yildiz',
       'İstanbul''lu ressam. Renk ve doku üzerine çalışmalar.',
       'Istanbul-based painter. Works on color and texture.',
       '905551234567'),
      ('seref', 'Şeref Kaya', 'Seref Kaya',
       'Ankara''lı seramik sanatçısı.',
       'Ankara-based ceramic artist.',
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

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
