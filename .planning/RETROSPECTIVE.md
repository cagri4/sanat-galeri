# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-26
**Phases:** 5 | **Plans:** 14 | **Commits:** 72

### What Was Built
- Multi-domain art gallery platform (3 domains from single Next.js codebase)
- Category-filtered artwork vitrine with lightbox zoom and WhatsApp CTA
- Professional artist CV subdomains (bio, portfolio, exhibitions, awards, education, press)
- Full bilingual support (TR/EN) with language switcher and cross-domain navigation
- Admin panel: artwork CRUD with Vercel Blob image upload, CV editor, message inbox
- 97 automated tests across 14 test files

### What Worked
- Wave-based parallel execution significantly reduced total time (Wave 2 plans ran concurrently in every phase)
- Research phase caught critical issues early: CVE-2025-29927, missing schema columns, i18n middleware composition pitfalls
- TDD approach for middleware routing and admin auth caught real bugs before UI was built
- Plan checker revision loop fixed structural issues (stale file paths, homepage double-modification) before execution
- DB-driven bilingual columns (`_tr`/`_en`) proved simpler than join tables for 2 languages

### What Was Inefficient
- Schema was incomplete in Phase 1 — required migrations in Phase 2 (new product columns) and Phase 4 (artist statement, press_items table). Schema should be more thoroughly scoped upfront
- `parseProductContext` had to be extracted from Server Action to separate utils file due to client/server boundary — could have been caught in planning
- Some Wave 0 test stubs were missing from initial plans, requiring revision loops (Phases 2 and 3)

### Patterns Established
- Server Actions with `auth()` guard as first line for all admin mutations
- Contract testing pattern: mock `@/lib/db` and `@/auth`, test logic directly
- Conditional CV sections: `return null` for empty data (not CSS hiding)
- Cross-domain links via `NEXT_PUBLIC_*` env vars (not Link component)
- `?tenant=` query param for local dev subdomain simulation

### Key Lessons
1. Schema design should include ALL fields from ALL phases at Phase 1, not just the current phase's needs
2. Wave 0 test files must be explicitly assigned to a plan task — implicit "will be created" is insufficient for verification
3. Homepage and shared layout modifications should be in one plan only to avoid conflicting approaches across waves
4. The plan checker revision loop (max 3 iterations) is essential — every phase had at least 1 issue caught

### Cost Observations
- Model mix: orchestrator on Opus, agents on Sonnet — good quality/cost balance
- Research agents ran in parallel (4 at project init) — worthwhile for catching domain pitfalls
- Plan checker caught 100% of structural issues before execution — zero runtime failures from plan defects
