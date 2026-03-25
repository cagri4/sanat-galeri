---
phase: 03-platform-i18n-nav-seo
plan: 01
subsystem: ui
tags: [next-intl, i18n, translations, typescript]

# Dependency graph
requires:
  - phase: 02-ana-galeri
    provides: Gallery components (ArtworkCard, ArtworkGrid, CategoryFilter, ContactForm, WhatsAppButton) and artwork detail page built in Phase 2
provides:
  - Complete tr.json and en.json with nav, gallery, contact, meta namespaces
  - Key parity test (i18n-keys.test.ts) ensuring both locales always match
  - All gallery components using t() / getTranslations() pattern
  - Zero inline locale ternaries for UI labels in gallery components and pages
affects: [03-02, 03-03, all plans that add UI strings — must add keys to both JSON files]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Components use getTranslations({ locale, namespace }) from next-intl/server"
    - "Client Components use useTranslations(namespace) from next-intl"
    - "DB-driven data (titleTr/En, altTr/En, etc.) remains as locale ternaries — not translation keys"
    - "async Server Components for getTranslations — artwork-card and artwork-grid made async"

key-files:
  created:
    - src/__tests__/i18n-keys.test.ts
  modified:
    - src/messages/tr.json
    - src/messages/en.json
    - src/app/(main)/[locale]/galeri/page.tsx
    - src/app/(main)/[locale]/urun/[slug]/page.tsx
    - src/components/gallery/artwork-card.tsx
    - src/components/gallery/artwork-grid.tsx
    - src/components/gallery/category-filter.tsx
    - src/components/gallery/contact-form.tsx
    - src/components/gallery/whatsapp-button.tsx

key-decisions:
  - "Key parity test uses recursive dot-notation key extraction — catches missing key bugs that would silently render raw key strings"
  - "artwork-card.tsx and artwork-grid.tsx made async Server Components to support getTranslations — no architectural concern since they were already server-side"
  - "WhatsAppButton gained locale prop for getTranslations — call site in slug/page.tsx updated to pass locale={locale}"
  - "Build DB connection error (placeholder DATABASE_URL in .env.local) is pre-existing infrastructure issue, not a code problem — TypeScript check (tsc --noEmit) passes with zero errors"

patterns-established:
  - "All new UI strings must be added to BOTH tr.json and en.json simultaneously — parity test will catch omissions"
  - "Server Components rendering locale-specific UI labels use getTranslations({ locale, namespace }) pattern"
  - "Client Components with locale-specific UI use useTranslations(namespace) — no locale prop needed"

requirements-completed: [PLT-02]

# Metrics
duration: 20min
completed: 2026-03-25
---

# Phase 3 Plan 01: i18n Translation JSON Expansion and Component Conversion Summary

**Expanded tr.json and en.json with all gallery namespaces, replaced every inline locale ternary in gallery components with next-intl t() calls, and added a recursive key parity test to guard both files forever.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-25T03:13:00Z
- **Completed:** 2026-03-25T03:33:41Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Both message files now have identical 22-key structures across common, nav, gallery, contact, and meta namespaces
- Key parity test catches silent "missing key renders raw key string" bugs at commit time
- All 7 gallery components and pages converted from inline ternaries to proper t()/getTranslations() calls
- TypeScript check (tsc --noEmit) passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand translation JSON files and create key parity test** - `0343081` (feat)
2. **Task 2: Replace all inline locale ternaries with translation calls** - `0441532` (feat)

## Files Created/Modified
- `src/messages/tr.json` - Expanded with nav, gallery, contact, meta namespaces (22 leaf keys)
- `src/messages/en.json` - Identical structure with English values
- `src/__tests__/i18n-keys.test.ts` - Recursive key parity test between both JSON files
- `src/app/(main)/[locale]/galeri/page.tsx` - Replaced inline ternary with t('title') via getTranslations
- `src/app/(main)/[locale]/urun/[slug]/page.tsx` - Replaced 8 UI label ternaries, added locale to WhatsAppButton
- `src/components/gallery/artwork-card.tsx` - Made async, sold badge uses t('sold')
- `src/components/gallery/artwork-grid.tsx` - Made async, empty state uses t('emptyState')
- `src/components/gallery/category-filter.tsx` - Filter All button uses useTranslations t('filterAll')
- `src/components/gallery/contact-form.tsx` - All labels, placeholders, messages use useTranslations
- `src/components/gallery/whatsapp-button.tsx` - Added locale prop, CTA uses t('whatsappCta')

## Decisions Made
- artwork-card and artwork-grid made async Server Components to support getTranslations — correct pattern for next-intl in Server Components
- WhatsAppButton received locale prop rather than accepting pre-translated text prop — consistent with other server components
- DB data ternaries (titleTr/En, altTr/En, mediumTr/En, dimensionsTr/En) intentionally preserved as locale ternaries — these are data, not translation keys

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build's page data collection fails due to placeholder DATABASE_URL in local .env.local — pre-existing infrastructure issue unrelated to this plan's changes. TypeScript compilation (tsc --noEmit) and i18n-keys test both pass cleanly.

## Next Phase Readiness
- Translation infrastructure complete — Plan 03-02 can add nav component and homepage server component conversion
- Any future plan adding UI strings must update both tr.json and en.json; parity test will catch omissions
- Homepage (src/app/(main)/[locale]/page.tsx) intentionally left untouched per plan spec — addressed in Plan 03-02

---
*Phase: 03-platform-i18n-nav-seo*
*Completed: 2026-03-25*
