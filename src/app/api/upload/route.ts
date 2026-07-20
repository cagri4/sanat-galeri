import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadImage, type UploadFolder } from '@/lib/storage'

/**
 * Görsel yükleme ucu — Supabase Storage'a yazar.
 * (Vercel Blob'dan taşındı; gerekçe: `lib/storage.ts` baş notu.)
 *
 * İstek: multipart/form-data — `file` (zorunlu), `folder` (urunler|sanatci|sergi).
 * Yanıt: { url }
 */

const FOLDERS: UploadFolder[] = ['urunler', 'sanatci', 'sergi']

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 })
  }

  const raw = String(form.get('folder') ?? 'urunler')
  const folder = (FOLDERS as string[]).includes(raw) ? (raw as UploadFolder) : 'urunler'

  const result = await uploadImage(file, folder)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({ url: result.url })
}
