#!/usr/bin/env python3
"""
Anka V — tek gerçek fotoğraftan image-to-3D (Çağrı onayı 20 Eki, en kötü ~$0.71). Canlıya GİTMEZ; Çağrı modeli seçer.
Giriş: arsiv/anka-3d-kaynak/anka-v-giris-kirpik.jpg (anka-v-gercek-foto.jpg, çatalın üstünden kırpılmış).

Canlı fiyat (model sayfaları, 19 Eki): firtoz/trellis $0.0014/sn (~$0.031) · tencent/hunyuan3d-2 $0.000975/sn (~$0.097).
Maliyet = predict_time × saniye fiyatı. Defter ~/.config/replicate-harcama.json.
SINIR: defter + en kötü > $4.00 başlamaz · iş başına 300 sn işlem süresinde iptal (en kötü: 0.42 + 0.29 = $0.71).

Kullanım: python3 scripts/replicate-anka-i23d.py <çıktı-klasörü> [trellis] [hunyuan]
"""
import json, sys, time, datetime, base64
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parent.parent
GIRIS = ROOT / 'arsiv/anka-3d-kaynak/anka-v-giris-kirpik.jpg'
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
SECIM = sys.argv[2:] or ['trellis', 'hunyuan']
TOKEN = dict(l.split('=', 1) for l in Path('~/.config/replicate.env').expanduser().read_text().split() if '=' in l)['REPLICATE_API_TOKEN'].strip('"')
H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
DEFTER = Path('~/.config/replicate-harcama.json').expanduser()
LIMIT, KESIM = 4.00, 300
URI = 'data:image/jpeg;base64,' + base64.b64encode(GIRIS.read_bytes()).decode()

MODELLER = {
    'trellis': ('firtoz/trellis', 'e8f6c4520699', 0.0014,
                {'images': [URI], 'generate_model': True, 'generate_color': False, 'texture_size': 2048, 'mesh_simplify': 0.9,
                 'return_no_background': True, 'seed': 1, 'randomize_seed': False}),
    'hunyuan': ('tencent/hunyuan3d-2', 'b1b9449a1277', 0.000975,
                {'image': URI, 'remove_background': True, 'steps': 50, 'guidance_scale': 5.5, 'octree_resolution': 256, 'seed': 1234}),
}

defter = json.loads(DEFTER.read_text()) if DEFTER.exists() else []


def tam_surum(name, kisa):
    r = requests.get(f'https://api.replicate.com/v1/models/{name}', headers=H, timeout=30).json()
    v = r['latest_version']['id']
    assert v.startswith(kisa), f'{name} sürümü değişmiş: {v}'
    return v


for key in SECIM:
    name, kisa, rate, inp = MODELLER[key]
    en_kotu = KESIM * rate
    if sum(r['maliyet_usd'] for r in defter) + en_kotu > LIMIT:
        sys.exit(f'DUR: defter + en kötü {en_kotu:.2f} > {LIMIT}')
    ver = tam_surum(name, kisa)
    for _ in range(8):
        r = requests.post('https://api.replicate.com/v1/predictions', headers=H, json={'version': ver, 'input': inp}, timeout=60)
        if r.status_code != 429:
            break
        time.sleep(15)
    r.raise_for_status()
    p = r.json(); t0 = time.time()
    print(key, 'başladı', p['id'], flush=True)
    while p['status'] not in ('succeeded', 'failed', 'canceled'):
        time.sleep(5)
        p = requests.get(p['urls']['get'], headers=H, timeout=30).json()
        started = p.get('started_at')
        if p['status'] == 'processing' and time.time() - t0 > KESIM + 60 and started:
            # işlem süresi KESIM'i geçtiyse iptal (kuyruk/soğuk açılış faturalanmaz)
            from datetime import timezone
            t_start = datetime.datetime.fromisoformat(started.replace('Z', '+00:00'))
            if (datetime.datetime.now(timezone.utc) - t_start).total_seconds() > KESIM:
                requests.post(p['urls']['cancel'], headers=H, timeout=30)
        if time.time() - t0 > 1800:
            requests.post(p['urls']['cancel'], headers=H, timeout=30)
    sn = (p.get('metrics') or {}).get('predict_time') or 0
    maliyet = round(sn * rate, 5)
    defter.append({'zaman': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'model': name, 'id': p['id'], 'durum': p['status'],
                   'metrics': p.get('metrics'), 'maliyet_usd': maliyet, 'maliyet_kaynagi': f'predict_time × ${rate}/sn (model sayfası)',
                   'not': 'Anka V image-to-3D (tek foto)'})
    DEFTER.write_text(json.dumps(defter, ensure_ascii=False, indent=1))
    print(f'{key} {p["status"]} {sn:.1f} sn ${maliyet:.4f}', flush=True)
    if p['status'] != 'succeeded':
        print('   hata:', (p.get('error') or '')[:300]); continue
    o = p['output']
    (OUT / f'{key}-output.json').write_text(json.dumps(o, indent=1))
    glb = o.get('model_file') if key == 'trellis' else o.get('mesh')
    (OUT / f'anka-v-{key}.glb').write_bytes(requests.get(glb, timeout=300).content)
    for k, u in enumerate((o.get('no_background_images') or []) if isinstance(o, dict) else []):
        (OUT / f'{key}-arkaplansiz-{k}.png').write_bytes(requests.get(u, timeout=120).content)

print('defter toplam', round(sum(r['maliyet_usd'] for r in defter), 4))
