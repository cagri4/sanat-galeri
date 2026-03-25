import { db } from '@/lib/db'
import { artists, portfolioItems, exhibitions, pressItems } from '@/lib/db/schema'
import { eq, asc, desc } from 'drizzle-orm'

/**
 * Get artist by slug — returns full artist record including bio, photo, statement.
 * Returns undefined if not found.
 */
export async function getArtistBySlug(slug: string) {
  return db.query.artists.findFirst({
    where: eq(artists.slug, slug),
  })
}

/**
 * Get portfolio items for an artist, ordered by sortOrder ascending.
 */
export async function getArtistPortfolio(artistId: number) {
  return db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.artistId, artistId))
    .orderBy(asc(portfolioItems.sortOrder))
}

/**
 * Get exhibitions for an artist, ordered by year descending.
 * Covers CV-03 (solo/group), CV-04 (awards), CV-05 (education).
 */
export async function getArtistExhibitions(artistId: number) {
  return db
    .select()
    .from(exhibitions)
    .where(eq(exhibitions.artistId, artistId))
    .orderBy(desc(exhibitions.year))
}

/**
 * Get press items for an artist, ordered by year descending.
 * Returns empty array when no items exist (CV-07 empty state).
 */
export async function getArtistPressItems(artistId: number) {
  return db
    .select()
    .from(pressItems)
    .where(eq(pressItems.artistId, artistId))
    .orderBy(desc(pressItems.year))
}
