---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x (Wave 0 installs) |
| **Config file** | `jest.config.ts` — Wave 0 creates |
| **Quick run command** | `pnpm test -- middleware.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- middleware.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | PLT-01 | unit | `pnpm test -- middleware.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | PLT-01 | unit | `pnpm test -- middleware.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | PLT-01 | unit | `pnpm test -- middleware.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | PLT-03 | manual | Manual browser test at 320px | N/A | ⬜ pending |
| 01-02-02 | 02 | 1 | PLT-03 | manual | Manual browser test at 1440px | N/A | ⬜ pending |
| 01-03-01 | 03 | 1 | ADM-04 | integration | `pnpm test -- admin-auth.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 1 | ADM-04 | unit | `pnpm test -- admin-layout.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 1 | N/A | smoke | `pnpm drizzle-kit migrate` | N/A | ⬜ pending |
| 01-04-02 | 04 | 1 | N/A | smoke | Manual upload + visual check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.ts` + `jest.setup.ts` — test framework configuration
- [ ] `pnpm add -D jest @types/jest jest-environment-node ts-jest` — framework install
- [ ] `src/__tests__/middleware.test.ts` — stubs for PLT-01 domain routing and admin redirect
- [ ] `src/__tests__/admin-auth.test.ts` — stubs for ADM-04 server-side session check

*Framework must be installed before any plan execution.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 320px viewport renders without horizontal scroll | PLT-03 | Visual layout check requires browser | Open dev tools, set viewport to 320px, verify no horizontal scrollbar |
| 1440px viewport renders without layout breaks | PLT-03 | Visual layout check requires browser | Open dev tools, set viewport to 1440px, verify layout integrity |
| Vercel Blob upload renders in next/image | N/A | Requires Vercel preview deployment | Upload test image via admin, verify it displays on page |
| Subdomain routing on Vercel preview | PLT-01 | Requires actual Vercel deployment with domain config | Deploy to preview, test all 3 domains route correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
