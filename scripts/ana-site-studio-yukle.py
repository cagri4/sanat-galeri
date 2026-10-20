#!/usr/bin/env python3
"""
Ana site stüdyo kareleri → Cloudinary (uarttasarim/studio/<id>.jpg) + product_images.studio_url SQL'i.
scripts/ana-site-studio.py çıktısını alır. Orijinal url'ye DOKUNMAZ. Kod studio_url'yi yalnız UART_STUDIO_FOTO=1 iken gösterir.

SQL ÜRETİR, UYGULAMAZ: scripts/sql/2026-10-20-studio-url.sql + -GERI-AL.sql
Hariç tutulacak id'ler (kötü sonuç) argümanla verilir: --haric 12,34 → onların studio_url'si boş kalır (orijinal görünür).
Kullanım: python3 scripts/ana-site-studio-yukle.py <çıktı-klasörü> [--haric id,id]
"""
import hashlib, json, sys, time, concurrent.futures as cf
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1])
HARIC = set(sys.argv[sys.argv.index('--haric') + 1].split(',')) if '--haric' in sys.argv else set()
ENV = {}
for l in (ROOT / '.env.local').read_text().splitlines():
    if '=' in l and not l.lstrip().startswith('#'):
        k, v = l.split('=', 1); ENV.setdefault(k, v.strip().strip('"'))
cloud, key, sec = ENV['CLOUDINARY_CLOUD_NAME'], ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']
rapor = json.loads((OUT / 'rapor.json').read_text())
ids = [i for i in rapor if i not in HARIC and (OUT / f'{i}.jpg').exists()]
kayit = OUT / 'yuklenen.json'
yuklenen = json.loads(kayit.read_text()) if kayit.exists() else {}


def yukle(i):
    if i in yuklenen:
        return i, yuklenen[i]
    p = {'public_id': f'uarttasarim/studio/{i}', 'timestamp': int(time.time()), 'overwrite': 'true', 'invalidate': 'true'}
    p['signature'] = hashlib.sha1(('&'.join(f'{k}={p[k]}' for k in sorted(p)) + sec).encode()).hexdigest(); p['api_key'] = key
    for _ in range(4):
        r = requests.post(f'https://api.cloudinary.com/v1_1/{cloud}/image/upload', data=p, files={'file': open(OUT / f'{i}.jpg', 'rb')}, timeout=120)
        if r.ok:
            return i, r.json()['secure_url']
        time.sleep(4)
    return i, None


with cf.ThreadPoolExecutor(6) as ex:
    for i, u in ex.map(yukle, ids):
        if u:
            yuklenen[i] = u
kayit.write_text(json.dumps(yuklenen, indent=1))
eksik = [i for i in ids if i not in yuklenen]
print(len(yuklenen), 'yüklü;', 'eksik:', eksik)

q = lambda s: "'" + s.replace("'", "''") + "'"
sql = ['-- Üretildi: scripts/ana-site-studio-yukle.py — stüdyo kareleri (ANA-SITE-FOTO-BRIEF, 20 Eki). url DEĞİŞMEZ.',
       '-- Görünürlük: yalnız UART_STUDIO_FOTO=1 olan deploy\'lar (şimdilik yalnız Preview). Geri alma: -GERI-AL.sql', 'BEGIN;']
sql += [f'UPDATE product_images SET studio_url = {q(yuklenen[i])} WHERE id = {int(i)};' for i in sorted(yuklenen, key=int)]
sql += ['COMMIT;']
(ROOT / 'scripts/sql/2026-10-20-studio-url.sql').write_text('\n'.join(sql) + '\n')
(ROOT / 'scripts/sql/2026-10-20-studio-url-GERI-AL.sql').write_text(
    '-- 2026-10-20-studio-url.sql geri alma. Cloudinary dosyaları kalır.\nBEGIN;\nUPDATE product_images SET studio_url = NULL;\nCOMMIT;\n')
print('SQL hazır:', len(yuklenen), 'satır; hariç', len(HARIC))
