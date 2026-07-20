/**
 * Ana sayfa yerleşimlerinin ilk değerlerini yazar.
 *
 * Hero sırası ve Instagram seçimi eskiden kodda sabitti; artık
 * `products.hero_order` / `products.instagram_order` alanlarından okunuyor ve
 * /admin/ana-sayfa ekranından yönetiliyor. Bu script sitenin MEVCUT görünümünü
 * birebir korumak için o seçimi DB'ye taşır — tek seferlik.
 *
 * Çalıştırma: node scripts/seed-homepage-slots.mjs
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

// Cila turunda seçilen hero sırası (5 farklı seriden birer güçlü görsel).
const HERO = ['volutlu-krater', 'afrodit-ve-kaz', 'thetis', 'siren', 'geometrik-donem-tabak']

const products = await api('products?select=id,slug,is_visible,sort_order&order=sort_order,id')
const visible = products.filter(p => p.is_visible)

for (const p of products) {
  const heroIdx = HERO.indexOf(p.slug)
  const igIdx = visible.findIndex(v => v.id === p.id)
  await api(`products?id=eq.${p.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      hero_order: heroIdx === -1 ? null : heroIdx,
      instagram_order: igIdx === -1 || igIdx > 8 ? null : igIdx,
    }),
  })
}

const after = await api('products?select=slug,hero_order,instagram_order&order=hero_order.nullslast,instagram_order.nullslast')
console.table(after)
