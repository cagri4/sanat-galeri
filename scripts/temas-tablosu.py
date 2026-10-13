#!/usr/bin/env python3
"""
Fotoğraf azaltma için temas tablosu (GOREV-A-LISTESI-UYGULA, 13 Eki).

Sanatçı 11 Eki: "bazı resimler azaltılabilir, benzer fotoğraflar bir arada".
Her eserin fotoğrafları yan yana; birbirine çok benzeyen kareler aynı renkli
çerçeve + "Benzer grup" etiketiyle işaretlenir. Benzerlik: biçim (dHash, 64 bit)
ve renk (RGB histogram kesişimi). İki kare benzer sayılır: dHash <= ESIK ya da
(renk >= RENK_ESIK ve dHash <= GENIS_ESIK). Eşikler 13 Eki RS01 (İçimdeki Güneş)
üzerinde gözle kalibre edildi; sonuç ÖNERİDİR, kararı sanatçı verir.
Sanatçı çıkarılacak karelerin KODUNU (ör. RS03-07) yazar.

HİÇBİR ŞEY SİLİNMEZ ve bu betik veritabanına YAZMAZ (yalnız okur).
Çıktılar: docs/temas-tablosu/ altında .html + .pdf + kod→görsel eşlemesi .json
"""
import io, json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'temas-tablosu')
ESIK = 18
GENIS_ESIK = 32
RENK_ESIK = 0.75
KISALTMA = {'Resimli Seramikler': 'RS', 'Seramik Heykeller': 'SH', 'Antik Dönem Replikaları': 'AR', 'Mimari Duvar Panoları': 'MP'}
SIRA = ['Resimli Seramikler', 'Mimari Duvar Panoları', 'Seramik Heykeller', 'Antik Dönem Replikaları']

def db_rows():
    env = dict(os.environ)
    for line in open(os.path.join(ROOT, '.env.local')):
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1); env.setdefault(k, v.strip('"'))
    sql = """select p.id, p.category, p.title_tr, p.sort_order, i.id, i.url, i.sort_order
             from products p join product_images i on i.product_id = p.id
             where p.is_visible order by p.category, p.sort_order, p.id, i.sort_order, i.id"""
    out = subprocess.run(['psql', env['DATABASE_URL'], '-AtF', '\t', '-c', sql], capture_output=True, text=True, check=True).stdout
    return [l.split('\t') for l in out.strip().splitlines()]

def thumb(url, w):
    return url.replace('/image/upload/', f'/image/upload/c_limit,w_{w},q_auto,f_jpg/', 1)

def imza(url):
    data = urllib.request.urlopen(thumb(url, 160), timeout=60).read()
    im = Image.open(io.BytesIO(data))
    g = im.convert('L').resize((9, 8), Image.LANCZOS)
    px = list(g.get_flattened_data())
    h = sum(1 << i for i, (a, b) in enumerate((px[r * 9 + c], px[r * 9 + c + 1]) for r in range(8) for c in range(8)) if a > b)
    hist = im.convert('RGB').resize((64, 64)).histogram()
    t = sum(hist)
    return h, [x / t for x in hist]

def benzer(a, b):
    d = bin(a[0] ^ b[0]).count('1')
    if d <= ESIK:
        return True
    return d <= GENIS_ESIK and sum(min(x, y) for x, y in zip(a[1], b[1])) >= RENK_ESIK

def main():
    rows = db_rows()
    urls = [r[5] for r in rows]
    with ThreadPoolExecutor(12) as ex:
        hashes = dict(zip(urls, ex.map(imza, urls)))

    eserler = {}
    for pid, cat, title, psort, iid, url, isort in rows:
        eserler.setdefault(pid, {'cat': cat, 'title': title, 'imgs': []})['imgs'].append({'id': int(iid), 'url': url})

    renk = ['#c0392b', '#2471a3', '#1e8449', '#b9770e', '#7d3c98', '#117864', '#a04000', '#2e4053']
    harita, bolumler, toplam_benzer = {}, [], 0
    for cat in SIRA:
        ps = [(pid, e) for pid, e in eserler.items() if e['cat'] == cat]
        for n, (pid, e) in enumerate(ps, 1):
            code = f"{KISALTMA[cat]}{n:02d}"
            imgs = e['imgs']
            # union-find: benzer kareler aynı grupta
            par = list(range(len(imgs)))
            def f(x):
                while par[x] != x: par[x] = par[par[x]]; x = par[x]
                return x
            for i in range(len(imgs)):
                for j in range(i + 1, len(imgs)):
                    if benzer(hashes[imgs[i]['url']], hashes[imgs[j]['url']]):
                        par[f(i)] = f(j)
            gruplar = {}
            for i in range(len(imgs)): gruplar.setdefault(f(i), []).append(i)
            cok = [g for g in gruplar.values() if len(g) > 1]
            grup_no = {i: k for k, g in enumerate(cok) for i in g}
            toplam_benzer += sum(len(g) for g in cok)
            kartlar = []
            for i, im in enumerate(imgs, 1):
                kod = f"{code}-{i:02d}"
                harita[kod] = {'product_image_id': im['id'], 'product_id': int(pid), 'eser': e['title'], 'url': im['url']}
                g = grup_no.get(i - 1)
                stil = f"outline:4px solid {renk[g % len(renk)]};outline-offset:-4px" if g is not None else ''
                etiket = f'<span class="g" style="background:{renk[g % len(renk)]}">Benzer {chr(65 + g)}</span>' if g is not None else ''
                kartlar.append(f'<figure><div class="im" style="{stil}"><img src="{thumb(im["url"], 360)}" alt="">{etiket}</div><figcaption><b>{kod}</b></figcaption></figure>')
            bolumler.append(
                f'<section><h2>{code} · {e["title"]} <small>{cat} · {len(imgs)} fotoğraf'
                f'{" · " + str(len(cok)) + " benzer grup" if cok else ""}</small></h2><div class="grid">{"".join(kartlar)}</div></section>')

    html = f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Temas tablosu — fotoğraf azaltma</title>
<style>body{{font:14px/1.5 system-ui,sans-serif;color:#2c2c2c;background:#f7f4ef;margin:24px}}
h1{{font-size:22px;margin:0 0 6px}} .not{{max-width:70ch;color:#4a4a4a}}
section{{break-inside:avoid-page;margin:28px 0;border-top:1px solid #d8d1c4;padding-top:12px}}
h2{{font-size:16px;margin:0 0 10px}} h2 small{{font-weight:400;color:#6b645a}}
.grid{{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}}
figure{{margin:0;break-inside:avoid}} .im{{position:relative;aspect-ratio:1;background:#ece7de;overflow:hidden}}
.im img{{width:100%;height:100%;object-fit:cover;display:block}}
.g{{position:absolute;left:6px;top:6px;color:#fff;font-size:11px;padding:1px 6px;border-radius:3px}}
figcaption{{font-size:12px;margin-top:3px}} @page{{size:A4 landscape;margin:12mm}}</style></head><body>
<h1>Temas tablosu — benzer fotoğraflar</h1>
<p class="not">Sanatçının 11 Ekim isteği: "bazı resimler azaltılabilir, benzer fotoğraflar bir arada". Her eserin sitede görünen
fotoğrafları yan yana. <b>Aynı renkli çerçeve</b> = bilgisayarın birbirine çok benzer bulduğu kareler (öneri, kesin değil).
<b>Sitede kalmasını istemediğiniz karelerin kodunu yazın</b> (ör. RS03-07). Hiçbir fotoğraf silinmeyecek, yalnız sitede gizlenecek.
<br>Toplam {len(rows)} fotoğraf, {len(eserler)} eser; benzer gruplarda {toplam_benzer} kare. Benzerlik: biçim (dHash ≤ {ESIK}/64) ya da renk (≥ {RENK_ESIK}) + biçim (≤ {GENIS_ESIK}/64).</p>
{''.join(bolumler)}</body></html>"""
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'temas-tablosu-2026-10-13.html'), 'w').write(html)
    json.dump(harita, open(os.path.join(OUT, 'kod-eslemesi-2026-10-13.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'{len(rows)} fotoğraf, {len(eserler)} eser, benzer gruplarda {toplam_benzer} kare')

if __name__ == '__main__':
    main()
