CREATE TABLE "press_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer,
	"title" text NOT NULL,
	"publication" text,
	"url" text,
	"year" integer,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "statement_tr" text;--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "statement_en" text;--> statement-breakpoint
ALTER TABLE "press_items" ADD CONSTRAINT "press_items_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;