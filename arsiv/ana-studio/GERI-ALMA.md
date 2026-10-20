# Ana site stüdyo kareleri — geri alma (canlıya alındı 20 Eki 2026, commit 1986643)

Canlıda: uarttasarim.com (uart-galeri) + uart-kurumsal.vercel.app. Bayrak: UART_STUDIO_FOTO=1 (Preview + Production).
Orijinal fotoğraflar hiç değişmedi (product_images.url); stüdyo kareleri product_images.studio_url'de.

## En hızlı (anında, deploy yok)
Önceki production deploy'unu geri yükselt (bayrak öncesi, commit e1d0f02):
    vercel promote uart-galeri-o2czf8auo-cagriandroit-3315s-projects.vercel.app --scope cagriandroit-3315s-projects
    vercel promote uart-kurumsal-8vtve5hpx-cagriandroit-3315s-projects.vercel.app --scope cagriandroit-3315s-projects

## Kalıcı
1. Vercel → uart-galeri ve uart-kurumsal → Env → UART_STUDIO_FOTO: Production hedefini kaldır, yeniden deploy (--prod).
2. Ya da DB'den: psql "$DATABASE_URL" -f scripts/sql/2026-10-20-studio-url-GERI-AL.sql  (studio_url = NULL; anında, preview de etkilenir).

## Tek görseli geri almak
    UPDATE product_images SET studio_url = NULL WHERE id = <id>;   -- o görselde orijinal görünür

Yedek: scripts/sql/yedek/product_images-2026-10-20-studio-oncesi.json · Kötü kaynak: KOTU-KAYNAK-LISTESI.md
