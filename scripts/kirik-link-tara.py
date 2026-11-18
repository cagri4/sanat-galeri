#!/usr/bin/env python3
"""uarttasarim.com salt-okuma kırık link/görsel taraması (18 Kas 2026).
Kullanım: python3 scripts/kirik-link-tara.py <cikti.json>
Site içi sayfaları BFS ile gezer (sitemap + /tr,/en başlangıç), her sayfadaki
<a href>, <img src/srcset>, og:image, <link rel=preload as=image>, style url() toplar,
her benzersiz hedefin HTTP durumunu ölçer. Hiçbir şeyi değiştirmez."""
import sys, json, re, html, urllib.request, urllib.parse, urllib.error, concurrent.futures as cf, time
from html.parser import HTMLParser

HOST = sys.argv[2] if len(sys.argv) > 2 else 'uarttasarim.com'
BASE = f'https://{HOST}'
UA = 'Mozilla/5.0 (X11; Linux x86_64) kirik-link-tara/1.0'

def srcset_urls(v):
    """srcset'i tarayıcı gibi ayrıştır: URL boşluğa kadar okunur, içindeki virgül
    (ör. Cloudinary f_auto,q_auto) URL'ye aittir; yalnız sondaki virgül ayırıcıdır."""
    out = []
    for m in re.finditer(r'\s*(\S+)(?:\s+[^,]*)?(?:,|$)', v):
        u = m.group(1).rstrip(',')
        if u: out.append(u)
    return out

class NoRedir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
opener_noredir = urllib.request.build_opener(NoRedir)
opener = urllib.request.build_opener()

def fetch(url, method='GET', follow=True, body=True):
    req = urllib.request.Request(url, method=method, headers={'User-Agent': UA, 'Accept-Language': 'tr'})
    op = opener if follow else opener_noredir
    for attempt in range(3):
        try:
            r = op.open(req, timeout=30)
            data = r.read() if body else b''
            return r.status, r.geturl(), r.headers.get('content-type', ''), data
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503, 504) and attempt < 2:
                time.sleep(2 + attempt * 3); continue
            return e.code, e.headers.get('location') or url, e.headers.get('content-type', ''), b''
        except Exception as e:
            if attempt < 2: time.sleep(2); continue
            return -1, url, str(e), b''

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.links=[]; s.imgs=[]
    def handle_starttag(s, tag, attrs):
        a = dict(attrs)
        if tag == 'a' and a.get('href'): s.links.append(a['href'])
        if tag in ('img', 'source'):
            if a.get('src'): s.imgs.append(a['src'])
            for k in ('srcset', 'imagesrcset'):
                if a.get(k):
                    s.imgs.extend(srcset_urls(a[k]))
        if tag == 'meta' and a.get('property') in ('og:image',) or (tag=='meta' and a.get('name')=='twitter:image'):
            if a.get('content'): s.imgs.append(a['content'])
        if tag == 'link' and a.get('as') == 'image':
            if a.get('href'): s.imgs.append(a['href'])
            if a.get('imagesrcset'):
                s.imgs.extend(srcset_urls(a['imagesrcset']))
        if a.get('style'):
            for u in re.findall(r'url\(["\']?([^"\')]+)', a['style']): s.imgs.append(u)

def norm(u, page):
    u = html.unescape(u.strip())
    if u.startswith(('mailto:', 'tel:', 'javascript:', '#', 'data:', 'whatsapp:')): return None
    full = urllib.parse.urljoin(page, u)
    full = full.split('#')[0]
    return full

def main(out):
    sm = fetch(BASE + '/sitemap.xml')[3].decode('utf-8', 'replace')
    start = re.findall(r'<loc>([^<]+)</loc>', sm)
    sitemap_urls = set(start)
    queue = list(dict.fromkeys([BASE + '/tr', BASE + '/en'] + start))
    seen = set(queue)
    pages = {}   # url -> {status, final, links, imgs}
    refs = {}    # target -> set(source pages), kind
    kinds = {}
    def crawl(url):
        st, final, ct, data = fetch(url)
        info = {'status': st, 'final': final, 'ct': ct, 'links': [], 'imgs': []}
        if st == 200 and 'html' in ct and urllib.parse.urlparse(final).netloc == HOST:
            p = P(); p.feed(data.decode('utf-8', 'replace'))
            info['links'] = [x for x in (norm(l, final) for l in p.links) if x]
            info['imgs'] = [x for x in (norm(l, final) for l in p.imgs) if x]
        return url, info
    with cf.ThreadPoolExecutor(6) as ex:
        while queue:
            batch, queue = queue[:60], queue[60:]
            for url, info in ex.map(crawl, batch):
                pages[url] = info
                for l in info['links']:
                    refs.setdefault(l, set()).add(url); kinds.setdefault(l, 'link')
                    pu = urllib.parse.urlparse(l)
                    if pu.netloc == HOST and l not in seen and not pu.path.startswith(('/api', '/admin', '/_next')):
                        seen.add(l); queue.append(l)
                for i in info['imgs']:
                    refs.setdefault(i, set()).add(url); kinds[i] = 'img'
            print(f'sayfa {len(pages)} kuyruk {len(queue)}', file=sys.stderr)
    # hedef durumları
    targets = [t for t in refs if t not in pages]
    def check(t):
        if kinds[t] == 'img':
            st, final, ct, data = fetch(t, body=True)
            return t, {'status': st, 'final': final, 'ct': ct, 'bytes': len(data)}
        st, final, ct, _ = fetch(t, body=False)
        return t, {'status': st, 'final': final, 'ct': ct}
    tstat = {}
    with cf.ThreadPoolExecutor(8) as ex:
        for i, (t, s) in enumerate(ex.map(check, targets)):
            tstat[t] = s
            if i % 100 == 0: print(f'hedef {i}/{len(targets)}', file=sys.stderr)
    for u, info in pages.items(): tstat[u] = {'status': info['status'], 'final': info['final'], 'ct': info['ct']}
    res = {'sitemap': sorted(sitemap_urls), 'pages': {u: {k: v for k, v in i.items()} for u, i in pages.items()},
           'targets': tstat, 'kinds': kinds, 'refs': {k: sorted(v) for k, v in refs.items()}}
    json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
    bad = {t: s for t, s in tstat.items() if not (200 <= s['status'] < 400)}
    bad_img = {t: s for t, s in tstat.items() if kinds.get(t) == 'img' and s['status'] == 200 and not s['ct'].startswith('image')}
    print(f'TOPLAM sayfa={len(pages)} hedef={len(tstat)} kirik={len(bad)} gorsel-ama-image-degil={len(bad_img)}')
    for t, s in sorted(bad.items()): print(s['status'], kinds.get(t, 'page'), t, '<-', (refs.get(t) or ['(sitemap/kuyruk)'])[:2] if isinstance(refs.get(t), list) else sorted(refs.get(t, {'(sitemap)'}))[:2])

main(sys.argv[1])
