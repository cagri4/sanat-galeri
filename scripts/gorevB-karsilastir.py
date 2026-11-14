#!/usr/bin/env python3
"""
Görev B (14 Kas) — Drive ↔ site karşılaştırması (YALNIZ RAPOR, hiçbir yere yazmaz).
Girdi: Görev A eşleşmesi (product_images.id → Drive dosyası), güncel DB dökümü, Drive indirmesi.
  python3 scripts/gorevB-karsilastir.py <drive> <eslesme-son.json> <products.json> <pi.json> <yeni-kareler.json> <cikti.json>
Çıktı: eser bazında Drive klasörü/dosya adındaki eser adı, sitedeki ad, görünür/gizli/Drive'sız sayıları,
Drive'da olup hiçbir site satırına eşleşmeyen dosyalar, hiçbir esere bağlanamayan Drive klasörleri.
"""
import json, sys, collections, re
from pathlib import Path
D = Path(sys.argv[1]); es = json.load(open(sys.argv[2])); pr = {p['id']: p for p in json.load(open(sys.argv[3]))}
pi = json.load(open(sys.argv[4])); yk = json.load(open(sys.argv[5])); OUT = sys.argv[6]
ATLA = ('.docx', '.doc', '.xlsx')
tum = sorted(str(p.relative_to(D)) for p in D.rglob('*') if p.is_file() and p.suffix.lower() not in ATLA)
pmap = {str(r['id']): r for r in pi}
eslesen = collections.defaultdict(list)  # drive dosyası → [pi id]
for k, v in es.items():
    if k in pmap and v.get('drive'):
        eslesen[v['drive']].append(int(k))
def eser_adi_dosyadan(f):
    a = Path(f).name; a = re.sub(r'\.(jpe?g|png|heic)$', '', a, flags=re.I)
    a = re.sub(r'^(Uarttasar[ıi]m|Uartasar[ıi]m|U-?art)\s*[_ ]*', '', a, flags=re.I)
    return re.split(r'[_]|\bby\b|\bceramic\b|\bseramik\b|\bterra\b', a, flags=re.I)[0].strip(' "-.')
urun = {}
for pid, p in pr.items():
    rows = [r for r in pi if r['product_id'] == pid]
    gor = [r for r in rows if r['is_visible']]
    dr = {r['id']: es.get(str(r['id']), {}).get('drive') for r in rows}
    klasor = collections.Counter('/'.join(f.split('/')[:-1]) for f in dr.values() if f)
    adlar = collections.Counter(eser_adi_dosyadan(f) for f in dr.values() if f)
    urun[pid] = {'slug': p['slug'], 'title_tr': p['title_tr'], 'title_en': p['title_en'], 'kategori': p['category'], 'urun_gorunur': p['is_visible'],
                 'gorunur': len(gor), 'gizli': len(rows) - len(gor),
                 'gorunur_drivesiz': [r['id'] for r in gor if not dr[r['id']]],
                 'gizli_driveli': [r['id'] for r in rows if not r['is_visible'] and dr[r['id']]],
                 'drive_klasor': [k for k, _ in klasor.most_common()], 'drive_dosya_eser_adi': [a for a, _ in adlar.most_common(4)]}
# Drive'da olup hiçbir site satırına eşleşmeyen dosyalar → ürün klasörüne göre
kl_urun = {}
for pid, u in urun.items():
    for k in u['drive_klasor'][:1]:
        kl_urun.setdefault(k, pid)
yk_by = {r['drive']: r for r in yk}
eslesmeyen = [f for f in tum if f not in eslesen]
bagsiz_klasor = collections.Counter()
for f in eslesmeyen:
    k = '/'.join(f.split('/')[:-1]); pid = kl_urun.get(k)
    if pid:
        urun[pid].setdefault('drive_eslesmeyen', []).append({'dosya': f, 'karar': yk_by.get(f, {}).get('karar', '?')})
    else:
        bagsiz_klasor[k] += 1
json.dump({'urun': urun, 'drive_dosya': len(tum), 'drive_eslesen': len(eslesen), 'drive_eslesmeyen': len(eslesmeyen),
           'esere_baglanamayan_klasorler': dict(bagsiz_klasor)}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('drive', len(tum), 'eşleşen', len(eslesen), 'eşleşmeyen', len(eslesmeyen))
for k, n in bagsiz_klasor.most_common(): print('  bağsız klasör', n, k)
