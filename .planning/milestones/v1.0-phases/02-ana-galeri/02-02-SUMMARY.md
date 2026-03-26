---
phase: 02-ana-galeri
plan: 02
subsystem: ui
tags: [next.js, react, tailwind, next-image, suspense, server-components, url-filtering]

# Dependency graph
requires:
  - phase: 02-ana-galeri
    plan: 01
    provides: getProducts(), getCategories(), ProductWithImage type from Drizzle relational queries

provides:
  - ArtworkCard Server Component (thumbnail, title, price, category badge, Link to detail page)
  - ArtworkGrid Server Component (responsive 3-col grid, empty state)
  - CategoryFilter Client Component (URL-based filtering via useRouter.replace, horizontal scroll)
  - Gallery listing page at /[locale]/galeri with Suspense boundary around CategoryFilter
affects: [02-03, phase-03, phase-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Component type inference: `type ProductWithImage = Awaited<ReturnType<typeof getProducts>>[number]`
    - URL-based filtering: CategoryFilter calls router.replace(pathname + '?category=' + cat)
    - Suspense boundary wrapping Client Components that use useSearchParams to avoid static generation bail-out
    - Next.js 16 async props: await params and await searchParams before use

key-files:
  created:
    - src/components/gallery/artwork-card.tsx
    - src/components/gallery/artwork-grid.tsx
    - src/components/gallery/category-filter.tsx
    - src/app/(main)/[locale]/galeri/page.tsx
  modified:
    - src/lib/queries/gallery.ts (fixed orderBy type signature)

key-decisions:
  - "ProductWithImage type inferred via Awaited<ReturnType<typeof getProducts>>[number] — avoids manual type duplication"
  - "CategoryFilter uses useRouter.replace (not Link) for filter buttons — filter is a UI action, not navigation; no browser history entry"
  - "CategoryFilter wrapped in Suspense in gallery page — required to avoid static generation bail-out from useSearchParams"
  - "Drizzle orderBy callback uses inferred types (img, { asc }) not manual unknown annotations — previous code had TS errors"

patterns-established:
  - "Pattern: Infer DB result types from query function return type — no manual interface duplication"
  - "Pattern: Client Component category filter using router.replace for zero-JS-fallback-compatible URL filtering"
  - "Pattern: Suspense wrapping useSearchParams consumers in Server Component pages"

requirements-completed: [GAL-01]

# Metrics
duration: 12min
completed: 2026-03-24
---

# Phase 02 Plan 02: Gallery Listing Page Summary

**Responsive gallery listing page at /[locale]/galeri with ArtworkCard grid, URL-based category filter (Suspense-wrapped Client Component), and next/image thumbnails linking to detail pages**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-24T20:08:09Z
- **Completed:** 2026-03-24T20:20:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- ArtworkCard Server Component with next/image thumbnail (aspect-[3/4], fallback placeholder SVG), category badge, price display, and Link to /[locale]/urun/[slug]
- ArtworkGrid Server Component with responsive CSS grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3) and localized empty state message
- CategoryFilter Client Component with horizontal scroll button bar, active state styling (bg-neutral-900 text-white), router.replace URL updates
- Gallery page with async params/searchParams (Next.js 16), Suspense boundary around CategoryFilter, generateMetadata export
- Fixed pre-existing Drizzle orderBy type annotation bug in gallery.ts (Rule 1 auto-fix)

## Task Commits

Each task was committed atomically:

1. **Task 1: Artwork card and grid components** - `aafe5f7` (feat)
2. **Task 2: Gallery page with category filter** - `2f9399d` (feat)

## Files Created/Modified

- `src/components/gallery/artwork-card.tsx` - Server Component: thumbnail with next/image, title/category/price, Link to detail page
- `src/components/gallery/artwork-grid.tsx` - Server Component: responsive 3-column grid, empty state
- `src/components/gallery/category-filter.tsx` - Client Component: horizontal filter buttons with URL-based category filtering
- `src/app/(main)/[locale]/galeri/page.tsx` - Async Server Component gallery page with Suspense boundary
- `src/lib/queries/gallery.ts` - Fixed Drizzle orderBy callback type (inferred vs manual unknown)

## Decisions Made

- ProductWithImage type is inferred via `Awaited<ReturnType<typeof getProducts>>[number]` — keeps types in sync with Drizzle schema without duplication.
- CategoryFilter uses `<button>` with `router.replace` rather than `<Link>` — category filter is a UI interaction, not navigation; avoids polluting browser history.
- CategoryFilter is inside `<Suspense>` in the page because Next.js requires this for components using `useSearchParams` to prevent static generation bail-out.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect Drizzle orderBy type annotation in gallery.ts**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** `gallery.ts` had manual type annotations `(img: { sortOrder: unknown }, { asc }: { asc: (col: unknown) => unknown[] })` which caused TS2322 errors and prevented the `with: { images }` relation from appearing in the inferred return type
- **Fix:** Changed both orderBy callbacks to use inferred parameter types: `(img, { asc }) => [asc(img.sortOrder)]`
- **Files modified:** src/lib/queries/gallery.ts
- **Verification:** `pnpm exec tsc --noEmit` outputs 0 errors
- **Committed in:** aafe5f7 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — incorrect type annotations blocking type inference)
**Impact on plan:** Required for ArtworkCard to access `product.images[0]`. The fix is minimal (removing incorrect explicit types). No scope creep.

## Issues Encountered

- `pnpm build` fails with "Database connection string format for neon() should be: postgresql://..." — this is a pre-existing infrastructure issue (placeholder DATABASE_URL in .env.local, documented in Plan 01 SUMMARY). The galeri page code is correct; build would succeed with a valid Neon connection string.
- TypeScript standalone (`pnpm exec tsc --noEmit`) passes with 0 errors, confirming correctness.

## User Setup Required

None new — see Plan 01 SUMMARY for DB credentials setup required before full build works.

## Next Phase Readiness

- Gallery listing page complete: ArtworkCard, ArtworkGrid, CategoryFilter, /[locale]/galeri page all implemented
- Plan 02-03 can build the artwork detail page (/[locale]/urun/[slug]) using getProductBySlug() and the ArtworkCard link pattern established here
- CategoryFilter URL contract established: `?category=X` param, cleared by router.replace(pathname)
- Blocker (inherited): DB must have real credentials and seed data applied for pages to render actual content

## Self-Check: PASSED

Files present:
- src/components/gallery/artwork-card.tsx: FOUND
- src/components/gallery/artwork-grid.tsx: FOUND
- src/components/gallery/category-filter.tsx: FOUND
- src/app/(main)/[locale]/galeri/page.tsx: FOUND

Commits exist:
- aafe5f7 (Task 1): FOUND
- 2f9399d (Task 2): FOUND

---
*Phase: 02-ana-galeri*
*Completed: 2026-03-24*
