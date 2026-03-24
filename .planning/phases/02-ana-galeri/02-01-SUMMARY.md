---
phase: 02-ana-galeri
plan: 01
subsystem: database
tags: [drizzle, neon, postgresql, zod, whatsapp, jest, seed, migrations]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Drizzle client (db/index.ts), schema tables, Neon connection, jest config
provides:
  - Drizzle relations (productsRelations, artistsRelations, productImagesRelations)
  - New products columns: year, mediumTr, mediumEn, dimensionsTr, dimensionsEn
  - Migration 0001_rainy_omega_flight.sql for the 5 new columns
  - Seed script (src/lib/db/seed.ts) with 2 artists + 5 products + images
  - Gallery query functions: getProducts(), getProductBySlug(), getCategories()
  - Contact Server Action: submitContact() with zod validation
  - WhatsApp utility: buildWhatsAppHref()
  - 6 test files (39 tests) — 3 logic + 3 Wave 0 UI stubs
affects: [02-02, 02-03, phase-03, phase-04, phase-05]

# Tech tracking
tech-stack:
  added:
    - yet-another-react-lightbox (installed — was listed as installed in RESEARCH.md but was missing)
  patterns:
    - Drizzle relational queries via relations() + db.query.* with `with:` option
    - Server Action pattern with zod schema validation + db.insert
    - WhatsApp wa.me/ deep link with phone.replace(/\D/g, '') normalization
    - Idempotent seed script with ON CONFLICT DO NOTHING
    - Wave 0 test stubs: contract tests with mocked db.query and next/navigation

key-files:
  created:
    - src/lib/db/seed.ts
    - src/lib/queries/gallery.ts
    - src/lib/utils/whatsapp.ts
    - src/lib/actions/contact.ts
    - src/__tests__/gallery-queries.test.ts
    - src/__tests__/whatsapp.test.ts
    - src/__tests__/contact-action.test.ts
    - src/__tests__/category-filter.test.ts
    - src/__tests__/artwork-detail.test.ts
    - src/__tests__/lightbox-viewer.test.ts
    - drizzle/0001_rainy_omega_flight.sql
  modified:
    - src/lib/db/schema.ts (5 new columns + 3 relations)
    - package.json (yet-another-react-lightbox added)

key-decisions:
  - "Drizzle relations (artistsRelations, productsRelations, productImagesRelations) are required for db.query.* with `with:` — FK columns alone are insufficient"
  - "yet-another-react-lightbox was installed in this plan (RESEARCH.md incorrectly listed it as already present)"
  - "Wave 0 UI test stubs use contract testing pattern — mock next/navigation and db.query, verify prop shapes and call signatures without jsdom rendering"
  - "Seed script uses ON CONFLICT DO NOTHING for idempotency — safe to re-run"
  - "submitContact body prefixed with [Eser: {slug}] when productSlug provided — no separate product_id column needed"

patterns-established:
  - "Pattern: Drizzle relational query — db.query.products.findMany({ with: { images: { limit: 1 } } })"
  - "Pattern: Category filter uses db.selectDistinct({ category }) .from(products) .where(isVisible)"
  - "Pattern: Wave 0 stub — import module, mock its deps, assert call signatures (no rendering needed)"
  - "Pattern: Server Action — 'use server', zod.safeParse, return { success, errors }, db.insert"

requirements-completed: [GAL-01, GAL-04, GAL-05]

# Metrics
duration: 35min
completed: 2026-03-24
---

# Phase 02 Plan 01: Ana Galeri Data Layer Summary

**Drizzle relations + 5 new product columns + migration, gallery queries (getProducts/getProductBySlug/getCategories), submitContact Server Action with zod validation, buildWhatsAppHref utility, and 6 test files (39 tests) as Wave 0 data/contract layer**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-24T09:15:00Z
- **Completed:** 2026-03-24T09:50:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Updated schema with 5 new nullable product columns (year, mediumTr, mediumEn, dimensionsTr, dimensionsEn) and generated migration SQL
- Added Drizzle relations to enable `db.query.products.findMany({ with: { images, artist } })` relational queries
- Created idempotent seed script with 2 artists (melike/seref) and 5 products across Tablo/Seramik/Heykel categories
- Implemented gallery query functions, contact Server Action with zod validation, and WhatsApp href builder
- Created 6 test files with 39 tests (all passing); 3 logic unit tests + 3 Wave 0 UI contract stubs

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration + Drizzle relations + seed script** - `001b2f5` (feat)
2. **Task 2: Gallery queries, contact Server Action, WhatsApp utility + all phase test stubs** - `f060274` (feat)

_Note: TDD tasks: RED phase confirmed failure before implementation, GREEN phase all tests pass._

## Files Created/Modified

- `src/lib/db/schema.ts` - Added 5 product columns + 3 Drizzle relations imports
- `drizzle/0001_rainy_omega_flight.sql` - Migration: ALTER TABLE products ADD COLUMN x5
- `src/lib/db/seed.ts` - Idempotent seed: 2 artists, 5 products, product images
- `src/lib/queries/gallery.ts` - getProducts(), getProductBySlug(), getCategories()
- `src/lib/utils/whatsapp.ts` - buildWhatsAppHref() with phone normalization
- `src/lib/actions/contact.ts` - submitContact() Server Action with zod + db.insert
- `src/__tests__/gallery-queries.test.ts` - 7 tests: findMany/findFirst call verification
- `src/__tests__/whatsapp.test.ts` - 7 tests: phone normalisation, encoding, URL shape
- `src/__tests__/contact-action.test.ts` - 8 tests: validation, db.insert, productSlug prefix
- `src/__tests__/category-filter.test.ts` - 4 tests: Wave 0 stub, next/navigation contract
- `src/__tests__/artwork-detail.test.ts` - 8 tests: product field shape contract
- `src/__tests__/lightbox-viewer.test.ts` - 5 tests: Wave 0 stub, slide prop contract
- `package.json` + `pnpm-lock.yaml` - Added yet-another-react-lightbox

## Decisions Made

- Drizzle relations are required for `db.query.*` with `with:` — FK columns alone are insufficient. Added `artistsRelations`, `productsRelations`, `productImagesRelations`.
- Wave 0 UI test stubs use contract testing pattern (mock db.query, next/navigation, verify prop shapes) rather than jsdom rendering — avoids test environment complexity while establishing interface contracts.
- Body prefixed with `[Eser: {slug}]` when productSlug provided — simpler than adding a product_id column.
- Seed uses ON CONFLICT DO NOTHING for idempotency.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing yet-another-react-lightbox package**
- **Found during:** Task 2 (lightbox-viewer test stub creation)
- **Issue:** RESEARCH.md listed the package as "already installed" but it was not present in node_modules
- **Fix:** Ran `pnpm add yet-another-react-lightbox`
- **Files modified:** package.json, pnpm-lock.yaml
- **Verification:** `pnpm test src/__tests__/lightbox-viewer.test.ts` passes (5/5 tests)
- **Committed in:** f060274 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing dependency)
**Impact on plan:** Required for lightbox-viewer tests and future LightboxViewer component. No scope creep.

## Issues Encountered

- DATABASE_URL in .env.local is a placeholder — `pnpm drizzle-kit push` cannot connect to DB. Migration file is generated correctly and ready to apply when real credentials are configured.
- `--testPathPatterns` (plural) in PLAN.md verify block does not work with Jest 30; used `--testPathPattern` (singular) or direct file path instead. Tests all pass.

## User Setup Required

**DB push requires real credentials.** Before running the seed script:
1. Set `DATABASE_URL_DIRECT` in `.env.local` to the actual Neon direct connection URL (port 5432)
2. Run: `pnpm drizzle-kit push` to apply migration 0001
3. Set `DATABASE_URL` to the pooled URL (port 6543)
4. Run: `npx tsx src/lib/db/seed.ts` to populate dev data

## Next Phase Readiness

- Data layer complete: gallery queries, contact action, WhatsApp utility all tested
- Wave 0 UI test stubs in place for Plans 02/03 to expand
- Schema migration ready to apply — needs real DB credentials
- Plans 02/03 can now build UI components against these query functions
- Blocker: DB must be seeded before gallery pages can render real data

## Self-Check: PASSED

All key files present:
- src/lib/queries/gallery.ts: FOUND
- src/lib/utils/whatsapp.ts: FOUND
- src/lib/actions/contact.ts: FOUND
- src/lib/db/seed.ts: FOUND
- drizzle/0001_rainy_omega_flight.sql: FOUND

All commits exist:
- 001b2f5 (Task 1): FOUND
- f060274 (Task 2): FOUND

---
*Phase: 02-ana-galeri*
*Completed: 2026-03-24*
