// Sanatcinin kendi dokumanina gore duzeltmeler (SANATCI-SITE-DUZENI.md).
// - Isimler: "Mainad" dogru yazim, "Can Krater" ayri form.
// - Siralama: sanatcinin verdigi eser sirasi.
// - UYDURMA biyografiler kaldirilir (dokumanda biyografi YOK, o yuzden
//   yer tutucu metin de yazilmaz — alan bos birakilir, bolum gizlenir).
import fs from 'node:fs'
import path from 'node:path'
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

// --- 1. Isim duzeltmeleri -----------------------------------------------
const RENAMES = [
  {
    slug: 'menad',
    patch: { slug: 'mainad', title_tr: 'Mainad', title_en: 'Maenad' },
    not: '"menead" dosya adiydi; sanatcinin yazimi "Mainad"',
  },
  {
    slug: 'kalyx-krater',
    // Sanatcinin listesi "Can Krater" diyor ve bunu ayri form olarak sayiyor.
    // (Fotograftaki form gorsel olarak calyx kratere benziyordu; sanatcinin
    // kendi adlandirmasi esas alindi — Cagri'nin talimati.)
    patch: {
      slug: 'can-krater',
      title_tr: 'Çan Krater',
      title_en: 'Bell Krater',
      form_tr: 'Çan Krater',
      form_en: 'Bell Krater',
    },
    not: 'sanatcinin listesine gore',
  },
]
for (const r of RENAMES) {
  const found = await api(`products?slug=eq.${r.slug}&select=id`)
  if (!found.length) { console.log(`  - atlandi (bulunamadi): ${r.slug}`); continue }
  await api(`products?slug=eq.${r.slug}`, { method: 'PATCH', body: JSON.stringify(r.patch) })
  console.log(`  ✓ ${r.slug} → ${r.patch.slug}  (${r.not})`)
}

// --- 2. Sanatcinin verdigi sira -----------------------------------------
const ORDER = [
  'afrodit-ve-kaz',
  'europa',
  'mainad',
  'thetis',
  'siren',
  'geometrik-donem-tabak',
  'geometrik-donem-toren-kabi', // listede acik gecmiyor, geometrik grupla birlikte
  'volutlu-krater',
  'can-krater',
  'aulos-calan-menad-kylix',    // "Kyliksler" — fotograf bekliyor, gizli
]
for (const [i, slug] of ORDER.entries()) {
  await api(`products?slug=eq.${slug}`, { method: 'PATCH', body: JSON.stringify({ sort_order: i }) })
}
console.log(`\n  ✓ ${ORDER.length} eser sanatcinin sirasina gore siralandi`)

// --- 3. Uydurma biyografileri kaldir ------------------------------------
// Sanatcinin dokumaninda biyografi YOK. Farazi metin yerine BOS birakiliyor;
// artist sayfasindaki "Hakkinda" bolumu bos bio'da zaten gizleniyor.
await api('artists?slug=in.(melike,seref)', {
  method: 'PATCH',
  body: JSON.stringify({ bio_tr: null, bio_en: null }),
})
console.log('  ✓ TASLAK biyografiler kaldirildi (gercek metin gelene kadar bolum gizli)')

const rows = await api('products?select=slug,title_tr,sort_order,is_visible&order=sort_order')
console.log('\nSon durum:')
for (const p of rows) {
  console.log(`  ${String(p.sort_order).padStart(2)}. ${p.title_tr}${p.is_visible ? '' : '  [GIZLI]'}`)
}
