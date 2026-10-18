"""OpenMVS dokulu OBJ → GLB: yörünge ekseni Y yukarı, kaide tabanı y=0, ölçek = künye yüksekliği 0,55 m.
Kullanım: python3 scripts/3d-anka-v-glb.py <anka_doku.obj> <eksen.npz> <çıkış.glb>"""
import sys, numpy as np, trimesh
obj, eks, out = sys.argv[1:4]
e = np.load(eks); X, n = e['X'], e['n']
m = trimesh.load(obj, process=False, force='mesh')
v = m.vertices - X
a = np.cross(n, [1, 0, 0]); a /= np.linalg.norm(a); b = np.cross(n, a)
x, y, z = v @ a, v @ n, v @ b
y -= y.min(); x -= (x.max() + x.min()) / 2; z -= (z.max() + z.min()) / 2
m.vertices = np.c_[x, y, z] * (0.55 / y.max())
m.export(out)
print('ölçü (m):', m.extents.round(3))
