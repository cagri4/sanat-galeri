---
phase: 03-platform-i18n-nav-seo
plan: 02
subsystem: ui
tags: [next-intl, navbar, i18n, seo, metadata, typescript, jest]

# Dependency graph
requires:
  - phase: 03-platform-i18n-nav-seo
    plan: 01
    provides: tr.json/en.json with nav and meta namespaces; getTranslations pattern in Server Components
provides:
  - LanguageSwitcher client component with getLanguageLinks helper (TR/EN toggle preserving pathname)
  - Navbar server component with getCrossDomainLinks helper (cross-domain links with locale segment)
  - src/lib/i18n/navigation.ts via createNavigation (usePathname, Link, useRouter hooks)
  - Navbar injected into both (main) and (artist) layouts
  - Locale-aware generateMetadata on homepage, gallery page, and artist page
  - Artist page bug fixed: useTranslations replaced with getTranslations in async Server Component
  - Contract tests for language-switcher, navbar cross-domain links, and gallery generateMetadata
affects: [03-03, all plans that add navigation items or new page-level SEO metadata]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "createNavigation from next-intl/navigation wraps routing to provide usePathname/Link/useRouter hooks"
    - "Pure helper functions (getLanguageLinks, getCrossDomainLinks) exported from components for unit testing without DOM"
    - "jest.mock used to stub next-intl, next-intl/server, and local component imports before importing modules with framework side-effects"
    - "Cross-domain navbar links use absolute URLs from NEXT_PUBLIC_*_URL env vars with locale segment appended"

key-files:
  created:
    - src/components/shared/language-switcher.tsx
    - src/components/shared/navbar.tsx
    - src/lib/i18n/navigation.ts
    - src/__tests__/language-switcher.test.ts
    - src/__tests__/navbar.test.ts
    - src/__tests__/gallery-metadata.test.ts
  modified:
    - src/app/(main)/[locale]/layout.tsx
    - src/app/(artist)/[locale]/[artist]/layout.tsx
    - src/app/(main)/[locale]/page.tsx
    - src/app/(main)/[locale]/galeri/page.tsx
    - src/app/(artist)/[locale]/[artist]/page.tsx

key-decisions:
  - "usePathname from next-intl/navigation does not exist in next-intl 4.x — must use createNavigation(routing) from next-intl/navigation to get locale-aware usePathname and Link"
  - "Pure helper functions (getLanguageLinks, getCrossDomainLinks) exported alongside components to enable unit testing without framework/DOM dependencies"
  - "Jest tests mock next-intl, next-intl/server, and @/lib/i18n/navigation before importing component modules to avoid ESM parse errors from node_modules"
  - "Homepage converted from Client Component (useTranslations) to Server Component (getTranslations) to enable generateMetadata export in same file"
  - "Artist page had useTranslations (client hook) in async Server Component — pre-existing bug fixed by converting to getTranslations"

patterns-established:
  - "All new pages must export generateMetadata using getTranslations with meta namespace"
  - "Navbar is a Server Component receiving locale prop — no client state needed"
  - "Cross-domain links always append /${locale} to base URL from env var"
  - "Contract tests for components with framework imports use jest.mock at top of test file before any imports"

requirements-completed: [PLT-04, PLT-05]

# Metrics
duration: 9min
completed: 2026-03-25
---

# Phase 3 Plan 02: LanguageSwitcher, Navbar, and Locale-Aware SEO Metadata Summary

**Shared Navbar with cross-domain links and TR/EN language switcher injected into both layout trees, plus locale-aware generateMetadata on all pages via next-intl getTranslations**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-03-25T03:36:08Z
- **Completed:** 2026-03-25T03:44:40Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Created LanguageSwitcher (client) and Navbar (server) shared components; Navbar rendered before children in both (main) and (artist) layouts
- Added locale-aware generateMetadata to homepage, gallery page, and artist placeholder page using meta namespace translation keys
- Fixed pre-existing bug: artist page was using useTranslations (client hook) in an async Server Component — replaced with getTranslations
- Created src/lib/i18n/navigation.ts using createNavigation(routing) as the correct next-intl 4.x API for locale-aware usePathname/Link
- 61 contract tests passing (10 new tests in 3 new test files)

## Task Commits

1. **Task 1: Create LanguageSwitcher, Navbar, and inject into both layouts** - `8ba8b09` (feat)
2. **Task 2: Add locale-aware SEO metadata to all pages and create contract tests** - `89ab91d` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `src/components/shared/language-switcher.tsx` - Client component with TR/EN toggle; exports getLanguageLinks helper
- `src/components/shared/navbar.tsx` - Server component with cross-domain links; exports getCrossDomainLinks helper
- `src/lib/i18n/navigation.ts` - createNavigation wrapper providing usePathname, Link, useRouter
- `src/app/(main)/[locale]/layout.tsx` - Added Navbar before children
- `src/app/(artist)/[locale]/[artist]/layout.tsx` - Added Navbar before children
- `src/app/(main)/[locale]/page.tsx` - Converted to Server Component, added generateMetadata
- `src/app/(main)/[locale]/galeri/page.tsx` - Replaced hardcoded generateMetadata with locale-aware async version
- `src/app/(artist)/[locale]/[artist]/page.tsx` - Fixed useTranslations bug, added generateMetadata
- `src/__tests__/language-switcher.test.ts` - 4 contract tests for getLanguageLinks
- `src/__tests__/navbar.test.ts` - 3 contract tests for getCrossDomainLinks
- `src/__tests__/gallery-metadata.test.ts` - 3 contract tests for generateMetadata with mocked getTranslations

## Decisions Made

- **createNavigation instead of direct usePathname import:** next-intl 4.x does not export usePathname directly from `next-intl/navigation`. The correct API is `createNavigation(routing)` which returns locale-aware Link, usePathname, useRouter, and redirect. Created `src/lib/i18n/navigation.ts` as the single place to import these from.
- **Pure helpers exported for testability:** getLanguageLinks and getCrossDomainLinks are pure functions with no framework dependencies, exported alongside the components. This allows unit testing the business logic without mounting React components.
- **Homepage converted to Server Component:** The homepage previously used `useTranslations` which requires 'use client'. Adding `generateMetadata` (server-only) to the same file required converting to an async Server Component using `getTranslations`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created src/lib/i18n/navigation.ts for createNavigation pattern**
- **Found during:** Task 1 (LanguageSwitcher component creation)
- **Issue:** Plan specified `import { usePathname } from 'next-intl/navigation'` but next-intl 4.x does not export usePathname directly — build error: "Export usePathname doesn't exist in target module"
- **Fix:** Created `src/lib/i18n/navigation.ts` using `createNavigation(routing)` pattern, updated language-switcher.tsx to import from `@/lib/i18n/navigation`
- **Files modified:** src/lib/i18n/navigation.ts (created), src/components/shared/language-switcher.tsx
- **Verification:** Build TypeScript compilation succeeded
- **Committed in:** 8ba8b09

**2. [Rule 1 - Bug] Fixed artist page useTranslations in async Server Component**
- **Found during:** Task 2 (artist page generateMetadata)
- **Issue:** Plan correctly noted this was a pre-existing bug — `useTranslations` (client hook) was being called in an `async function` Server Component. This would cause runtime errors.
- **Fix:** Replaced `import { useTranslations } from 'next-intl'` with `import { getTranslations } from 'next-intl/server'`, added locale to params type, used `await getTranslations({ locale, namespace: 'common' })`
- **Files modified:** src/app/(artist)/[locale]/[artist]/page.tsx
- **Verification:** TypeScript compiles, all tests pass
- **Committed in:** 89ab91d

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes were anticipated in the plan spec. The navigation.ts file is a natural addition to the i18n infrastructure. The artist page bug fix was explicitly called out in the plan action.

## Issues Encountered

- Jest tests for components importing next-intl packages failed with "Unexpected token 'export'" due to ESM-only distribution. Fixed by adding `jest.mock('next-intl/server', ...)`, `jest.mock('next-intl', ...)`, and `jest.mock('@/lib/i18n/navigation', ...)` at the top of each test file before any imports.

## Next Phase Readiness

- Navbar and LanguageSwitcher are ready for use in Plan 03 (artist subdomain pages)
- All pages have locale-aware SEO metadata
- The createNavigation pattern in `src/lib/i18n/navigation.ts` is established for all future client components needing locale-aware routing

## Self-Check: PASSED

All key files exist and both task commits (8ba8b09, 89ab91d) are verified in git history.

---
*Phase: 03-platform-i18n-nav-seo*
*Completed: 2026-03-25*
