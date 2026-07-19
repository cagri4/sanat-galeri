// Sanatçı bilgileri + GEÇİCİ eser ataması.
// Atama kuralı (Çağrı, 2026-07-19): kap/vazo formundaki eserler -> Şeref,
// figürlü mitolojik replikalar -> Melike. Sanatçılardan geri dönüş gelince
// düzeltilecek — bu atama PROVISIONAL.
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

const DRAFT_TR = '⚠️ TASLAK — bu metin farazi bir yer tutucudur, sanatçının onayıyla değiştirilecektir.'
const DRAFT_EN = '⚠️ DRAFT — this text is a hypothetical placeholder, to be replaced with the artist\'s own words.'

// Soyad "Doğan" Çağrı tarafından doğrulandı. E-posta HÂLÂ verilmedi -> null.
const ARTISTS = {
  melike: {
    name_tr: 'Melike Doğan', name_en: 'Melike Doğan',
    bio_tr: `${DRAFT_TR}\n\nSeramik ve pişmiş toprak üzerine çalışan bir sanatçı. Antik Yunan seramiğinin figürlü anlatım geleneğini terra sigillata tekniğiyle yeniden ele alıyor; mitolojik sahnelerin ikonografisini ve figür-yüzey ilişkisini araştırıyor.\n\n(Gerçek biyografi, eğitim ve sergi bilgileri sanatçıdan alınacaktır.)`,
    bio_en: `${DRAFT_EN}\n\nAn artist working in ceramics and fired clay, revisiting the figural narrative tradition of Ancient Greek pottery through the terra sigillata technique, and exploring the iconography of mythological scenes and the relationship between figure and surface.\n\n(Actual biography, education and exhibition history to be supplied by the artist.)`,
  },
  seref: {
    name_tr: 'Şeref Doğan', name_en: 'Şeref Doğan',
    bio_tr: `${DRAFT_TR}\n\nSeramik alanında üreten bir sanatçı. Antik kap formlarının oran, hacim ve yüzey ilişkisi üzerine çalışıyor; tornada şekillendirilen formları terra sigillata astarı ve elle işlenen bezemelerle tamamlıyor.\n\n(Gerçek biyografi, eğitim ve sergi bilgileri sanatçıdan alınacaktır.)`,
    bio_en: `${DRAFT_EN}\n\nAn artist producing in ceramics, working on the proportion, volume and surface of ancient vessel forms, completing wheel-thrown shapes with terra sigillata slip and hand-worked ornament.\n\n(Actual biography, education and exhibition history to be supplied by the artist.)`,
  },
}

for (const [slug, data] of Object.entries(ARTISTS)) {
  await api(`artists?slug=eq.${slug}`, { method: 'PATCH', body: JSON.stringify({ ...data, email: null }) })
  console.log(`✓ ${data.name_tr}`)
}

const ids = Object.fromEntries(
  (await api('artists?select=id,slug')).map(a => [a.slug, a.id])
)

// GEÇİCİ atama — kap/vazo formu -> Şeref, figürlü mitolojik -> Melike
const ASSIGN = {
  seref: ['afrodit-ve-kaz', 'aulos-calan-menad-kylix', 'geometrik-donem-toren-kabi',
          'geometrik-donem-tabak', 'kylix-krater-can-krater', 'volutlu-krater'],
  melike: ['europa', 'menad', 'thetis', 'siren'],
}

for (const [artist, slugs] of Object.entries(ASSIGN)) {
  for (const s of slugs) {
    await api(`products?slug=eq.${s}`, { method: 'PATCH', body: JSON.stringify({ artist_id: ids[artist] }) })
  }
  console.log(`✓ ${artist}: ${slugs.length} eser atandı (GEÇİCİ)`)
}

// Fotoğrafı olmayan eser demoda gizli — içerik uydurmak yerine gizliyoruz.
await api('products?slug=eq.aulos-calan-menad-kylix', {
  method: 'PATCH', body: JSON.stringify({ is_visible: false }),
})
console.log('\n! "Aulos Çalan Menad — Kylix" gizlendi: Drive\'da bu esere ait fotoğraf yok.')
