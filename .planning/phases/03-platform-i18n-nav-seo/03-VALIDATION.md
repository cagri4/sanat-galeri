---
phase: 3
slug: platform-i18n-nav-seo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + ts-jest (installed in Phase 1) |
| **Config file** | `jest.config.ts` (root) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | PLT-02 | unit | `pnpm test -- --testPathPattern=i18n-keys` | created in task | ⬜ pending |
| 03-01-02 | 01 | 1 | PLT-02 | build | `pnpm build` | n/a | ⬜ pending |
| 03-02-01 | 02 | 2 | PLT-04 | build | `pnpm build` | n/a | ⬜ pending |
| 03-02-02 | 02 | 2 | PLT-05 | unit+build | `pnpm test && pnpm build` | created in task | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/i18n-keys.test.ts` — verifies TR and EN JSON have identical key structures (created in 03-01 Task 1)
- [ ] `src/__tests__/language-switcher.test.ts` — contract test for locale link generation (created in 03-02 Task 2)
- [ ] `src/__tests__/navbar.test.ts` — contract test for cross-domain link rendering (created in 03-02 Task 2)
- [ ] `src/__tests__/gallery-metadata.test.ts` — contract test for locale-aware generateMetadata (created in 03-02 Task 2)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Language switcher toggles /tr/ ↔ /en/ in browser | PLT-02 | Browser navigation + cookie persistence | Click language switcher, verify URL changes and content updates |
| Cross-domain nav links work between domains | PLT-04 | Requires Vercel deployment with subdomains | Click artist link in navbar, verify navigation to correct subdomain |
| SEO meta tags render correctly in page source | PLT-05 | Requires checking HTML source | View page source, verify unique title/description per page |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
