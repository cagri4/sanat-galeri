import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function getProducts(category?: string) {
  return db.query.products.findMany({
    where: and(
      eq(products.isVisible, true),
      category ? eq(products.category, category) : undefined,
    ),
    with: {
      images: { limit: 1, orderBy: (img: { sortOrder: unknown }, { asc }: { asc: (col: unknown) => unknown[] }) => [asc(img.sortOrder)] },
    },
    orderBy: [desc(products.createdAt)],
  })
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isVisible, true)),
    with: {
      images: { orderBy: (img: { sortOrder: unknown }, { asc }: { asc: (col: unknown) => unknown[] }) => [asc(img.sortOrder)] },
      artist: true,
    },
  })
}

export async function getCategories() {
  const results = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.isVisible, true))
  return results.map((r) => r.category)
}
