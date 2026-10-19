#!/usr/bin/env python3
"""
Şeref sitesi — stüdyo kareleri (SEREF-FOTO-BRIEF.md, Çağrı kararı 19 Eki).
Kaynak: eserin Cloudinary'deki gerçek fotoğrafları. ÜRETİCİ (generatif) AI YOK — eserin yüzeyi
yeniden boyanmaz; yalnız arka plan atılır, perspektif düzeltilir, kare kırpılır.

Modlar (tümü 1600×1600 kare, aynı nötr zemin):
  panel  : pano duvardan kesilir (IS-Net maskesi → 4 köşe; beyaz duvarda beyaz pano gibi maskenin
           tutmadığı yerde köşeler elle, kaynak fotoğraf ızgarasından okunarak), künye oranına düzlenir, zemine oturur.
           Köşeler elle verilebilir (quad=[(x,y)…] sol-üst, sağ-üst, sağ-alt, sol-alt; 0–1 oran).
  cutout : nesne (heykel, replika) maskeyle kesilir, zemine yumuşak gölgeyle oturur.
  crop   : detay karesi (arka plan zaten yok) — merkez + kenar oranı.

Kullanım: <venv>/bin/python scripts/seref-studio.py <kaynak-klasör> <çıktı-klasör> [id …]
Kaynak klasörde <product_images.id>.jpg dosyaları bulunur.
"""
import sys
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageFilter

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
N = 1600
BG = (241, 240, 238)          # nötr açık gri (#F1F0EE) — tüm karelerde aynı

# künye ölçüsü (yükseklik × genişlik, cm) → düzleme oranı
DIM = {'canakkale': (250, 350), 'yurekli': (250, 350), 'troia': (250, 350), 'sifa': (250, 400),
       'bilgi': (150, 220), 'deniz': (150, 400), 'guzel': (230, 370), 'parion': (250, 350), 'gonul': (250, 350)}

# id → (mod, parametreler)
PLAN = {
    # Çanakkale Şehitleri Anısına
    198: ('panel', {'dim': 'canakkale'}), 199: ('crop', {}), 201: ('crop', {}), 204: ('crop', {}),
    # Yürekli Yiğitlerin Anısına 1915
    208: ('panel', {'dim': 'yurekli', 'quad': [(0.081, 0.2275), (0.925, 0.2275), (0.9375, 0.85), (0.065, 0.831)]}), 210: ('crop', {}), 211: ('crop', {}), 218: ('crop', {}),
    # Troya Yılı Anısına 1915
    237: ('panel', {'dim': 'troia', 'quad': [(0.11, 0.12), (0.89, 0.125), (0.956, 0.913), (0.06, 0.913)]}), 241: ('crop', {}), 229: ('crop', {}), 232: ('crop', {}),
    # Şifanın Işığı
    191: ('panel', {'dim': 'sifa', 'quad': [(0.035, 0.0525), (0.965, 0.0525), (0.965, 0.897), (0.035, 0.897)]}), 192: ('crop', {}), 193: ('crop', {}), 195: ('crop', {}),
    # Akar'ın Deryası (yer döşemesi, dairesel — düzleme yok)
    602: ('crop', {}), 599: ('crop', {}), 601: ('crop', {}), 607: ('crop', {}),
    # Bilginin Kaynağı
    611: ('panel', {'dim': 'bilgi'}), 612: ('crop', {}), 614: ('crop', {}), 615: ('crop', {}),
    # Türk Denizcilerinin Sesi
    629: ('panel', {'dim': 'deniz'}), 633: ('crop', {'cx': 0.3}),
    # Güzel Bakış
    244: ('panel', {'dim': 'guzel', 'quad': [(0.06, 0.123), (0.934, 0.125), (0.94, 0.857), (0.035, 0.875)]}), 245: ('crop', {}), 246: ('crop', {}), 247: ('crop', {}),
    # Parion Esintisi
    179: ('panel', {'dim': 'parion', 'quad': [(0.065, 0.112), (0.8475, 0.017), (0.85, 0.93), (0.085, 0.83)]}), 188: ('crop', {}), 182: ('crop', {}), 190: ('crop', {}),
    # Gönül Gözü
    168: ('panel', {'dim': 'gonul', 'quad': [(0.0375, 0.019), (0.95, 0.019), (0.95, 0.914), (0.0375, 0.914)]}), 171: ('crop', {}), 172: ('crop', {}), 176: ('crop', {}),
    # Gizem, Oluşum ve Sonsuzluk (bitki/oda önünde → yalnız detay)
    620: ('crop', {}), 626: ('crop', {}), 627: ('crop', {'cx': 0.52, 'cy': 0.5, 'size': 0.78}), 628: ('crop', {}),
    # Anadolu Ekininde Güzeller (heykel)
    647: ('cutout', {}), 637: ('cutout', {}), 645: ('cutout', {}), 649: ('cutout', {}),
    # Antik dönem replikaları
    496: ('cutout', {}), 518: ('cutout', {}), 483: ('cutout', {}), 478: ('cutout', {}), 511: ('cutout', {}), 485: ('cutout', {}),
}

_sess = None
def mask(im: Image.Image, hard: bool = False) -> np.ndarray:
    """IS-Net (rembg, yerel ONNX; BiRefNet 7 GB RAM'de OOM) alfa maskesi, 0–255."""
    global _sess
    from rembg import new_session, remove
    if _sess is None:
        _sess = new_session('isnet-general-use')
    m = np.array(remove(im, session=_sess, only_mask=True))
    if hard:  # kesmelerde fon halesi kalmasın: eşik + hafif yumuşak kenar
        m = np.where(m > 160, 255, 0).astype(np.uint8)
        m = cv2.GaussianBlur(m, (0, 0), 1.5)
    return m


def canvas():
    return Image.new('RGB', (N, N), BG)


def shadow(alpha: Image.Image, off=(0, 18), blur=28, op=0.22):
    a = alpha.point(lambda v: int(v * op)).filter(ImageFilter.GaussianBlur(blur))
    return a, off


def place(rgba: Image.Image, frac: float, base=False) -> Image.Image:
    """RGBA nesneyi kareye ölçekleyip ortalar; gölge düşer."""
    w, h = rgba.size
    s = frac * N / max(w, h)
    rgba = rgba.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    w, h = rgba.size
    x, y = (N - w) // 2, (N - h) // 2
    if base:  # heykel/replika: zemine otursun, biraz aşağıda
        y = min(N - h - int(N * 0.08), y + int(N * 0.03))
    c = canvas()
    sh, (dx, dy) = shadow(rgba.getchannel('A'))
    c.paste((70, 66, 60), (x + dx, y + dy), sh)
    c.paste(rgba, (x, y), rgba)
    return c


def order(pts):
    pts = np.array(pts, dtype=np.float32)
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    return np.array([pts[s.argmin()], pts[d.argmin()], pts[s.argmax()], pts[d.argmax()]], dtype=np.float32)


def quad_from_mask(m: np.ndarray):
    _, b = cv2.threshold(m, 127, 255, cv2.THRESH_BINARY)
    cs, _ = cv2.findContours(b, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cs, key=cv2.contourArea)
    hull = cv2.convexHull(c)
    peri = cv2.arcLength(hull, True)
    for eps in (0.01, 0.02, 0.03, 0.05, 0.08):
        ap = cv2.approxPolyDP(hull, eps * peri, True)
        if len(ap) == 4:
            return order(ap.reshape(4, 2))
    return order(cv2.boxPoints(cv2.minAreaRect(c)))


def panel(im: Image.Image, p: dict) -> Image.Image:
    a = np.array(im)
    H, W = a.shape[:2]
    if 'quad' in p:
        q = order([(x * W, y * H) for x, y in p['quad']])
    else:
        q = quad_from_mask(mask(im))
    h_cm, w_cm = DIM[p['dim']]
    ow = 2400
    oh = round(ow * h_cm / w_cm)
    M = cv2.getPerspectiveTransform(q, np.float32([[0, 0], [ow, 0], [ow, oh], [0, oh]]))
    flat = Image.fromarray(cv2.warpPerspective(a, M, (ow, oh), flags=cv2.INTER_CUBIC))
    return place(flat.convert('RGBA'), 0.86)


def crop(im: Image.Image, p: dict) -> Image.Image:
    W, H = im.size
    side = int(min(W, H) * p.get('size', 1.0))
    cx, cy = p.get('cx', 0.5) * W, p.get('cy', 0.5) * H
    x = int(min(max(cx - side / 2, 0), W - side))
    y = int(min(max(cy - side / 2, 0), H - side))
    return im.crop((x, y, x + side, y + side)).resize((N, N), Image.LANCZOS)


def cutout(im: Image.Image, p: dict) -> Image.Image:
    m = Image.fromarray(mask(im, hard=True))
    rgba = im.convert('RGBA')
    rgba.putalpha(m)
    bbox = m.point(lambda v: 255 if v > 24 else 0).getbbox()
    return place(rgba.crop(bbox), p.get('frac', 0.80), base=True)


def hero(im: Image.Image, out: Path):
    """Hero: heykel kesilir, 2400×1350 stüdyo zemininde sağ üçte bire oturur (solda ad için boş zemin)."""
    W, H = 2400, 1350
    m = Image.fromarray(mask(im, hard=True))
    rgba = im.convert('RGBA'); rgba.putalpha(m)
    rgba = rgba.crop(m.point(lambda v: 255 if v > 24 else 0).getbbox())
    s = 0.80 * H / rgba.height
    rgba = rgba.resize((round(rgba.width * s), round(rgba.height * s)), Image.LANCZOS)
    c = Image.new('RGB', (W, H), BG)
    x, y = int(W * 0.66 - rgba.width / 2), int(H * 0.53 - rgba.height / 2)
    sh, (dx, dy) = shadow(rgba.getchannel('A'))
    c.paste((70, 66, 60), (x + dx, y + dy), sh)
    c.paste(rgba, (x, y), rgba)
    c.save(out / 'hero.jpg', 'JPEG', quality=90, optimize=True)


if __name__ == '__main__':
    if sys.argv[3:] == ['hero']:
        hero(Image.open(SRC / '637.jpg').convert('RGB'), OUT); print('hero'); sys.exit()
    ids = [int(x) for x in sys.argv[3:]] or list(PLAN)
    for i in ids:
        mod, p = PLAN[i]
        im = Image.open(SRC / f'{i}.jpg').convert('RGB')
        out = {'panel': panel, 'crop': crop, 'cutout': cutout}[mod](im, p)
        out.save(OUT / f'{i}.jpg', 'JPEG', quality=90, optimize=True)
        print(i, mod, flush=True)
