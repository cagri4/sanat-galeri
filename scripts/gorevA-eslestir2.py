#!/usr/bin/env python3
"""
Görev A — eşleştirmenin 2. turu: pHash'le eşleşmeyen GÖRÜNÜR ürün fotoğraflarını, aynı eserin Drive klasöründeki
dosyalarla ÖZELLİK NOKTASI (SIFT + RANSAC homografi) ile karşılaştırır. Kırpılmış/yeniden kaydedilmiş/renk ayarlı
kopyaları yakalar. Yalnız rapor yazar.

  python3 scripts/gorevA-eslestir2.py <drive> <db-kareler> <esles.json> <cikti.json>
"""
import json, sys, collections
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageOps

DRIVE, DBK, ES, OUT = map(Path, sys.argv[1:5])
ROOT = Path(__file__).resolve().parent.parent
Y = ROOT / 'scripts/sql/yedek'
pi = {r['id']: r for r in json.load(open(Y / 'product_images-2026-11-10-gorevA-oncesi.json'))}
es = json.load(open(ES))['db']
sift = cv2.SIFT_create(1500)
bf = cv2.BFMatcher()
Image.MAX_IMAGE_PIXELS = None


def oku(p: Path, maks=900):
    im = Image.open(p); im.draft('RGB', (maks * 2, maks * 2))
    im = ImageOps.exif_transpose(im).convert('L'); im.thumbnail((maks, maks))
    return np.asarray(im)


_ozc = {}


def oz(p):
    if p not in _ozc:
        _ozc[p] = sift.detectAndCompute(oku(p), None)
    return _ozc[p]


def skor(a, b):
    ka, da = oz(a); kb, db_ = oz(b)
    if da is None or db_ is None or len(ka) < 10 or len(kb) < 10:
        return 0
    m = [x for x, y in (p for p in bf.knnMatch(da, db_, k=2) if len(p) == 2) if x.distance < 0.75 * y.distance]
    if len(m) < 8:
        return len(m)
    src = np.float32([ka[x.queryIdx].pt for x in m]); dst = np.float32([kb[x.trainIdx].pt for x in m])
    H, mask = cv2.findHomography(src, dst, cv2.RANSAC, 6.0)
    return int(mask.sum()) if mask is not None else 0


# ürün → Drive klasör(ler)i (1. turda güvenle eşleşenlerden)
klasor = collections.defaultdict(collections.Counter)
for k, v in es.items():
    if k[0] == 'p' and v['mesafe'] <= 10:
        klasor[pi[int(k[1:])]['product_id']]['/'.join(v['drive'].split('/')[:-1])] += 1

tum_drive = [p for p in DRIVE.rglob('*') if p.is_file() and p.suffix.lower() not in ('.docx', '.doc', '.xlsx')]
sonuc = {}
for k, v in es.items():
    if k[0] != 'p' or v['mesafe'] <= 10:
        continue
    r = pi[int(k[1:])]
    if not r['is_visible']:
        continue
    kl = [DRIVE / f for f in klasor.get(r['product_id'], {})]
    adaylar = [p for p in tum_drive if any(p.parent == x or x in p.parents for x in kl)] if kl else []
    puan = sorted(((skor(DBK / f'{k}.jpg', p), p) for p in adaylar), key=lambda x: -x[0])[:2]
    sonuc[k] = {'urun': r['product_id'], 'klasor': [str(x.relative_to(DRIVE)) for x in kl],
                'en': [str(puan[0][1].relative_to(DRIVE)), puan[0][0]] if puan else None,
                'ikinci': [str(puan[1][1].relative_to(DRIVE)), puan[1][0]] if len(puan) > 1 else None}
    print(k, sonuc[k]['en'], sonuc[k]['ikinci'] and sonuc[k]['ikinci'][1], flush=True)
json.dump(sonuc, open(OUT, 'w'), ensure_ascii=False, indent=1)
