#!/usr/bin/env python3
"""
Şeref panoları — RENK-KORUYAN netlik/detay kıyası (Çağrı onayı 20 Eki, ~$0.20). RELIGHT YOK. Canlıya GİTMEZ.
Hedef: düşük çözünürlük → net (Instagram etkisi), ama orijinal sır rengi korunsun (ΔE < 5).

Canlı fiyat + ayar (model sayfaları / API şeması, 20 Eki):
  philz1337x/clarity-upscaler  $0.00115/sn  creativity 0.35→0.1 + adım 18→40 (0.05×18<1 adım → model içi hata), resemblance 0.6→1.5, dynamic 6→3, nötr prompt
  cjwbw/supir-v0q              $0.000975/sn color_fix_type=Wavelet, s_cfg 7.5→4, renk/kontrast prompt'u çıkarıldı, 30 adım
  sczhou/codeformer            $0.000975/sn codeformer_fidelity 1.0 (en sadık), background_enhance (yüz yok → Real-ESRGAN arka plan)
  tencentarc/gfpgan            $0.000975/sn v1.4 (yüz yok → Real-ESRGAN arka plan)
  nightmareai/real-esrgan      $0.000225/sn referans (en sadık)
Hepsi ×2. Maliyet = predict_time × saniye fiyatı. Defter ~/.config/replicate-harcama.json.
SINIR: defter + en kötü > $4.00 başlamaz · test $0.45'i geçemez · modele göre zaman kesimi (iptal).

Kullanım: python3 scripts/replicate-netlik.py <giriş-klasörü (id-giris.jpg)> <çıktı-klasörü> <id> …
"""
import json, sys, time, datetime, base64
from pathlib import Path
import requests

SRC, OUT, IDS = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3:]
OUT.mkdir(parents=True, exist_ok=True)
TOKEN = dict(l.split('=', 1) for l in Path('~/.config/replicate.env').expanduser().read_text().split() if '=' in l)['REPLICATE_API_TOKEN'].strip('"')
H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
DEFTER = Path('~/.config/replicate-harcama.json').expanduser()
LIMIT, TEST_LIMIT = 4.00, 0.45
NOTR = 'glazed ceramic relief panel, sharp focus, natural colors'

MODELLER = {  # anahtar: (model, sürüm, $/sn, kesim sn, giriş üreteci)
    'esrgan': ('nightmareai/real-esrgan', 'b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8', 0.000225, 60,
               lambda u: {'image': u, 'scale': 2}),
    'gfpgan': ('tencentarc/gfpgan', '0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c', 0.000975, 60,
               lambda u: {'img': u, 'scale': 2, 'version': 'v1.4'}),
    'codeformer': ('sczhou/codeformer', 'cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2', 0.000975, 60,
                   lambda u: {'image': u, 'upscale': 2, 'face_upsample': False, 'background_enhance': True, 'codeformer_fidelity': 1.0}),
    'clarity': ('philz1337x/clarity-upscaler', 'dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e', 0.00115, 90,
                lambda u: {'image': u, 'prompt': NOTR, 'creativity': 0.1, 'num_inference_steps': 40, 'resemblance': 1.5, 'dynamic': 3,
                           'scale_factor': 2, 'sharpen': 0, 'seed': 1337, 'output_format': 'png'}),
    'supir': ('cjwbw/supir-v0q', 'ede69f6a5ae7d09f769d683347325b08d2f83a93d136ed89747941205e0a71da', 0.000975, 120,
              lambda u: {'image': u, 'upscale': 2, 'min_size': 1024, 'color_fix_type': 'Wavelet', 's_cfg': 4, 'edm_steps': 30,
                         'a_prompt': NOTR + ', highly detailed photo', 'seed': 7}),
}

defter = json.loads(DEFTER.read_text()) if DEFTER.exists() else []
test = 0.0


def run(key, inp, etiket):
    global test
    name, ver, rate, kesim, _ = MODELLER[key]
    en_kotu = kesim * rate
    if sum(r['maliyet_usd'] for r in defter) + en_kotu > LIMIT or test + en_kotu > TEST_LIMIT:
        sys.exit(f'DUR: sınır — test {test:.3f} + en kötü {en_kotu:.3f}')
    for _ in range(8):
        r = requests.post('https://api.replicate.com/v1/predictions', headers=H, json={'version': ver, 'input': inp}, timeout=60)
        if r.status_code != 429:
            break
        time.sleep(15)
    r.raise_for_status()
    p = r.json(); t0 = time.time()
    while p['status'] not in ('succeeded', 'failed', 'canceled'):
        time.sleep(3)
        if time.time() - t0 > kesim + 240:  # kuyruk/soğuk açılış payı; faturalanan predict_time
            requests.post(p['urls']['cancel'], headers=H, timeout=30)
        p = requests.get(p['urls']['get'], headers=H, timeout=30).json()
        if p['status'] == 'processing' and (p.get('metrics') or {}).get('predict_time', 0) > kesim:
            requests.post(p['urls']['cancel'], headers=H, timeout=30)
    sn = (p.get('metrics') or {}).get('predict_time') or 0
    maliyet = round(sn * rate, 5)
    test += maliyet
    defter.append({'zaman': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'model': name, 'id': p['id'], 'durum': p['status'],
                   'metrics': p.get('metrics'), 'maliyet_usd': maliyet, 'maliyet_kaynagi': f'predict_time × ${rate}/sn (model sayfası)',
                   'not': f'Şeref netlik kıyası {etiket}'})
    DEFTER.write_text(json.dumps(defter, ensure_ascii=False, indent=1))
    print(f'{etiket} {p["status"]} {sn:.1f} sn ${maliyet:.4f}', flush=True)
    if p['status'] != 'succeeded':
        print('   hata:', p.get('error')); return None
    o = p['output']
    return o[0] if isinstance(o, list) else o


for key in MODELLER:
    for i in IDS:
        out = OUT / f'{i}-{key}.png'
        if out.exists():
            continue  # yeniden faturalama yok
        src = SRC / f'{i}-giris.jpg'
        u = 'data:image/jpeg;base64,' + base64.b64encode(src.read_bytes()).decode()
        if key == 'clarity':  # clarity data URI'de içeriden hata veriyor ('h' referenced before assignment) → aynı 768 kare, URL ile
            u = f'https://res.cloudinary.com/df0henatz/image/upload/c_scale,w_768,q_95/uarttasarim/seref-studio/{i}.jpg'
        url = run(key, MODELLER[key][4](u), f'{i}/{key}')
        if url:
            out.write_bytes(requests.get(url, timeout=180).content)

print(f'TEST TOPLAM ${test:.4f}')
