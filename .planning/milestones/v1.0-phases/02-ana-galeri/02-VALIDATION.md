---
phase: 2
slug: ana-galeri
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x + ts-jest (installed in Phase 1) |
| **Config file** | `jest.config.ts` (root) |
| **Quick run command** | `pnpm test -- --testPathPatterns=gallery` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --testPathPatterns=gallery`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | GAL-01 | unit | `pnpm test -- --testPathPatterns=gallery-queries` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | GAL-01 | unit | `pnpm test -- --testPathPatterns=category-filter` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | GAL-02 | unit | `pnpm test -- --testPathPatterns=artwork-detail` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | GAL-03 | unit | `pnpm test -- --testPathPatterns=lightbox-viewer` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | GAL-03 | manual | Manual lightbox open/close test | N/A | ⬜ pending |
| 02-03-01 | 03 | 2 | GAL-04 | unit | `pnpm test -- --testPathPatterns=whatsapp` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | GAL-05 | unit | `pnpm test -- --testPathPatterns=contact-action` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Schema migration: add `year`, `mediumTr`, `mediumEn`, `dimensionsTr`, `dimensionsEn` to `products` table
- [ ] Schema addition: `productsRelations` and `productImagesRelations` in `schema.ts`
- [ ] Seed script: `src/lib/db/seed.ts` with artist + product data
- [ ] `src/__tests__/gallery-queries.test.ts` — stubs for GAL-01 filter logic
- [ ] `src/__tests__/category-filter.test.ts` — stubs for GAL-01 UI
- [ ] `src/__tests__/artwork-detail.test.ts` — stubs for GAL-02 metadata
- [ ] `src/__tests__/lightbox-viewer.test.ts` — stubs for GAL-03 slide data
- [ ] `src/__tests__/whatsapp.test.ts` — stubs for GAL-04 href builder
- [ ] `src/__tests__/contact-action.test.ts` — stubs for GAL-05 Server Action

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lightbox opens on thumbnail click | GAL-03 | Touch/click interaction in browser | Click artwork image, verify lightbox opens with zoom |
| Lightbox pinch-zoom works on mobile | GAL-03 | Touch gesture requires real device | Test on mobile device or Chrome DevTools touch simulation |
| WhatsApp link opens correct app/page | GAL-04 | External app redirect | Click WhatsApp button, verify pre-filled message in WhatsApp |
| Contact form shows success feedback | GAL-05 | Visual UI feedback | Submit form, verify success toast/message appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
