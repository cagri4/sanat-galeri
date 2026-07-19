-- Eser siralamasi: sanatcinin verdigi sira (SANATCI-SITE-DUZENI.md)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0;
