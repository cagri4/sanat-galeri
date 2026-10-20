#!/usr/bin/env python3
"""
Ana site (uarttasarim.com) — tüm eser fotoğraflarına stüdyo karesi (ANA-SITE-FOTO-BRIEF.md, Çağrı onayı 20 Eki).
ÜCRETSİZ, YEREL: IS-Net (rembg) maskesi. Üretici AI yok — eserin yüzeyi yeniden boyanmaz.
Çıktı: 1600×1600 kare, nötr zemin #F1F0EE (Şeref sitesiyle aynı). Kaynak url'ye dokunulmaz; DB'de studio_url'ye yazılır.

Otomatik mod (her görsel için):
  crop   : maske kenarların çoğuna değiyorsa (>%35) → detay/tam kadraj; merkezden kare kırpılır.
  cutout : nesne maskeyle kesilir, zemine yumuşak gölgeyle oturur (heykel, vazo, tabak, pano…).
  seref  : Şeref'in elle düzeltilmiş stüdyo karesi varsa (scripts/seref-studio.py) o kullanılır.
Kalite bayrakları (rapor.json): dusuk-coz, nesne-kenarda (kesik olabilir), kararsiz-maske, parcali-maske, bos-maske.

Kullanım: <venv>/bin/python scripts/ana-site-studio.py <list.txt> <kaynak-klasör> <çıktı-klasör> [seref-klasör]
list.txt: id|slug|kategori|url
"""
import sys, json
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageFilter

LISTE, SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
SEREF = Path(sys.argv[4]) if len(sys.argv) > 4 else None
OUT.mkdir(parents=True, exist_ok=True)
N, BG = 1600, (241, 240, 238)
RAPOR = OUT / 'rapor.json'
rapor = json.loads(RAPOR.read_text()) if RAPOR.exists() else {}

_sess = None
def maske(im: Image.Image) -> np.ndarray:
    """IS-Net maskesi 1024 px'te hesaplanır (model zaten 1024 çalışır), tam boyuta büyütülür."""
    global _sess
    from rembg import new_session, remove
    if _sess is None:
        _sess = new_session('isnet-general-use')
    k = im.copy(); k.thumbnail((1024, 1024))
    m = np.array(remove(k, session=_sess, only_mask=True))
    return cv2.resize(m, im.size, interpolation=cv2.INTER_LINEAR)


def kare_kirp(im: Image.Image) -> Image.Image:
    W, H = im.size; s = min(W, H)
    x, y = (W - s) // 2, (H - s) // 2
    return im.crop((x, y, x + s, y + s)).resize((N, N), Image.LANCZOS)


def yerlestir(im: Image.Image, m: np.ndarray) -> Image.Image:
    h = np.where(m > 160, 255, 0).astype(np.uint8)            # sert eşik: fon halesi kalmasın
    h = cv2.GaussianBlur(h, (0, 0), 1.5)
    a = Image.fromarray(h)
    rgba = im.convert('RGBA'); rgba.putalpha(a)
    rgba = rgba.crop(a.point(lambda v: 255 if v > 24 else 0).getbbox())
    w, hh = rgba.size; s = 0.80 * N / max(w, hh)
    rgba = rgba.resize((max(1, round(w * s)), max(1, round(hh * s))), Image.LANCZOS)
    w, hh = rgba.size
    x, y = (N - w) // 2, (N - hh) // 2
    c = Image.new('RGB', (N, N), BG)
    sh = rgba.getchannel('A').point(lambda v: int(v * 0.22)).filter(ImageFilter.GaussianBlur(28))
    c.paste((70, 66, 60), (x, y + 18), sh)
    c.paste(rgba, (x, y), rgba)
    return c


def isle(i: str):
    im = Image.open(SRC / f'{i}.jpg').convert('RGB')
    W, H = im.size
    bayrak = []
    if min(W, H) < 900:
        bayrak.append('dusuk-coz')
    if SEREF and (SEREF / f'{i}.jpg').exists():
        Image.open(SEREF / f'{i}.jpg').save(OUT / f'{i}.jpg', quality=90)
        return {'mod': 'seref', 'bayrak': bayrak, 'boyut': [W, H]}
    m = maske(im)
    b = m > 128
    f = float(b.mean())
    kenar = np.concatenate([b[0], b[-1], b[:, 0], b[:, -1]]).mean()
    n, lab, st, _ = cv2.connectedComponentsWithStats(b.astype(np.uint8))
    alanlar = sorted(st[1:, cv2.CC_STAT_AREA], reverse=True) if n > 1 else []
    parcali = len(alanlar) > 1 and alanlar[1] > 0.15 * alanlar[0]
    if f < 0.02:
        bayrak.append('bos-maske'); mod = 'crop'
    elif kenar > 0.35:   # maske kenarların çoğuna değiyor → gerçek detay/doku karesi
        mod = 'crop'
    else:
        mod = 'cutout'
        if kenar > 0.08:
            bayrak.append('nesne-kenarda')
        if f > 0.60:     # nesne kareyi dolduruyor ama kenarda değil (üstten tabak vb.) — kesilir, kontrol et
            bayrak.append('kararsiz-maske')
        if parcali:
            bayrak.append('parcali-maske')
    out = kare_kirp(im) if mod == 'crop' else yerlestir(im, m)
    out.save(OUT / f'{i}.jpg', 'JPEG', quality=90, optimize=True)
    return {'mod': mod, 'bayrak': bayrak, 'boyut': [W, H], 'maske': round(f, 3), 'kenar': round(float(kenar), 3)}


if __name__ == '__main__':
    satirlar = [l.strip().split('|') for l in LISTE.read_text().splitlines() if l.strip()]
    for k, (i, slug, kat, url) in enumerate(satirlar):
        if i in rapor and (OUT / f'{i}.jpg').exists():
            continue
        r = isle(i)
        r.update(slug=slug, kategori=kat)
        rapor[i] = r
        RAPOR.write_text(json.dumps(rapor, ensure_ascii=False, indent=1))
        print(f'{k + 1}/{len(satirlar)} {i} {slug} {r["mod"]} {",".join(r["bayrak"])}', flush=True)
