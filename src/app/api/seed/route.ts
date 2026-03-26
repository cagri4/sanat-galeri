import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Step 1: Create all tables (idempotent — IF NOT EXISTS)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS artists (
        id serial PRIMARY KEY,
        slug text NOT NULL UNIQUE,
        name_tr text NOT NULL,
        name_en text NOT NULL,
        bio_tr text,
        bio_en text,
        photo_url text,
        email text,
        whatsapp text,
        statement_tr text,
        statement_en text,
        created_at timestamp DEFAULT now()
      )
    `)

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id serial PRIMARY KEY,
        artist_id integer REFERENCES artists(id),
        slug text NOT NULL UNIQUE,
        title_tr text NOT NULL,
        title_en text NOT NULL,
        description_tr text,
        description_en text,
        category text NOT NULL,
        year integer,
        medium_tr text,
        medium_en text,
        dimensions_tr text,
        dimensions_en text,
        price numeric(10,2),
        currency text DEFAULT 'TRY',
        is_sold boolean DEFAULT false,
        is_visible boolean DEFAULT true,
        created_at timestamp DEFAULT now()
      )
    `)

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_images (
        id serial PRIMARY KEY,
        product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url text NOT NULL,
        alt_tr text,
        alt_en text,
        sort_order integer DEFAULT 0
      )
    `)

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id serial PRIMARY KEY,
        artist_id integer REFERENCES artists(id),
        title_tr text,
        title_en text,
        year integer,
        medium_tr text,
        medium_en text,
        image_url text NOT NULL,
        sort_order integer DEFAULT 0
      )
    `)

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exhibitions (
        id serial PRIMARY KEY,
        artist_id integer REFERENCES artists(id),
        type text NOT NULL,
        title_tr text NOT NULL,
        title_en text NOT NULL,
        location text,
        year integer,
        sort_order integer DEFAULT 0
      )
    `)

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id serial PRIMARY KEY,
        artist_id integer REFERENCES artists(id),
        sender_name text NOT NULL,
        sender_email text NOT NULL,
        body text NOT NULL,
        is_read boolean DEFAULT false,
        created_at timestamp DEFAULT now()
      )
    `)

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS press_items (
        id serial PRIMARY KEY,
        artist_id integer REFERENCES artists(id),
        title text NOT NULL,
        publication text,
        url text,
        year integer,
        sort_order integer DEFAULT 0
      )
    `)

    // Step 2: Seed artists
    await db.execute(sql`
      INSERT INTO artists (slug, name_tr, name_en, bio_tr, bio_en, photo_url, statement_tr, statement_en, whatsapp, email)
      VALUES
        ('melike', 'Melike Yıldız', 'Melike Yildiz',
         'İstanbul doğumlu çok yönlü bir sanatçı. Renk ve doku arasında köprüler kurarak, doğanın ve şehir yaşamının çarpıcı kontrastlarını tuvale aktarır. Akrilik, yağlı boya ve karışık tekniklerle çalışır. İstanbul ve uluslararası galerilerde sergileri bulunan Melike, eserlerinde organik formlar ile geometrik yapıları harmanlayarak kendine özgü bir dil yaratır.',
         'Istanbul-born versatile artist. Building bridges between color and texture, she transfers the striking contrasts of nature and urban life onto canvas. Working with acrylic, oil, and mixed media, Melike creates a unique visual language by blending organic forms with geometric structures.',
         'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80',
         'Rengim benim dilim. Her fırça darbesiyle yaşadığım duyguları tuvale aktarıyor, seyirciye içimden geçenleri göstermeye çalışıyorum. Işık ve rengin iç içe geçtiği bu yolculuk, benim için hem bir keşif hem de bir özgürlük.',
         'Color is my language. With every brushstroke I transfer my emotions to the canvas, trying to show the viewer what passes through me. This journey where light and color intertwine is both a discovery and a freedom for me.',
         '905551234567', 'melike@uarttasarim.com'),
        ('seref', 'Şeref Kaya', 'Seref Kaya',
         'Ankara doğumlu seramik ve heykel sanatçısı. Geleneksel Anadolu tekniklerini çağdaş formlarla buluşturarak, toprak, taş ve metal gibi doğal malzemelerle üç boyutlu eserler üretir. Form ve boşluk arasındaki dengeyi araştıran eserleri, izleyiciyi dokunsal bir deneyime davet eder.',
         'Ankara-born ceramics and sculpture artist. Blending traditional Anatolian techniques with contemporary forms, he creates three-dimensional works using natural materials like clay, stone, and metal. His pieces explore the balance between form and space, inviting viewers into a tactile experience.',
         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
         'Toprakla kurduğum bağ, atalarımdan gelen bir miras. Anadolu''nun bin yıllık seramik geleneğini çağdaş formlarla buluşturmak, hem geçmişe saygı hem de geleceğe bir köprü kurmak demek.',
         'My connection with clay is an inheritance from my ancestors. Bringing together the thousand-year-old ceramic tradition of Anatolia with contemporary forms means both respecting the past and building a bridge to the future.',
         '905559876543', 'seref@uarttasarim.com')
      ON CONFLICT (slug) DO NOTHING
    `)

    // Get artist IDs
    const artists = await db.execute(sql`SELECT id, slug FROM artists`)
    const artistRows = artists as unknown as Array<{ id: number; slug: string }>
    const melikeId = artistRows.find((a) => a.slug === 'melike')?.id
    const serefId = artistRows.find((a) => a.slug === 'seref')?.id

    if (!melikeId || !serefId) {
      return NextResponse.json({ error: 'Artists not found after insert' }, { status: 500 })
    }

    // Step 3: Seed products with Unsplash art images
    await db.execute(sql`
      INSERT INTO products (artist_id, slug, title_tr, title_en, category, year, medium_tr, medium_en, dimensions_tr, dimensions_en, price, currency, is_visible)
      VALUES
        (${melikeId}, 'mavi-akin', 'Mavi Akın', 'Blue Flow', 'Tablo', 2024, 'Tuval üzerine yağlıboya', 'Oil on canvas', '100x80 cm', '100x80 cm', 4500.00, 'TRY', true),
        (${melikeId}, 'altin-isik', 'Altın Işık', 'Golden Light', 'Tablo', 2023, 'Tuval üzerine akrilik', 'Acrylic on canvas', '60x90 cm', '60x90 cm', 3200.00, 'TRY', true),
        (${melikeId}, 'sonbahar-senfoni', 'Sonbahar Senfonisi', 'Autumn Symphony', 'Tablo', 2024, 'Tuval üzerine karışık teknik', 'Mixed media on canvas', '120x90 cm', '120x90 cm', 6800.00, 'TRY', true),
        (${melikeId}, 'kirmizi-ruya', 'Kırmızı Rüya', 'Red Dream', 'Tablo', 2023, 'Tuval üzerine yağlıboya', 'Oil on canvas', '80x60 cm', '80x60 cm', 3800.00, 'TRY', true),
        (${serefId}, 'toprak-kase', 'Toprak Kâse', 'Earth Bowl', 'Seramik', 2024, 'Çark yapımı seramik, sır', 'Wheel-thrown ceramic, glazed', '25x25 cm', '25x25 cm', 850.00, 'TRY', true),
        (${serefId}, 'anadolu-vazo', 'Anadolu Vazo', 'Anatolian Vase', 'Seramik', 2024, 'El yapımı seramik, oksit boya', 'Hand-built ceramic, oxide paint', '40x15 cm', '40x15 cm', 1200.00, 'TRY', true),
        (${serefId}, 'denge-heykeli', 'Denge Heykeli', 'Balance Sculpture', 'Heykel', 2023, 'Bronz döküm', 'Bronze cast', '45x20x20 cm', '45x20x20 cm', 5500.00, 'TRY', true),
        (${serefId}, 'ruzgar-formu', 'Rüzgar Formu', 'Wind Form', 'Heykel', 2024, 'Paslanmaz çelik', 'Stainless steel', '60x30x30 cm', '60x30x30 cm', 7200.00, 'TRY', true)
      ON CONFLICT (slug) DO NOTHING
    `)

    // Get product IDs and add images with Unsplash URLs
    const products = await db.execute(sql`SELECT id, slug FROM products ORDER BY id`)
    const productList = products as unknown as Array<{ id: number; slug: string }>

    const imageMap: Record<string, string[]> = {
      'mavi-akin': [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
        'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80',
      ],
      'altin-isik': [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
        'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80',
      ],
      'sonbahar-senfoni': [
        'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&q=80',
      ],
      'kirmizi-ruya': [
        'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80',
      ],
      'toprak-kase': [
        'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
        'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&q=80',
      ],
      'anadolu-vazo': [
        'https://images.unsplash.com/photo-1604076913837-52ab5f33e2f7?w=800&q=80',
      ],
      'denge-heykeli': [
        'https://images.unsplash.com/photo-1561839561-b13bcfe57670?w=800&q=80',
      ],
      'ruzgar-formu': [
        'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80',
      ],
    }

    for (const p of productList) {
      const images = imageMap[p.slug] ?? []
      for (let i = 0; i < images.length; i++) {
        await db.execute(sql`
          INSERT INTO product_images (product_id, url, alt_tr, alt_en, sort_order)
          VALUES (${p.id}, ${images[i]}, ${p.slug + ' görsel'}, ${p.slug + ' image'}, ${i})
          ON CONFLICT DO NOTHING
        `)
      }
    }

    // Step 4: Seed exhibitions
    await db.execute(sql`
      INSERT INTO exhibitions (artist_id, type, title_tr, title_en, location, year)
      VALUES
        (${melikeId}, 'solo_sergi', 'Renk ve Işık', 'Color and Light', 'İstanbul Modern', 2024),
        (${melikeId}, 'solo_sergi', 'İç Manzaralar', 'Inner Landscapes', 'Galeri Nev', 2023),
        (${melikeId}, 'grup_sergi', 'Çağdaş Türk Sanatçılar', 'Contemporary Turkish Artists', 'SALT Galata', 2023),
        (${melikeId}, 'grup_sergi', 'Yeni Yüzler', 'New Faces', 'Arter', 2022),
        (${melikeId}, 'odul', 'Genç Sanatçı Ödülü', 'Young Artist Award', 'İstanbul Kültür Sanat Vakfı', 2022),
        (${melikeId}, 'egitim', 'Güzel Sanatlar, Yüksek Lisans', 'MFA, Fine Arts', 'Mimar Sinan Üniversitesi', 2019),
        (${melikeId}, 'egitim', 'Resim Bölümü, Lisans', 'BA, Painting', 'Marmara Üniversitesi', 2017),
        (${serefId}, 'solo_sergi', 'Toprak ve Ateş', 'Earth and Fire', 'CerModern Ankara', 2024),
        (${serefId}, 'solo_sergi', 'Form Arayışları', 'Exploring Forms', 'Galeri Zilberman', 2023),
        (${serefId}, 'grup_sergi', 'Anadolu Elleri', 'Hands of Anatolia', 'Pera Müzesi', 2023),
        (${serefId}, 'odul', 'Geleneksel El Sanatları Ödülü', 'Traditional Crafts Award', 'Kültür Bakanlığı', 2021),
        (${serefId}, 'egitim', 'Seramik ve Cam Tasarımı, YL', 'MA, Ceramics & Glass', 'Hacettepe Üniversitesi', 2018),
        (${serefId}, 'egitim', 'Güzel Sanatlar, Lisans', 'BA, Fine Arts', 'Anadolu Üniversitesi', 2016)
      ON CONFLICT DO NOTHING
    `)

    // Step 5: Seed portfolio items with Unsplash images
    await db.execute(sql`
      INSERT INTO portfolio_items (artist_id, title_tr, title_en, year, medium_tr, medium_en, image_url, sort_order)
      VALUES
        (${melikeId}, 'Kırmızı Serisi No.1', 'Red Series No.1', 2023, 'Tuval üzerine yağlıboya', 'Oil on canvas', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80', 1),
        (${melikeId}, 'Mavi Hayal', 'Blue Dream', 2024, 'Tuval üzerine akrilik', 'Acrylic on canvas', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80', 2),
        (${melikeId}, 'Gün Batımı Çalışması', 'Sunset Study', 2023, 'Kağıt üzerine suluboya', 'Watercolor on paper', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', 3),
        (${melikeId}, 'Soyut Kompozisyon', 'Abstract Composition', 2022, 'Karışık teknik', 'Mixed media', 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80', 4),
        (${serefId}, 'Kıl Teknik Kase', 'Coil Bowl', 2023, 'Çark yapımı seramik', 'Wheel-thrown ceramic', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80', 1),
        (${serefId}, 'Anadolu Küpü', 'Anatolian Jar', 2024, 'El yapımı seramik, sır', 'Hand-built ceramic, glazed', 'https://images.unsplash.com/photo-1604076913837-52ab5f33e2f7?w=600&q=80', 2),
        (${serefId}, 'Denge', 'Balance', 2023, 'Bronz', 'Bronze', 'https://images.unsplash.com/photo-1561839561-b13bcfe57670?w=600&q=80', 3)
      ON CONFLICT DO NOTHING
    `)

    // Step 6: Seed press items (Melike only — Şeref has none for CV-07 test)
    await db.execute(sql`
      INSERT INTO press_items (artist_id, title, publication, url, year, sort_order)
      VALUES
        (${melikeId}, 'Genç Sanatçılar Yükseliyor', 'Sanat Dünyası Dergisi', 'https://example.com/article1', 2024, 1),
        (${melikeId}, 'İstanbul''un Renk Şairi', 'Cumhuriyet Kültür Eki', 'https://example.com/article2', 2023, 2),
        (${melikeId}, 'Yeni Nesil Ressamlar', 'Art Unlimited', 'https://example.com/article3', 2023, 3)
      ON CONFLICT DO NOTHING
    `)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      tables: ['artists', 'products', 'product_images', 'portfolio_items', 'exhibitions', 'messages', 'press_items'],
      data: { artists: 2, products: 8, exhibitions: 13, portfolioItems: 7, pressItems: 3 },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Seed failed', details: String(error) },
      { status: 500 }
    )
  }
}
