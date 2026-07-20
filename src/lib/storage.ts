import { supabase } from '@/lib/db/supabase'

/**
 * Görsel deposu: Supabase Storage (`eserler` kovası, public).
 *
 * ÖNCEDEN Vercel Blob kullanılıyordu, ancak `BLOB_READ_WRITE_TOKEN` hiçbir
 * ortamda tanımlı değildi — panelden yapılan her yükleme canlıda
 * `400 "Vercel Blob: No token found"` ile düşüyordu (2026-07-20 denetimi).
 * Supabase Storage zaten kullanımda ve ödenmiş durumda; yeni bir faturalı
 * servis açmak yerine mevcut kova kullanılıyor.
 */

export const BUCKET = 'eserler'

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const ALLOWED_TYPES = Object.keys(EXT)
export const MAX_BYTES = 10 * 1024 * 1024

export type UploadFolder = 'urunler' | 'sanatci' | 'sergi'

/** Çakışmayan, tahmin edilemeyen bir dosya adı üretir. */
function objectPath(folder: UploadFolder, contentType: string): string {
  const rand = crypto.randomUUID().slice(0, 8)
  return `${folder}/${Date.now()}-${rand}.${EXT[contentType] ?? 'bin'}`
}

export async function uploadImage(
  file: File,
  folder: UploadFolder
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Yalnızca JPEG, PNG ve WEBP yüklenebilir.' }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'Dosya çok büyük (en fazla 10 MB).' }
  }

  const path = objectPath(folder, file.type)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error('uploadImage:', error)
    return { error: 'Yükleme başarısız: ' + error.message }
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
}

/**
 * Public URL'den kova içi yolu çıkarır.
 * Kovaya ait olmayan URL'ler (dış bağlantılar) için null döner — silinmezler.
 */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

/** Depodan siler. Dosya yoksa veya dış URL ise sessizce geçer. */
export async function deleteImage(url: string): Promise<void> {
  const path = pathFromPublicUrl(url)
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('deleteImage:', error)
}
