#!/usr/bin/env python3
"""
Zamansız Manzaralar (DB kategorisi 'Resimli Seramikler') — her eserde EN FARKLI 6 fotoğraf (ABLAM-UART-ISTEK, 21 Eki).
Silme YOK: fazla kareler is_visible=false (0007 düzeni). Kapak (sitedeki ilk fotoğraf) hep tutulur.
Seçim: en uzak nokta (farthest-point) — her adımda seçilmişlere EN AZ benzeyen kare eklenir.
Benzerlik: 24×24 Lab renk + 32×32 kenar izi; bulanık / küçük kareye ceza. Kalan sıra mevcut sort_order'a göre.
SQL ÜRETİR, UYGULAMAZ: scripts/sql/2026-10-21-zamansiz-6-foto.sql + GERI-AL. Seçim JSON'u: scripts/data/zamansiz-6-foto.json
Kullanım: python3 scripts/zamansiz-6-foto.py <kaynak-klasör (id.jpg)>
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np, cv2

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])
DB = next(l.split('=', 1)[1].strip().strip('"') for l in (ROOT / '.env.local').read_text().splitlines() if l.startswith('DATABASE_URL='))
K = 6
rows = json.loads(subprocess.run(['psql', DB, '-At', '-c', """select json_agg(t) from (select p.slug, i.id, i.sort_order from products p
  join product_images i on i.product_id=p.id where p.category='Resimli Seramikler' and p.is_visible and i.is_visible
  order by p.slug, i.sort_order, i.id) t"""], capture_output=True, text=True, check=True).stdout)


def oz(path):
    im = cv2.imread(str(path)); h, w = im.shape[:2]
    lab = cv2.cvtColor(cv2.resize(im, (24, 24), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2LAB).astype(float).ravel() / 255
    g = cv2.cvtColor(cv2.resize(im, (256, 256), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    e = cv2.resize(cv2.Canny(g, 60, 160).astype(float), (32, 32), interpolation=cv2.INTER_AREA).ravel() / 255
    netlik = cv2.Laplacian(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()
    return np.concatenate([lab / np.sqrt(lab.size), e / np.sqrt(e.size)]), netlik, min(h, w)


# 21 Eki görsel inceleme: algoritma bazı eserlerde benzer yakın çekimleri biriktirdi / alt-yan açıyı kaçırdı
# ya da karanlık-bulanık kare seçti → elle düzeltilen nihai 6'lar (kapak hep ilk).
ELLE = {
    'the-sleep-of-deep-water': [462, 465, 466, 467, 471, 472],      # 474 karanlık/bulanık → 471 alttan
    'the-sleep-of-the-branches': [440, 448, 450, 458, 459, 460],    # 4 benzer desen yakını → yan + alt açılar
    'the-sun-within-me': [252, 255, 256, 257, 262, 264],            # 253 (252 tekrarı) → 262 alttan
    'the-threshold-of-the-day': [347, 348, 352, 353, 362, 367],     # 357 yakın tekrarı → 362 alttan
    'the-trees-first-home': [426, 429, 430, 436, 437, 438],         # 428 (426 tekrarı) → 437 alttan
    'the-turning-sky': [268, 269, 272, 282, 286, 288],              # 281 boşluklu şerit → 269 kaideli yan
    'the-worlds-first-dream': [411, 415, 418, 421, 424, 425],       # 412/416 üstten tekrar → 424/425 alt
}

eserler = {}
for r in rows:
    eserler.setdefault(r['slug'], []).append(r)
secim = {}
for slug, imgs in eserler.items():
    ids = [r['id'] for r in imgs]
    if len(ids) <= K:
        secim[slug] = {'tut': ids, 'gizle': []}; continue
    f = {i: oz(SRC / f'{i}.jpg') for i in ids}
    net = np.array([f[i][1] for i in ids]); kucuk = np.array([f[i][2] for i in ids])
    ceza = {i: (0.5 if f[i][1] < np.percentile(net, 20) else 0) + (0.5 if f[i][2] < 900 else 0) for i in ids}
    sec = [ids[0]]                                  # kapak
    while len(sec) < K:
        en = max((i for i in ids if i not in sec),
                 key=lambda i: min(np.linalg.norm(f[i][0] - f[j][0]) for j in sec) * (1 - 0.35 * ceza[i]))
        sec.append(en)
    if slug in ELLE:
        assert set(ELLE[slug]) <= set(ids) and ids[0] in ELLE[slug], slug
        sec = ELLE[slug]
    tut = [i for i in ids if i in sec]              # mevcut sırayı koru
    secim[slug] = {'tut': tut, 'gizle': [i for i in ids if i not in sec]}

(ROOT / 'scripts/data/zamansiz-6-foto.json').write_text(json.dumps(secim, indent=1))
gizle = [i for v in secim.values() for i in v['gizle']]
sql = ['-- Zamansız Manzaralar: eser başına en farklı 6 fotoğraf (ABLAM-UART-ISTEK 21 Eki). SİLME YOK, gizleme.',
       '-- Geri alma: 2026-10-21-zamansiz-6-foto-GERI-AL.sql', 'BEGIN;',
       f"UPDATE product_images SET is_visible = false WHERE id IN ({', '.join(map(str, gizle))});", 'COMMIT;']
(ROOT / 'scripts/sql/2026-10-21-zamansiz-6-foto.sql').write_text('\n'.join(sql) + '\n')
(ROOT / 'scripts/sql/2026-10-21-zamansiz-6-foto-GERI-AL.sql').write_text(
    f"BEGIN;\nUPDATE product_images SET is_visible = true WHERE id IN ({', '.join(map(str, gizle))});\nCOMMIT;\n")
for s, v in secim.items():
    print(f"{s}: tut {v['tut']} · gizle {len(v['gizle'])}")
print('toplam gizlenecek', len(gizle))
