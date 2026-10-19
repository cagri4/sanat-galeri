#!/usr/bin/env bash
# uarttasarim.com Cloudflare kurulumu (19 Eki 2026, rc talimatı).
# - Zone yoksa oluşturmayı dener (token'da zone.create yetkisi gerekir; yoksa panelden açılmalı).
# - Kayıtları kurar (varsa atlar, HİÇBİR ŞEY SİLMEZ):
#     TXT @   google-site-verification=…  (GoDaddy'den birebir — Search Console sahipliği)
#     A   @   76.76.21.21                 (Vercel, DNS only)
#     CNAME www cname.vercel-dns.com      (Vercel, DNS only)
#   Vercel değerleri: api.vercel.com/v6/domains/uarttasarim.com/config → recommendedIPv4 / recommendedCNAME (19 Eki).
# - Cloudflare'in atadığı 2 nameserver'ı yazdırır (GoDaddy'de NS değişimi Çağrı'nın adımı).
set -euo pipefail
TOK=$(grep CLOUDFLARE_API_TOKEN ~/Masaüstü/araclar/CF-api/.env | cut -d= -f2- | tr -d '"')
ACC=8ea3ac69bf23da3c6be25778c3475926
API=https://api.cloudflare.com/client/v4
cf() { curl -s -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" "$@"; }

ZID=$(cf "$API/zones?name=uarttasarim.com" | python3 -c "import sys,json;r=json.load(sys.stdin)['result'];print(r[0]['id'] if r else '')")
if [ -z "$ZID" ]; then
  R=$(cf -X POST "$API/zones" -d "{\"name\":\"uarttasarim.com\",\"account\":{\"id\":\"$ACC\"},\"type\":\"full\",\"jump_start\":false}")
  ZID=$(echo "$R" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['result']['id'] if d.get('success') else '')")
  [ -n "$ZID" ] || { echo "ZONE AÇILAMADI: $(echo "$R" | python3 -c 'import sys,json;print(json.load(sys.stdin)["errors"])')"; exit 1; }
  echo "zone oluşturuldu: $ZID"
fi

ekle() {  # tür ad içerik
  local var; var=$(cf "$API/zones/$ZID/dns_records?type=$1&name=$2" | python3 -c "import sys,json;print(len(json.load(sys.stdin)['result']))")
  if [ "$var" != "0" ]; then echo "zaten var: $1 $2"; return; fi
  cf -X POST "$API/zones/$ZID/dns_records" -d "{\"type\":\"$1\",\"name\":\"$2\",\"content\":\"$3\",\"ttl\":1,\"proxied\":false}" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);print('eklendi' if d['success'] else 'HATA', '$1 $2', d.get('errors') or '')"
}
ekle TXT   uarttasarim.com     '\"google-site-verification=DD_1Fyp8D7WKj8crwAU2r9i1kKDN72A8s7c1-auSNbw\"'
ekle A     uarttasarim.com     76.76.21.21
ekle CNAME www.uarttasarim.com cname.vercel-dns.com

cf "$API/zones/$ZID/dns_records" | python3 -c "import sys,json;[print(' ',r['type'],r['name'],r['content'],'proxied' if r['proxied'] else 'dns-only') for r in json.load(sys.stdin)['result']]"
cf "$API/zones/$ZID" | python3 -c "import sys,json;z=json.load(sys.stdin)['result'];print('durum:',z['status']);print('CLOUDFLARE NAMESERVERLARI:',' '.join(z['name_servers']))"
