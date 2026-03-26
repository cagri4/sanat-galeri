---
phase: 5
slug: admin-paneli
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + ts-jest (installed in Phase 1) |
| **Config file** | `jest.config.ts` (root) |
| **Quick run command** | `pnpm test -- --testPathPattern "admin-"` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --testPathPattern "admin-"`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ADM-01 | unit | `pnpm test -- --testPathPattern=admin-product` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | ADM-02 | unit | `pnpm test -- --testPathPattern=admin-artist` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | ADM-03 | unit | `pnpm test -- --testPathPattern=admin-messages` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | ADM-01 | build | `pnpm build` | n/a | ⬜ pending |
| 05-03-01 | 03 | 2 | ADM-02, ADM-03 | build | `pnpm build` | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/admin-product.test.ts` — covers ADM-01 (create, update, delete product)
- [ ] `src/__tests__/admin-artist.test.ts` — covers ADM-02 (update bio, create/delete exhibition)
- [ ] `src/__tests__/admin-messages.test.ts` — covers ADM-03 (list messages, mark read, parse context)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Product image upload via Vercel Blob | ADM-01 | Requires live Blob token | Upload image in product form, verify it appears in gallery |
| Gallery reflects changes after CRUD | ADM-01 | Full-stack visual check | Create/edit product in admin, visit gallery, verify changes |
| CV changes reflect on subdomain | ADM-02 | Full-stack visual check | Edit bio in admin, visit artist subdomain, verify update |
| Message read state persists | ADM-03 | Requires live DB | Mark message read, refresh, verify still marked |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
