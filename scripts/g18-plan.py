#!/usr/bin/env python3
"""18 Kas — Ablam'ın 13–14 Kas Drive güncellemesi → site fark planı (SALT OKUMA; uygulamaz).
Kullanım: python3 scripts/g18-plan.py <scratch-dir>   (scratch: drive/, site.json, hash.json — kirik/hash.py üretir)
Kural: eserin görünür seti = Drive klasöründeki fotolar. Drive karesi sitedeki bir satırla dHash ≤15 ise o satır
yeniden kullanılır (yükleme yok); değilse Cloudinary'ye yeni kare olarak yüklenecek (Ablam'ın yeni/yeniden
düzenlenmiş karesi). Drive'da olmayan görünür satırlar gizlenir (SİLİNMEZ). Kapak korunur (Drive setindeyse).
Çıktı: plan.json + scripts/sql/2026-11-18-ablam-drive.sql + -GERI-AL.sql + yukle.json"""
import sys, json, re, os, urllib.request
S = sys.argv[1]
site = json.load(open(f'{S}/site.json')); H = json.load(open(f'{S}/hash.json'))
rows = {r['id']: r for r in site}
ESER = [  # slug, drive klasörü, dosya süzgeci
    ('afrodit-ve-kaz', 'antik/Afrodit ve Kaz-tabak', None),
    ('aulos-calan-menad-kylix', 'antik/Aulos çalan menad- Kylix', None),
    ('can-krater', 'antik/Çan Krater', None),
    ('europa', 'antik/Europa', None),
    ('geometrik-donem-tabak', 'antik/Geometrik dönem çanak', 'tabak'),
    ('geometrik-donem-toren-kabi', 'antik/Geometrik dönem çanak', 'tören'),
    ('mainad', 'antik/Menead tabak', None),
    ('siren', 'antik/Siren tabak', None),
    ('thetis', 'antik/Thetis tabak', None),
    ('volutlu-krater', 'antik/Volütlü Krater', None),
    ('troia-yili-anisina-1915', 'troia', None),
    ('the-turning-sky', 'atwt', None),
]
ESIK = 15
def dsort(f):
    b = os.path.basename(f).lower()
    n = re.findall(r'(\d+)', re.sub(r'1915', '', b))
    return ('detay' in b or 'detail' in b, int(n[0]) if n else 0, b)
def ham(a, b): return bin(a ^ b).count('1')
def exists(u):
    try: return urllib.request.urlopen(urllib.request.Request(u, method='HEAD'), timeout=30).status == 200
    except Exception: return False
plan, yukle, ileri, geri = [], [], [], []
q = lambda s: "'" + s.replace("'", "''") + "'"
for slug, klasor, suz in ESER:
    mine = [r for r in site if r['slug'] == slug]
    pid = mine[0]['product_id']
    files = sorted([k for k in H['drive'] if k.startswith(klasor + '/') and (not suz or suz in k.lower())], key=dsort)
    once = [r['id'] for r in sorted(mine, key=lambda r: (r['sort_order'], r['id'])) if r['is_visible']]
    kullan, yeni, eslesme = [], [], {}
    for f in files:
        best = min(((ham(H['drive'][f], H['site'][str(r['id'])]), r['id']) for r in mine))
        if best[0] <= ESIK and best[1] not in kullan:
            kullan.append(best[1]); eslesme[f] = {'id': best[1], 'dist': best[0]}
        else:
            yeni.append(f); eslesme[f] = {'id': None, 'dist': best[0], 'yakin': best[1]}
    # sıra: kapak (eski ilk görünür) Drive setindeyse başta, sonra Drive sırası
    sira = [eslesme[f]['id'] or f for f in files]
    if once and once[0] in sira: sira.remove(once[0]); sira.insert(0, once[0])
    alt = next((r for r in mine if r['is_visible']), mine[0])
    yeni_kayit = []
    n = 0
    for so, x in enumerate(sira):
        if isinstance(x, int):
            r = rows[x]
            if not (r['is_visible'] and r['sort_order'] == so):
                ileri.append(f"UPDATE product_images SET is_visible=true, sort_order={so} WHERE id={x} AND is_visible={str(r['is_visible']).lower()} AND sort_order={r['sort_order']};")
                geri.append(f"UPDATE product_images SET is_visible={str(r['is_visible']).lower()}, sort_order={r['sort_order']} WHERE id={x};")
        else:
            while True:
                n += 1
                ad = f"uarttasarim-{slug}-drive-2026-11-{n}"
                u = f"https://res.cloudinary.com/df0henatz/image/upload/uarttasarim/eser/{ad}.jpg"
                if not exists(u): break
            yukle.append({'slug': slug, 'drive': x, 'ad': ad, 'url': u})
            yeni_kayit.append({'drive': x, 'url': u, 'sort_order': so})
            ileri.append(f"INSERT INTO product_images (product_id, url, alt_tr, alt_en, sort_order, is_visible) SELECT {pid}, {q(u)}, {q(alt['alt_tr'] or '')}, {q(alt['alt_en'] or '')}, {so}, true WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE url={q(u)});")
            geri.append(f"DELETE FROM product_images WHERE url={q(u)};")
    gizle = [i for i in once if i not in sira]
    for i in gizle:
        r = rows[i]
        ileri.append(f"UPDATE product_images SET is_visible=false WHERE id={i} AND is_visible=true;")
        geri.append(f"UPDATE product_images SET is_visible=true, sort_order={r['sort_order']} WHERE id={i};")
    plan.append({'slug': slug, 'pid': pid, 'drive': files, 'eslesme': eslesme, 'once': once, 'sonra': sira, 'gizle': gizle, 'yeni': yeni_kayit})
    print(f"{slug:28s} önce {len(once):2d} görünür → sonra {len(sira):2d} | yeniden kullanılan {len(kullan)} | yeni yükleme {len(yeni_kayit)} | gizlenecek {len(gizle)}")
BASLIK = [("the-turning-sky", "Dönen Gökyüzü", "Dünya Dönerken", "The Turning Sky", "As the World Turns")]
for slug, otr, ytr, oen, yen in BASLIK:
    ileri.append(f"UPDATE products SET title_tr={q(ytr)}, title_en={q(yen)} WHERE slug={q(slug)} AND title_tr={q(otr)} AND title_en={q(oen)};")
    geri.append(f"UPDATE products SET title_tr={q(otr)}, title_en={q(oen)} WHERE slug={q(slug)};")
bas = "-- 18 Kas: Ablam'ın 13–14 Kas Drive güncellemesi (antik replikalar fotoları, Troya = Drive'daki 5, Dünya Dönerken). UYGULANMADI — Çağrı onayı.\n-- ÖNKOŞUL: yukle.json'daki kareler Cloudinary'ye yüklenmiş ve URL'ler 200 dönmeli (scripts/g18-yukle.py). Görsel kota sorunu (KIRIK-LINK-RAPOR-18KAS.md) önce çözülmeli.\n"
open('scripts/sql/2026-11-18-ablam-drive.sql', 'w').write(bas + 'BEGIN;\n' + '\n'.join(ileri) + '\nCOMMIT;\n')
open('scripts/sql/2026-11-18-ablam-drive-GERI-AL.sql', 'w').write(bas.replace('UYGULANMADI', 'GERİ ALMA') + 'BEGIN;\n' + '\n'.join(reversed(geri)) + '\nCOMMIT;\n')
json.dump(plan, open(f'{S}/plan.json', 'w'), ensure_ascii=False, indent=1)
json.dump(yukle, open(f'{S}/yukle.json', 'w'), ensure_ascii=False, indent=1)
print('ileri', len(ileri), 'satır; yükleme', len(yukle))
