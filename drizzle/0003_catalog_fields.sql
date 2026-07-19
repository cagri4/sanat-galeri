-- Katalog formatı alanları (Kap Formu / Dönemi / Mitolojik Konu)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "form_tr" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "form_en" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "period_tr" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "period_en" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "subject_tr" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "subject_en" text;
