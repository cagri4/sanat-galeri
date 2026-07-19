// Drive'dan indirilen fotoğrafları optimize edip Vercel Blob'a yükler ve
// product_images kayıtlarını oluşturur.
// Aynı eserin çoklu açı çekimleri TEK esere bağlanır (lightbox için sort_order).
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')])
)
const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' }
const api = async (p, o = {}) => {
  const r = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${p}`, { headers: H, ...o })
  const t = await r.text()
  if (!r.ok) throw new Error(`${p} → ${r.status} ${t}`)
  return t ? JSON.parse(t) : null
}

const DIR = path.join(ROOT, 'drive-fotolar/antik-donem')

// slug → dosyalar (ilk dosya kapak görseli olur)
const GROUPS = {
  'afrodit-ve-kaz': ['Afrodit ve kaz2.jpg', 'Afrodit ve kaz3.jpg', 'Afrodit ve kaz4.jpg'],
  'europa': ['Europa.jpg', 'Europa1.jpg', 'Europa2.jpg'],
  'menad': ['menead.jpg', 'menead1.jpg', 'menead2.jpg', 'menead3.jpg'],
  'thetis': ['thetis.jpg', 'Thetis1.jpg', 'Thetis2.jpg', 'Thetis4.jpg'],
  'siren': ['Siren.jpg', 'Siren1.jpg', 'Siren2.jpg', 'Siren4.jpg',
            'IMG_20201115_143718crf.jpg', 'IMG_20201115_143727crf.jpg',
            'IMG_20201115_143739crf.jpg', 'IMG_20201115_143741crf.jpg'],
  'geometrik-donem-toren-kabi': ['Geometrik dönem çanak.jpg', 'Geometrik dönem çanak1.jpg',
                                 'Geometrik dönem çanak2.jpg', 'Geometrik dönem çanak3.jpg'],
  'geometrik-donem-tabak': ['Geometrik dönem tabak.jpg', 'Geometrik dönem tabak1.jpg',
                            'Geometrik dönem tabak2.jpg', 'Geometrik dönem tabaki3.jpg'],
  'kylix-krater-can-krater': ['Kalyx Krater.jpg', 'Kalyx Krater1.jpg', 'Kalyx Krater3.jpg',
                              'Kalyx Krater4.jpg', 'kylix krater kolaj.jpg'],
  'volutlu-krater': ['Volütlü Krater.jpg', 'Volütlü Krater1.jpg', 'Volütlü Krater2.jpg',
                     'Volütlü Krater3.jpg', 'Volütlü Krater4.jpg', 'Volütlü Krater5.jpg',
                     'IMG_20201115_143541.jpg', 'IMG_20201115_143607.jpg',
                     'IMG_20201115_143618.jpg', 'IMG_20201115_143646.jpg',
                     'IMG_20201115_143650.jpg'],
}

const TMP = '/tmp/uart-optimized'
fs.mkdirSync(TMP, { recursive: true })

// Galeri için 2000px uzun kenar / q82 yeterli; orijinaller 3–6 MB.
function optimize(src, outName) {
  const out = path.join(TMP, outName)
  execFileSync('python3', ['-c', `
from PIL import Image, ImageOps
im = Image.open(${JSON.stringify(src)})
im = ImageOps.exif_transpose(im).convert('RGB')
im.thumbnail((2000, 2000), Image.LANCZOS)
im.save(${JSON.stringify(out)}, 'JPEG', quality=82, optimize=True, progressive=True)
`])
  return out
}

const products = await api('products?select=id,slug,title_tr,title_en')
const bySlug = Object.fromEntries(products.map(p => [p.slug, p]))

let totalImgs = 0, totalBytes = 0
for (const [slug, files] of Object.entries(GROUPS)) {
  const prod = bySlug[slug]
  if (!prod) { console.log(`! ürün bulunamadı: ${slug}`); continue }

  // idempotent: bu ürünün mevcut görsellerini temizle
  await api(`product_images?product_id=eq.${prod.id}`, { method: 'DELETE' })

  let order = 0
  for (const f of files) {
    const src = path.join(DIR, f)
    if (!fs.existsSync(src)) { console.log(`  ! dosya yok: ${f}`); continue }

    const outName = `${slug}-${order + 1}.jpg`
    const opt = optimize(src, outName)
    const buf = fs.readFileSync(opt)

    // Supabase Storage (public "eserler" bucket) — Vercel Blob bu projede
    // hiç provision edilmemişti (token "placeholder"), Supabase zaten hazır.
    const up = await fetch(
      `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/eserler/${encodeURIComponent(outName)}`,
      {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'true',
        },
        body: buf,
      }
    )
    if (!up.ok) throw new Error(`upload ${outName} → ${up.status} ${await up.text()}`)
    const blob = {
      url: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/eserler/${encodeURIComponent(outName)}`,
    }

    await api('product_images', {
      method: 'POST',
      body: JSON.stringify({
        product_id: prod.id,
        url: blob.url,
        alt_tr: `${prod.title_tr} — görsel ${order + 1}`,
        alt_en: `${prod.title_en} — image ${order + 1}`,
        sort_order: order,
      }),
    })
    order++
    totalBytes += buf.length
  }
  totalImgs += order
  console.log(`  ✓ ${prod.title_tr}: ${order} görsel`)
}
console.log(`\nToplam ${totalImgs} görsel yüklendi (${(totalBytes / 1024 / 1024).toFixed(1)} MB optimize edilmiş)`)
