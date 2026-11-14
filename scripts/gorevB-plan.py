#!/usr/bin/env python3
"""
Görev B (14 Kas) — Drive senkron PLANI (yazmaz). Kural (Çağrı onayına sunulur):
 sitede görünen ama Drive'da karşılığı olmayan kare → aynı eserin Drive'da olup sitede gizli duran karesiyle
 (önce ablanın 3 yeni karesi, sonra sort_order sırası) AYNI SIRADA yer değiştirir. Görünür sayı değişmez.
 Yerine konacak Drive karesi yoksa Drive'sız kare yerinde kalır (raporda ayrıca listelenir).
  python3 scripts/gorevB-plan.py <eslesme-son.json> <products.json> <pi.json> <cikti.json>
"""
import json, sys
es = json.load(open(sys.argv[1])); pr = json.load(open(sys.argv[2])); pi = json.load(open(sys.argv[3]))
YENI = {690, 691, 692}
drive = lambda r: (es.get(str(r['id'])) or {}).get('drive') or ('YENI:%d' % r['id'] if r['id'] in YENI else None)
plan = []
for p in sorted(pr, key=lambda p: (p['category'], p['sort_order'] or 0, p['slug'])):
    if not p['is_visible']: continue
    rows = sorted((r for r in pi if r['product_id'] == p['id']), key=lambda r: (r['sort_order'] or 0, r['id']))
    gor = [r for r in rows if r['is_visible']]
    kullanilan = {drive(r) for r in gor if drive(r)}
    havuz, gorulen = [], set(kullanilan)
    for r in sorted((r for r in rows if not r['is_visible'] and drive(r)), key=lambda r: (r['id'] not in YENI, r['sort_order'] or 0, r['id'])):
        if drive(r) in gorulen: continue
        gorulen.add(drive(r)); havuz.append(r)
    cik = [r for r in gor if not drive(r)]
    takas = list(zip(cik, havuz))
    sonra = []
    tk = {a['id']: b for a, b in takas}
    for r in gor:
        b = tk.get(r['id'])
        sonra.append({**b, 'sort_order': r['sort_order']} if b else r)
    plan.append({'urun_id': p['id'], 'slug': p['slug'], 'title_tr': p['title_tr'], 'kategori': p['category'],
                 'once': [{'id': r['id'], 'url': r['url'], 'drive': drive(r)} for r in gor],
                 'sonra': [{'id': r['id'], 'url': r['url'], 'drive': drive(r)} for r in sonra],
                 'takas': [{'cikan': a['id'], 'giren': b['id'], 'sort_order': a['sort_order']} for a, b in takas],
                 'drivesiz_kalan': [r['id'] for r in cik[len(takas):]],
                 'drive_gizli_kalan': len(havuz) - len(takas)})
json.dump(plan, open(sys.argv[4], 'w'), ensure_ascii=False, indent=1)
deg = [x for x in plan if x['takas']]
print('eser', len(plan), 'değişen eser', len(deg), 'takas', sum(len(x['takas']) for x in plan),
      'drive\'sız kalan', sum(len(x['drivesiz_kalan']) for x in plan), 'drive\'da olup gizli kalan', sum(x['drive_gizli_kalan'] for x in plan))
for x in plan:
    if x['takas'] or x['drivesiz_kalan'] or x['drive_gizli_kalan']:
        print(f"  {x['slug'][:32]:32} takas {len(x['takas'])}  drivesiz_kalan {len(x['drivesiz_kalan'])}  gizli_kalan {x['drive_gizli_kalan']}")
