---
phase: 4
slug: sanatci-cv-subdomainleri
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + ts-jest (installed in Phase 1) |
| **Config file** | `jest.config.ts` (root) |
| **Quick run command** | `pnpm test -- --testPathPattern="artist"` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --testPathPattern="artist"`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | CV-01–06 | unit | `pnpm test -- --testPathPattern=artist-queries` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | CV-07, CV-08 | unit | `pnpm test -- --testPathPattern=artist-contact` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | CV-01, CV-06 | build | `pnpm build` | n/a | ⬜ pending |
| 04-02-02 | 02 | 2 | CV-02 | build | `pnpm build` | n/a | ⬜ pending |
| 04-03-01 | 03 | 2 | CV-03–05, CV-07 | build | `pnpm build` | n/a | ⬜ pending |
| 04-03-02 | 03 | 2 | CV-08 | build | `pnpm build` | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Schema migration: add `statementTr`, `statementEn` to `artists`; create `press_items` table; expand exhibitions type
- [ ] Drizzle relations for `portfolioItems`, `exhibitions`, `pressItems` on artists
- [ ] Seed data: exhibitions, portfolio items, press items for both artists
- [ ] `src/__tests__/artist-queries.test.ts` — covers CV-01 through CV-06
- [ ] `src/__tests__/artist-contact.test.ts` — covers CV-07, CV-08

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Subdomain opens with correct artist content | CV-01 | Requires Vercel deployment with subdomain | Visit melike.uarttasarim.com, verify bio/photo |
| Lightbox opens on portfolio image click | CV-02 | Browser interaction | Click portfolio image, verify lightbox opens |
| Press section hidden when no items | CV-07 | Visual check | View artist with no press items, verify section absent |
| Contact form submits with correct artist assignment | CV-08 | Requires live DB | Submit form, check DB message has correct artistId |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
