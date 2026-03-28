import { NextResponse } from 'next/server'
import postgres from 'postgres'

export async function GET() {
  const url = process.env.DATABASE_URL!
  try {
    // Test 1: Raw postgres.js query (bypass Drizzle entirely)
    const client = postgres(url, { prepare: false, ssl: 'require' })
    const raw = await client`SELECT id, slug, title_tr FROM products WHERE is_visible = true LIMIT 2`
    await client.end()

    // Test 2: Drizzle simple query (no relations)
    const { db } = await import('@/lib/db')
    const { products } = await import('@/lib/db/schema')
    const { eq } = await import('drizzle-orm')
    const drizzleSimple = await db.select({ slug: products.slug, title: products.titleTr }).from(products).where(eq(products.isVisible, true)).limit(2)

    // Test 3: Drizzle relational query (the one that fails)
    let relational: unknown = null
    let relError: string | null = null
    try {
      relational = await db.query.products.findMany({
        where: eq(products.isVisible, true),
        with: { images: { limit: 1 } },
        limit: 2,
      })
    } catch (e) {
      relError = String(e)
    }

    return NextResponse.json({
      raw: { success: true, count: raw.length, data: raw },
      drizzleSimple: { success: true, count: drizzleSimple.length, data: drizzleSimple },
      drizzleRelational: relError ? { success: false, error: relError.substring(0, 200) } : { success: true, count: (relational as any[])?.length },
      db_url_prefix: url.substring(0, 40) + '...',
    })
  } catch (error) {
    return NextResponse.json({ error: String(error), db_url_prefix: url.substring(0, 40) + '...' }, { status: 500 })
  }
}
