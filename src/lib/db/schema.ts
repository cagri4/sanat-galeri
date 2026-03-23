import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core'

export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  slug: text('slug').unique().notNull(),          // "melike" | "seref"
  nameTr: text('name_tr').notNull(),
  nameEn: text('name_en').notNull(),
  bioTr: text('bio_tr'),
  bioEn: text('bio_en'),
  photoUrl: text('photo_url'),
  email: text('email'),
  whatsapp: text('whatsapp'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id),
  slug: text('slug').unique().notNull(),
  titleTr: text('title_tr').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionTr: text('description_tr'),
  descriptionEn: text('description_en'),
  category: text('category').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }),
  currency: text('currency').default('TRY'),
  isSold: boolean('is_sold').default(false),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  altTr: text('alt_tr'),
  altEn: text('alt_en'),
  sortOrder: integer('sort_order').default(0),
})

export const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id),
  titleTr: text('title_tr'),
  titleEn: text('title_en'),
  year: integer('year'),
  mediumTr: text('medium_tr'),
  mediumEn: text('medium_en'),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').default(0),
})

export const exhibitions = pgTable('exhibitions', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id),
  type: text('type').notNull(),               // "sergi" | "odul" | "etkinlik"
  titleTr: text('title_tr').notNull(),
  titleEn: text('title_en').notNull(),
  location: text('location'),
  year: integer('year'),
  sortOrder: integer('sort_order').default(0),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id), // NULL = main site
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})
