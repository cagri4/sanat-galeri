-- İki site (2026-10-10, KARARLAR-2026-10-10.md madde 2): aynı eser iki sitede
-- yer alabilir (seramik heykeller); fark AÇIKLAMA METNİNDEN gelir.
--   description_tr/en          → Uart Galeri metni (hikâye, esin kaynağı, seri)
--   description_kurumsal_tr/en → Uart Kurumsal metni (ölçü, malzeme, uygulama,
--                                mekâna yerleşim, proje dili)
-- Yalnızca EKLEME: mevcut kod bu kolonları görmez, prod etkilenmez.
-- ⚠️ Paylaşımlı Supabase (preview = prod) — Çağrı onayıyla uygulanır.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_kurumsal_tr" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_kurumsal_en" text;
