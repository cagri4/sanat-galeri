"""Kalyx Krater — fotoğraf siluetinden dönel (torna) yaklaşık model. Yapay zekâ YOK.
Profil kalyx.jpg üzerinde ızgarayla elle ölçüldü (piksel). Arka yüz ön yüzün aynasıdır; kulplar yoktur."""
import numpy as np, trimesh
from PIL import Image
P = [(383,368),(410,370),(420,352),(440,330),(460,309),(480,297),(500,285),(520,274),(540,264),(560,256),(580,248),
     (600,240),(620,233),(640,226),(660,220),(680,216),(700,212),(720,203),(740,192),(760,177),(780,160),(800,137),
     (820,108),(835,86),(870,88),(885,110),(895,140),(905,150),(955,150),(963,142)]
CX, TOP, BOT = 452, 383, 963
HEIGHT_M = 0.30                     # temsilî — gerçek ölçü künyede yok
s = HEIGHT_M / (BOT - TOP)
ys = np.arange(TOP, BOT + 1, 2.0)
rs = np.interp(ys, [p[0] for p in P], [p[1] for p in P])
N = 160
th = np.linspace(0, 2 * np.pi, N + 1)          # dikiş için son sütun tekrar
photo = np.asarray(Image.open('kalyx.jpg').convert('RGB'))
# doku: satır = profil satırı, sütun = açı; x = CX + r·sinθ (θ=0 kameraya bakar)
TW, TH = 2048, len(ys)
tex = np.zeros((TH, TW, 3), np.uint8)
tt = np.linspace(0, 2 * np.pi, TW, endpoint=False)
for i, (y, r) in enumerate(zip(ys, rs)):
    xs = np.clip(np.round(CX + r * np.sin(tt)).astype(int), 0, photo.shape[1] - 1)
    tex[i] = photo[int(y), xs]
Image.fromarray(tex).resize((TW, 1024)).save('doku.jpg', quality=90)
# dış yüzey
V, UV, F = [], [], []
for i, (y, r) in enumerate(zip(ys, rs)):
    for j, t in enumerate(th):
        V.append([r * s * np.sin(t), (BOT - y) * s, r * s * np.cos(t)])
        UV.append([t / (2 * np.pi), 1 - i / (len(ys) - 1)])
R = N + 1
for i in range(len(ys) - 1):
    for j in range(N):
        a, b, c, d = i * R + j, i * R + j + 1, (i + 1) * R + j, (i + 1) * R + j + 1
        F += [[a, c, b], [b, c, d]]
outer = trimesh.Trimesh(np.array(V), np.array(F), process=False,
    visual=trimesh.visual.TextureVisuals(uv=np.array(UV), material=trimesh.visual.material.PBRMaterial(
        baseColorTexture=Image.open('doku.jpg'), metallicFactor=0.0, roughnessFactor=0.55)))
# iç yüzey + ağız halkası + taban (düz koyu renk)
WALL = 9
iys = ys[ys <= 805]; irs = np.maximum(np.interp(iys, ys, rs) - WALL, 5)
iys = np.append(iys, 812); irs = np.append(irs, 1)
V2, F2 = [], []
def ring(y, r): return [[r * s * np.sin(t), (BOT - y) * s, r * s * np.cos(t)] for t in th[:-1]]
for y, r in zip(iys, irs): V2 += ring(y, r)
for i in range(len(iys) - 1):
    for j in range(N):
        a, b = i * N + j, i * N + (j + 1) % N; c, d = a + N, b + N
        F2 += [[a, b, c], [b, d, c]]          # içe bakan normal
base = len(V2); V2 += ring(TOP, rs[0])        # ağız: dış üst halka ↔ iç üst halka
for j in range(N):
    a, b = base + j, base + (j + 1) % N; c, d = j, (j + 1) % N
    F2 += [[a, c, b], [b, c, d]]
bc = len(V2); V2.append([0, 0, 0]); bb = len(V2); V2 += ring(BOT, rs[-1])   # alt taban
for j in range(N): F2.append([bc, bb + j, bb + (j + 1) % N])
inner = trimesh.Trimesh(np.array(V2), np.array(F2), process=False)
inner.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
    baseColorFactor=[38, 32, 28, 255], metallicFactor=0.0, roughnessFactor=0.7))
sc = trimesh.Scene(); sc.add_geometry(outer, 'dis'); sc.add_geometry(inner, 'ic')
sc.export('kalyx-krater-torna.glb')
print('ok', len(V), len(F) + len(F2))
