# Anka V — videodan 3B model (18–19 Eki 2026)

Kaynak: Drive `VID-20261018-WA0001.mp4` (id 14NNlI41f1JbgPP00aYr9DPw8v_l3jSnx), 35 sn, 480×856 (WhatsApp sıkıştırmalı).
Tümü yerel ve ücretsiz, GPU yok (4 çekirdek CPU). Yapay zekâ kullanılmadı.

1. Kare: `ffmpeg -i video.mp4 -vf "select='not(mod(n\,8))'" -vsync vfr -q:v 2 kareler/k%04d.jpg` → 128 kare
2. SfM: `scripts/3d-anka-v-sfm.py` (pycolmap 4.2, SIFT CPU, sıralı eşleştirme) → 128/128 kare, 7.167 nokta, hata 0,67 px (~4,5 dk)
3. `pycolmap.undistort_images('dense','sparse/0','kareler')`, model metne çevrildi (OpenMVS COLMAP txt okur)
4. OpenMVS (docker `openmvs/openmvs-ubuntu`):
   - `InterfaceCOLMAP -i . -o scene.mvs --image-folder images`
   - `DensifyPointCloud scene.mvs --resolution-level 1 --number-views 4` → 1,3 M nokta (**2 sa 10 dk**, CPU)
   - `ReconstructMesh -i scene_dense.mvs` → 154 bin yüz (sahnenin tamamı)
5. Kırpma: kamera yörüngesinin ekseni bulundu (bakış ışınlarına en yakın nokta + yörünge düzlemi normali);
   masa üstü ile 2,8 birim arası, eksenden 1,4 birim yarıçap → tek parça 84.562 yüz
6. Kaide dahil yeniden kırpma (h > −1,645, tabanda r < 0,7) → 85.673 yüz; `TextureMesh -i scene_dense.mvs --mesh-file anka_kirpik2.ply --export-type obj` → 1024² doku (4 dk)
7. `scripts/3d-anka-v-glb.py`: Y yukarı, kaide tabanı y=0; **ölçek: yükseklik 0,55 m** (künye 30 × 55 cm) → GLB 6,3 MB, ölçü 18 × 55 × 23 cm

Ölçek notu: Model 55 cm'ye ayarlanınca en geniş yeri ~23 cm çıkıyor (künyede 30). Çatal fotoğrafından
ölçmek ~29 cm yükseklik veriyor, ama çatal kameraya heykelden çok daha yakın (perspektif) — güvenilir değil.
Sanatçıdan gerçek yükseklik (kaide dahil/hariç) teyidi istenmeli.

**Karar (19 Eki 2026, Çağrı onayı):** künyedeki 30 × 55 cm geçerli. Model 55 cm yükseklikte kalır; 23 cm genişlik farkı
videoda kaybolan ince kanat uçlarından (sayfa notu bunu söylüyor). Genişliğe göre ölçeklemek yüksekliği ~72 cm yapardı → yapılmadı.

Bilinen kusurlar: ahşap kaidenin yan yüzleri az dokulu olduğu için ince/eksik çıktı; birkaç küçük delikte turuncu doku lekesi; video 480×856 olduğundan yüzey yumuşak.
