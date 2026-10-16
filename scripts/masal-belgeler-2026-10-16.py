#!/usr/bin/env python3
"""
Masalın Hafızası — sanatçının yeniden düzenlediği eser belgeleri (15 Eki; WhatsApp: "her heykel için
ayrı belge", "Cemşab yazılacak"). Kaynak: scripts/data/masal-belgeler-2026-10-16.json.

ÜÇ AYRI SQL ÜRETİR, HİÇBİRİNİ UYGULAMAZ (her biri ayrı onaylanabilir, her birinin GERI-AL'ı var):
  1. 2026-10-16-masal-metinleri.sql   künye (yıl/teknik/ölçü) + figür açıklamaları + Cemşab + Anka IV ölçüsü
  2. 2026-10-16-dev-fotograflari.sql  Drive'a eklenen dev6/dev7 eklenir; Drive'dan kalkan dev3 GİZLENİR
  3. 2026-10-16-sehzade-fotograflari.sql  Drive'daki 3 yeni kare eklenir; eski 2 kare GİZLENİR
Hiçbir satır/fotoğraf silinmez. Yedek: scripts/sql/yedek/masal-belgeler-2026-10-16.json

Kullanım: python3 scripts/masal-belgeler-2026-10-16.py <drive-indirme-klasörü> <çalışma-klasörü>
"""
import hashlib, json, subprocess, sys, time
from pathlib import Path
import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for line in (ROOT / '.env.local').read_text().splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.split('=', 1)
        ENV.setdefault(k, v.strip().strip('"'))
SRC, WORK = Path(sys.argv[1]), Path(sys.argv[2])
WORK.mkdir(parents=True, exist_ok=True)
DATA = json.loads((ROOT / 'scripts/data/masal-belgeler-2026-10-16.json').read_text())
ESKI = json.loads((ROOT / 'scripts/data/sahmaran-2026-10-14.json').read_text())
DB = ENV['DATABASE_URL']
SQLDIR = ROOT / 'scripts/sql'

def psql_json(sql):
    out = subprocess.run(['psql', DB, '-At', '-c', sql], capture_output=True, text=True, check=True).stdout.strip()
    return json.loads(out) if out else None

q = lambda v: 'NULL' if v is None else "'" + str(v).replace("'", "''") + "'"
lit = lambda v: str(v) if isinstance(v, (int, bool)) and not isinstance(v, bool) else ('true' if v is True else 'false' if v is False else q(v))

# ---- 1. Cloudinary yükleme (yalnız dosya; site bunlara SQL uygulanana kadar bakmaz) ---------
YUKLE = [('dev', 'Dev /dev6.jpg', 'uarttasarim/heykel/dev-6'), ('dev', 'Dev /dev7.jpg', 'uarttasarim/heykel/dev-7'),
         ('sehzade', 'Şehzade/Şehzade', 'uarttasarim/heykel/sehzade-2026-10-1'),
         ('sehzade', 'Şehzade/Şehzade.1', 'uarttasarim/heykel/sehzade-2026-10-2'),
         ('sehzade', 'Şehzade/Şehzade.2', 'uarttasarim/heykel/sehzade-2026-10-3')]
results_path = WORK / 'uploads.json'
results = json.loads(results_path.read_text()) if results_path.exists() else {}
cloud, key, secret = ENV['CLOUDINARY_CLOUD_NAME'], ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']
for _, rel, pid in YUKLE:
    if pid in results:
        continue
    out = WORK / (pid.rsplit('/', 1)[1] + '.jpg')
    im = ImageOps.exif_transpose(Image.open(SRC / rel)).convert('RGB')
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
    results[pid] = {'url': r.json()['secure_url'], 'kaynak': rel}
    results_path.write_text(json.dumps(results, ensure_ascii=False, indent=1))
    print(pid, '←', rel, flush=True)

# ---- 2. yedek ----------------------------------------------------------------
COLS = ['title_tr', 'title_en', 'year', 'medium_tr', 'medium_en', 'dimensions_tr', 'dimensions_en',
        'description_tr', 'description_en', 'description_kurumsal_tr', 'description_kurumsal_en']
yedek = {
    'products': psql_json(f"select json_agg(t order by sort_order) from (select id, slug, {', '.join(COLS)}, sort_order from products where collection like 'Masalın Hafızası%') t"),
    'product_images': psql_json("select json_agg(t order by product_id, sort_order) from (select i.id, i.product_id, i.url, i.sort_order, i.is_visible from product_images i join products p on p.id = i.product_id where p.slug in ('dev','sehzade')) t"),
}
(SQLDIR / 'yedek/masal-belgeler-2026-10-16.json').write_text(json.dumps(yedek, ensure_ascii=False, indent=1))
by = {r['slug']: r for r in yedek['products']}

# Seri metinleri: figürlerde bugünkü açıklamanın tamamı (altısında aynı); Şahmaran'da I'in eser paragrafından sonrası
figur_seri_tr, figur_seri_en = by['padisah']['description_tr'], by['padisah']['description_en']
for s in ['dervis', 'dev', 'devanasi', 'keloglan', 'sehzade']:
    assert by[s]['description_tr'] == figur_seri_tr, f'{s}: figür seri metni farklı — DUR'
e1 = next(e for e in ESKI['eserler'] if e['slug'] == 'sahmaran-i-donusum')
d1 = by['sahmaran-i-donusum']
assert d1['description_tr'].startswith(e1['text_tr'] + '\n\n') and d1['description_en'].startswith(e1['text_en'] + '\n\n'), 'Şahmaran I gövdesi değişmiş — DUR'
sah_seri_tr, sah_seri_en = d1['description_tr'][len(e1['text_tr']) + 2:], d1['description_en'][len(e1['text_en']) + 2:]

# ---- 3. metin SQL'i ------------------------------------------------------------
sql = ['-- Üretildi: scripts/masal-belgeler-2026-10-16.py — sanatçının 15 Eki belgeleri. Silme yok.',
       '-- Geri alma: 2026-10-16-masal-metinleri-GERI-AL.sql (yedek: scripts/sql/yedek/masal-belgeler-2026-10-16.json)', 'BEGIN;']
def upd(slug, sets):
    sql.append(f"UPDATE products SET {', '.join(f'{k} = {lit(v)}' for k, v in sets.items())} WHERE slug = {q(slug)};")
for e in DATA['anka']:
    sets = {'year': e['year']}
    if 'dimensions' in e:
        sets |= {'dimensions_tr': e['dimensions'], 'dimensions_en': e['dimensions']}
    upd(e['slug'], sets)
# Anka kurumsal: IV'ün ölçüsü değişti → "en büyük parça" ve seri aralığı artık doğru değil, çıkarılır
iv = by['anka-iv-ozgurlesme']
for a, b in [('35 × 65 cm — serinin en büyük parçası.', '40 × 55 cm.'), ('35 × 65 cm — the largest piece in the series.', '40 × 55 cm.')]:
    assert a in (iv['description_kurumsal_tr'] + iv['description_kurumsal_en']), f'Anka IV kurumsal metninde yok: {a}'
sql.append("UPDATE products SET description_kurumsal_tr = replace(description_kurumsal_tr, '35 × 65 cm — serinin en büyük parçası.', '40 × 55 cm.'), "
           "description_kurumsal_en = replace(description_kurumsal_en, '35 × 65 cm — the largest piece in the series.', '40 × 55 cm.') WHERE slug = 'anka-iv-ozgurlesme';")
for s in [r['slug'] for r in yedek['products'] if r['slug'].startswith('anka-')]:
    assert ' (26 × 50 cm ile 35 × 65 cm arası)' in by[s]['description_kurumsal_tr'] and ' (from 26 × 50 cm to 35 × 65 cm)' in by[s]['description_kurumsal_en'], f'{s}: aralık yok — DUR'
sql.append("UPDATE products SET description_kurumsal_tr = replace(description_kurumsal_tr, ' (26 × 50 cm ile 35 × 65 cm arası)', ''), "
           "description_kurumsal_en = replace(description_kurumsal_en, ' (from 26 × 50 cm to 35 × 65 cm)', '') WHERE slug LIKE 'anka-%' AND collection = 'Masalın Hafızası — Anka Serisi';")
for e in DATA['sahmaran']:
    sets = {k: e[k] for k in ['year', 'medium_tr', 'medium_en'] if k in e}
    sets |= {'dimensions_tr': e['dimensions'], 'dimensions_en': e['dimensions']}
    if 'text_tr' in e:
        sets |= {'description_tr': e['text_tr'] + '\n\n' + sah_seri_tr, 'description_en': e['text_en'] + '\n\n' + sah_seri_en}
    upd(e['slug'], sets)
for e in DATA['figurler']:
    sets = {k: e[k] for k in ['title_tr', 'title_en', 'year', 'medium_tr', 'medium_en'] if k in e}
    sets |= {'dimensions_tr': e['dimensions'], 'dimensions_en': e['dimensions'],
             'description_tr': e['text_tr'] + '\n\n' + figur_seri_tr, 'description_en': e['text_en'] + '\n\n' + figur_seri_en}
    upd(e['slug'], sets)
sql.append('COMMIT;')
(SQLDIR / '2026-10-16-masal-metinleri.sql').write_text('\n'.join(sql) + '\n')

geri = ['-- 2026-10-16-masal-metinleri.sql geri alma — yedekten (scripts/sql/yedek/masal-belgeler-2026-10-16.json).', 'BEGIN;']
for r in yedek['products']:
    geri.append(f"UPDATE products SET {', '.join(f'{c} = ' + ('NULL' if r[c] is None else lit(r[c])) for c in COLS)} WHERE id = {r['id']};")
geri.append('COMMIT;')
(SQLDIR / '2026-10-16-masal-metinleri-GERI-AL.sql').write_text('\n'.join(geri) + '\n')

# ---- 4. fotoğraf SQL'leri --------------------------------------------------------
imgs = yedek['product_images']
def foto_sql(ad, slug, gizle_urls, ekle):
    ids = [i['id'] for i in imgs if i['url'].split('/upload/')[1].split('/', 1)[1] in gizle_urls]
    assert len(ids) == len(gizle_urls), f'{ad}: gizlenecek kare bulunamadı — DUR'
    son = max(i['sort_order'] for i in imgs if i['product_id'] == by[slug]['id'])
    s = [f'-- Üretildi: scripts/masal-belgeler-2026-10-16.py — {ad}. Silme yok, eski kare(ler) gizlenir.',
         f'-- Geri alma: 2026-10-16-{ad}-GERI-AL.sql', 'BEGIN;',
         f"UPDATE product_images SET is_visible = false WHERE id IN ({', '.join(map(str, ids))});"]
    for n, pid in enumerate(ekle, 1):
        s.append(f"INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ({by[slug]['id']}, {q(results[pid]['url'])}, {son + n}, true); -- {results[pid]['kaynak']}")
    s.append('COMMIT;')
    (SQLDIR / f'2026-10-16-{ad}.sql').write_text('\n'.join(s) + '\n')
    g = [f'-- 2026-10-16-{ad}.sql geri alma. Cloudinary dosyaları kalır.', 'BEGIN;',
         f"DELETE FROM product_images WHERE product_id = {by[slug]['id']} AND url IN ({', '.join(q(results[p]['url']) for p in ekle)});",
         f"UPDATE product_images SET is_visible = true WHERE id IN ({', '.join(map(str, ids))});", 'COMMIT;']
    (SQLDIR / f'2026-10-16-{ad}-GERI-AL.sql').write_text('\n'.join(g) + '\n')

foto_sql('dev-fotograflari', 'dev', ['uarttasarim/heykel/dev-3.jpg'], ['uarttasarim/heykel/dev-6', 'uarttasarim/heykel/dev-7'])
foto_sql('sehzade-fotograflari', 'sehzade', ['uarttasarim/heykel/sehzade-1.jpg', 'uarttasarim/heykel/sehzade-2.jpg'],
         ['uarttasarim/heykel/sehzade-2026-10-1', 'uarttasarim/heykel/sehzade-2026-10-2', 'uarttasarim/heykel/sehzade-2026-10-3'])
print('SQL hazır (3 dosya + 3 GERI-AL); yedek', len(yedek['products']), 'eser,', len(imgs), 'görsel satırı')
