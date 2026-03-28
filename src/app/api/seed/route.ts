import { NextResponse } from 'next/server'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export async function GET() {
  try {
    // Step 1: Create tables
    await client`CREATE TABLE IF NOT EXISTS artists (id serial PRIMARY KEY, slug text NOT NULL UNIQUE, name_tr text NOT NULL, name_en text NOT NULL, bio_tr text, bio_en text, photo_url text, email text, whatsapp text, statement_tr text, statement_en text, created_at timestamp DEFAULT now())`
    await client`CREATE TABLE IF NOT EXISTS products (id serial PRIMARY KEY, artist_id integer REFERENCES artists(id), slug text NOT NULL UNIQUE, title_tr text NOT NULL, title_en text NOT NULL, description_tr text, description_en text, category text NOT NULL, year integer, medium_tr text, medium_en text, dimensions_tr text, dimensions_en text, price numeric(10,2), currency text DEFAULT 'TRY', is_sold boolean DEFAULT false, is_visible boolean DEFAULT true, created_at timestamp DEFAULT now())`
    await client`CREATE TABLE IF NOT EXISTS product_images (id serial PRIMARY KEY, product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE, url text NOT NULL, alt_tr text, alt_en text, sort_order integer DEFAULT 0)`
    await client`CREATE TABLE IF NOT EXISTS portfolio_items (id serial PRIMARY KEY, artist_id integer REFERENCES artists(id), title_tr text, title_en text, year integer, medium_tr text, medium_en text, image_url text NOT NULL, sort_order integer DEFAULT 0)`
    await client`CREATE TABLE IF NOT EXISTS exhibitions (id serial PRIMARY KEY, artist_id integer REFERENCES artists(id), type text NOT NULL, title_tr text NOT NULL, title_en text NOT NULL, location text, year integer, sort_order integer DEFAULT 0)`
    await client`CREATE TABLE IF NOT EXISTS messages (id serial PRIMARY KEY, artist_id integer REFERENCES artists(id), sender_name text NOT NULL, sender_email text NOT NULL, body text NOT NULL, is_read boolean DEFAULT false, created_at timestamp DEFAULT now())`
    await client`CREATE TABLE IF NOT EXISTS press_items (id serial PRIMARY KEY, artist_id integer REFERENCES artists(id), title text NOT NULL, publication text, url text, year integer, sort_order integer DEFAULT 0)`

    // Step 2: Seed artists
    await client`
      INSERT INTO artists (slug, name_tr, name_en, bio_tr, bio_en, photo_url, statement_tr, statement_en, whatsapp, email)
      VALUES
        ('melike', 'Melike Doğan', 'Melike Dogan',
         'İstanbul doğumlu çok yönlü bir sanatçı. Renk ve doku arasında köprüler kurarak, doğanın ve şehir yaşamının çarpıcı kontrastlarını tuvale aktarır.',
         'Istanbul-born versatile artist. Building bridges between color and texture, she transfers the striking contrasts of nature and urban life onto canvas.',
         'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80',
         'Rengim benim dilim. Her fırça darbesiyle yaşadığım duyguları tuvale aktarıyor, seyirciye içimden geçenleri göstermeye çalışıyorum.',
         'Color is my language. With every brushstroke I transfer my emotions to the canvas, trying to show the viewer what passes through me.',
         '905551234567', 'melike@uarttasarim.com'),
        ('seref', 'Şeref Doğan', 'Seref Dogan',
         'Ankara doğumlu seramik ve heykel sanatçısı. Geleneksel Anadolu tekniklerini çağdaş formlarla buluşturarak üç boyutlu eserler üretir.',
         'Ankara-born ceramics and sculpture artist. Blending traditional Anatolian techniques with contemporary forms to create three-dimensional works.',
         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
         'Toprakla kurduğum bağ, atalarımdan gelen bir miras. Anadolunun bin yıllık seramik geleneğini çağdaş formlarla buluşturmak demek.',
         'My connection with clay is an inheritance from my ancestors. Bringing together the thousand-year-old ceramic tradition of Anatolia with contemporary forms.',
         '905559876543', 'seref@uarttasarim.com')
      ON CONFLICT (slug) DO NOTHING
    `

    const artists = await client`SELECT id, slug FROM artists`
    const melikeId = artists.find((a) => a.slug === 'melike')?.id
    const serefId = artists.find((a) => a.slug === 'seref')?.id
    if (!melikeId || !serefId) return NextResponse.json({ error: 'Artists not found' }, { status: 500 })

    // Step 3: Products
    await client`
      INSERT INTO products (artist_id, slug, title_tr, title_en, category, year, medium_tr, medium_en, dimensions_tr, dimensions_en, price, currency, is_visible)
      VALUES
        (${melikeId}, 'mavi-akin', 'Mavi Akın', 'Blue Flow', 'Tablo', 2024, 'Tuval üzerine yağlıboya', 'Oil on canvas', '100x80 cm', '100x80 cm', 4500.00, 'TRY', true),
        (${melikeId}, 'altin-isik', 'Altın Işık', 'Golden Light', 'Tablo', 2023, 'Tuval üzerine akrilik', 'Acrylic on canvas', '60x90 cm', '60x90 cm', 3200.00, 'TRY', true),
        (${melikeId}, 'sonbahar-senfoni', 'Sonbahar Senfonisi', 'Autumn Symphony', 'Tablo', 2024, 'Karışık teknik', 'Mixed media on canvas', '120x90 cm', '120x90 cm', 6800.00, 'TRY', true),
        (${melikeId}, 'kirmizi-ruya', 'Kırmızı Rüya', 'Red Dream', 'Tablo', 2023, 'Tuval üzerine yağlıboya', 'Oil on canvas', '80x60 cm', '80x60 cm', 3800.00, 'TRY', true),
        (${serefId}, 'toprak-kase', 'Toprak Kâse', 'Earth Bowl', 'Seramik', 2024, 'Çark yapımı seramik', 'Wheel-thrown ceramic', '25x25 cm', '25x25 cm', 850.00, 'TRY', true),
        (${serefId}, 'anadolu-vazo', 'Anadolu Vazo', 'Anatolian Vase', 'Seramik', 2024, 'El yapımı seramik', 'Hand-built ceramic', '40x15 cm', '40x15 cm', 1200.00, 'TRY', true),
        (${serefId}, 'denge-heykeli', 'Denge Heykeli', 'Balance Sculpture', 'Heykel', 2023, 'Bronz döküm', 'Bronze cast', '45x20x20 cm', '45x20x20 cm', 5500.00, 'TRY', true),
        (${serefId}, 'ruzgar-formu', 'Rüzgar Formu', 'Wind Form', 'Heykel', 2024, 'Paslanmaz çelik', 'Stainless steel', '60x30x30 cm', '60x30x30 cm', 7200.00, 'TRY', true)
      ON CONFLICT (slug) DO NOTHING
    `

    // Step 4: Product images
    const products = await client`SELECT id, slug FROM products ORDER BY id`
    const imageMap: Record<string, string[]> = {
      'mavi-akin': ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80'],
      'altin-isik': ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80', 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80'],
      'sonbahar-senfoni': ['https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&q=80'],
      'kirmizi-ruya': ['https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80'],
      'toprak-kase': ['https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80', 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&q=80'],
      'anadolu-vazo': ['https://images.unsplash.com/photo-1604076913837-52ab5f33e2f7?w=800&q=80'],
      'denge-heykeli': ['https://images.unsplash.com/photo-1561839561-b13bcfe57670?w=800&q=80'],
      'ruzgar-formu': ['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80'],
    }
    for (const p of products) {
      const imgs = imageMap[p.slug as string] ?? []
      for (let i = 0; i < imgs.length; i++) {
        await client`INSERT INTO product_images (product_id, url, alt_tr, alt_en, sort_order) VALUES (${p.id}, ${imgs[i]}, ${p.slug + ' görsel'}, ${p.slug + ' image'}, ${i}) ON CONFLICT DO NOTHING`
      }
    }

    // Step 5: Exhibitions
    await client`
      INSERT INTO exhibitions (artist_id, type, title_tr, title_en, location, year) VALUES
        (${melikeId}, 'solo_sergi', 'Renk ve Işık', 'Color and Light', 'İstanbul Modern', 2024),
        (${melikeId}, 'solo_sergi', 'İç Manzaralar', 'Inner Landscapes', 'Galeri Nev', 2023),
        (${melikeId}, 'grup_sergi', 'Çağdaş Türk Sanatçılar', 'Contemporary Turkish Artists', 'SALT Galata', 2023),
        (${melikeId}, 'odul', 'Genç Sanatçı Ödülü', 'Young Artist Award', 'İKSV', 2022),
        (${melikeId}, 'egitim', 'Güzel Sanatlar YL', 'MFA Fine Arts', 'Mimar Sinan Üniversitesi', 2019),
        (${melikeId}, 'egitim', 'Resim Lisans', 'BA Painting', 'Marmara Üniversitesi', 2017),
        (${serefId}, 'solo_sergi', 'Toprak ve Ateş', 'Earth and Fire', 'CerModern', 2024),
        (${serefId}, 'solo_sergi', 'Form Arayışları', 'Exploring Forms', 'Zilberman', 2023),
        (${serefId}, 'grup_sergi', 'Anadolu Elleri', 'Hands of Anatolia', 'Pera Müzesi', 2023),
        (${serefId}, 'odul', 'El Sanatları Ödülü', 'Crafts Award', 'Kültür Bakanlığı', 2021),
        (${serefId}, 'egitim', 'Seramik YL', 'MA Ceramics', 'Hacettepe Üniversitesi', 2018),
        (${serefId}, 'egitim', 'Güzel Sanatlar Lisans', 'BA Fine Arts', 'Anadolu Üniversitesi', 2016)
      ON CONFLICT DO NOTHING
    `

    // Step 6: Portfolio items
    await client`
      INSERT INTO portfolio_items (artist_id, title_tr, title_en, year, medium_tr, medium_en, image_url, sort_order) VALUES
        (${melikeId}, 'Kırmızı Serisi', 'Red Series', 2023, 'Yağlıboya', 'Oil', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80', 1),
        (${melikeId}, 'Mavi Hayal', 'Blue Dream', 2024, 'Akrilik', 'Acrylic', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80', 2),
        (${melikeId}, 'Gün Batımı', 'Sunset Study', 2023, 'Suluboya', 'Watercolor', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', 3),
        (${melikeId}, 'Soyut Kompozisyon', 'Abstract', 2022, 'Karışık', 'Mixed', 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80', 4),
        (${serefId}, 'Kıl Teknik Kase', 'Coil Bowl', 2023, 'Seramik', 'Ceramic', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80', 1),
        (${serefId}, 'Anadolu Küpü', 'Anatolian Jar', 2024, 'Seramik', 'Ceramic', 'https://images.unsplash.com/photo-1604076913837-52ab5f33e2f7?w=600&q=80', 2),
        (${serefId}, 'Denge', 'Balance', 2023, 'Bronz', 'Bronze', 'https://images.unsplash.com/photo-1561839561-b13bcfe57670?w=600&q=80', 3)
      ON CONFLICT DO NOTHING
    `

    // Step 7: Press items (Melike only)
    await client`
      INSERT INTO press_items (artist_id, title, publication, url, year, sort_order) VALUES
        (${melikeId}, 'Genç Sanatçılar Yükseliyor', 'Sanat Dünyası', 'https://example.com/1', 2024, 1),
        (${melikeId}, 'İstanbulun Renk Şairi', 'Cumhuriyet Kültür', 'https://example.com/2', 2023, 2),
        (${melikeId}, 'Yeni Nesil Ressamlar', 'Art Unlimited', 'https://example.com/3', 2023, 3)
      ON CONFLICT DO NOTHING
    `

    return NextResponse.json({
      success: true,
      message: 'Database seeded!',
      data: { artists: 2, products: 8, exhibitions: 12, portfolioItems: 7, pressItems: 3 },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 })
  }
}
