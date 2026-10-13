#!/usr/bin/env python3
"""
"Anadolu Ekininde Güzeller" fotoğraf yenileme (sanatçı 13 Eki 18:47, Çağrı onayı).

1. Drive'daki 17 yeni fotoğraf (klasör 1747MUHi…, 13 Eki) küçültülüp Cloudinary'ye
   yüklenir: uarttasarim/heykel/anadolu-ekininde-guzeller-2026-10-<n>. Mevcut
   hiçbir dosyanın üzerine yazılmaz (overwrite=false).
2. SQL ÜRETİLİR, UYGULANMAZ (scripts/sql/2026-10-13-anadolu-fotograf-yenile.sql
   + GERI-AL). Uygulanınca:
   - 17 yeni product_images satırı (ürün anadolu-ekininde-guzeller)
   - eski 9 satır is_visible=false (SİLİNMEZ; dosya Cloudinary'de kalır)
   - eski kareler 2008 Nüve/Nucleus sergisine eklenir (zaten orada olan kare hariç)

Kullanım: python3 scripts/aeg-yenile-2026-10-13.py <indirilen-klasör> <çalışma-klasörü>
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
DL, WORK = Path(sys.argv[1]), Path(sys.argv[2])
WORK.mkdir(parents=True, exist_ok=True)

# Sıra: kapak Üç Güzeller (ölçülü tek eser, grubun en temsilî karesi), sonra
# dosya adlarına göre eser eser. Eser ADI doğrulanmadığı için alt metin yazılmaz
# (site eser başlığına düşer). 373 px'lik ayrıntı karesi en sona.
ORDER = [
    'üç güzeller17x27x70cm.jpg', 'Üç güzeller ayrıntı.jpg',
    'Nüve.jpg', 'Nüve.1.jpg', 'Nüve2.jpg', 'Nüve2.1.jpg', 'Nüve3.jpg', 'Nüve4.jpg',
    'Nüve5.jpg', 'Nüve5.1.jpg', 'Nüve5.2.jpg', 'Nüve6.jpg', 'Nüve6.1.jpg',
    'Aşk.jpg', 'Angel.jpg', 'Angel-1.jpg', 'Üç güzeller ayrıntı1.jpg',
]
files = {p.name: p for p in DL.glob('*.jpg')}
missing = [n for n in ORDER if n not in files]
extra = [n for n in files if n not in ORDER]
if missing or extra:
    sys.exit(f'Drive içeriği beklenenden farklı — DUR. eksik={missing} fazla={extra}')

results_path = WORK / 'uploads.json'
results = json.loads(results_path.read_text()) if results_path.exists() else {}
cloud, key, secret = ENV['CLOUDINARY_CLOUD_NAME'], ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']
for n, name in enumerate(ORDER, 1):
    pid = f'uarttasarim/heykel/anadolu-ekininde-guzeller-2026-10-{n}'
    if pid in results:
        continue
    out = WORK / f'{n:02d}.jpg'
    im = ImageOps.exif_transpose(Image.open(files[name])).convert('RGB')
    im.thumbnail((2560, 2560), Image.LANCZOS)
    im.save(out, 'JPEG', quality=88, optimize=True)
    ts = int(time.time())
    params = {'public_id': pid, 'timestamp': ts, 'overwrite': 'false'}
    to_sign = '&'.join(f'{k}={params[k]}' for k in sorted(params)) + secret
    params.update(api_key=key, signature=hashlib.sha1(to_sign.encode()).hexdigest())
    for _ in range(3):
        r = requests.post(f'https://api.cloudinary.com/v1_1/{cloud}/image/upload',
                          data=params, files={'file': out.open('rb')}, timeout=120)
        if r.ok:
            break
        time.sleep(3)
    r.raise_for_status()
    results[pid] = {'url': r.json()['secure_url'], 'kaynak': name}
    results_path.write_text(json.dumps(results, ensure_ascii=False, indent=1))
    print(f'{n}/{len(ORDER)} {pid} ← {name}', flush=True)

# ---- SQL (uygulanmaz) --------------------------------------------------------
OLD_IDS = list(range(590, 599))  # eski 9 kare (product_images), 1 Eki içe aktarması
# eski-6 (id 595) = 2008 sergisindeki nuve-nucleus-marina-2008-2 ile aynı kare (dHash 0) → sergiye tekrar eklenmez
SERGI_DISI = {595}
q = lambda v: "'" + str(v).replace("'", "''") + "'"
P = "(select id from products where slug='anadolu-ekininde-guzeller')"
sql = ['-- Üretildi: scripts/aeg-yenile-2026-10-13.py — Anadolu Ekininde Güzeller fotoğraf yenileme.',
       '-- Hiçbir satır SİLİNMEZ. Geri alma: 2026-10-13-anadolu-fotograf-yenile-GERI-AL.sql', 'BEGIN;',
       f"-- güvenlik: eski 9 satır beklenen üründe mi?\nDO $$ BEGIN IF (select count(*) from product_images where id between 590 and 598 and product_id={P}) <> 9 THEN RAISE EXCEPTION 'eski satırlar beklenmedik'; END IF; END $$;"]
for n, name in enumerate(ORDER, 1):
    pid = f'uarttasarim/heykel/anadolu-ekininde-guzeller-2026-10-{n}'
    sql.append(f"INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ({P}, {q(results[pid]['url'])}, {n - 1}, true); -- {name}")
sql.append(f"UPDATE product_images SET is_visible = false, sort_order = sort_order + 100 WHERE id IN ({', '.join(map(str, OLD_IDS))});")
sql.append("-- eski kareler 2008 Nüve / Nucleus sergisine (aynı Cloudinary dosyası, yeniden yükleme yok)")
sql.append(f"""INSERT INTO exhibition_photos (exhibition_slug, url, sort_order)
SELECT 'nuve-nucleus-marina-2008', url, 4 + row_number() OVER (ORDER BY id)
FROM product_images WHERE id IN ({', '.join(str(i) for i in OLD_IDS if i not in SERGI_DISI)}) ORDER BY id;""")
sql.append('COMMIT;')
out = ROOT / 'scripts/sql/2026-10-13-anadolu-fotograf-yenile.sql'
out.write_text('\n'.join(sql) + '\n')
geri = ROOT / 'scripts/sql/2026-10-13-anadolu-fotograf-yenile-GERI-AL.sql'
geri.write_text('\n'.join([
    '-- 2026-10-13-anadolu-fotograf-yenile.sql geri alma. Cloudinary dosyaları kalır.',
    'BEGIN;',
    "DELETE FROM product_images WHERE url LIKE '%/uarttasarim/heykel/anadolu-ekininde-guzeller-2026-10-%';",
    f"UPDATE product_images SET is_visible = true, sort_order = sort_order - 100 WHERE id IN ({', '.join(map(str, OLD_IDS))}) AND sort_order >= 100;",
    "DELETE FROM exhibition_photos WHERE exhibition_slug = 'nuve-nucleus-marina-2008' AND url LIKE '%/uarttasarim/heykel/anadolu-ekininde-guzeller-%';",
    'COMMIT;']) + '\n')
print('SQL:', out.relative_to(ROOT), '+', geri.name)
