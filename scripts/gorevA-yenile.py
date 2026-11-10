#!/usr/bin/env python3
"""
Görev A (10 Kas 2026) — 2. adım: sitedeki fotoğrafları SEO adlı Cloudinary kopyalarına taşı.

  python3 scripts/gorevA-yenile.py plan    <esles.json> <cikti-klasoru>   # yalnız plan (hiçbir yere yazmaz)
  python3 scripts/gorevA-yenile.py yukle   <cikti-klasoru>                # Cloudinary'ye KOPYA yükler (eski dosya silinmez)
  python3 scripts/gorevA-yenile.py sql     <cikti-klasoru>                # doğrulanmış yüklemelerden SQL + GERI-AL üretir (UYGULAMAZ)

Güvenlik:
- Eski Cloudinary dosyaları SİLİNMEZ, yeniden adlandırılmaz → eski URL'ler (kodda sabit olanlar dahil) çalışmaya devam eder.
- Yeni dosya, mevcut sitedeki görüntünün birebir kopyası (Cloudinary kendi URL'sinden çeker) — kırpma/seçim değişmez.
- DB'de yalnız url (+ ürün fotolarında alt_tr/alt_en) değişir; is_visible, sort_order, product_id, studio_url DOKUNULMAZ.
- Her yeni URL HTTP 200 + aynı en/boy doğrulanmadan SQL'e girmez.
Kapsam: product_images (yalnız is_visible=true) + exhibition_photos (atolye HARİÇ — hero-atolye.ts dosya adıyla eşliyor,
  o adım kod değişikliği + deploy ister).
Ad biçimi: uarttasarim-<eser-slug>-<tanım>  (küçük harf, Türkçe karakter sadeleştirilmiş, tireli; tanım Drive'daki yeni addan)
"""
import hashlib, json, re, sys, time, unicodedata
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for l in (ROOT / '.env.local').read_text().splitlines():
    if '=' in l and not l.lstrip().startswith('#'):
        k, v = l.split('=', 1); ENV.setdefault(k, v.strip().strip('"'))
YEDEK = ROOT / 'scripts/sql/yedek'
TR = str.maketrans({'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g', 'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c',
                    '’': '', "'": '', '"': ''})
GURULTU = {'uarttasarim', 'uartasarim', 'uarttasarimjpg', 'jpg', 'jpeg', 'by', 'the', 'and', 've', 'of', 'a', 'png'}


def slug(s: str) -> str:
    s = unicodedata.normalize('NFKD', s.translate(TR)).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\.(jpe?g|png)$', '', s)
    s = re.sub(r'jpg$', '', s)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


# Tanım yalnız AÇIKLAYICI kelimelerden kurulur (Drive adlarındaki kişi adı, tarih, numara, yazım hatası atılır).
# Sanatçı adı bilerek alınmaz: bazı antik replikalarda DB (Şeref) ile Drive adı (Melike) çelişiyor — rc'ye soruldu.
TANIM = {
    'ceramic': 'ceramic', 'ceramics': 'ceramics', 'ceramicart': 'ceramic-art', 'ceramicform': 'ceramic-form',
    'ceramicpaintings': 'ceramic-painting', 'ceramicrelief': 'ceramic-relief', 'relief': 'relief', 'mural': 'mural',
    'art': 'art', 'wallart': 'wall-art', 'wallsculpture': 'wall-sculpture', 'architecturalart': 'architectural-art',
    'painting': 'painting', 'paintings': 'painting', 'paintingceramics': 'painting-ceramics', 'form': 'form',
    'detail': 'detail', 'detal': 'detail', 'detay': 'detail', 'ayrinti': 'detail', 'ayr': 'detail', 'ayr1': 'detail',
    'ayr3': 'detail', 'panobayr': 'detail', 'sculpture': 'sculpture', 'sculptures': 'sculpture', 'sculptural': 'sculpture',
    'heykel': 'sculpture', 'heykeli': 'sculpture', 'heykeller': 'sculpture', 'plate': 'plate', 'terra': 'terra',
    'sigillata': 'sigillata', 'sigilatta': 'sigillata', 'replica': 'replica', 'interior': 'interior', 'design': 'design',
    'desing': 'design', 'tasarim': 'design', 'mimari': 'architectural', 'architectural': 'architectural', 'wall': 'wall',
    'pano': 'panel', 'panosu': 'panel', 'panolari': 'panel', 'seramik': 'ceramic', 'duvar': 'wall', 'kylix': 'kylix',
    'krater': 'krater', 'antique': 'antique', 'pottery': 'pottery', 'decor': 'decor', 'hotel': 'hotel', 'resimli': 'painted',
}


def tanim(drive_ad: str, eser_kelimeler: set[str]) -> str:
    gor, out = set(eser_kelimeler), []
    for k in slug(Path(drive_ad).name).split('-'):
        for t in TANIM.get(k, '').split('-'):
            if t and t not in gor:
                gor.add(t); out.append(t)
    return '-'.join(out[:5])


def plan(esles_p: Path, out: Path):
    out.mkdir(parents=True, exist_ok=True)
    # esles_p: eslesme-son.json {product_images.id: {drive, yontem}} (pHash + SIFT ile kesinleşmiş eşleşmeler)
    es = json.load(open(esles_p))
    pi = json.load(open(YEDEK / 'product_images-2026-11-10-gorevA-oncesi.json'))
    pr = {p['id']: p for p in json.load(open(YEDEK / 'products-2026-11-10-gorevA-oncesi.json'))}
    ex = json.load(open(YEDEK / 'exhibition_photos-2026-11-10-gorevA-oncesi.json'))
    kullanilan, satirlar, supheli = set(), [], []

    def benzersiz(ad):
        a, n = ad, 2
        while a in kullanilan:
            a = f'{ad}-{n}'; n += 1
        kullanilan.add(a); return a

    for r in sorted(pi, key=lambda r: (r['product_id'], r['sort_order'] or 0, r['id'])):
        if not r['is_visible']:
            continue
        p = pr[r['product_id']]
        m = es.get(str(r['id']))
        eser_kel = set(slug(p['slug']).split('-')) | set(slug(p['title_tr'] or '').split('-')) | set(slug(p['title_en'] or '').split('-'))
        guvenli = bool(m)
        t = tanim(m['drive'], eser_kel) if guvenli else ''
        if not guvenli:  # Drive'da kesin karşılığı yok → ad yalnız eserden (tanımsız)
            supheli.append({'tablo': 'product_images', 'id': r['id'], 'eser': p['slug']})
        ad = benzersiz('-'.join(x for x in ('uarttasarim', p['slug'], t) if x)[:110].rstrip('-'))
        detay = 'detail' in t.split('-')
        alt_tr = f"{p['title_tr']}{' — detay' if detay else ''} · Uarttasarım seramik"
        alt_en = f"{p['title_en'] or p['title_tr']}{' — detail' if detay else ''} · Uarttasarım ceramics"
        satirlar.append({'tablo': 'product_images', 'id': r['id'], 'eski_url': r['url'], 'public_id': f'uarttasarim/eser/{ad}',
                         'drive': m['drive'] if guvenli else None, 'alt_tr': alt_tr, 'alt_en': alt_en,
                         'eski_alt_tr': r['alt_tr'], 'eski_alt_en': r['alt_en']})

    sayac = {}
    for r in sorted(ex, key=lambda r: (r['exhibition_slug'], r['sort_order'] or 0, r['id'])):
        if r['exhibition_slug'] == 'atolye':
            continue
        sayac[r['exhibition_slug']] = sayac.get(r['exhibition_slug'], 0) + 1
        ad = benzersiz(f"uarttasarim-sergi-{slug(r['exhibition_slug'])}-{sayac[r['exhibition_slug']]}")
        satirlar.append({'tablo': 'exhibition_photos', 'id': r['id'], 'eski_url': r['url'], 'public_id': f'uarttasarim/sergi-seo/{ad}'})

    json.dump({'satirlar': satirlar, 'supheli': supheli}, open(out / 'plan.json', 'w'), ensure_ascii=False, indent=1)
    print('plan:', sum(s['tablo'] == 'product_images' for s in satirlar), 'ürün fotosu,',
          sum(s['tablo'] == 'exhibition_photos' for s in satirlar), 'sergi fotosu; şüpheli', len(supheli))


def imza(p):
    return hashlib.sha1(('&'.join(f'{k}={p[k]}' for k in sorted(p)) + ENV['CLOUDINARY_API_SECRET']).encode()).hexdigest()


def yukle(out: Path):
    pl = json.load(open(out / 'plan.json'))
    sonuc_p = out / 'yukleme.json'
    sonuc = json.load(open(sonuc_p)) if sonuc_p.exists() else {}
    cloud = ENV['CLOUDINARY_CLOUD_NAME']
    for i, s in enumerate(pl['satirlar']):
        k = f"{s['tablo']}:{s['id']}"
        if k in sonuc and sonuc[k].get('ok'):
            continue
        p = {'public_id': s['public_id'], 'timestamp': int(time.time()), 'overwrite': 'false'}
        p['signature'] = imza(p); p['api_key'] = ENV['CLOUDINARY_API_KEY']; p['file'] = s['eski_url']
        for deneme in range(5):
            r = requests.post(f'https://api.cloudinary.com/v1_1/{cloud}/image/upload', data=p, timeout=180)
            if r.ok or r.status_code == 400:
                break
            time.sleep(3 + deneme * 3)
        j = r.json() if r.headers.get('content-type', '').startswith('application/json') else {}
        sonuc[k] = {'ok': r.ok, 'url': j.get('secure_url'), 'w': j.get('width'), 'h': j.get('height'), 'hata': None if r.ok else r.text[:300]}
        if i % 20 == 0:
            json.dump(sonuc, open(sonuc_p, 'w'), indent=1); print(i, k, r.status_code, flush=True)
    json.dump(sonuc, open(sonuc_p, 'w'), indent=1)
    print('yüklendi', sum(v['ok'] for v in sonuc.values()), '/', len(pl['satirlar']))


def boyut(url):
    # Cloudinary fl_getinfo: dönüşümsüz meta (en/boy) — tüm dosyayı indirmeden
    u = url.replace('/upload/', '/upload/fl_getinfo/', 1)
    r = requests.get(u, timeout=60)
    r.raise_for_status()
    j = r.json()
    o = j.get('output') or j.get('input')
    return o['width'], o['height']


def sql(out: Path):
    pl = json.load(open(out / 'plan.json'))
    yk = json.load(open(out / 'yukleme.json'))
    q = lambda s: 'NULL' if s is None else "'" + str(s).replace("'", "''") + "'"
    ileri, geri, red = [], [], []
    for s in pl['satirlar']:
        y = yk.get(f"{s['tablo']}:{s['id']}")
        if not y or not y['ok']:
            red.append((s, 'yükleme yok')); continue
        try:
            if requests.head(y['url'], timeout=60).status_code != 200:
                red.append((s, 'yeni url 200 değil')); continue
            if boyut(s['eski_url']) != (y['w'], y['h']):
                red.append((s, f"boyut farklı {boyut(s['eski_url'])} ≠ {(y['w'], y['h'])}")); continue
        except Exception as e:
            red.append((s, f'doğrulama hatası {e}')); continue
        if s['tablo'] == 'product_images':
            ileri.append(f"UPDATE product_images SET url={q(y['url'])}, alt_tr={q(s['alt_tr'])}, alt_en={q(s['alt_en'])} WHERE id={s['id']} AND url={q(s['eski_url'])};")
            geri.append(f"UPDATE product_images SET url={q(s['eski_url'])}, alt_tr={q(s['eski_alt_tr'])}, alt_en={q(s['eski_alt_en'])} WHERE id={s['id']};")
        else:
            ileri.append(f"UPDATE exhibition_photos SET url={q(y['url'])} WHERE id={s['id']} AND url={q(s['eski_url'])};")
            geri.append(f"UPDATE exhibition_photos SET url={q(s['eski_url'])} WHERE id={s['id']};")
    bas = '-- Görev A (10 Kas 2026): SEO adlı Cloudinary kopyaları. Üreten: scripts/gorevA-yenile.py. '
    (ROOT / 'scripts/sql/2026-11-10-seo-foto-adlari.sql').write_text(
        bas + 'Geri alma: -GERI-AL.sql\nBEGIN;\n' + '\n'.join(ileri) + '\nCOMMIT;\n')
    (ROOT / 'scripts/sql/2026-11-10-seo-foto-adlari-GERI-AL.sql').write_text(
        bas + 'ESKİ url/alt geri yüklenir (eski Cloudinary dosyaları silinmedi).\nBEGIN;\n' + '\n'.join(geri) + '\nCOMMIT;\n')
    json.dump([{'tablo': s['tablo'], 'id': s['id'], 'neden': n} for s, n in red], open(out / 'red.json', 'w'), ensure_ascii=False, indent=1)
    print('SQL satırı', len(ileri), '· reddedilen', len(red))


if __name__ == '__main__':
    k = sys.argv[1]
    if k == 'plan':
        plan(Path(sys.argv[2]), Path(sys.argv[3]))
    elif k == 'yukle':
        yukle(Path(sys.argv[2]))
    elif k == 'sql':
        sql(Path(sys.argv[2]))
