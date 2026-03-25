---
phase: 04-sanatci-cv-subdomainleri
plan: 01
subsystem: database
tags: [drizzle-orm, postgresql, supabase, next-intl, zod, jest, contract-testing]

# Dependency graph
requires:
  - phase: 03-platform-i18n-nav-seo
    provides: next-intl wiring, tr.json/en.json structure, i18n-keys parity test
  - phase: 02-ana-galeri
    provides: Drizzle relations pattern, contract-testing pattern, messages table with artistId FK
  - phase: 01-foundation
    provides: schema.ts base, artists/exhibitions/portfolioItems tables

provides:
  - press_items table with artistId FK and sortOrder
  - artists.statement_tr / artists.statement_en columns
  - Drizzle relations for portfolioItems, exhibitions, pressItems on artists
  - getArtistBySlug, getArtistPortfolio, getArtistExhibitions, getArtistPressItems query functions
  - submitArtistContact server action with artistSlug -> artistId lookup
  - artistContactSchema (zod)
  - cv namespace in tr.json and en.json (12 keys each)
  - meta.artistTitle/artistDesc/portfolioTitle/exhibitionsTitle/contactTitle i18n keys
  - Seed data: exhibitions (4 types each artist), portfolio items, press items (melike only)
  - Drizzle migration 0002_clever_mimic.sql (generated, pending apply)

affects:
  - 04-02 and later CV UI plans — depend on query layer and schema being in place
  - Any plan adding artist contact form — depends on submitArtistContact and artistContactSchema

# Tech tracking
tech-stack:
  added: []
  patterns:
    - contract-testing with mocked db.query.* and db.select().from().where().orderBy() chains
    - artist-aware server action: slug lookup -> artist ID -> db.insert with FK
    - Drizzle relations for all artist-owned tables (portfolioItems, exhibitions, pressItems)
    - cv namespace in next-intl message files following existing gallery/contact pattern

key-files:
  created:
    - src/lib/queries/artist.ts
    - src/__tests__/artist-queries.test.ts
    - src/__tests__/artist-contact.test.ts
    - drizzle/0002_clever_mimic.sql
  modified:
    - src/lib/db/schema.ts
    - src/lib/db/seed.ts
    - src/lib/actions/contact.ts
    - src/messages/tr.json
    - src/messages/en.json

key-decisions:
  - "getArtistPortfolio, getArtistExhibitions, getArtistPressItems use raw db.select() chains (not db.query.*) matching RESEARCH.md recommendation for consistency with gallery.ts pattern"
  - "submitArtistContact in contact.ts (not new file) — extends existing file following plan spec"
  - "drizzle-kit push could not apply migration due to neon-http driver incompatibility with Supabase pooler endpoint in this environment; migration SQL generated (0002_clever_mimic.sql) and must be applied manually"
  - "Seed data gives melike 2 press items and seref none — validates CV-07 empty state behavior"

patterns-established:
  - "Pattern: Artist query functions in src/lib/queries/artist.ts mirroring src/lib/queries/gallery.ts"
  - "Pattern: Artist contact action extends existing contact.ts with artistContactSchema + submitArtistContact"
  - "Pattern: Contract tests mock db.query.artists.findFirst + db.select chain for artist query testing"

requirements-completed: [CV-01, CV-02, CV-03, CV-04, CV-05, CV-06, CV-07, CV-08]

# Metrics
duration: 35min
completed: 2026-03-25
---

# Phase 4 Plan 01: Schema migration, query layer, CV translations, and contract tests

**press_items table, statementTr/En columns, 4 artist CV query functions, artist contact action with slug-to-ID lookup, bilingual cv namespace, and full contract test coverage**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-25T04:00:00Z
- **Completed:** 2026-03-25T04:35:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Extended schema: `press_items` table + `statement_tr/en` columns on `artists` + updated Drizzle relations for all artist-owned tables
- Query layer: 4 exported functions (`getArtistBySlug`, `getArtistPortfolio`, `getArtistExhibitions`, `getArtistPressItems`) in new `src/lib/queries/artist.ts`
- Artist contact action: `submitArtistContact` with `artistContactSchema` — resolves artist slug to DB ID before inserting message
- Translations: full `cv` namespace (12 keys) + 5 new `meta` keys in both `tr.json` and `en.json`; i18n-keys parity test still passes
- Contract tests: 20 tests across `artist-queries.test.ts` and `artist-contact.test.ts`; full suite 81/81 green

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration, Drizzle relations, seed data, and i18n keys** - `30afee6` (feat)
2. **Task 2: RED — failing contract tests** - `4894448` (test)
3. **Task 2: GREEN — query functions and contact action** - `fc741d2` (feat)

**Plan metadata:** *(this commit)*

_Note: TDD task has separate test commit (RED) and implementation commit (GREEN)_

## Files Created/Modified
- `src/lib/db/schema.ts` - Added statementTr/En to artists, pressItems table, updated all relations
- `src/lib/db/seed.ts` - Added statement columns to artist INSERT; seeded exhibitions, portfolio items, press items
- `src/lib/queries/artist.ts` — New: all 4 CV query functions
- `src/lib/actions/contact.ts` — Extended: artistContactSchema + submitArtistContact
- `src/messages/tr.json` — Extended: cv namespace + meta artist keys
- `src/messages/en.json` — Extended: cv namespace + meta artist keys
- `src/__tests__/artist-queries.test.ts` — New: contract tests for query functions
- `src/__tests__/artist-contact.test.ts` — New: contract tests for artist contact action
- `drizzle/0002_clever_mimic.sql` — Migration SQL for press_items table and statement columns

## Decisions Made
- Used raw `db.select().from().where().orderBy()` chains for portfolio/exhibitions/press queries (not `db.query.*`) — consistent with gallery.ts pattern and avoids needing `findMany` on each table
- Extended existing `contact.ts` rather than creating a new file — plan specification, keeps related actions co-located
- Seed gives melike press items and seref none — ensures CV-07 empty state is testable

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

### Issues Encountered

**drizzle-kit push could not apply migration to database**
- **During:** Task 1 verification (`pnpm drizzle-kit push`)
- **Issue:** `@neondatabase/serverless` neon-http driver constructs `api.pooler.supabase.com` as the HTTP endpoint from the Supabase pooler URL, which does not exist. The driver is designed for Neon's proprietary HTTP API, not standard Supabase pools.
- **Workaround:** Generated migration SQL file (`drizzle/0002_clever_mimic.sql`) using `pnpm drizzle-kit generate`. The migration must be applied to the Supabase database manually or via Supabase SQL editor.
- **Migration SQL to apply:**
  ```sql
  CREATE TABLE "press_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "artist_id" integer,
    "title" text NOT NULL,
    "publication" text,
    "url" text,
    "year" integer,
    "sort_order" integer DEFAULT 0
  );
  ALTER TABLE "artists" ADD COLUMN "statement_tr" text;
  ALTER TABLE "artists" ADD COLUMN "statement_en" text;
  ALTER TABLE "press_items" ADD CONSTRAINT "press_items_artist_id_artists_id_fk"
    FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;
  ```
- **Impact:** All code, tests, and translations complete. Only DB schema application is pending.

## Next Phase Readiness
- Query layer complete: all 4 CV query functions exported and contract-tested
- Artist contact action complete: `submitArtistContact` and `artistContactSchema` ready for UI forms
- i18n translations ready: `cv` and updated `meta` namespaces in both locales
- **Blocker:** `press_items` table and `statement_tr/en` columns must be applied to the Supabase database before CV UI pages can render correctly. Apply `drizzle/0002_clever_mimic.sql` in Supabase SQL editor.

## Self-Check: PASSED

- FOUND: src/lib/queries/artist.ts
- FOUND: src/lib/actions/contact.ts (with artistContactSchema + submitArtistContact)
- FOUND: src/__tests__/artist-queries.test.ts
- FOUND: src/__tests__/artist-contact.test.ts
- FOUND: commit 30afee6 (feat: schema migration)
- FOUND: commit 4894448 (test: failing contract tests)
- FOUND: commit fc741d2 (feat: query layer and contact action)

---
*Phase: 04-sanatci-cv-subdomainleri*
*Completed: 2026-03-25*
