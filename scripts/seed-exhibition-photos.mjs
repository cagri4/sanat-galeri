/**
 * Bozcaada 2010 sergi fotoğraflarını `exhibition_photos` tablosuna taşır.
 *
 * Fotoğraflar zaten Supabase Storage'da (`eserler/bozcaada-N.jpg`); burada
 * yalnızca kayıtları oluşturuyoruz. Alt yazılar: ilk üçü SANATÇININ KENDİ
 * metni (SANATCI-SITE-DUZENI.md), kalan 9'u BOŞ — uydurma yazılmadı,
 * sanatçıdan gelince panelden girilecek.
 *
 * Tek seferlik. Tekrar çalıştırılırsa mevcut kayıtları silip yeniden kurar.
 * Çalıştırma: node scripts/seed-exhibition-photos.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')])
)
const H = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}
const api = async (p, o = {}) => {
  const r = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${p}`, { headers: H, ...o })
  const t = await r.text()
  if (!r.ok) throw new Error(`${p} → ${r.status} ${t}`)
  return t ? JSON.parse(t) : null
}

const SLUG = 'bozcaada-2010'
const BUCKET = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/eserler`
const COUNT = 12
const ROMAN = ['I', 'II', 'III']

// Sanatçının kendi yazdığı üç yerleştirme açıklaması.
const CAPTIONS_TR = [
  'Volütlü kraterler, kyliksler ve geometrik dönem replikalarının birlikte sergilendiği bölüm.',
  'Antik kap formlarının farklı yüksekliklerde kaideler üzerinde sergilendiği görünüm.',
  'Günlük kullanım kapları ile figürlü kraterlerin bir arada sunulduğu bölüm.',
]
const CAPTIONS_EN = [
  'The section where volute kraters, kylikes and Geometric-period replicas are shown together.',
  'A view of ancient vessel forms displayed on pedestals of varying heights.',
  'The section presenting everyday vessels alongside figured kraters.',
]

await api(`exhibition_photos?exhibition_slug=eq.${SLUG}`, { method: 'DELETE' })

const rows = Array.from({ length: COUNT }, (_, i) => ({
  exhibition_slug: SLUG,
  url: `${BUCKET}/bozcaada-${i + 1}.jpg`,
  title_tr: `Sergi Yerleştirmesi ${i < 3 ? ROMAN[i] : i + 1}`,
  title_en: `Installation ${i < 3 ? ROMAN[i] : i + 1}`,
  caption_tr: CAPTIONS_TR[i] ?? null,
  caption_en: CAPTIONS_EN[i] ?? null,
  sort_order: i,
}))

const created = await api('exhibition_photos', { method: 'POST', body: JSON.stringify(rows) })
console.table(created.map(r => ({
  sira: r.sort_order,
  baslik: r.title_tr,
  aciklama: r.caption_tr ? r.caption_tr.slice(0, 45) + '…' : '(boş — sanatçıdan bekleniyor)',
})))
console.log(`\n${created.length} fotoğraf kaydı oluşturuldu.`)
