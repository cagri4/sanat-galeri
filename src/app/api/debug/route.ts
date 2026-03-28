import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const result = await db.query.products.findMany({
      where: eq(products.isVisible, true),
      with: {
        images: { limit: 1 },
      },
      limit: 2,
    })
    return NextResponse.json({
      success: true,
      count: result.length,
      sample: result.map(r => ({ slug: r.slug, title: r.titleTr, images: r.images?.length ?? 0 })),
      db_url_prefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
    })
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: String(error),
      db_url_prefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
    }, { status: 500 })
  }
}
