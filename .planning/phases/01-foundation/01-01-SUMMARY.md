---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [nextjs, drizzle, neon-postgres, vercel-blob, next-intl, next-auth, jest, typescript, tailwind]

# Dependency graph
requires: []
provides:
  - Next.js 16 project scaffold with TypeScript, Tailwind CSS, App Router
  - Drizzle schema with 6 tables: artists, products, productImages, portfolioItems, exhibitions, messages
  - Drizzle DB client (pooled Neon connection) and drizzle.config.ts (direct connection)
  - Initial migration SQL in drizzle/ directory
  - next-intl routing config with TR (default) + EN locales
  - next-auth v5 credentials provider for admin auth
  - Vercel Blob upload route stub with auth check
  - Jest test framework with ts-jest and @/* path alias
affects: [01-02, 01-03, 02-main-gallery, 03-i18n, 04-cv-subdomains, 05-admin]

# Tech tracking
tech-stack:
  added:
    - next@16.2.1
    - drizzle-orm@0.45.1
    - drizzle-kit@0.31.10
    - "@neondatabase/serverless@1.0.2"
    - "@vercel/blob@2.3.1"
    - next-intl@4.8.3
    - next-auth@5.0.0-beta.30
    - zod@4.3.6
    - jest@30.3.0
    - ts-jest@29.4.6
  patterns:
    - "Two DB URLs: DATABASE_URL (pooled, port 6543) for app; DATABASE_URL_DIRECT (direct, port 5432) for migrations"
    - "next-intl plugin wraps nextConfig in next.config.ts via withNextIntl()"
    - "Vercel Blob remotePatterns omits 'search' key to allow query params"
    - "next-auth v5 credentials provider compares env vars — no user table for single admin"

key-files:
  created:
    - src/lib/db/schema.ts
    - src/lib/db/index.ts
    - drizzle.config.ts
    - drizzle/0000_known_sunset_bain.sql
    - src/lib/i18n/routing.ts
    - src/lib/i18n/request.ts
    - src/messages/tr.json
    - src/messages/en.json
    - src/auth.ts
    - src/app/api/auth/[...nextauth]/route.ts
    - src/app/api/upload/route.ts
    - src/lib/blob.ts
    - jest.config.ts
    - jest.setup.ts
    - next.config.ts
    - .env.example
  modified:
    - package.json

key-decisions:
  - "Scaffolded in /tmp then rsync to project root (create-next-app refuses non-empty directories)"
  - "API routes staged with src/app/ in Task 1 commit — already present before Task 3 committed remaining i18n/auth files"
  - "drizzle.config.ts uses DATABASE_URL_DIRECT to avoid PgBouncer prepared statement errors during migrations"
  - "next.config.ts omits search key in remotePatterns to allow Vercel Blob URLs with query params"

patterns-established:
  - "Pattern: Two-connection DB strategy — pooled for queries, direct for migrations"
  - "Pattern: next-intl plugin composition in next.config.ts wraps nextConfig"
  - "Pattern: next-auth v5 env-var-based single-admin credentials (no user table)"

requirements-completed: [PLT-01, PLT-03]

# Metrics
duration: 15min
completed: 2026-03-23
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Next.js 16 project with Drizzle/Neon schema (6 tables), next-auth v5 credentials provider, next-intl TR/EN routing, Vercel Blob stub, and Jest/ts-jest test framework**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-23T19:00:00Z
- **Completed:** 2026-03-23T19:07:34Z
- **Tasks:** 3
- **Files modified:** 20+

## Accomplishments

- Next.js 16.2.1 project with TypeScript, Tailwind 4, App Router, and all Phase 1 dependencies installed
- Complete Drizzle schema with 6 tables (artists, products, productImages, portfolioItems, exhibitions, messages) with TR/EN field pairs, initial migration SQL generated
- next-intl i18n routing config (TR default + EN), next-auth v5 credentials provider, Vercel Blob upload stub with auth check, and Jest/ts-jest framework all configured

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project and install all Phase 1 dependencies** - `8614662` (feat)
2. **Task 2: Create Drizzle schema, DB client, and drizzle config** - `706a114` (feat)
3. **Task 3: Configure i18n routing, auth, Blob stub, and test framework** - `1042d45` (feat)

## Files Created/Modified

- `src/lib/db/schema.ts` - 6 Drizzle table definitions with TR/EN bilingual fields
- `src/lib/db/index.ts` - Drizzle client with pooled Neon connection
- `drizzle.config.ts` - Migration config using DATABASE_URL_DIRECT (port 5432)
- `drizzle/0000_known_sunset_bain.sql` - Initial migration SQL generated from schema
- `src/lib/i18n/routing.ts` - next-intl defineRouting with TR default + EN
- `src/lib/i18n/request.ts` - Server-side locale resolution config
- `src/messages/tr.json` - Turkish translations (minimal seed)
- `src/messages/en.json` - English translations (minimal seed)
- `src/auth.ts` - next-auth v5 credentials provider (env-var based, no user table)
- `src/app/api/auth/[...nextauth]/route.ts` - next-auth route handler
- `src/app/api/upload/route.ts` - Vercel Blob client-upload stub with session check
- `src/lib/blob.ts` - Re-export stub for @vercel/blob put/del/list
- `jest.config.ts` - ts-jest preset, node environment, @/* path alias
- `jest.setup.ts` - Empty placeholder
- `next.config.ts` - Vercel Blob remotePatterns + withNextIntl plugin wrapper
- `.env.example` - All required env var names (no values)
- `package.json` - Added "test": "jest" script, renamed to sanat-galeri

## Decisions Made

- Scaffolded Next.js in /tmp and rsync'd to project root since create-next-app refuses dirs with existing files (.planning/ conflict)
- drizzle.config.ts uses DATABASE_URL_DIRECT (port 5432) to avoid PgBouncer prepared-statement errors during migrations; app uses DATABASE_URL (port 6543)
- next.config.ts omits the `search` key in remotePatterns — including it (even empty) blocks Vercel Blob URLs that contain query parameters
- next-auth v5 credentials compare against ADMIN_USERNAME/ADMIN_PASSWORD env vars; no database user table needed for single-admin scenario

## Deviations from Plan

None - plan executed exactly as written. The scaffolding in /tmp was a minor procedural adaptation (not architectural) due to create-next-app refusing non-empty directories — the output is identical to what the plan specified.

## Issues Encountered

- `pnpm create next-app` refused to scaffold in the project root because `.planning/` directory existed. Resolved by scaffolding in `/tmp/nextapp-scaffold` and using `rsync --exclude=.git` to move files.
- `pnpm build` failed initially because `next.config.ts` referenced `./src/lib/i18n/request.ts` which didn't exist yet. Resolved by creating all Task 3 files before running the final build verification.

## User Setup Required

Before running `pnpm dev` with real functionality, fill in `.env.local` with:

- `DATABASE_URL` — Neon pooled connection string (port 6543)
- `DATABASE_URL_DIRECT` — Neon direct connection string (port 5432) — required for `pnpm drizzle-kit migrate`
- `AUTH_SECRET` — Generate with: `openssl rand -base64 32`
- `ADMIN_USERNAME` — Choose admin username
- `ADMIN_PASSWORD` — Choose strong admin password (min 8 chars)
- `BLOB_READ_WRITE_TOKEN` — From Vercel Dashboard -> Storage -> Blob Store

## Next Phase Readiness

- Project scaffold complete — ready for 01-02 (middleware domain routing and placeholder pages)
- Drizzle schema defined — 01-03 (admin auth) and Phase 2 (gallery) can reference schema types
- Test framework operational — middleware unit tests can be written in 01-02

---
*Phase: 01-foundation*
*Completed: 2026-03-23*
