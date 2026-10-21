#!/usr/bin/env python3
"""
Ablamın 21 Eki düzeltmeleri (ABLAM-UART-DUZELTME-21EKI.md) — Drive dosyalarını siteye hazırlar.
Kaynak: Drive (rclone ile indirildi): Hakkımızda/{Melike,şeref}.jpg · Hakkımızda/Melike Sergiler/* ·
Projeler/Assos Athena Tapınağı Maketi/* · mimari duvar panoları/Güzel Bakış/*.jpg

1) Yuvarlak profil: kare 640 px → public/brand/{melike,seref}-avatar.jpg
2) Melike sergi + Assos fotoğrafları → Cloudinary; URL listesi src/lib/ablam-21eki.json (kod buradan okur)
3) Güzel Bakış: eski görünür kareler GİZLENİR (silinmez), yeni 6 kare eklenir → SQL + GERI-AL (UYGULAMAZ)
Kullanım: python3 scripts/ablam-21eki.py <drive-indirme-klasörü>
"""
import hashlib, json, subprocess, sys, time
from pathlib import Path
import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
D = Path(sys.argv[1])
ENV = {}
for l in (ROOT / '.env.local').read_text().splitlines():
    if '=' in l and not l.lstrip().startswith('#'):
        k, v = l.split('=', 1); ENV.setdefault(k, v.strip().strip('"'))
cloud, key, sec = ENV['CLOUDINARY_CLOUD_NAME'], ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']
TMP = D / '_hazir'; TMP.mkdir(exist_ok=True)


def hazirla(src: Path, maks=2560) -> Path:
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB'); im.thumbnail((maks, maks), Image.LANCZOS)
    out = TMP / (src.stem.replace(' ', '-') + '.jpg'); im.save(out, 'JPEG', quality=88, optimize=True); return out


def yukle(path: Path, pid: str) -> str:
    p = {'public_id': pid, 'timestamp': int(time.time()), 'overwrite': 'true', 'invalidate': 'true'}
    p['signature'] = hashlib.sha1(('&'.join(f'{k}={p[k]}' for k in sorted(p)) + sec).encode()).hexdigest(); p['api_key'] = key
    for _ in range(4):
        r = requests.post(f'https://api.cloudinary.com/v1_1/{cloud}/image/upload', data=p, files={'file': open(path, 'rb')}, timeout=180)
        if r.ok:
            return r.json()['secure_url']
        time.sleep(4)
    r.raise_for_status()


# 1) profil fotoları
for ad, dosya in (('melike', 'Melike.jpg'), ('seref', 'şeref.jpg')):
    im = ImageOps.fit(ImageOps.exif_transpose(Image.open(D / 'hak' / dosya)).convert('RGB'), (640, 640), Image.LANCZOS)
    im.save(ROOT / f'public/brand/{ad}-avatar.jpg', 'JPEG', quality=88, optimize=True)
    print('avatar', ad)

# 2) Melike sergi + Assos
cikti = {'melikeSergi': [], 'assos': []}
for n, f in enumerate(sorted((D / 'msergi').iterdir())):
    cikti['melikeSergi'].append(yukle(hazirla(f), f'uarttasarim/sergiler/melike/melike-sergi-{n + 1}'))
assos = sorted(f for f in (D / 'assos').iterdir() if f.suffix.lower() == '.jpg')
# sıra: tam cepheden (maketi.JPG) önce, sonra dosya numarasına göre
assos.sort(key=lambda f: (0 if f.stem.endswith('maketi') else int(''.join(c for c in f.stem if c.isdigit()) or 99)))
for n, f in enumerate(assos):
    cikti['assos'].append(yukle(hazirla(f), f'uarttasarim/projeler/assos-athena/assos-athena-{n + 1}'))
(ROOT / 'src/lib/ablam-21eki.json').write_text(json.dumps(cikti, indent=1) + '\n')
print('melike sergi', len(cikti['melikeSergi']), '· assos', len(cikti['assos']))

# 3) Güzel Bakış — sıra: önden pano (151646) kapak, sonra mekân kareleri
SIRA = ['151646', '124315', '124344', '164540', '215105', '222300']
gb = [yukle(hazirla(D / 'gb' / f'{s}.jpg'), f'uarttasarim/mimari/guzel-bakis-2026-10-21-{n + 1}') for n, s in enumerate(SIRA)]
DB = ENV['DATABASE_URL']
q = lambda s: "'" + s.replace("'", "''") + "'"
eski = subprocess.run(['psql', DB, '-At', '-c', "select string_agg(i.id::text, ',') from product_images i join products p on p.id=i.product_id where p.slug='guzel-bakis' and i.is_visible"],
                      capture_output=True, text=True, check=True).stdout.strip()
sql = ["-- Güzel Bakış: ablamın 21 Eki yeni fotoğrafları (Drive). Eski kareler GİZLENİR (silinmez). Geri alma: -GERI-AL.sql", 'BEGIN;',
       f'UPDATE product_images SET is_visible = false WHERE id IN ({eski});']
sql += [f"INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ((select id from products where slug='guzel-bakis'), {q(u)}, {n}, true);"
        for n, u in enumerate(gb)]
sql.append('COMMIT;')
(ROOT / 'scripts/sql/2026-10-21-guzel-bakis.sql').write_text('\n'.join(sql) + '\n')
(ROOT / 'scripts/sql/2026-10-21-guzel-bakis-GERI-AL.sql').write_text(
    'BEGIN;\n' + f"DELETE FROM product_images WHERE url IN ({', '.join(q(u) for u in gb)});\n"
    + f'UPDATE product_images SET is_visible = true WHERE id IN ({eski});\nCOMMIT;\n')
print('güzel bakış: gizlenecek', eski, '· yeni', len(gb))
