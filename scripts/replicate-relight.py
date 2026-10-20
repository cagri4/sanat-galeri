#!/usr/bin/env python3
"""
Şeref panoları — IC-Light relight + Real-ESRGAN upscale TESTİ (Çağrı onayı 20 Eki, ~$0.20). Canlıya GİTMEZ.
Amaç: stüdyo ışığı hissi verirken gerçek sır RENGİ ve DOKUSU korunuyor mu? (öncesi/sonrası contact-sheet)

Fiyat (model sayfaları, 19 Eki): zsxkib/ic-light $0.000975/sn · nightmareai/real-esrgan $0.000225/sn.
Maliyet = Replicate'in döndürdüğü predict_time × saniye fiyatı (gerçek). Defter: ~/.config/replicate-harcama.json.
SINIRLAR: defter toplamı + en kötü (300 sn) > $4.00 ise başlamaz · bu test $0.40'ı geçerse durur · 300 sn'de iptal.

Kullanım: python3 scripts/replicate-relight.py <kare-klasörü> <çıktı-klasörü> <id> [id …]
"""
import json, os, sys, time, datetime, base64
from pathlib import Path
import requests

SRC, OUT, IDS = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3:]
OUT.mkdir(parents=True, exist_ok=True)
ENV = dict(l.split('=', 1) for l in Path('~/.config/replicate.env').expanduser().read_text().split() if '=' in l)
TOKEN = (ENV.get('REPLICATE_API_TOKEN') or ENV.get('REPLICATE_TOKEN')).strip().strip('"')
H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
DEFTER = Path('~/.config/replicate-harcama.json').expanduser()
LIMIT, TEST_LIMIT, KESIM = 4.00, 0.40, 300

ICL = ('zsxkib/ic-light', 'd41bcb10d8c159868f4cfbd7c6a2ca01484f7d39e4613419d5952c61562f1ba7', 0.000975)
ESR = ('nightmareai/real-esrgan', 'b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8', 0.000225)
PROMPT = 'glazed ceramic relief panel, professional product photography, soft diffused studio lighting, neutral light grey backdrop'

defter = json.loads(DEFTER.read_text()) if DEFTER.exists() else []
test_harcama = 0.0


def data_uri(p: Path):
    return 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode()


def run(model, inp, etiket):
    global test_harcama
    name, ver, rate = model
    en_kotu = KESIM * rate
    toplam = sum(r['maliyet_usd'] for r in defter)
    if toplam + en_kotu > LIMIT or test_harcama + en_kotu > TEST_LIMIT:
        sys.exit(f'DUR: sınır — defter {toplam:.3f}, test {test_harcama:.3f}, en kötü {en_kotu:.3f}')
    for _ in range(6):  # düşük bakiyeli hesapta dakikada sınırlı istek → 429'da bekle
        r = requests.post('https://api.replicate.com/v1/predictions', headers=H, json={'version': ver, 'input': inp}, timeout=60)
        if r.status_code != 429:
            break
        time.sleep(15)
    r.raise_for_status()
    p = r.json(); t0 = time.time()
    while p['status'] not in ('succeeded', 'failed', 'canceled'):
        time.sleep(3)
        if time.time() - t0 > KESIM:
            requests.post(p['urls']['cancel'], headers=H, timeout=30)
        p = requests.get(p['urls']['get'], headers=H, timeout=30).json()
    sn = (p.get('metrics') or {}).get('predict_time') or 0
    maliyet = round(sn * rate, 5)
    test_harcama += maliyet
    defter.append({'zaman': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'model': name, 'id': p['id'],
                   'durum': p['status'], 'metrics': p.get('metrics'), 'maliyet_usd': maliyet,
                   'maliyet_kaynagi': f'predict_time × ${rate}/sn (model sayfası)', 'not': f'Şeref relight testi {etiket}'})
    DEFTER.write_text(json.dumps(defter, ensure_ascii=False, indent=1))
    print(f'{etiket} {name} {p["status"]} {sn:.1f} sn ${maliyet:.4f}', flush=True)
    if p['status'] != 'succeeded':
        sys.exit(f'HATA: {p.get("error")}')
    o = p['output']
    return o[0] if isinstance(o, list) else o


for i in IDS:
    src = SRC / f'{i}.jpg'
    # IC-Light girişi 768×768 (model ızgarası), highres ×1.5 → 1152
    from PIL import Image
    small = OUT / f'{i}-giris.jpg'
    Image.open(src).convert('RGB').resize((768, 768), Image.LANCZOS).save(small, quality=92)
    rl = OUT / f'{i}-relight.png'
    if rl.exists():  # yeniden faturalama yok: önceki relight çıktısı kullanılır
        url = 'data:image/png;base64,' + base64.b64encode(rl.read_bytes()).decode()
    else:
        url = run(ICL, {'subject_image': data_uri(small), 'prompt': PROMPT, 'light_source': 'Top Light', 'width': 768, 'height': 768,
                        'output_format': 'png', 'seed': 7}, f'{i}/relight')
        rl.write_bytes(requests.get(url, timeout=120).content)
    if (OUT / f'{i}-relight-up.png').exists():
        continue
    url = run(ESR, {'image': url, 'scale': 2}, f'{i}/upscale')
    (OUT / f'{i}-relight-up.png').write_bytes(requests.get(url, timeout=120).content)

print(f'TEST TOPLAM ${test_harcama:.4f} · defter ${sum(r["maliyet_usd"] for r in defter):.4f}')
