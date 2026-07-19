/**
 * Basit, bagimliliksiz IP bazli oran sinirlayici.
 *
 * Bellek ici: tek sunucu ornegi icin yeterli. Vercel'de her lambda ornegi
 * kendi sayacini tutar, yani sinir ornek basina uygulanir — bu bir iletisim
 * formu icin kabul edilebilir (amac otomatik spam selini kesmek, kesin
 * kotalama degil). Trafik artarsa Upstash/Redis'e tasinmali.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/** Bellegin sinirsiz buyumesini onle (bot IP'leri cok cesitli olabilir). */
const MAX_KEYS = 5000

export interface RateLimitResult {
  ok: boolean
  /** Sinir asildiysa kac saniye sonra tekrar denenebilir. */
  retryAfter: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_KEYS) {
      // Suresi dolmuslari temizle; hala doluysa en eskiyi at.
      for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k)
      if (buckets.size >= MAX_KEYS) buckets.delete(buckets.keys().next().value as string)
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { ok: true, retryAfter: 0 }
}

/** Proxy arkasindaki gercek istemci IP'si. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}
