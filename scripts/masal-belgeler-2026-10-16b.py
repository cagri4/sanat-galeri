#!/usr/bin/env python3
"""
Masalın Hafızası — sanatçının 16 Eki cevapları (Çağrı iletti):
  Şahmaran V yılı 2012 (künyedeki doğru) · Padişah belgesi (Drive Padişah/Padişah.docx, 15 Eki)
  Şehzade fotoğrafları Drive'da değişti: Şehzade.jpg (yeni), Şehzade1.jpg (yeni dosya), Şehzade3.jpg (= mevcut sehzade-2)
Dün eklenen 3 sahnelenmiş kare GİZLENİR (silinmez); sehzade-2 tekrar görünür olur.

SQL ÜRETİR, UYGULAMAZ: scripts/sql/2026-10-16b-masal.sql + GERI-AL (yedekten).
Kullanım: python3 scripts/masal-belgeler-2026-10-16b.py <drive-indirme-klasörü> <çalışma-klasörü>
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
DB = ENV['DATABASE_URL']
SQLDIR = ROOT / 'scripts/sql'

def psql_json(sql):
    out = subprocess.run(['psql', DB, '-At', '-c', sql], capture_output=True, text=True, check=True).stdout.strip()
    return json.loads(out) if out else None

q = lambda v: 'NULL' if v is None else (str(v) if isinstance(v, int) and not isinstance(v, bool) else
                                         ('true' if v is True else 'false' if v is False else "'" + str(v).replace("'", "''") + "'"))

PADISAH_TR = """Türk masallarında padişah tipi, belli bir otoritenin ve gücün simgesidir. Bütün düzen onun elindedir. Ancak bu mutlak güç, onun yenilmez olduğu anlamına gelmez. Masallarda da en güçlü padişahın bile üstesinden gelemediği durumlar vardır, başkalarının aklına ve yardımına ihtiyaç duyar.

Günümüzde de bu arketip yaşamaktadır. Gücü ve otoriteyi elinde tutan, toplumun sorunlarına karşı duyarsız ve bencil kalabilen insanlar vardır. Fakat onlar da maddi gücün bile yetersiz kaldığı bir hastalıkla, iflasla, çaresizlikle yüzleşebilirler. Masaldaki padişah gibi, modern iktidar da kırılgandır.

Benim biçimlendirdiğim Padişah, bu çelişkiyi taşır. Tahtına oturmuş, rahatlık içinde bütün işleri oturduğu yerden kontrol eder. Parlak Raku sırlı giysileri ve stilize tahtı, soyluluğun ve otoritenin gösterişli kabuğudur. Yüzündeki hafif alaycı, rahat ifade ve bacak bacak üstüne atmış umursamaz duruşu, kendini ölümsüz sanan iktidarın rehavetidir. Tahtının etrafına dizdiğim elmalar ise onun en büyük arzusunu anlatır: çocukları ve soyunun ebedi oluşu, sonsuza kadar sürecek bir saltanat hayali."""
PADISAH_EN = """In Turkish tales the sultan type is a symbol of a certain authority and power. The whole order is in his hands. Yet this absolute power does not mean he is invincible. In the tales there are situations that even the mightiest sultan cannot overcome; he needs the wisdom and help of others.

This archetype lives on today. There are people who hold power and authority and can remain indifferent and selfish towards society’s problems. But they too may come face to face with an illness, a bankruptcy or a helplessness against which even material power falls short. Like the sultan in the tale, modern power is fragile.

The Sultan I have shaped carries this contradiction. Seated on his throne, he controls all affairs in comfort from where he sits. His glossy raku-glazed robes and stylised throne are the showy shell of nobility and authority. The slightly mocking, relaxed expression on his face and his careless cross-legged posture are the complacency of a power that believes itself immortal. The apples I have arranged around his throne tell of his greatest desire: his children and the eternity of his line, the dream of a reign that will last forever."""

# ---- 1. Cloudinary yükleme --------------------------------------------------------
YUKLE = [('Şehzade/Şehzade.jpg', 'uarttasarim/heykel/sehzade-2026-10-16-1'), ('Şehzade/Şehzade1.jpg', 'uarttasarim/heykel/sehzade-2026-10-16-2')]
results_path = WORK / 'uploads.json'
results = json.loads(results_path.read_text()) if results_path.exists() else {}
cloud, key, secret = ENV['CLOUDINARY_CLOUD_NAME'], ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']
for rel, pid in YUKLE:
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
COLS = ['year', 'medium_tr', 'medium_en', 'dimensions_tr', 'dimensions_en', 'description_tr', 'description_en']
yedek = {
    'products': psql_json(f"select json_agg(t) from (select id, slug, {', '.join(COLS)} from products where slug in ('sahmaran-v-karsilasma','padisah')) t"),
    'product_images': psql_json("select json_agg(t order by id) from (select id, product_id, url, sort_order, is_visible from product_images where product_id = (select id from products where slug='sehzade')) t"),
}
(SQLDIR / 'yedek/masal-belgeler-2026-10-16b.json').write_text(json.dumps(yedek, ensure_ascii=False, indent=1))
by = {r['slug']: r for r in yedek['products']}
seri_tr, seri_en = by['padisah']['description_tr'], by['padisah']['description_en']
assert seri_tr.startswith('Anadolu’nun sözlü kültüründe') and seri_en.startswith('Passed down'), 'Padişah metni artık seri metni değil — DUR'
imgs = yedek['product_images']
sid = imgs[0]['product_id']
sahne = [i['id'] for i in imgs if '/sehzade-2026-10-' in i['url'] and '/sehzade-2026-10-16-' not in i['url'] and i['is_visible']]
eski2 = [i['id'] for i in imgs if i['url'].endswith('/uarttasarim/heykel/sehzade-2.jpg')]
assert len(sahne) == 3 and len(eski2) == 1, f'beklenmeyen Şehzade görselleri: {imgs}'

# ---- 3. SQL --------------------------------------------------------------------
sql = ['-- Üretildi: scripts/masal-belgeler-2026-10-16b.py — sanatçının 16 Eki cevapları. Silme yok.',
       '-- Geri alma: 2026-10-16b-masal-GERI-AL.sql (yedek: scripts/sql/yedek/masal-belgeler-2026-10-16b.json)', 'BEGIN;',
       "UPDATE products SET year = 2012 WHERE slug = 'sahmaran-v-karsilasma';",
       f"UPDATE products SET year = 2009, medium_tr = {q('Serbest şekillendirme, şamotlu çamur ve Raku pişirimi')}, "
       f"medium_en = {q('Free-formed grogged clay, raku firing')}, dimensions_tr = '45 × 50 cm', dimensions_en = '45 × 50 cm', "
       f"description_tr = {q(PADISAH_TR + chr(10) * 2 + seri_tr)}, description_en = {q(PADISAH_EN + chr(10) * 2 + seri_en)} WHERE slug = 'padisah';",
       f"UPDATE product_images SET is_visible = false WHERE id IN ({', '.join(map(str, sahne))}); -- dünkü sahnelenmiş 3 kare (Drive'dan kalktı)"]
for n, (rel, pid) in enumerate(YUKLE):
    sql.append(f"INSERT INTO product_images (product_id, url, sort_order, is_visible) VALUES ({sid}, {q(results[pid]['url'])}, {n}, true); -- {rel}")
sql.append(f"UPDATE product_images SET is_visible = true, sort_order = 2 WHERE id = {eski2[0]}; -- sehzade-2 = Drive Şehzade3.jpg")
sql.append('COMMIT;')
(SQLDIR / '2026-10-16b-masal.sql').write_text('\n'.join(sql) + '\n')

geri = ['-- 2026-10-16b-masal.sql geri alma — yedekten. Cloudinary dosyaları kalır.', 'BEGIN;',
        f"DELETE FROM product_images WHERE product_id = {sid} AND url IN ({', '.join(q(results[p]['url']) for _, p in YUKLE)});"]
for r in yedek['products']:
    geri.append(f"UPDATE products SET {', '.join(f'{c} = {q(r[c])}' for c in COLS)} WHERE id = {r['id']};")
for i in imgs:
    geri.append(f"UPDATE product_images SET is_visible = {q(i['is_visible'])}, sort_order = {i['sort_order']} WHERE id = {i['id']};")
geri.append('COMMIT;')
(SQLDIR / '2026-10-16b-masal-GERI-AL.sql').write_text('\n'.join(geri) + '\n')
print('SQL hazır; yedek', len(yedek['products']), 'eser,', len(imgs), 'görsel')
