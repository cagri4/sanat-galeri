#!/usr/bin/env python3
"""
Görev A (10 Kas 2026) — 1. adım: Drive'daki (yeniden adlandırılmış) fotoğrafları sitedeki fotoğraflarla EŞLE.
Hiçbir şeye yazmaz; yalnız JSON rapor üretir.

  python3 scripts/gorevA-eslestir.py <drive-indirme-klasoru> <db-kucuk-kareler-klasoru> <cikti.json>

- db klasörü: p<product_images.id>.jpg ve e<exhibition_photos.id>.jpg (Cloudinary w_384 kopyaları)
- Yöntem: EXIF düzeltmeli gri 32×32 → DCT pHash (64 bit) + en/boy oranı. Kırpılmış/değişik kareler eşleşmez → "şüpheli".
- Çıktı: her DB satırı için en yakın Drive dosyası + mesafe + ikinci en yakın; hiçbir DB satırına
  eşleşmeyen Drive kareleri ("yeni aday").
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps

DRIVE, DBK, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
Image.MAX_IMAGE_PIXELS = None
N = 32
_c = np.array([[np.cos(np.pi * (2 * x + 1) * u / (2 * N)) for x in range(N)] for u in range(N)])


def ozellik(p: Path):
    im = Image.open(p)
    im.draft('L', (256, 256))
    im = ImageOps.exif_transpose(im).convert('L')
    w, h = im.size
    a = np.asarray(im.resize((N, N), Image.LANCZOS), dtype=np.float64)
    d = _c @ a @ _c.T
    blok = d[:8, :8].flatten()[1:]
    bits = blok > np.median(blok)
    return bits, w / h


def yukle(dosyalar):
    out = {}
    for p in dosyalar:
        try:
            out[p] = ozellik(p)
        except Exception as e:  # bozuk / desteklenmeyen dosya
            print('atla', p, e, file=sys.stderr)
    return out


drive = yukle([p for p in DRIVE.rglob('*') if p.is_file() and p.suffix.lower() not in ('.docx', '.doc', '.xlsx')])
db = yukle(sorted(DBK.glob('*.jpg')))
dk = list(drive)
DB_ = np.array([drive[k][0] for k in dk])
DR = np.array([drive[k][1] for k in dk])

sonuc, kullanilan = {}, {}
for k, (b, r) in db.items():
    ham = (DB_ != b).sum(1)
    # oran çok farklıysa (kırpma/dönme) cezalandır
    oranfark = np.abs(np.log(DR / r))
    skor = ham + (oranfark > 0.08) * 12
    i = np.argsort(skor)[:2]
    en, iki = i[0], i[1]
    sonuc[k.stem] = {
        'drive': str(dk[en].relative_to(DRIVE)), 'mesafe': int(skor[en]), 'ham': int(ham[en]),
        'oranfark': round(float(oranfark[en]), 3), 'ikinci': str(dk[iki].relative_to(DRIVE)), 'ikinci_mesafe': int(skor[iki]),
    }
    if skor[en] <= 10:
        kullanilan.setdefault(str(dk[en].relative_to(DRIVE)), []).append(k.stem)

# Drive karelerinin birbirine yakınlığı (aynı fotonun iki adla kopyası mı?)
eslesmeyen = [str(k.relative_to(DRIVE)) for k in dk if str(k.relative_to(DRIVE)) not in kullanilan]
kopya = {}
for k in eslesmeyen:
    i = dk.index(DRIVE / k)
    ham = (DB_ != DB_[i]).sum(1)
    ham[i] = 99
    j = int(np.argmin(ham))
    kopya[k] = {'en_yakin_drive': str(dk[j].relative_to(DRIVE)), 'ham': int(ham[j]),
                'o_eslesti_mi': str(dk[j].relative_to(DRIVE)) in kullanilan}

json.dump({'db': sonuc, 'drive_kullanilan': kullanilan, 'drive_eslesmeyen': kopya}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('db', len(db), 'drive', len(drive), 'eşleşen drive', len(kullanilan), 'eşleşmeyen drive', len(eslesmeyen))
