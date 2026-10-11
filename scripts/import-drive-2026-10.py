#!/usr/bin/env python3
"""
Drive içe aktarma (Ekim 2026) — heykeller, 4 yeni pano, yapım/montaj ve sergi
fotoğrafları. Çağrı onayı: 2026-10-11 ("gizli gir, sonra kontrol edip açacağız").

  python3 scripts/import-drive-2026-10.py <indirme_klasoru> <calisma_klasoru>

1. Fotoğrafları küçültür (en uzun kenar 2560 px, JPEG q88; BMP → JPEG).
2. Cloudinary'ye imzalı yükler (overwrite=false → tekrar çalıştırmak güvenli).
   public_id: uarttasarim/<heykel|mimari|mimari-yapim|sergi>/<slug>-<n>
3. <calisma>/import.sql üretir — UYGULAMAZ. Ürünler is_visible=false.
   Yapım/montaj ve sergi fotoğrafları exhibition_photos'a, hiçbir sayfanın
   okumadığı anahtarlarla (yapim-<slug>, <sergi-slug>) girer → görünmez.

Metin kaynağı: scripts/data/drive-import-2026-10.json (sanatçının docx'leri).
Künyesi olmayan alanlar NULL kalır — UYDURMA YOK.
"""
import hashlib, json, os, re, sys, time, unicodedata
from pathlib import Path

import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / 'scripts/data/drive-import-2026-10.json').read_text(encoding='utf-8'))
ENV = {}
for line in (ROOT / '.env.local').read_text().splitlines():
    if '=' in line and not line.startswith('#'):
        k, v = line.split('=', 1)
        ENV[k] = v.strip().strip('"')

DL, WORK = Path(sys.argv[1]), Path(sys.argv[2])
WORK.mkdir(parents=True, exist_ok=True)
nfc = lambda s: unicodedata.normalize('NFC', s)
IMG = re.compile(r'\.(jpe?g|bmp)$', re.I)


def natural_key(name: str):
    """'Anka-Yaşama Dönüş.jpg' (numarasız) önce, sonra 1, 2, 3 …; afişler en önde."""
    stem = nfc(Path(name).stem)
    afis = 0 if re.search(r'afi[şs]', stem, re.I) else 1
    m = re.search(r'(\d+)\D*$', stem)
    return (afis, int(m.group(1)) if m else -1, stem)


def images_in(folder: Path, prefix: str | None = None):
    files = [p for p in folder.iterdir() if p.is_file() and IMG.search(p.name)]
    if prefix:
        files = [p for p in files if nfc(p.name).startswith(nfc(prefix))]
    return sorted(files, key=lambda p: natural_key(p.name))


def find_dir(base: Path, name: str) -> Path:
    for p in base.iterdir():
        if nfc(p.name) == nfc(name):
            return p
    raise SystemExit(f'klasör yok: {base}/{name}')


# ---- 1. Plan: (kaynak, public_id, hedef) -----------------------------------
plan = []  # dict(src, pid, kind, key, order)
heykel_base = DL / 'ceramicart/Heykeller'
masal = find_dir(heykel_base, "Masalın Hafızası Anadolu'dan Günümüze Seramik Bedenler")
for h in DATA['heykeller']:
    folder = find_dir(heykel_base if h['series'] == 'anadolu' else masal, h['folder'])
    files = images_in(folder, h['prefix'] if h['series'] in ('anka', 'sahmaran') else None)
    if not files:
        raise SystemExit(f"görsel yok: {h['slug']}")
    for i, f in enumerate(files):
        plan.append(dict(src=f, pid=f"uarttasarim/heykel/{h['slug']}-{i+1}", kind='product', key=h['slug'], order=i))

pano_base = DL / 'ceramicart/mimari duvar panoları'
for p in DATA['panolar']:
    for i, f in enumerate(images_in(find_dir(pano_base, p['folder']))):
        plan.append(dict(src=f, pid=f"uarttasarim/mimari/{p['slug']}-{i+1}", kind='product', key=p['slug'], order=i))

for folder, slug in DATA['yapim_klasorleri'].items():
    d = find_dir(pano_base, folder)
    files = sorted((f for f in d.rglob('*') if f.is_file() and IMG.search(f.name)
                    and re.search(r'yap', str(f.relative_to(d)), re.I)),
                   key=lambda f: (str(f.parent), natural_key(f.name)))
    # Ana (eser) fotoğrafının kopyası yapım klasörüne de konmuşsa atla
    # (Akar'ın Deryası: 9 ana kare "Yapım ve montaj"da birebir tekrar ediyordu).
    main_md5 = {hashlib.md5(f.read_bytes()).hexdigest() for f in images_in(d)}
    files = [f for f in files if hashlib.md5(f.read_bytes()).hexdigest() not in main_md5]
    for i, f in enumerate(files):
        plan.append(dict(src=f, pid=f"uarttasarim/mimari-yapim/{slug}-{i+1}", kind='photo', key=f'yapim-{slug}', order=i))

sergi_base = DL / 'Studio/Sergiler'
for folder, slug in DATA['sergiler'].items():
    for i, f in enumerate(images_in(find_dir(sergi_base, folder))):
        plan.append(dict(src=f, pid=f"uarttasarim/sergi/{slug}-{i+1}", kind='photo', key=slug, order=i))

print(f'plan: {len(plan)} görsel')
if os.environ.get('PLAN_ONLY'):
    from collections import Counter
    for k, c in Counter(i['key'] for i in plan).items():
        first = next(i for i in plan if i['key'] == k)
        print(f'{c:3d} {k:45s} kapak: {first["src"].name}')
    sys.exit(0)

# ---- 2. Küçült + yükle ------------------------------------------------------
results_path = WORK / 'uploads.json'
results = json.loads(results_path.read_text()) if results_path.exists() else {}
cloud, key, secret = ENV['CLOUDINARY_CLOUD_NAME'], ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']

for n, item in enumerate(plan, 1):
    if item['pid'] in results:
        continue
    out = WORK / 'img' / (item['pid'].replace('/', '__') + '.jpg')
    out.parent.mkdir(parents=True, exist_ok=True)
    if not out.exists():
        im = ImageOps.exif_transpose(Image.open(item['src'])).convert('RGB')
        im.thumbnail((2560, 2560), Image.LANCZOS)
        im.save(out, 'JPEG', quality=88, optimize=True)
    ts = int(time.time())
    params = {'public_id': item['pid'], 'timestamp': ts, 'overwrite': 'false'}
    to_sign = '&'.join(f'{k}={params[k]}' for k in sorted(params)) + secret
    params.update(api_key=key, signature=hashlib.sha1(to_sign.encode()).hexdigest())
    for attempt in range(3):
        r = requests.post(f'https://api.cloudinary.com/v1_1/{cloud}/image/upload',
                          data=params, files={'file': out.open('rb')}, timeout=120)
        if r.ok:
            break
        time.sleep(3)
    r.raise_for_status()
    results[item['pid']] = r.json()['secure_url']
    results_path.write_text(json.dumps(results, ensure_ascii=False, indent=1))
    print(f'{n}/{len(plan)} {item["pid"]}', flush=True)

# ---- 3. SQL (uygulanmaz) ----------------------------------------------------
q = lambda v: 'NULL' if v is None else "'" + str(v).replace("'", "''") + "'"
T = DATA['texts']
ARTIST = {'melike': "(select id from artists where slug='melike')", 'seref': "(select id from artists where slug='seref')"}
sql = ['-- Üretildi: scripts/import-drive-2026-10.py — ürünler GİZLİ (is_visible=false).', 'BEGIN;']


def product_sql(r: dict):
    cols = ', '.join(r)
    vals = ', '.join(v if isinstance(v, str) and v.startswith('(select') else (str(v).lower() if isinstance(v, bool) else (str(v) if isinstance(v, int) else q(v))) for v in r.values())
    return f'INSERT INTO products ({cols}) VALUES ({vals}) ON CONFLICT (slug) DO NOTHING;'


for i, h in enumerate(DATA['heykeller']):
    s = h['series']
    if s == 'anka':
        d_tr, d_en = h['piece_tr'] + '\n\n' + T['anka_tr'], h['piece_en'] + '\n\n' + T['anka_en']
    elif s == 'sahmaran':
        d_tr, d_en = T['sahmaran_tr'], T['sahmaran_en']
    elif s == 'anadolu':
        d_tr, d_en = T['anadolu_tr'], T['anadolu_en']
    else:
        d_tr, d_en = T['masal_tr'], T['masal_en']
    sql.append(product_sql({
        'slug': h['slug'], 'title_tr': h['title_tr'], 'title_en': h['title_en'],
        'description_tr': d_tr, 'description_en': d_en,
        'category': 'Seramik Heykeller', 'collection': h['collection'],
        'medium_tr': h.get('medium_tr'), 'medium_en': h.get('medium_en'),
        'dimensions_tr': h.get('dimensions'), 'dimensions_en': h.get('dimensions'),
        'subject_tr': h.get('subject_tr'), 'subject_en': h.get('subject_en'),
        'artist_id': ARTIST[h['artist']], 'sort_order': 300 + i, 'is_visible': False,
    }))

for i, p in enumerate(DATA['panolar']):
    sql.append(product_sql({
        'slug': p['slug'], 'title_tr': p['title_tr'], 'title_en': p['title_en'],
        'description_tr': p['description_tr'], 'description_en': p['description_en'],
        'category': 'Mimari Duvar Panoları', 'collection': p['collection'], 'year': p['year'],
        'medium_tr': 'Şamotlu çamur, yüksek rölyef, çift pişirim ve sırlama',
        'medium_en': 'Chamotte clay, high relief, double firing and glazing',
        'dimensions_tr': p['dimensions_tr'], 'dimensions_en': p['dimensions_en'],
        'form_tr': p['form_tr'], 'form_en': p['form_en'],
        'subject_tr': p['subject_tr'], 'subject_en': p['subject_en'],
        'artist_id': ARTIST['seref'], 'sort_order': 107 + i, 'is_visible': False,
    }))

for item in plan:
    url = q(results[item['pid']])
    if item['kind'] == 'product':
        sql.append(f"INSERT INTO product_images (product_id, url, sort_order) SELECT id, {url}, {item['order']} "
                   f"FROM products WHERE slug={q(item['key'])} AND NOT EXISTS (SELECT 1 FROM product_images WHERE url={url});")
    else:
        sql.append(f"INSERT INTO exhibition_photos (exhibition_slug, url, sort_order) SELECT {q(item['key'])}, {url}, {item['order']} "
                   f"WHERE NOT EXISTS (SELECT 1 FROM exhibition_photos WHERE url={url});")
sql.append('COMMIT;')
(WORK / 'import.sql').write_text('\n'.join(sql) + '\n', encoding='utf-8')
print('SQL:', WORK / 'import.sql', '| yüklü:', len(results))
