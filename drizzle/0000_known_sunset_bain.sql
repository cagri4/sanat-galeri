CREATE TABLE "artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_tr" text NOT NULL,
	"name_en" text NOT NULL,
	"bio_tr" text,
	"bio_en" text,
	"photo_url" text,
	"email" text,
	"whatsapp" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "artists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "exhibitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer,
	"type" text NOT NULL,
	"title_tr" text NOT NULL,
	"title_en" text NOT NULL,
	"location" text,
	"year" integer,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer,
	"sender_name" text NOT NULL,
	"sender_email" text NOT NULL,
	"body" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer,
	"title_tr" text,
	"title_en" text,
	"year" integer,
	"medium_tr" text,
	"medium_en" text,
	"image_url" text NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt_tr" text,
	"alt_en" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer,
	"slug" text NOT NULL,
	"title_tr" text NOT NULL,
	"title_en" text NOT NULL,
	"description_tr" text,
	"description_en" text,
	"category" text NOT NULL,
	"price" numeric(10, 2),
	"currency" text DEFAULT 'TRY',
	"is_sold" boolean DEFAULT false,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;