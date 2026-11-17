#!/usr/bin/env python3
"""18 Kas planının yeni karelerini Cloudinary'ye yükler (yukle.json; g18-plan.py üretir). ÇAĞRI ONAYINDAN SONRA çalıştırılır,
SQL'den ÖNCE. Kareler site tarafından kullanılmaz; SQL uygulanana dek görünmez.
  python3 scripts/g18-yukle.py <scratch-dir>
Geri alma: yüklenen public_id'ler çıktıda; Cloudinary'den silinmeleri gerekmez (referanssız kalır)."""
import hashlib, json, sys, time
from pathlib import Path
import requests
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parent.parent; S = Path(sys.argv[1])
ENV = {}
for l in (ROOT / '.env.local').read_text().splitlines():
    if '=' in l and not l.lstrip().startswith('#'):
        k, v = l.split('=', 1); ENV.setdefault(k, v.strip().strip('"'))
TMP = ROOT / 'arsiv/g18-yeni'; TMP.mkdir(parents=True, exist_ok=True)
for y in json.load(open(S / 'yukle.json')):
    if requests.head(y['url'], timeout=60).status_code == 200: print('zaten var', y['url']); continue
    im = ImageOps.exif_transpose(Image.open(S / 'drive' / y['drive'])).convert('RGB'); im.thumbnail((2560, 2560), Image.LANCZOS)
    f = TMP / f"{y['ad']}.jpg"; im.save(f, 'JPEG', quality=88, optimize=True)
    p = {'public_id': f"uarttasarim/eser/{y['ad']}", 'timestamp': int(time.time()), 'overwrite': 'false'}
    p['signature'] = hashlib.sha1(('&'.join(f'{k}={p[k]}' for k in sorted(p)) + ENV['CLOUDINARY_API_SECRET']).encode()).hexdigest()
    p['api_key'] = ENV['CLOUDINARY_API_KEY']
    r = requests.post(f"https://api.cloudinary.com/v1_1/{ENV['CLOUDINARY_CLOUD_NAME']}/image/upload", data=p, files={'file': open(f, 'rb')}, timeout=180)
    r.raise_for_status()
    assert requests.head(y['url'], timeout=60).status_code == 200, y['url']
    print('yüklendi', y['url'])
print('tamam — şimdi SQL uygulanabilir')
