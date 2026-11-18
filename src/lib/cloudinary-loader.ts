'use client'

// Görsel boyutlandırma Vercel yerine Cloudinary'de (18 Kas 2026).
// Neden: Vercel görsel optimizasyon kotası doldu → /_next/image 402 dönüyordu
// (KIRIK-LINK-RAPOR-18KAS.md). Cloudinary adreslerine f_auto,q_auto,w_<genişlik>
// eklenir; diğer adresler (yerel /brand/…, Supabase) olduğu gibi döner.
// Geri alma: next.config.ts'deki loader/loaderFile satırlarını kaldır.

const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/

export default function cloudinaryLoader({
  src,
  width,
}: {
  src: string
  width: number
  quality?: number
}): string {
  const m = src.match(CLOUDINARY)
  if (m) return `${m[1]}f_auto,q_auto,c_limit,w_${width}/${m[2]}`
  // Boyutlandırılamayan kaynak: dosyanın kendisi (w yalnız Next'in uyarısı için).
  return src.includes('?') ? src : `${src}?w=${width}`
}
