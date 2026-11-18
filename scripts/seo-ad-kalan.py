#!/usr/bin/env python3
"""18 Kas — Görev A'dan kalan: atölye (DB exhibition_photos 'atolye', 14), Melike sergi (14) ve Assos (9) fotolarını
SEO adlı Cloudinary KOPYALARINA geçir. Eski dosyalar SİLİNMEZ (eski URL'ler çalışmaya devam eder).
  python3 scripts/seo-ad-kalan.py yukle   # kopyaları yükler (Cloudinary kaynağı kendi URL'sinden çeker), 200 + aynı en/boy doğrular
  python3 scripts/seo-ad-kalan.py yaz     # ablam-21eki.json'u yeni URL'lerle yazar + SQL/GERI-AL üretir (SQL'i UYGULAMAZ)
Eşleme: scripts/sql/yedek/seo-ad-kalan-2026-11-18.json"""
import hashlib, json, re, sys, time
from pathlib import Path
import requests
ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for l in (ROOT / '.env.local').read_text().splitlines():
    if '=' in l and not l.lstrip().startswith('#'):
        k, v = l.split('=', 1); ENV.setdefault(k, v.strip().strip('"'))
ESL = ROOT / 'scripts/sql/yedek/seo-ad-kalan-2026-11-18.json'
JS = ROOT / 'src/lib/ablam-21eki.json'
DIR = 'uarttasarim/sergi-seo'

def kaynaklar():
    import subprocess
    db = ENV['DATABASE_URL']
    rows = subprocess.run(['psql', db, '-Atc', "select id,url from exhibition_photos where exhibition_slug='atolye' order by id"],
                          capture_output=True, text=True, check=True).stdout.split()
    out = []
    for r in rows:
        i, u = r.split('|', 1); n = re.search(r'atolye-2026-10-(\d+)\.jpg$', u).group(1)
        out.append({'tur': 'atolye', 'id': int(i), 'eski': u, 'ad': f'uarttasarim-seramik-atolyesi-{n}'})
    j = json.load(open(JS))
    for u in j['melikeSergi']:
        n = re.search(r'melike-sergi-(\d+)\.jpg$', u).group(1)
        out.append({'tur': 'melikeSergi', 'eski': u, 'ad': f'uarttasarim-melike-dogan-seramik-sergisi-{n}'})
    for u in j['assos']:
        n = re.search(r'assos-athena-(\d+)\.jpg$', u).group(1)
        out.append({'tur': 'assos', 'eski': u, 'ad': f'uarttasarim-assos-athena-tapinagi-seramik-maketi-{n}'})
    return out

def info(u):
    r = requests.get(u.replace('/upload/', '/upload/fl_getinfo/', 1), timeout=60); r.raise_for_status()
    x = r.json()['input']; return x['width'], x['height']

def yukle():
    es = json.load(open(ESL)) if ESL.exists() else kaynaklar()
    for e in es:
        if e.get('yeni'): continue
        p = {'public_id': f"{DIR}/{e['ad']}", 'timestamp': int(time.time()), 'overwrite': 'false'}
        p['signature'] = hashlib.sha1(('&'.join(f'{k}={p[k]}' for k in sorted(p)) + ENV['CLOUDINARY_API_SECRET']).encode()).hexdigest()
        p['api_key'] = ENV['CLOUDINARY_API_KEY']; p['file'] = e['eski']
        r = requests.post(f"https://api.cloudinary.com/v1_1/{ENV['CLOUDINARY_CLOUD_NAME']}/image/upload", data=p, timeout=180)
        r.raise_for_status(); yeni = r.json()['secure_url']
        for _ in range(12):
            if requests.head(yeni, timeout=60).status_code == 200: break
            time.sleep(5)
        else: raise AssertionError(yeni)
        assert info(yeni) == info(e['eski']), (yeni, e['eski'])
        e['yeni'] = yeni; print('ok', yeni)
        ESL.write_text(json.dumps(es, ensure_ascii=False, indent=1))
    ESL.write_text(json.dumps(es, ensure_ascii=False, indent=1)); print('tamam', len(es))

def q(s): return "'" + s.replace("'", "''") + "'"

def yaz():
    es = json.load(open(ESL)); assert all(e.get('yeni') for e in es)
    j = json.load(open(JS)); m = {e['eski']: e['yeni'] for e in es}
    for k in ('melikeSergi', 'assos'): j[k] = [m[u] for u in j[k]]
    JS.write_text(json.dumps(j, ensure_ascii=False, indent=2) + '\n')
    at = [e for e in es if e['tur'] == 'atolye']
    h = "-- 18 Kas: atölye fotoları SEO adlı kopyalara (Çağrı onayı). Kod (hero-atolye.ts) iki adı da tanır → önce deploy, sonra bu SQL.\n"
    f = h + "BEGIN;\n" + ''.join(f"UPDATE exhibition_photos SET url={q(e['yeni'])} WHERE id={e['id']} AND url={q(e['eski'])};\n" for e in at) + "COMMIT;\n"
    g = h.replace('(Çağrı onayı)', 'GERİ ALMA') + "BEGIN;\n" + ''.join(f"UPDATE exhibition_photos SET url={q(e['eski'])} WHERE id={e['id']} AND url={q(e['yeni'])};\n" for e in at) + "COMMIT;\n"
    (ROOT / 'scripts/sql/2026-11-18-atolye-seo.sql').write_text(f)
    (ROOT / 'scripts/sql/2026-11-18-atolye-seo-GERI-AL.sql').write_text(g)
    print('json + sql yazıldı', len(at))

{'yukle': yukle, 'yaz': yaz}[sys.argv[1]]()
