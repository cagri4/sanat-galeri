import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/db/supabase'
import { clientIp, rateLimit } from '@/lib/rate-limit'

/**
 * Iletisim formu ucu — hem eser sayfasindaki form hem de sol alttaki modal
 * buraya gonderiyor. Mesaj `messages` tablosuna dusuyor, admin panelinde
 * goruluyor.
 *
 * NOT: E-posta bildirimi (info@...) HENUZ YOK — yontem netlesince
 * (muhtemelen Resend) ayrica eklenecek. Su an yalnizca DB'ye yaziliyor.
 */

// 10 dakikada en fazla 5 mesaj / IP.
const LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

const contactApiSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(2000),
  /** Honeypot: gercek kullanicida bos kalir, botlar doldurur. */
  website: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = contactApiSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Honeypot dolduysa: bota basarili gorunumu ver ama HICBIR SEY kaydetme.
    // 200 donmek botun tekrar denemesini engeller.
    if (parsed.data.website && parsed.data.website.trim() !== '') {
      return NextResponse.json({ success: true })
    }

    const { ok, retryAfter } = rateLimit(`contact:${clientIp(request)}`, LIMIT, WINDOW_MS)
    if (!ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const { name, email, message } = parsed.data
    const { error } = await supabase.from('messages').insert({
      sender_name: name,
      sender_email: email,
      body: message,
      artist_id: null,
      is_read: false,
    })

    if (error) {
      console.error('Contact insert error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
