#!/usr/bin/env python3
"""
Panolar (DB kategorisi 'Mimari Duvar Panoları') — her eser EN FAZLA 6 fotoğraf (ABLAM-UART-ISTEK-2, 21 Eki).
Zamansız Manzaralar'daki mantık (scripts/zamansiz-6-foto.py): kapak + en uzak nokta seçimi, silme yok (is_visible=false).
Ek: Şeref sitesinin seçtiği kareler (lib/seref-studio.ts SEREF_SECIM) KESİN tutulur — iki site tutarlı kalsın.
6 ve altı olan eser dokunulmaz. SQL ÜRETİR: scripts/sql/2026-10-21-panolar-6-foto.sql + GERI-AL.
Kullanım: python3 scripts/panolar-6-foto.py <kaynak-klasör (id.jpg)>
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np, cv2

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])
DB = next(l.split('=', 1)[1].strip().strip('"') for l in (ROOT / '.env.local').read_text().splitlines() if l.startswith('DATABASE_URL='))
K = 6
SEREF = {s: [int(x) for x in ids.split(',')] for s, ids in re.findall(r"'([a-z0-9-]+)': \[([\d, ]+)\]", (ROOT / 'src/lib/seref-studio.ts').read_text())}
ELLE: dict = {   # 21 Eki görsel inceleme
    'yurekli-yigitlerin-anisina-1915': [208, 210, 211, 217, 218, 219],   # 222 (208 tekrarı) → 217 deniz detayı
}
rows = json.loads(subprocess.run(['psql', DB, '-At', '-c', """select json_agg(t) from (select p.slug, i.id from products p
  join product_images i on i.product_id=p.id where p.category='Mimari Duvar Panoları' and p.is_visible and i.is_visible
  order by p.slug, i.sort_order, i.id) t"""], capture_output=True, text=True, check=True).stdout)


def oz(path):
    im = cv2.imread(str(path)); h, w = im.shape[:2]
    lab = cv2.cvtColor(cv2.resize(im, (24, 24), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2LAB).astype(float).ravel() / 255
    g = cv2.cvtColor(cv2.resize(im, (256, 256), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    e = cv2.resize(cv2.Canny(g, 60, 160).astype(float), (32, 32), interpolation=cv2.INTER_AREA).ravel() / 255
    return np.concatenate([lab / np.sqrt(lab.size), e / np.sqrt(e.size)]), min(h, w)


eserler = {}
for r in rows:
    eserler.setdefault(r['slug'], []).append(r['id'])
secim = {}
for slug, ids in eserler.items():
    if len(ids) <= K:
        secim[slug] = {'tut': ids, 'gizle': []}; continue
    f = {i: oz(SRC / f'{i}.jpg') for i in ids}
    sec = [ids[0]] + [i for i in SEREF.get(slug, []) if i in ids and i != ids[0]]
    sec = sec[:K]
    while len(sec) < K:
        sec.append(max((i for i in ids if i not in sec),
                       key=lambda i: min(np.linalg.norm(f[i][0] - f[j][0]) for j in sec) * (0.75 if f[i][1] < 900 else 1)))
    if slug in ELLE:
        sec = ELLE[slug]
    secim[slug] = {'tut': [i for i in ids if i in sec], 'gizle': [i for i in ids if i not in sec]}

(ROOT / 'scripts/data/panolar-6-foto.json').write_text(json.dumps(secim, indent=1))
gizle = [i for v in secim.values() for i in v['gizle']]
(ROOT / 'scripts/sql/2026-10-21-panolar-6-foto.sql').write_text(
    "-- Panolar: eser başına en fazla 6 fotoğraf (ABLAM-UART-ISTEK-2). SİLME YOK. Geri alma: -GERI-AL.sql\nBEGIN;\n"
    f"UPDATE product_images SET is_visible = false WHERE id IN ({', '.join(map(str, gizle))});\nCOMMIT;\n")
(ROOT / 'scripts/sql/2026-10-21-panolar-6-foto-GERI-AL.sql').write_text(
    f"BEGIN;\nUPDATE product_images SET is_visible = true WHERE id IN ({', '.join(map(str, gizle))});\nCOMMIT;\n")
for s, v in secim.items():
    print(f"{s}: tut {v['tut']} · gizle {len(v['gizle'])}")
print('toplam gizlenecek', len(gizle))
