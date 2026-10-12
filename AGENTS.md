<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Test sunucusu hijyeni (ZORUNLU)

`next dev` / `next start` ile test sunucusu başlatırsan **işin bitince KAPAT**. Yeni bir tane başlatmadan önce eskisini öldür — sabit port kullan, o portu dinleyeni önce sonlandır.

Neden: 2026-07-19'da bir cila turunda her test döngüsünde yeni production sunucusu açıldı, hiçbiri kapatılmadı → 18 öksüz `next-server` süreci, **4 GB swap**. Bunlar `top`/`free`'de görünmez (toplam RSS sadece 157 MB, hepsi swap'e itilmiş), o yüzden saatlerce fark edilmedi ve makine sürünür hale geldi.

Süreç ararken/temizlerken: `pkill -f <desen>` kendi kabuğunu da eşleştirip öldürebilir (exit 144). PID'leri topla, kendi PID/PPID'ini hariç tut, PID bazlı `kill` at.

# Edit Talepleri sheet'i = talimat (ZORUNLU)

Drive `Editler/Edit Talepleri` sheet'inde **net** bir talimat varsa (ör. "Teknik alanını kaldır") onu **uygula**, Çağrı'ya tekrar sorma. Uygularken metin/içerik kaybetme: nereye taşıdığını rapora ve sheet'in "Worker notu" sütununa yaz. Yalnızca talep belirsizse ya da uydurma bilgi gerektiriyorsa sor.

Neden: 2026-10-10'da sheet satır 11'deki net "Teknik alanını kaldır" talebi plan sorusu olarak Çağrı'ya geri soruldu; Çağrı "bu soru sorulmamalıydı" dedi.

# TODO.md (ZORUNLU, 2026-10-12'den itibaren)

Kökteki `TODO.md` işlerin tek listesi; panel (upu-panel.vercel.app) okur. Yalnız üç satır tipi: `- [ ] madde` (bekliyor), `- [x] madde` (bitti), `- [~] madde - sebep` (atlandı).
- İş gelince önce maddeyi yaz, sonra başla. Bitince tiki kendin at; madde metni kısa, tamamlanmış cümle.
- Karar/bilgi/onay gerekirse `[~]` + sebep yaz ve sıradaki maddeye geç — işi durdurma.
- Çalışırken bulduğun yeni iş/hatayı madde olarak ekle. Uydurma madde yazma.
- Liste bitince dur ve raporla: ne bitti, ne atlandı, neden.

Neden: worker'lar tek iş bitirip orkestratörü bekliyordu; darboğaz orkestratördü.
