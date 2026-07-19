<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Test sunucusu hijyeni (ZORUNLU)

`next dev` / `next start` ile test sunucusu başlatırsan **işin bitince KAPAT**. Yeni bir tane başlatmadan önce eskisini öldür — sabit port kullan, o portu dinleyeni önce sonlandır.

Neden: 2026-07-19'da bir cila turunda her test döngüsünde yeni production sunucusu açıldı, hiçbiri kapatılmadı → 18 öksüz `next-server` süreci, **4 GB swap**. Bunlar `top`/`free`'de görünmez (toplam RSS sadece 157 MB, hepsi swap'e itilmiş), o yüzden saatlerce fark edilmedi ve makine sürünür hale geldi.

Süreç ararken/temizlerken: `pkill -f <desen>` kendi kabuğunu da eşleştirip öldürebilir (exit 144). PID'leri topla, kendi PID/PPID'ini hariç tut, PID bazlı `kill` at.
