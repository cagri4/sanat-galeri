-- Enable RLS on all public tables + minimal safe policies.
--
-- Strategy:
--   - artists / exhibitions / portfolio_items / product_images / press_items:
--     public SELECT (gallery is intended to be readable by anyone)
--   - products: public SELECT only where is_visible = true
--   - messages: anon INSERT allowed (contact form), no anon SELECT
--   - All write operations on other tables go through service_role
--     (RLS bypass), so admin panel keeps working.

-- ── Enable RLS ──────────────────────────────────────────────
ALTER TABLE public.artists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;

-- ── Public read policies (anyone can SELECT) ─────────────────
DROP POLICY IF EXISTS "public_read_artists"        ON public.artists;
DROP POLICY IF EXISTS "public_read_exhibitions"    ON public.exhibitions;
DROP POLICY IF EXISTS "public_read_portfolio"      ON public.portfolio_items;
DROP POLICY IF EXISTS "public_read_product_images" ON public.product_images;
DROP POLICY IF EXISTS "public_read_products"       ON public.products;
DROP POLICY IF EXISTS "public_read_press"          ON public.press_items;

CREATE POLICY "public_read_artists"
  ON public.artists
  FOR SELECT
  USING (true);

CREATE POLICY "public_read_exhibitions"
  ON public.exhibitions
  FOR SELECT
  USING (true);

CREATE POLICY "public_read_portfolio"
  ON public.portfolio_items
  FOR SELECT
  USING (true);

CREATE POLICY "public_read_product_images"
  ON public.product_images
  FOR SELECT
  USING (true);

CREATE POLICY "public_read_products"
  ON public.products
  FOR SELECT
  USING (is_visible = true);

CREATE POLICY "public_read_press"
  ON public.press_items
  FOR SELECT
  USING (true);

-- ── messages: anon INSERT only (contact form), no SELECT ─────
DROP POLICY IF EXISTS "anon_insert_messages" ON public.messages;

CREATE POLICY "anon_insert_messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (true);

-- NOTE: messages SELECT/UPDATE/DELETE handled only by service_role
-- (RLS bypass), so admin can read/manage messages from the server.
