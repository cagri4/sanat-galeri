#!/usr/bin/env python3
"""
Şahmaran serisi güncellemesi (sanatçı 13 Eki 23:57): yeni eser Şahmaran V – Karşılaşma
(4 foto) + I–IV künye/açıklamaları Drive "Şahmaran.docx"tan (scripts/data/sahmaran-2026-10-14.json).

1. 4 yeni foto → Cloudinary uarttasarim/heykel/sahmaran-v-karsilasma-<n> (overwrite=false).
2. Etkilenen satırların YEDEĞİ → scripts/sql/yedek/sahmaran-2026-10-14.json
3. SQL ÜRETİLİR, UYGULANMAZ: scripts/sql/2026-10-14-sahmaran.sql + GERI-AL (yedekten).
   Hiçbir fotoğraf silinmez/gizlenmez (eski 15 kare Drive'da değişmemiş).

Kullanım: python3 scripts/sahmaran-2026-10-14.py <karsilasma-klasörü> <çalışma-klasörü>
"""
import hashlib, json, os, re, subprocess, sys, time
from pathlib import Path
import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for line in (ROOT / '.env.local').read_text().splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.split('=', 1)
        ENV[k] = v.strip().strip('"')
SRC, WORK = Path(sys.argv[1]), Path(sys.argv[2])
WORK.mkdir(parents=True, exist_ok=True)
DATA = json.loads((ROOT / 'scripts/data/sahmaran-2026-10-14.json').read_text())
DB = ENV['DATABASE_URL']

def psql_json(sql):
    out = subprocess.run(['psql', DB, '-At', '-c', sql], capture_output=True, text=True, check=True).stdout.strip()
    return json.loads(out) if out else None

# ---- 1. yükleme --------------------------------------------------------------
files = sorted(SRC.glob('*Karşılaşma*.jpg'), key=lambda p: int(re.search(r'(\d+)\.jpg$', p.name).group(1)))
if len(files) != 4:
    sys.exit(f'Beklenen 4 Karşılaşma fotoğrafı, bulunan {len(files)} — DUR.')
results_path = WORK / 'uploads.json'
results = json.loads(results_path.read_text()) if results_path.exists() else {}
cloud, key, secret = ENV['CLOUDINARY_CLOUD_NAME'], ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']
for n, f in enumerate(files, 1):
    pid = f'uarttasarim/heykel/sahmaran-v-karsilasma-{n}'
    if pid in results:
        continue
    out = WORK / f'{n}.jpg'
    im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
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
    results[pid] = {'url': r.json()['secure_url'], 'kaynak': f.name}
    results_path.write_text(json.dumps(results, ensure_ascii=False, indent=1))
    print(pid, '←', f.name, flush=True)

# ---- 2. yedek ----------------------------------------------------------------
COLS = 'id, slug, year, medium_tr, medium_en, subject_tr, subject_en, form_tr, form_en, description_tr, description_en, description_kurumsal_tr, description_kurumsal_en, sort_order'
yedek = psql_json(f"select json_agg(t order by sort_order) from (select {COLS} from products where category='Seramik Heykeller') t")
if any(r['slug'] == 'sahmaran-v-karsilasma' for r in yedek):
    sys.exit('Şahmaran V zaten var — DUR.')
(ROOT / 'scripts/sql/yedek/sahmaran-2026-10-14.json').write_text(json.dumps(yedek, ensure_ascii=False, indent=1))
by = {r['slug']: r for r in yedek}
iv = by['sahmaran-iv-ozlem']
# Seri metni = I–IV'ün bugünkü açıklaması (dördünde aynı); yeni metin eser paragraflarıyla başlar.
seri_tr, seri_en = iv['description_tr'], iv['description_en']
assert all(by[s]['description_tr'] == seri_tr for s in ['sahmaran-i-donusum', 'sahmaran-ii-iki-doga', 'sahmaran-iii-icsel-bilgelik']), 'seri metni farklı — DUR'

q = lambda v: 'NULL' if v is None else "'" + str(v).replace("'", "''") + "'"
sql = ['-- Üretildi: scripts/sahmaran-2026-10-14.py — Şahmaran.docx (Drive, 13 Eki). Silme yok.',
       '-- Geri alma: 2026-10-14-sahmaran-GERI-AL.sql (yedek: scripts/sql/yedek/sahmaran-2026-10-14.json)', 'BEGIN;',
       "DO $$ BEGIN IF EXISTS (select 1 from products where slug='sahmaran-v-karsilasma') THEN RAISE EXCEPTION 'Şahmaran V zaten var'; END IF; END $$;"]
for e in DATA['eserler']:
    if e.get('yeni'):
        continue
    sets = [f"year = {e['year']}", f"medium_tr = {q(e['medium_tr'])}", f"medium_en = {q(e['medium_en'])}",
            f"subject_tr = {q(e['subject_tr'])}", f"subject_en = {q(e['subject_en'])}",
            f"description_tr = {q(e['text_tr'] + chr(10) * 2 + seri_tr)}", f"description_en = {q(e['text_en'] + chr(10) * 2 + seri_en)}",
            "description_kurumsal_tr = replace(description_kurumsal_tr, 'dört parçasından', 'beş parçasından')",
            "description_kurumsal_en = replace(description_kurumsal_en, 'four pieces', 'five pieces')"]
    if e['form_tr']:
        sets += [f"form_tr = {q(e['form_tr'])}", f"form_en = {q(e['form_en'])}"]
    sql.append(f"UPDATE products SET {', '.join(sets)} WHERE slug = {q(e['slug'])};")
v = next(e for e in DATA['eserler'] if e.get('yeni'))
sql.append("-- V, IV'ün hemen ardından: sonraki heykeller bir sıra kayar")
sql.append(f"UPDATE products SET sort_order = sort_order + 1 WHERE category = 'Seramik Heykeller' AND sort_order > {iv['sort_order']};")
sql.append(f"""INSERT INTO products (artist_id, slug, title_tr, title_en, category, collection, year, medium_tr, medium_en, subject_tr, subject_en, form_tr, form_en,
  description_tr, description_en, description_kurumsal_tr, description_kurumsal_en, is_visible, sort_order)
VALUES ((select id from artists where slug='melike'), {q(v['slug'])}, {q(v['title_tr'])}, {q(v['title_en'])}, 'Seramik Heykeller', 'Masalın Hafızası — Şahmaran Serisi', {v['year']},
  {q(v['medium_tr'])}, {q(v['medium_en'])}, {q(v['subject_tr'])}, {q(v['subject_en'])}, {q(v['form_tr'])}, {q(v['form_en'])},
  {q(v['text_tr'] + chr(10) * 2 + seri_tr)}, {q(v['text_en'] + chr(10) * 2 + seri_en)}, {q(v['kurumsal_tr'])}, {q(v['kurumsal_en'])}, true, {iv['sort_order'] + 1});""")
for n, f in enumerate(files, 1):
    sql.append(f"INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='sahmaran-v-karsilasma'), {q(results[f'uarttasarim/heykel/sahmaran-v-karsilasma-{n}']['url'])}, {n - 1}, true); -- {f.name}")
sql.append('COMMIT;')
(ROOT / 'scripts/sql/2026-10-14-sahmaran.sql').write_text('\n'.join(sql) + '\n')

geri = ['-- 2026-10-14-sahmaran.sql geri alma — yedekten (scripts/sql/yedek/sahmaran-2026-10-14.json). Cloudinary dosyaları kalır.', 'BEGIN;',
        "DELETE FROM product_images WHERE product_id = (select id from products where slug='sahmaran-v-karsilasma');",
        "DELETE FROM products WHERE slug = 'sahmaran-v-karsilasma';"]
for r in yedek:
    cols = ['year', 'medium_tr', 'medium_en', 'subject_tr', 'subject_en', 'form_tr', 'form_en', 'description_tr', 'description_en', 'description_kurumsal_tr', 'description_kurumsal_en', 'sort_order']
    geri.append(f"UPDATE products SET {', '.join(f'{c} = ' + (str(r[c]) if isinstance(r[c], int) else q(r[c])) for c in cols)} WHERE id = {r['id']};")
geri.append('COMMIT;')
(ROOT / 'scripts/sql/2026-10-14-sahmaran-GERI-AL.sql').write_text('\n'.join(geri) + '\n')
print('SQL hazır; yedek', len(yedek), 'heykel satırı')
