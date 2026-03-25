import { db } from '@/lib/db'
import { products, artists, messages } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * Admin query layer — no isVisible filter, returns all records.
 */

export async function getAllProducts() {
  return db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: {
      images: true,
      artist: true,
    },
  })
}

export async function getProductById(id: number) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: true,
      artist: true,
    },
  })
}

export async function getAllArtists() {
  return db.query.artists.findMany({
    orderBy: [artists.nameTr],
  })
}

export async function getArtistBySlug(slug: string) {
  return db.query.artists.findFirst({
    where: eq(artists.slug, slug),
    with: {
      exhibitions: true,
      portfolioItems: true,
      pressItems: true,
    },
  })
}

export async function getAllMessages() {
  return db.query.messages.findMany({
    orderBy: [desc(messages.createdAt)],
    with: {
      artist: true,
    },
  })
}
