---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [next-auth, admin-auth, server-components, cve-2025-29927, jest, route-groups]

# Dependency graph
requires:
  - phase: 01-01
    provides: next-auth v5 credentials provider (auth, signIn exports), Jest test framework

provides:
  - Admin login page at /admin/login using next-auth v5 server action pattern
  - (protected) admin layout with server-side await auth() check (CVE-2025-29927 defense)
  - Admin dashboard placeholder at /admin/dashboard (requires auth)
  - Admin chrome layout wrapper (nav bar) without auth check
  - Auth tests verifying both authenticated and unauthenticated code paths
affects: [05-admin, 02-main-gallery]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Defense-in-depth: middleware (Plan 02) + server-side await auth() in (protected) layout — two independent auth layers"
    - "Next.js route group nesting: (admin)/(protected)/ inherits auth check from nested layout"
    - "next-auth v5 server action signIn: form action with 'use server' + await signIn('credentials', {..., redirectTo})"

key-files:
  created:
    - src/app/(admin)/layout.tsx
    - src/app/(admin)/(protected)/layout.tsx
    - src/app/(admin)/login/page.tsx
    - src/app/(admin)/(protected)/dashboard/page.tsx
    - src/__tests__/admin-auth.test.ts
  modified: []

key-decisions:
  - "await auth() in (protected) layout is the mandatory second auth layer — must never be removed even when middleware also guards the route (CVE-2025-29927: middleware can be bypassed with crafted x-middleware-subrequest headers, server-side check cannot)"
  - "Login page lives under (admin)/ NOT (admin)/(protected)/ — must be accessible without session to avoid redirect loop"
  - "Jest dynamic import pattern: import layout inside each test to allow per-test mock resets and avoid module caching issues between test cases"

patterns-established:
  - "Pattern: Nested route groups for auth tiers — (admin)/ for chrome, (admin)/(protected)/ for authenticated pages"
  - "Pattern: TDD for Server Component auth — mock @/auth module, mock next/navigation redirect, test via dynamic import"

requirements-completed: [ADM-04]

# Metrics
duration: 15min
completed: 2026-03-23
---

# Phase 1 Plan 03: Admin Authentication Layer Summary

**next-auth v5 admin login with server-action form, server-side await auth() in (protected) layout as CVE-2025-29927 defense-in-depth, dashboard placeholder, and Jest auth tests**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-23T19:10:41Z
- **Completed:** 2026-03-23T19:30:00Z
- **Tasks:** 2 (Task 1 with TDD: 2 commits; Task 2: already committed via Plan 02 stash)
- **Files modified:** 5

## Accomplishments

- Admin (protected) layout implementing server-side `await auth()` as defense-in-depth against CVE-2025-29927 — middleware can be bypassed with crafted headers, server-side check cannot
- Login page with next-auth v5 server action pattern (`'use server'` + `await signIn('credentials', {..., redirectTo})`) accessible without authentication
- Jest test suite (3 tests) verifying unauthenticated redirect and authenticated render paths in the ProtectedAdminLayout

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Write failing admin auth tests** - `8c3ab78` (test)
2. **Task 1 GREEN: Implement (protected) layout + admin chrome layout** - `fc95796` (feat)
3. **Task 2: Login page + dashboard placeholder** - `850bba6` (feat, committed as part of Plan 02 stash resolution)

## Files Created/Modified

- `src/app/(admin)/layout.tsx` - Admin chrome wrapper (nav bar), no auth check
- `src/app/(admin)/(protected)/layout.tsx` - Server-side `await auth()`, redirects to /admin/login if no session
- `src/app/(admin)/login/page.tsx` - Login form using next-auth v5 server action, imports `signIn` from `@/auth`
- `src/app/(admin)/(protected)/dashboard/page.tsx` - Admin dashboard placeholder (inside protected group)
- `src/__tests__/admin-auth.test.ts` - 3 Jest tests: auth() called, unauthenticated redirect, authenticated render

## Decisions Made

- `await auth()` in `(protected)/layout.tsx` is the mandatory second auth layer per CVE-2025-29927 — even if middleware also guards admin routes, the server-side check is required because middleware can be bypassed via `x-middleware-subrequest` header manipulation
- Login page placed at `(admin)/login/page.tsx` (NOT inside `(protected)/`) so it remains accessible without a session — avoids redirect loop
- TDD tests use dynamic imports inside each test case to allow Jest module cache resets between test cases (static imports at module level would cache the mock state)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed invalid `turbopack: false` from next.config.ts**
- **Found during:** Task 2 build verification
- **Issue:** A stash pop from Plan 02 execution had introduced `turbopack: false` in next.config.ts. This is invalid in Next.js 16 — `turbopack` option expects `TurbopackOptions` object, not boolean. TypeScript build error: "Type 'false' has no properties in common with type 'TurbopackOptions'"
- **Fix:** Removed `turbopack: false` line from next.config.ts
- **Files modified:** next.config.ts
- **Verification:** Build succeeded after removal
- **Committed in:** Will be in final docs commit

---

**Total deviations:** 1 auto-fixed (1 blocking bug)
**Impact on plan:** The invalid next.config.ts option was a pre-existing issue from Plan 02 stash state. Removing it was necessary to unblock the build verification. No scope creep.

## Issues Encountered

- Turbopack's tmp-file write strategy caused ENOENT errors in the Turkish filesystem path (`Masaüstü` directory). This was a pre-existing issue (present before 01-03 changes). Build ultimately succeeded once the invalid `turbopack: false` config option was removed — the ENOENT was a side effect of the build failing during TypeScript check, not a filesystem limitation.
- `--testPathPattern` flag renamed to `--testPathPatterns` in Jest 30 — used correct flag for test execution.
- Plan 02 had run partially (stash state) — login page and dashboard files were found already committed in `850bba6` when stash was popped. Files verified to match plan spec exactly.

## User Setup Required

None - no external service configuration required for this plan. Admin auth uses env vars configured in Plan 01.

## Next Phase Readiness

- Admin auth flow complete: login page accessible, dashboard protected by (protected) layout
- Ready for Phase 5 (admin) to add real admin features to the dashboard
- CVE-2025-29927 defense-in-depth implemented and tested

---
*Phase: 01-foundation*
*Completed: 2026-03-23*
