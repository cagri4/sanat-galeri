#!/usr/bin/env python3
"""
Görev A — Drive'da olup sitede (product_images, gizli/görünür HİÇBİR satırda) karşılığı olmayan kareleri bul.
1. tur pHash'le hiçbir DB satırına eşleşmeyen, eser klasöründeki (Yapım/montaj ve sergi alt klasörleri hariç) Drive dosyaları
alınır; aynı eserin TÜM DB fotolarıyla SIFT+RANSAC karşılaştırılır. En iyi eşleşme güçlü ve açık ara öndeyse
"yeniden kaydedilmiş kopya", değilse "YENİ aday". Kontakt sayfası üretir (göz kontrolü için).

  python3 scripts/gorevA-yeni-kareler.py <drive> <db-kareler> <esles.json> <cikti-klasoru>
"""
import json, sys, collections, subprocess
from pathlib import Path
import cv2, numpy as np
from PIL import Image, ImageOps

DRIVE, DBK, ES, OUT = map(Path, sys.argv[1:5]); OUT.mkdir(parents=True, exist_ok=True)
Y = Path(__file__).resolve().parent.parent / 'scripts/sql/yedek'
pi = {r['id']: r for r in json.load(open(Y / 'product_images-2026-11-10-gorevA-oncesi.json'))}
pr = {p['id']: p for p in json.load(open(Y / 'products-2026-11-10-gorevA-oncesi.json'))}
es = json.load(open(ES))
sift, bf = cv2.SIFT_create(1500), cv2.BFMatcher()
Image.MAX_IMAGE_PIXELS = None
ATLA = ('yapım', 'yapim', 'montaj', 'sergi', 'yolculuk')


def oku(p, maks=900):
    im = Image.open(p); im.draft('RGB', (maks * 2, maks * 2))
    im = ImageOps.exif_transpose(im).convert('L'); im.thumbnail((maks, maks)); return np.asarray(im)


_c = {}
def oz(p):
    if p not in _c: _c[p] = sift.detectAndCompute(oku(p), None)
    return _c[p]


def skor(a, b):
    ka, da = oz(a); kb, db_ = oz(b)
    if da is None or db_ is None or len(ka) < 10 or len(kb) < 10: return 0
    m = [x for x, y in (p for p in bf.knnMatch(da, db_, k=2) if len(p) == 2) if x.distance < 0.75 * y.distance]
    if len(m) < 8: return len(m)
    H, mask = cv2.findHomography(np.float32([ka[x.queryIdx].pt for x in m]), np.float32([kb[x.trainIdx].pt for x in m]), cv2.RANSAC, 6.0)
    return int(mask.sum()) if mask is not None else 0


# ürün ↔ Drive klasörü (1. tur güvenli eşleşmelerden, en çok geçen klasör)
klasor = collections.defaultdict(collections.Counter)
for k, v in es['db'].items():
    if k[0] == 'p' and v['mesafe'] <= 10:
        klasor['/'.join(v['drive'].split('/')[:-1])][pi[int(k[1:])]['product_id']] += 1
kl_urun = {k: c.most_common(1)[0][0] for k, c in klasor.items()}

adaylar = []
for f in es['drive_eslesmeyen']:
    kl = '/'.join(f.split('/')[:-1])
    if any(a in f.lower() for a in ATLA) or kl not in kl_urun or f.lower().endswith(('.docx', '.doc')):
        continue
    adaylar.append((f, kl_urun[kl]))

rapor = []
for f, uid in adaylar:
    dbler = [r for r in pi.values() if r['product_id'] == uid]
    puan = sorted(((skor(DRIVE / f, DBK / f"p{r['id']}.jpg"), r['id'], r['is_visible']) for r in dbler), reverse=True)
    en, iki = puan[0], (puan[1] if len(puan) > 1 else (0, None, None))
    kopya = en[0] >= 40 and en[0] >= 1.6 * max(iki[0], 1)
    rapor.append({'drive': f, 'urun': pr[uid]['slug'], 'urun_id': uid, 'en': en[:2], 'en_gorunur': en[2], 'ikinci': iki[:2],
                  'karar': 'kopya' if kopya else 'YENI-aday'})
    print(rapor[-1]['karar'], pr[uid]['slug'], f.split('/')[-1][:50], en[:2], iki[0], flush=True)
json.dump(rapor, open(OUT / 'yeni-kareler.json', 'w'), ensure_ascii=False, indent=1)

# kontakt sayfası: her YENİ aday + o eserin sitedeki görünür kareleri
tmp = OUT / 'tmp'; tmp.mkdir(exist_ok=True)
by = collections.defaultdict(list)
for r in rapor:
    by[r['urun_id']].append(r)
for uid, rs in by.items():
    gorunur = sorted((r for r in pi.values() if r['product_id'] == uid and r['is_visible']), key=lambda r: (r['sort_order'] or 0, r['id']))
    kareler = []
    for r in gorunur:
        kareler += ['-label', f"SITE p{r['id']}", str(DBK / f"p{r['id']}.jpg")]
    for i, r in enumerate(rs):
        t = tmp / f'{uid}-{i}.jpg'
        im = ImageOps.exif_transpose(Image.open(DRIVE / r['drive'])).convert('RGB'); im.thumbnail((400, 400)); im.save(t)
        kareler += ['-label', f"{r['karar']} {i}: {Path(r['drive']).name[:28]}", str(t)]
    subprocess.run(['montage', *kareler, '-tile', '6x', '-geometry', '230x230+4+4', '-pointsize', '11', str(OUT / f"kontakt-{pr[uid]['slug']}.jpg")], check=True)
print('aday', sum(r['karar'] == 'YENI-aday' for r in rapor), '/', len(rapor))
