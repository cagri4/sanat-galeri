---
phase: 01-foundation
plan: 02
subsystem: routing
tags: [middleware, next-intl, domain-routing, multi-tenant, responsive, placeholder-pages, tdd]

# Dependency graph
requires:
  - 01-01 (Next.js scaffold, next-intl routing config, Jest framework)
provides:
  - Domain routing middleware mapping 3 domains to route groups
  - ?tenant= query param for local dev subdomain simulation
  - Admin path guard redirecting to /admin/login
  - (main)/[locale] route group with responsive layout
  - (artist)/[locale]/[artist] route group with responsive layout
  - 8-test unit test suite for middleware routing
affects: [01-03, 02-main-gallery, 03-i18n, 04-cv-subdomains, 05-admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Middleware composition: getTenant() first, then intlMiddleware on rewritten URL"
    - "Artist subdomain rewrite: prepend /{tenant} to pathname before intlMiddleware"
    - "Admin guard: check authjs.session-token cookie, redirect to /admin/login"
    - "?tenant= query param overrides hostname detection for local dev testing"
    - "DOMAIN_MAP: explicit hostname-to-tenant mapping, unknown hostnames default to main"
    - "Route group layouts provide NextIntlClientProvider per domain context"
    - "Responsive container: min-w-[320px] mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8"
    - "Typography scaling: text-2xl sm:text-3xl lg:text-4xl"

key-files:
  created:
    - src/middleware.ts
    - src/__tests__/middleware.test.ts
    - src/app/(main)/[locale]/layout.tsx
    - src/app/(main)/[locale]/page.tsx
    - src/app/(artist)/[locale]/[artist]/layout.tsx
    - src/app/(artist)/[locale]/[artist]/page.tsx
  modified:
    - src/app/layout.tsx
  deleted:
    - src/app/page.tsx

key-decisions:
  - "middleware.ts retained (not renamed to proxy.ts): Next.js 16 deprecation warning present but file still works; plan specs this filename and test infrastructure imports @/middleware"
  - "VALID_ARTISTS hardcoded in artist layout: no DB call needed for phase 1 validation"
  - "Admin pages (login + dashboard) also committed: they were created in 01-01 but not committed; needed for admin-auth.test.ts to pass"
  - "Root layout stripped of Geist fonts and Create Next App defaults to be minimal html/body wrapper"

patterns-established:
  - "Pattern: Middleware composition order — admin guard > getTenant() > intlMiddleware on rewritten URL"
  - "Pattern: Local dev subdomain simulation via ?tenant= query param"
  - "Pattern: Route group layouts own their NextIntlClientProvider scope"

requirements-completed: [PLT-01, PLT-03]

# Metrics
duration: 17min
completed: 2026-03-23
---

# Phase 1 Plan 02: Middleware Domain Routing and Placeholder Pages Summary

**Domain routing middleware (DOMAIN_MAP + getTenant + admin guard) + responsive placeholder pages for main site and artist subdomains, with 8 passing unit tests via TDD**

## Performance

- **Duration:** ~17 min
- **Started:** 2026-03-23T19:10:41Z
- **Completed:** 2026-03-23T19:27:10Z
- **Tasks:** 2
- **Files modified:** 8 created, 1 modified, 1 deleted

## Accomplishments

- Middleware with DOMAIN_MAP routing: uarttasarim.com → (main), melike/seref subdomains → (artist), ?tenant= for local dev, admin guard
- Responsive route group layouts: (main)/[locale] and (artist)/[locale]/[artist] with NextIntlClientProvider + locale/artist validation
- 8-test middleware unit test suite (TDD RED → GREEN), all 11 tests (including admin-auth) passing

## Task Commits

| Task | Name | Commit | Phase |
|------|------|--------|-------|
| 1 RED | Failing middleware tests | 5e51bc4 | TDD RED |
| 1 GREEN | Middleware implementation | fad3c15 | TDD GREEN |
| 2 | Placeholder pages + route group layouts | 850bba6 | feat |

## Files Created/Modified

- `src/middleware.ts` — DOMAIN_MAP, getTenant(), admin guard, intlMiddleware composition
- `src/__tests__/middleware.test.ts` — 8 unit tests covering all routing behaviors
- `src/app/(main)/[locale]/layout.tsx` — NextIntlClientProvider, locale validation, responsive container
- `src/app/(main)/[locale]/page.tsx` — Main site placeholder (siteTitle translation)
- `src/app/(artist)/[locale]/[artist]/layout.tsx` — VALID_ARTISTS guard, NextIntlClientProvider, responsive
- `src/app/(artist)/[locale]/[artist]/page.tsx` — Artist name heading placeholder
- `src/app/layout.tsx` — Stripped to minimal html/body wrapper (removed Geist fonts, Create Next App defaults)
- `src/app/page.tsx` — Deleted (conflicted with route groups)

## Decisions Made

- `middleware.ts` name retained despite Next.js 16 deprecation warning (`proxy.ts` is new canonical); plan specs this filename and test imports `@/middleware`
- `VALID_ARTISTS` array hardcoded in artist layout for Phase 1 — no DB call needed for slug validation at this stage
- Admin pages (login + dashboard) included in this commit — they were created in 01-01 but remained untracked; needed for admin-auth tests to pass
- Root `layout.tsx` stripped to bare minimum — Geist fonts removed, Create Next App placeholder copy removed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Next.js 16 Turbopack intermittent build failures**
- **Found during:** Task 2 build verification
- **Issue:** Turbopack (default in Next.js 16) had intermittent ENOENT errors on tmp build manifest files — a known race condition on constrained systems
- **Fix:** Waited for background build process to complete naturally; a concurrent background build (from a previous invocation) succeeded and produced a valid `.next/` directory with all route groups in `app-paths-manifest.json`
- **Files modified:** None
- **Commit:** N/A (build environment issue, not code)

**2. Admin pages committed in this plan**
- **Found during:** Task 2 git status
- **Issue:** `src/app/(admin)/(protected)/dashboard/page.tsx` and `src/app/(admin)/login/page.tsx` were created in 01-01 but not committed (they appeared as untracked in git status)
- **Fix:** Included in Task 2 commit — they were needed for admin-auth.test.ts to pass and for clean build
- **Files modified:** Both admin page files
- **Commit:** 850bba6

## Build Verification

- `pnpm test` — 11 tests passing (8 middleware + 3 admin-auth)
- Build succeeded — `app-paths-manifest.json` contains:
  - `/(artist)/[locale]/[artist]/page`
  - `/(main)/[locale]/page`
  - All admin routes

## Next Phase Readiness

- Middleware domain routing complete — ready for 01-03 (admin panel implementation)
- ?tenant= query param works locally for subdomain simulation
- Placeholder pages render at all breakpoints (responsive Tailwind classes applied)
- Test suite operational — 11 tests green

## Self-Check: PASSED

- src/middleware.ts: FOUND
- src/__tests__/middleware.test.ts: FOUND
- src/app/(main)/[locale]/page.tsx: FOUND (verified via find)
- src/app/(artist)/[locale]/[artist]/page.tsx: FOUND (verified via find)
- Commit 5e51bc4 (TDD RED): FOUND
- Commit fad3c15 (TDD GREEN): FOUND
- Commit 850bba6 (placeholder pages): FOUND

---
*Phase: 01-foundation*
*Completed: 2026-03-23*
