#!/usr/bin/env python3
"""
Görev A — ablanın Drive'a 5–6 Kas'ta eklediği ve sitede hiçbir karşılığı olmayan kareleri SEO adıyla Cloudinary'ye
yükler ve product_images'a GİZLİ (is_visible=false) ekleyen SQL + GERI-AL üretir (UYGULAMAZ).
Neden gizli: üç karenin üçü de 6-foto sınırı dolu eserlerde; hangisinin yerine görüneceği rc/ablaya soruldu.
Kararla görünür yapmak = tek UPDATE (is_visible=true) + bir eski karenin is_visible=false.

  python3 scripts/gorevA-yeni-ekle.py <drive-klasoru>
Seçim gözle yapıldı (kontakt: gorevA-yeni-kareler.py → adaylar.jpg); diğer 6 aday sitedeki karelerin yeniden kaydı çıktı.
"""
import hashlib, json, sys, time
from pathlib import Path
import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
D = Path(sys.argv[1])
ENV = {}
for l in (ROOT / '.env.local').read_text().splitlines():
    if '=' in l and not l.lstrip().startswith('#'):
        k, v = l.split('=', 1); ENV.setdefault(k, v.strip().strip('"'))

YENI = [  # (eser slug, Drive yolu, SEO adı, alt TR, alt EN)
    ('troia-yili-anisina-1915', 'Galeri/mimari duvar panoları/Troia yılı anısına 1915/Uarttasarım_Troia Yılı Anısına_Ceramic Art.jpg',
     'uarttasarim-troia-yili-anisina-1915-ceramic-art-wall', 'Troya Yılı Anısına 1915 — duvarda · Uarttasarım seramik',
     'In Memory of the Year of Troy, 1915 — on the wall · Uarttasarım ceramics'),
    ('the-threshold-of-the-day', 'Galeri/Resimli seramikler/Zamansız manzaralar serisi/The Threshold of the Day/The Threshold of the Day by_Melike Doğan_uarttasarım.jpg',
     'uarttasarim-the-threshold-of-the-day-ceramic-plate', 'Günün Eşiği · Uarttasarım seramik', 'The Threshold of the Day · Uarttasarım ceramics'),
    ('the-sleep-of-deep-water', 'Galeri/Resimli seramikler/Zamansız manzaralar serisi/The Sleep of Deep Water/Uartasarım_The Sleep of Deep Water_ceramic form.jpg',
     'uarttasarim-the-sleep-of-deep-water-ceramic-bowl', 'Derin Suyun Uykusu · Uarttasarım seramik', 'The Sleep of Deep Water · Uarttasarım ceramics'),
]
TMP = ROOT / 'arsiv/gorevA-yeni'; TMP.mkdir(parents=True, exist_ok=True)
q = lambda s: "'" + s.replace("'", "''") + "'"
ileri, geri, urls = [], [], []
for slug, yol, ad, atr, aen in YENI:
    im = ImageOps.exif_transpose(Image.open(D / yol)).convert('RGB'); im.thumbnail((2560, 2560), Image.LANCZOS)
    f = TMP / f'{ad}.jpg'; im.save(f, 'JPEG', quality=88, optimize=True)
    p = {'public_id': f'uarttasarim/eser/{ad}', 'timestamp': int(time.time()), 'overwrite': 'false'}
    p['signature'] = hashlib.sha1(('&'.join(f'{k}={p[k]}' for k in sorted(p)) + ENV['CLOUDINARY_API_SECRET']).encode()).hexdigest()
    p['api_key'] = ENV['CLOUDINARY_API_KEY']
    r = requests.post(f"https://api.cloudinary.com/v1_1/{ENV['CLOUDINARY_CLOUD_NAME']}/image/upload", data=p, files={'file': open(f, 'rb')}, timeout=180)
    r.raise_for_status(); u = r.json()['secure_url']
    assert requests.head(u, timeout=60).status_code == 200
    urls.append(u); print(slug, u)
    ileri.append(f"INSERT INTO product_images (product_id, url, alt_tr, alt_en, sort_order, is_visible) VALUES "
                 f"((select id from products where slug={q(slug)}), {q(u)}, {q(atr)}, {q(aen)}, 100, false);")
    geri.append(f"DELETE FROM product_images WHERE url={q(u)};")
bas = '-- Görev A (10 Kas): ablanın Drive\'a eklediği, sitede karşılığı olmayan 3 kare — GİZLİ eklenir (6-foto sınırı; karar rc/ablada).\n'
(ROOT / 'scripts/sql/2026-11-10-yeni-kareler-gizli.sql').write_text(bas + 'BEGIN;\n' + '\n'.join(ileri) + '\nCOMMIT;\n')
(ROOT / 'scripts/sql/2026-11-10-yeni-kareler-gizli-GERI-AL.sql').write_text(bas + 'BEGIN;\n' + '\n'.join(geri) + '\nCOMMIT;\n')
print('SQL hazır')
