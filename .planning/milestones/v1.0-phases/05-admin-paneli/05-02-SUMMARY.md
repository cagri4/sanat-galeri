---
phase: 05-admin-paneli
plan: 02
subsystem: ui
tags: [next.js, react, tailwind, react-hook-form, zod, vercel-blob, server-components, client-components]

# Dependency graph
requires:
  - phase: 05-admin-paneli-01
    provides: Server Actions (createProduct, updateProduct, deleteProduct, addProductImage, deleteProductImage) and admin query layer (getAllProducts, getProductById, getAllArtists, getAllMessages)
  - phase: 01-foundation
    provides: auth.ts (NextAuth v5 signOut), /api/upload route for Vercel Blob token exchange
provides:
  - Admin navigation sidebar (AdminNav Server Component + AdminNavLinks Client Component)
  - Protected layout with sidebar wrapping all admin pages
  - Dashboard page showing product/artist/unread-message counts
  - Product list page with thumbnail, title, category, visibility badge, edit links
  - New product form page (create mode, redirects to edit page on success)
  - Edit product page with product form pre-filled + image uploader
  - ProductForm Client Component with react-hook-form + zod validation, create + edit + delete
  - ImageUploader Client Component using @vercel/blob/client upload(), multi-file, delete with blob cleanup
  - Artists list page + edit page with ArtistForm + ExhibitionForm
  - Messages list page with MessageList client component showing read/unread state
  - message-utils.ts pure utility module (parseProductContext extracted from actions)
affects: [05-admin-paneli-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AdminNav is Server Component; active-path highlighting extracted to AdminNavLinks ('use client') to use usePathname"
    - "ProductForm calls Server Actions directly (not useActionState) — simpler async/await with useState for status"
    - "ImageUploader uses dynamic import('@vercel/blob/client') to avoid SSR issues with client-only upload()"
    - "Edit page passes product data as prop to Client Component — Server Component fetches, Client Component renders form"
    - "parseProductContext moved to lib/utils/message-utils.ts — pure function, not a Server Action"

key-files:
  created:
    - src/components/admin/admin-nav.tsx
    - src/components/admin/admin-nav-client.tsx
    - src/components/admin/product-form.tsx
    - src/components/admin/image-uploader.tsx
    - src/components/admin/artist-form.tsx
    - src/components/admin/exhibition-form.tsx
    - src/components/admin/message-list.tsx
    - src/app/(admin)/(protected)/urunler/page.tsx
    - src/app/(admin)/(protected)/urunler/yeni/page.tsx
    - src/app/(admin)/(protected)/urunler/[id]/page.tsx
    - src/app/(admin)/(protected)/sanatcilar/page.tsx
    - src/app/(admin)/(protected)/sanatcilar/[slug]/page.tsx
    - src/app/(admin)/(protected)/mesajlar/page.tsx
    - src/lib/utils/message-utils.ts
  modified:
    - src/app/(admin)/(protected)/layout.tsx
    - src/app/(admin)/(protected)/dashboard/page.tsx
    - src/lib/actions/message.ts

key-decisions:
  - "AdminNav split into Server Component (admin-nav.tsx) + Client Component (admin-nav-client.tsx) — signOut needs server action, usePathname needs 'use client'"
  - "parseProductContext moved from actions/message.ts to lib/utils/message-utils.ts — Client Component (message-list) cannot import 'use server' modules in some bundling scenarios"
  - "ImageUploader uses dynamic import('@vercel/blob/client') — avoids SSR import errors for client-only SDK"
  - "ProductForm redirects to edit page on successful create (router.push to /admin/urunler/${result.id})"

patterns-established:
  - "Server Component fetches data, passes typed props to Client Component form — no client-side data fetching"
  - "Client form components use useState for save/error status (idle|saving|success|error) with auto-reset"
  - "Delete operations use window.confirm() dialog before calling Server Action"

requirements-completed: [ADM-01]

# Metrics
duration: 12min
completed: 2026-03-25
---

# Phase 5 Plan 02: Admin Artwork CRUD UI Summary

**Full admin artwork CRUD UI — product list, create form, edit form, Vercel Blob image uploader — plus artists and messages management pages**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-25T08:13:27Z
- **Completed:** 2026-03-25T08:26:26Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments

- Admin navigation sidebar with active-path highlighting on all protected pages
- Dashboard with section counts (products, artists, unread messages) and direct links
- Product list table: thumbnail, title, artist name, category, visibility badge, edit link
- ProductForm component handles create (redirects to edit on success) and edit (pre-filled) with zod validation
- ImageUploader with multi-file Vercel Blob upload, thumbnail grid, and per-image delete
- Artists list + edit pages with ArtistForm (bio, statement, photo upload, contact) and ExhibitionForm
- Messages list with read/unread state, "mark read" button, and product context badge
- 97 tests still passing with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin nav + layout + dashboard + product/artist/message pages** - `8926ded` (feat)
2. **Task 2: Product form + image uploader + new/edit product pages** - `221349d` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/components/admin/admin-nav.tsx` - Server Component sidebar, renders AdminNavLinks + sign-out form action
- `src/components/admin/admin-nav-client.tsx` - Client Component for active-path nav links using usePathname
- `src/components/admin/product-form.tsx` - react-hook-form + zod product create/edit/delete form
- `src/components/admin/image-uploader.tsx` - Vercel Blob client upload, thumbnail grid, per-image delete
- `src/components/admin/artist-form.tsx` - Artist bio/statement/photo/contact update form
- `src/components/admin/exhibition-form.tsx` - Exhibition CRUD per type (solo/grup/odul/egitim)
- `src/components/admin/message-list.tsx` - Message list with read/unread UI and mark-read action
- `src/app/(admin)/(protected)/layout.tsx` - Updated: adds AdminNav sidebar to all protected pages
- `src/app/(admin)/(protected)/dashboard/page.tsx` - Updated: section count cards with links
- `src/app/(admin)/(protected)/urunler/page.tsx` - Product list with thumbnail table
- `src/app/(admin)/(protected)/urunler/yeni/page.tsx` - New product page (create mode)
- `src/app/(admin)/(protected)/urunler/[id]/page.tsx` - Edit product page with ProductForm + ImageUploader
- `src/app/(admin)/(protected)/sanatcilar/page.tsx` - Artist grid list
- `src/app/(admin)/(protected)/sanatcilar/[slug]/page.tsx` - Artist edit page with ArtistForm + ExhibitionForm
- `src/app/(admin)/(protected)/mesajlar/page.tsx` - Messages page with MessageList
- `src/lib/utils/message-utils.ts` - parseProductContext pure function (moved from actions/message.ts)
- `src/lib/actions/message.ts` - Modified: removed parseProductContext (now in message-utils.ts)

## Decisions Made

- AdminNav split into Server + Client components: `signOut` needs to be in a server action (can't call from Client Component directly as prop), while `usePathname` requires 'use client'
- `parseProductContext` moved to `lib/utils/message-utils.ts` because `message-list.tsx` is a Client Component and importing 'use server' modules in client context causes bundling issues
- `ImageUploader` uses `dynamic import('@vercel/blob/client')` to prevent SSR import errors — the blob client SDK is browser-only
- On create, `ProductForm` uses `router.push` to navigate to the edit page after successful creation, allowing image uploads to happen immediately

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] parseProductContext moved to dedicated utils module**
- **Found during:** Task 1 (building message-list.tsx)
- **Issue:** message-list.tsx is 'use client' but needed to import parseProductContext which was in a 'use server' module — this is an incompatible import
- **Fix:** Created `src/lib/utils/message-utils.ts` as a plain module (no 'use server' directive), moved parseProductContext there, removed it from actions/message.ts
- **Files modified:** src/lib/utils/message-utils.ts (created), src/lib/actions/message.ts (removed function)
- **Verification:** Build succeeded, tests still pass (97/97)
- **Committed in:** 8926ded (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical separation for client/server boundary)
**Impact on plan:** Required for correct module bundling. No scope creep.

## Issues Encountered

- Previous build process was still running when attempting new builds — waited for completion rather than force-killing to avoid corrupted .next artifacts
- Pre-existing admin pages (mesajlar, sanatcilar, artist-form, exhibition-form) were already created, committed alongside Task 1 files

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full artwork CRUD UI complete — admin can list, create, edit, delete products with images
- Artists management pages complete with bio/exhibition editing
- Messages page complete with read/unread state management
- All routes compile successfully with TypeScript, zero test regressions
- Ready for Phase 5 Plan 03 (if any remaining admin features)
