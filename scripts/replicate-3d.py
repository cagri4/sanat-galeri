#!/usr/bin/env python3
"""Replicate image-to-3D, SERT BÜTÇE SINIRLI (Çağrı: kredi 10 $, script 4 $'da durur).

Defter: ~/.config/replicate-harcama.json (tüm çalıştırmalar, tahmini + bildirilen maliyet).
Her çalıştırma BAŞLAMADAN: defterdeki toplam + EN KÖTÜ tahmin > LIMIT ise başlamaz.
Çalışırken 20 dk'yı aşarsa iptal eder.
Kullanım: [MODEL3D=hunyuan|rodin] python3 scripts/replicate-3d.py <girdi.png[,girdi2.png…]> <çıkış.glb> [face_count]
"""
import json, os, sys, time, urllib.request, urllib.error, base64, pathlib

LIMIT = 4.00
# Model sayfalarındaki fiyat (19 Eki 2026):
#   tencent/hunyuan-3d-3.1: "$0.50 per unit (20 units for $10)" — birim/çalıştırma yazmıyor
#   hyper3d/rodin (Gen-2):  "$0.40 per output (25 outputs for $10)"
MODELLER = {'hunyuan': ('tencent/hunyuan-3d-3.1', 0.50, 2), 'rodin': ('hyper3d/rodin', 0.40, 2)}
SECIM = os.environ.get('MODEL3D', 'hunyuan')
MODEL, UNIT_PRICE, WORST_UNITS = MODELLER[SECIM]   # WORST_UNITS: temkinli üst sınır
DEFTER = pathlib.Path.home() / '.config/replicate-harcama.json'

tok = next(l.split('=', 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / '.config/replicate.env') if l.startswith('REPLICATE_API_TOKEN'))
H = {'Authorization': f'Bearer {tok}', 'Content-Type': 'application/json'}
def api(method, url, body=None):
    r = urllib.request.Request(url, method=method, headers=H, data=json.dumps(body).encode() if body else None)
    try:
        with urllib.request.urlopen(r, timeout=120) as f: return json.load(f)
    except urllib.error.HTTPError as e:
        sys.exit(f'HTTP {e.code}: {e.read().decode()[:800]}')

defter = json.loads(DEFTER.read_text()) if DEFTER.exists() else []
harcanan = sum(d['maliyet_usd'] for d in defter)
en_kotu = WORST_UNITS * UNIT_PRICE
if harcanan + en_kotu > LIMIT:
    sys.exit(f'DUR: defterde {harcanan:.2f} $ + en kötü {en_kotu:.2f} $ > {LIMIT} $ sınırı')

girdi, cikis = sys.argv[1], sys.argv[2]
faces = int(sys.argv[3]) if len(sys.argv) > 3 else 150000
uris = ['data:image/png;base64,' + base64.b64encode(open(g, 'rb').read()).decode() for g in girdi.split(',')]
if SECIM == 'rodin':
    inp = {'images': uris[:5], 'prompt': os.environ.get('PROMPT3D', 'A handmade ceramic sculpture'), 'tier': 'Gen-2', 'quality': 'medium', 'material': 'PBR', 'mesh_mode': 'Raw',
           'geometry_file_format': 'glb', 'use_original_alpha': True, 'seed': 42}
else:
    inp = {'image': uris[0], 'generate_type': 'Normal', 'enable_pbr': False, 'face_count': faces}
p = api('POST', f'https://api.replicate.com/v1/models/{MODEL}/predictions', {'input': inp})
print('tahmin', p['id'], p['status'], flush=True)
t0 = time.time()
while p['status'] not in ('succeeded', 'failed', 'canceled'):
    if time.time() - t0 > 1200:
        api('POST', p['urls']['cancel']); sys.exit('DUR: 20 dk aşıldı, iptal edildi')
    time.sleep(5); p = api('GET', p['urls']['get'])
print('durum', p['status'], 'metrics', p.get('metrics'), flush=True)
# Maliyet: Replicate yanıtı birim sayısını veriyorsa onu, yoksa en kötü tahmini deftere yaz
m = p.get('metrics') or {}
birim = m.get('unit_count') or m.get('output_count') or m.get('generic_output_count')
maliyet = (birim * UNIT_PRICE) if birim else en_kotu   # başarısız da faturalanmış olabilir
defter.append({'zaman': time.strftime('%F %T'), 'model': MODEL, 'id': p['id'], 'durum': p['status'],
               'metrics': m, 'maliyet_usd': maliyet, 'maliyet_kaynagi': 'metrics' if birim else 'en-kotu-tahmin'})
DEFTER.write_text(json.dumps(defter, ensure_ascii=False, indent=1))
print(f'deftere yazıldı: {maliyet:.2f} $ (toplam {sum(d["maliyet_usd"] for d in defter):.2f} $)')
if p['status'] != 'succeeded': sys.exit(p.get('error'))
out = p['output'] if isinstance(p['output'], str) else p['output'][0] if isinstance(p['output'], list) else p['output']
print('çıktı', out)
urllib.request.urlretrieve(out, cikis)
print('kaydedildi', cikis, os.path.getsize(cikis))
