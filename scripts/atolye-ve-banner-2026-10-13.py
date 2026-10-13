#!/usr/bin/env python3
"""
Atölye fotoğrafları + Masalın Hafızası banner adayı (sanatçı 13 Eki 21:25).

1. Drive Studio/Hakkımızda/"Atölyeden fotolar" (14 kare, 13 Eki) küçültülüp
   Cloudinary'ye: uarttasarim/atolye/atolye-2026-10-<n> (dosya adı sırasıyla).
2. Masalın Hafızası banner ADAYI: Drive Masalın Hafızası klasöründeki
   "Masalın Hafızası: Anadolu'dan Günümüze Seramik Bedenler" → uarttasarim/koleksiyon/masalin-hafizasi-banner-2026-10.
   ⚠️ Sanatçının adını verdiği "Masalın hafızası kaf dağından gelenler" dosyası Drive'da
   YOK; bu aday teyitsiz canlıya alınmaz.
3. SQL ÜRETİLİR: exhibition_photos'a exhibition_slug='atolye' satırları (+ GERI-AL).
   Mevcut canlı kod 'atolye' slug'ını okumaz → uygulamak siteyi değiştirmez.

Kullanım: python3 scripts/atolye-ve-banner-2026-10-13.py <atolye-klasörü> <banner-dosyası> <çalışma-klasörü>
"""
import hashlib, json, sys, time
from pathlib import Path
import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for line in (ROOT / '.env.local').read_text().splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.split('=', 1)
        ENV[k] = v.strip().strip('"')
ATOLYE, BANNER, WORK = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
WORK.mkdir(parents=True, exist_ok=True)
files = sorted(ATOLYE.glob('*.jpg'))
if len(files) != 14:
    sys.exit(f'Beklenen 14 atölye karesi, bulunan {len(files)} — DUR.')

results_path = WORK / 'uploads.json'
results = json.loads(results_path.read_text()) if results_path.exists() else {}
cloud, key, secret = ENV['CLOUDINARY_CLOUD_NAME'], ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']

def upload(src: Path, pid: str):
    if pid in results:
        return
    out = WORK / (pid.replace('/', '__') + '.jpg')
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im.thumbnail((2560, 2560), Image.LANCZOS)
    im.save(out, 'JPEG', quality=88, optimize=True)
    params = {'public_id': pid, 'timestamp': int(time.time()), 'overwrite': 'false'}
    to_sign = '&'.join(f'{k}={params[k]}' for k in sorted(params)) + secret
    params.update(api_key=key, signature=hashlib.sha1(to_sign.encode()).hexdigest())
    for _ in range(3):
        r = requests.post(f'https://api.cloudinary.com/v1_1/{cloud}/image/upload', data=params, files={'file': out.open('rb')}, timeout=120)
        if r.ok:
            break
        time.sleep(3)
    r.raise_for_status()
    results[pid] = {'url': r.json()['secure_url'], 'kaynak': src.name}
    results_path.write_text(json.dumps(results, ensure_ascii=False, indent=1))
    print(pid, '←', src.name, flush=True)

for n, f in enumerate(files, 1):
    upload(f, f'uarttasarim/atolye/atolye-2026-10-{n}')
upload(BANNER, 'uarttasarim/koleksiyon/masalin-hafizasi-banner-2026-10')

q = lambda v: "'" + str(v).replace("'", "''") + "'"
sql = ['-- Üretildi: scripts/atolye-ve-banner-2026-10-13.py — atölye fotoğrafları (Drive Hakkımızda/Atölyeden fotolar).',
       '-- Yalnız EKLEME. Geri alma: 2026-10-13-atolye-fotograflari-GERI-AL.sql', 'BEGIN;',
       "DO $$ BEGIN IF EXISTS (select 1 from exhibition_photos where exhibition_slug='atolye') THEN RAISE EXCEPTION 'atolye satırları zaten var'; END IF; END $$;"]
for n, f in enumerate(files, 1):
    r = results[f'uarttasarim/atolye/atolye-2026-10-{n}']
    sql.append(f"INSERT INTO exhibition_photos (exhibition_slug, url, title_tr, title_en, sort_order) VALUES ('atolye', {q(r['url'])}, 'Atölye', 'Studio', {n - 1}); -- {f.name}")
sql.append('COMMIT;')
(ROOT / 'scripts/sql/2026-10-13-atolye-fotograflari.sql').write_text('\n'.join(sql) + '\n')
(ROOT / 'scripts/sql/2026-10-13-atolye-fotograflari-GERI-AL.sql').write_text(
    "-- 2026-10-13-atolye-fotograflari.sql geri alma. Cloudinary dosyaları kalır.\nBEGIN;\n"
    "DELETE FROM exhibition_photos WHERE exhibition_slug = 'atolye' AND url LIKE '%/uarttasarim/atolye/atolye-2026-10-%';\nCOMMIT;\n")
print('banner:', results['uarttasarim/koleksiyon/masalin-hafizasi-banner-2026-10']['url'])
