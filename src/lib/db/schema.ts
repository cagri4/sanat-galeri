import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  slug: text('slug').unique().notNull(),          // "melike" | "seref"
  nameTr: text('name_tr').notNull(),
  nameEn: text('name_en').notNull(),
  bioTr: text('bio_tr'),
  bioEn: text('bio_en'),
  statementTr: text('statement_tr'),
  statementEn: text('statement_en'),
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
  year: integer('year'),
  mediumTr: text('medium_tr'),
  mediumEn: text('medium_en'),
  dimensionsTr: text('dimensions_tr'),
  dimensionsEn: text('dimensions_en'),
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
  type: text('type').notNull(),               // "solo_sergi" | "grup_sergi" | "odul" | "egitim"
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

export const pressItems = pgTable('press_items', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id),
  title: text('title').notNull(),
  publication: text('publication'),
  url: text('url'),
  year: integer('year'),
  sortOrder: integer('sort_order').default(0),
})

// Drizzle relations — required for db.query.* with `with:` option
export const artistsRelations = relations(artists, ({ many }) => ({
  products: many(products),
  portfolioItems: many(portfolioItems),
  exhibitions: many(exhibitions),
  pressItems: many(pressItems),
}))

export const productsRelations = relations(products, ({ many, one }) => ({
  images: many(productImages),
  artist: one(artists, { fields: [products.artistId], references: [artists.id] }),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  artist: one(artists, { fields: [portfolioItems.artistId], references: [artists.id] }),
}))

export const exhibitionsRelations = relations(exhibitions, ({ one }) => ({
  artist: one(artists, { fields: [exhibitions.artistId], references: [artists.id] }),
}))

export const pressItemsRelations = relations(pressItems, ({ one }) => ({
  artist: one(artists, { fields: [pressItems.artistId], references: [artists.id] }),
}))
