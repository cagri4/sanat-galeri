// Katalog alanlarını (Kap Formu / Dönemi / Mitolojik Konu) doldurur ve
// açıklamaların başındaki tekrar eden künye satırını temizler.
// Tüm değerler sanatçının kendi metninden (Drive: "Replikalar hakkında.docx").
// Metinde geçmeyen alan NULL bırakılır — tahmin edilmez.
import fs from 'node:fs'

const env = Object.fromEntries(
  fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
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

const N = null
const CATALOG = {
  'afrodit-ve-kaz': {
    form_tr: 'Kylix', form_en: 'Kylix',
    period_tr: 'MÖ 5. yüzyıl (özgün örnek: MÖ 460–450)', period_en: '5th century BC (original: 460–450 BC)',
    subject_tr: "Afrodit'in kutsal hayvanı olan kaz ile betimlenişi.", subject_en: 'Aphrodite depicted with the goose, her sacred animal.',
    medium_tr: 'Terra sigillata — Attika beyaz zemin (white ground)', medium_en: 'Terra sigillata — Attic white ground',
  },
  'europa': {
    form_tr: N, form_en: N, period_tr: N, period_en: N,
    subject_tr: "Europa'nın Zeus tarafından boğa kılığında kaçırılışı.", subject_en: 'The abduction of Europa by Zeus in the form of a bull.',
    medium_tr: 'Terra sigillata — kırmızı figürlü Attika geleneği', medium_en: 'Terra sigillata — Attic red-figure tradition',
  },
  'menad': {
    form_tr: N, form_en: N, period_tr: N, period_en: N,
    subject_tr: "Dionysos'un kadın takipçisi Mainad; thyrsos, nebris ve panter ile.", subject_en: 'A Maenad, female follower of Dionysos, with thyrsos, nebris and panther.',
    medium_tr: 'Terra sigillata — Attika kırmızı figür üslubu', medium_en: 'Terra sigillata — Attic red-figure style',
  },
  'thetis': {
    form_tr: N, form_en: N,
    period_tr: 'Geç Arkaik – Erken Klasik dönem esinli', period_en: 'Inspired by the Late Archaic – Early Classical period',
    subject_tr: "Nereid Thetis, balıklarla birlikte; Akhilleus'un annesi.", subject_en: 'The Nereid Thetis with fish; the mother of Achilles.',
    medium_tr: 'Terra sigillata — kırmızı zemin üzerine beyaz figür', medium_en: 'Terra sigillata — white figure on red ground',
  },
  'siren': {
    form_tr: N, form_en: N,
    period_tr: 'Geç Klasik – Helenistik dönem esinli', period_en: 'Inspired by the Late Classical – Hellenistic period',
    subject_tr: 'Kadın başlı, kuş gövdeli Siren; ölüm ve ruhun yolculuğu ile ilişkilendirilir.', subject_en: 'A Siren with a woman\'s head and bird\'s body, associated with death and the journey of the soul.',
    medium_tr: 'Terra sigillata', medium_en: 'Terra sigillata',
  },
  'aulos-calan-menad-kylix': {
    form_tr: 'Kylix (tondo kompozisyonu)', form_en: 'Kylix (tondo composition)',
    period_tr: N, period_en: N,
    subject_tr: 'Aulos çalan Mainad ya da kadın müzisyen (auletris); Dionysos alayı.', subject_en: 'A Maenad or female musician (auletris) playing the aulos; the Dionysian procession.',
    medium_tr: 'Terra sigillata — kırmızı figür kylix tondosu', medium_en: 'Terra sigillata — red-figure kylix tondo',
  },
  'geometrik-donem-toren-kabi': {
    form_tr: 'Tören kabı', form_en: 'Ceremonial vessel',
    period_tr: 'Geç Geometrik Dönem (yaklaşık MÖ 760–700)', period_en: 'Late Geometric (c. 760–700 BC)',
    subject_tr: 'Figürsüz; güneş rozeti, radyal şeritler ve su kuşu frizi.', subject_en: 'Non-figural; sun rosette, radial bands and a water-bird frieze.',
    medium_tr: 'Terra sigillata', medium_en: 'Terra sigillata',
  },
  'geometrik-donem-tabak': {
    form_tr: 'Tabak', form_en: 'Plate',
    period_tr: 'Geometrik Dönem (MÖ 900–700)', period_en: 'Geometric Period (900–700 BC)',
    subject_tr: 'Figürsüz; güneş rozeti ve geometrik motif repertuarı.', subject_en: 'Non-figural; sun rosette and the geometric motif repertoire.',
    medium_tr: 'Terra sigillata', medium_en: 'Terra sigillata',
  },
  'kylix-krater-can-krater': {
    form_tr: 'Çan Krater', form_en: 'Bell Krater',
    period_tr: 'Özgün örnek: Attika siyah figür, yaklaşık MÖ 550–520', period_en: 'Original: Attic black figure, c. 550–520 BC',
    subject_tr: 'İki hoplit arasında hakem/otorite figürü; olası Herakles ve Zeus.', subject_en: 'A figure of arbitration between two hoplites; possibly Herakles and Zeus.',
    medium_tr: 'Terra sigillata — siyah figür', medium_en: 'Terra sigillata — black figure',
  },
  'volutlu-krater': {
    form_tr: 'Volütlü Krater', form_en: 'Volute Krater',
    period_tr: N, period_en: N,
    subject_tr: 'A yüzü: ritüel alayı (olası Eleusis Gizemleri / Demeter–Persephone). B yüzü: olası Delos Üçlüsü (Leto–Apollon–Artemis) ya da Demeter ve Triptolemos.',
    subject_en: 'Side A: a ritual procession (possibly the Eleusinian Mysteries / Demeter–Persephone). Side B: possibly the Delian Triad (Leto–Apollo–Artemis) or Demeter and Triptolemos.',
    medium_tr: 'Terra sigillata — kırmızı figür yorumu', medium_en: 'Terra sigillata — an interpretation of red figure',
  },
}

// Açıklamanın ilk paragrafı künye tekrarıysa (artık ayrı alanlarda) kaldır.
const HEAD = /^(Kap formu|Teknik|Dönemi|Vessel form|Technique|Period)\s*:/i
const stripHead = (d) => {
  if (!d) return d
  const parts = d.split('\n\n')
  return HEAD.test(parts[0].trim()) ? parts.slice(1).join('\n\n') : d
}

const rows = await api('products?select=id,slug,description_tr,description_en')
let n = 0
for (const r of rows) {
  const cat = CATALOG[r.slug]
  if (!cat) { console.log(`  ! katalog verisi yok: ${r.slug}`); continue }
  await api(`products?id=eq.${r.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...cat,
      description_tr: stripHead(r.description_tr),
      description_en: stripHead(r.description_en),
    }),
  })
  n++
  console.log(`  ✓ ${r.slug}  form=${cat.form_tr ?? '—'}  dönem=${cat.period_tr ?? '—'}`)
}
console.log(`\n${n} eserin katalog alanları dolduruldu.`)
