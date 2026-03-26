---
phase: 05-admin-paneli
plan: 01
subsystem: api
tags: [drizzle, nextauth, zod, server-actions, vercel-blob, jest, tdd]

# Dependency graph
requires:
  - phase: 04-sanatci-cv-subdomainleri
    provides: schema.ts with all tables (artists, products, messages, exhibitions, portfolioItems, pressItems)
  - phase: 01-foundation
    provides: auth.ts (NextAuth v5), db.ts (Drizzle ORM), existing action pattern from contact.ts
provides:
  - Admin Server Actions for product CRUD (createProduct, updateProduct, deleteProduct)
  - Admin Server Actions for product images (addProductImage, deleteProductImage, reorderProductImages)
  - Admin Server Action for artist bio/statement update (updateArtist)
  - Admin Server Actions for exhibition CRUD (createExhibition, updateExhibition, deleteExhibition)
  - Admin Server Actions for message management (markMessageRead, parseProductContext)
  - Admin query layer without isVisible filter (getAllProducts, getProductById, getAllArtists, getArtistBySlug, getAllMessages)
  - messagesRelations in schema.ts enabling db.query.messages with: { artist: true }
affects: [05-admin-paneli-02, 05-admin-paneli-03, any admin UI pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Admin Server Actions use auth() guard at top: const session = await auth(); if (!session) return { success: false, error: 'Unauthorized' }"
    - "All mutations call revalidatePath('/', 'layout') to invalidate all caches (admin + public)"
    - "Admin queries in admin.ts have no isVisible filter — return all records regardless of visibility"
    - "Slug generation from Turkish title: toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '')"
    - "TDD RED/GREEN pattern: test files created first with mocked db/auth, then implementations make tests pass"

key-files:
  created:
    - src/lib/actions/product.ts
    - src/lib/actions/product-image.ts
    - src/lib/actions/artist.ts
    - src/lib/actions/exhibition.ts
    - src/lib/actions/message.ts
    - src/lib/queries/admin.ts
    - src/__tests__/admin-product.test.ts
    - src/__tests__/admin-artist.test.ts
    - src/__tests__/admin-messages.test.ts
  modified:
    - src/lib/db/schema.ts

key-decisions:
  - "messagesRelations added to schema.ts (messages belongs_to artist via artistId) — required for db.query.messages with: { artist: true } in getAllMessages()"
  - "artistsRelations extended with messages: many(messages) to complete the bidirectional relation"
  - "Admin query layer (admin.ts) separate from gallery.ts — gallery.ts has isVisible=true filter, admin.ts has none"
  - "deleteProductImage uses @vercel/blob del() to clean up blob storage before deleting the DB row"
  - "parseProductContext is a pure function (not 'use server' action) exported from message.ts — testable without async mocks"

patterns-established:
  - "Server Action auth pattern: await auth() → null check → return { success: false, error: 'Unauthorized' }"
  - "Admin test mock pattern: jest.mock('@/auth') with mockResolvedValue(null) for unauthorized, { user: { id: '1' } } for authorized"
  - "Test mock chain rebuild in beforeEach after jest.clearAllMocks() to reset mock return values"

requirements-completed: [ADM-01, ADM-02, ADM-03]

# Metrics
duration: 15min
completed: 2026-03-25
---

# Phase 5 Plan 01: Admin Server Actions Summary

**Drizzle-based admin CRUD Server Actions for products/artists/exhibitions/messages with NextAuth v5 auth guards, zod validation, and 97-test green suite**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-25T08:06:23Z
- **Completed:** 2026-03-25T08:21:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- All 5 Server Action modules implemented with auth guards, zod validation, and revalidatePath calls
- Admin query layer created with 5 query functions (no isVisible filter — returns all records)
- messagesRelations added to schema.ts enabling relational queries on messages table
- 19 new admin unit tests all pass (3 test files covering ADM-01, ADM-02, ADM-03)
- Full test suite: 97 tests pass with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 tests + admin query layer + messagesRelations fix** - `a0bc699` (test)
2. **Task 2: All admin Server Actions** - `633a4a7` (feat)

**Plan metadata:** (docs commit — see below)

_Note: TDD tasks have RED commit (test) then GREEN commit (feat)_

## Files Created/Modified

- `src/lib/db/schema.ts` - Added messagesRelations + messages: many(messages) to artistsRelations
- `src/lib/queries/admin.ts` - 5 admin query functions (getAllProducts, getProductById, getAllArtists, getArtistBySlug, getAllMessages) without isVisible filter
- `src/lib/actions/product.ts` - createProduct/updateProduct/deleteProduct with auth, zod, slug generation
- `src/lib/actions/product-image.ts` - addProductImage/deleteProductImage (@vercel/blob)/reorderProductImages
- `src/lib/actions/artist.ts` - updateArtist for bio/statement/photo/email/whatsapp
- `src/lib/actions/exhibition.ts` - createExhibition/updateExhibition/deleteExhibition CRUD
- `src/lib/actions/message.ts` - markMessageRead + parseProductContext pure utility
- `src/__tests__/admin-product.test.ts` - ADM-01 unit tests (auth guard, CRUD, slug generation)
- `src/__tests__/admin-artist.test.ts` - ADM-02 unit tests (auth guard, update bio/statement)
- `src/__tests__/admin-messages.test.ts` - ADM-03 unit tests (auth guard, markMessageRead, parseProductContext)

## Decisions Made

- messagesRelations was missing from schema.ts — added to enable `db.query.messages.findMany({ with: { artist: true } })` in getAllMessages()
- artistsRelations extended with `messages: many(messages)` to make the bidirectional relation complete
- Admin query layer kept in separate file (admin.ts) from gallery.ts — clear separation of admin vs public query semantics
- deleteProductImage uses `@vercel/blob del()` to remove blob storage file before deleting the DB row (prevents orphaned blob files)
- parseProductContext exported as plain function (not 'use server' async action) — simpler testing, no async needed for regex operation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Jest 30 changed flag name from `--testPathPattern` to `--testPathPatterns` — adapted test commands accordingly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All admin mutation and query backend is complete
- Admin UI pages (05-02 onwards) can import actions from their respective files
- All Server Actions tested and verified with auth guards
- No blockers for next phase
