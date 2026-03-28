import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

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
