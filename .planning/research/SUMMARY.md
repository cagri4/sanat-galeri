# Project Research Summary

**Project:** U-Art Tasarim — Multi-Domain Art Gallery & Portfolio Platform
**Domain:** Multi-tenant art gallery / vitrine web platform (Next.js on Vercel)
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

U-Art Tasarim is a multi-domain art gallery and portfolio vitrine for two artists (Melike and Seref), served from a single Next.js codebase on Vercel with three public-facing domains: the main gallery (`uarttasarim.com`), and two artist CV subdomains (`melike.uarttasarim.com`, `seref.uarttasarim.com`). The production-proven pattern for this architecture is a single Next.js project with Edge middleware performing hostname-based URL rewrites to isolated route groups, backed by Neon Postgres and Vercel Blob for storage. All major technology choices have official Vercel documentation and are in active production use at scale; the stack is well-settled and carries HIGH confidence.

The recommended approach prioritizes correctness of the foundation before feature work. Multi-tenant middleware, i18n composition (next-intl), database connection strategy, and admin auth must all be correct from the first commit — these are the four areas where a wrong early decision requires a costly rewrite later. The project intentionally defers online payment and user accounts to v2+, focusing v1 on the vitrine model: artwork browsing with WhatsApp / email inquiry as the purchase path. This is the correct call for the Turkish art market and dramatically reduces v1 scope.

The primary risks are not architectural but implementation-detail risks: a public CVE (9.1) for middleware-only admin auth, a known Next.js bug with `remotePatterns` and Vercel Blob URLs, and a well-documented conflict when combining subdomain routing with next-intl middleware naively. All three are avoidable with specific patterns documented in PITFALLS.md. Vercel-hosted deployment means the CVE is patched at the platform level, but defense-in-depth (server-side session checks in every admin Server Component) is still mandatory.

---

## Key Findings

### Recommended Stack

The stack is Vercel-native end-to-end: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS v4, Neon Postgres via Drizzle ORM, Vercel Blob for image storage, next-intl 4.x for TR/EN i18n, next-auth v5 for admin auth, and shadcn/ui (admin-only). Every component is the current recommended choice as of 2026-03-22, replacing deprecated predecessors (Vercel Postgres → Neon, react-image-lightbox → yet-another-react-lightbox, next-i18next → next-intl, Prisma → Drizzle).

**Core technologies:**
- **Next.js 16 + React 19**: App Router, Server Components, Server Actions — Vercel-native, required for this architecture
- **Drizzle ORM + Neon Postgres**: 7.4 KB bundle, no cold-start penalty, edge-native — Prisma is explicitly ruled out due to 1-3s cold starts on Vercel serverless
- **Vercel Blob (@vercel/blob 2.3.1)**: Zero extra accounts, global CDN, client-upload pattern bypasses 4.5 MB serverless body limit — required for artwork image upload
- **next-intl 4.8.3**: First-class App Router + RSC support, 931K weekly downloads, domain-aware routing via `defineRouting({ domains })` — the unambiguous winner for this stack
- **next-auth v5 (beta.25)**: Credentials provider + JWT, production-proven despite beta tag — single-admin use case, no RBAC needed
- **yet-another-react-lightbox 3.29.1**: 205K weekly downloads, explicit `next/image` integration via custom render, React 19 compatible
- **shadcn/ui**: Admin-only — keeps the gallery aesthetic uncontaminated by component library design language

### Expected Features

The vitrine model (browse → inquire via WhatsApp/email → artist responds) is the correct v1 scope. All platform features are well-understood and have established implementation patterns.

**Must have (table stakes):**
- High-quality image display with lightbox (pinch-zoom on mobile) — non-negotiable for art browsing
- Artwork detail page: title, medium, dimensions, year, price, availability status — missing any field feels amateurish to collectors
- Gallery grid with category/medium filter — flat unfiltered list is unusable
- WhatsApp CTA + contact inquiry form on artwork pages — this is the purchase conversion point
- Artist CV subdomains: bio, photo, exhibition list, awards, portfolio gallery — professional credential pages
- TR / EN language support on all pages — international reach is a stated goal
- Admin panel: artwork CRUD with image upload, CV editing, message inbox
- Mobile-responsive layout — majority of art browsing is mobile
- Available / Sold status per artwork — functional necessity for vitrine model
- Multi-domain routing (3 domains from one codebase)

**Should have (competitive differentiators):**
- WhatsApp pre-fill with artwork context (title + URL) — reduces buyer friction
- Gallery-aesthetic design language (white space, large type, minimal chrome) — elevates perceived artwork value
- Sold works visible as archive with "Sold" badge — signals demand and portfolio depth
- schema.org VisualArtwork structured data — SEO rich results for art-intent searches
- Artwork process / technique notes (optional per piece) — collector engagement for ceramics/mixed-media
- Inquiry form pre-filled with artist + artwork context

**Defer (v2+):**
- Online payment / checkout — Turkish financial regulation + fulfillment complexity; validate demand via WhatsApp inquiry volume first
- User accounts / collector wishlist — GDPR complexity, session management overhead, < 500 MAU at launch
- Standalone custom domains per artist (DNS swap, not code change — infrastructure ready in v1)
- Email newsletter, print-on-demand

**Anti-features (never build):**
- Blog/news section (artists won't maintain it; empty blog hurts credibility)
- Social media auto-posting (Instagram API fragility, high maintenance)
- Real-time chat widget (page load penalty; WhatsApp already on artist's phone)

### Architecture Approach

The architecture is a single Next.js project with three route groups (`(main)`, `(artist)`, `(admin)`) separated by Edge middleware hostname detection. All three domains hit the same Vercel deployment; middleware reads the `host` header and rewrites to the correct internal route group without exposing the internal path in public URLs. This is the pattern Vercel explicitly documents and supports via the Platforms Starter Kit.

**Major components:**
1. **`middleware.ts` (Edge Runtime)** — domain detection, locale routing, admin auth guard; the critical single file that routes everything
2. **`(main)` route group** — main gallery: product grid, artwork detail, contact; Server Components with RSC data fetching
3. **`(artist)` route group** — CV/bio, portfolio, exhibitions, contact; `[artist]` slug drives data fetching for both Melike and Seref from one set of page files
4. **`(admin)` route group** — all CRUD forms, image upload pipeline, message inbox; Client Components + Server Actions
5. **`lib/db.ts`** — thin Drizzle query layer over Neon Postgres (pooled URL for app queries, direct URL for migrations only)
6. **`lib/blob.ts` + `/api/upload`** — Vercel Blob client-upload token exchange; bypasses serverless body size limit
7. **`messages/tr.json` + `messages/en.json`** — next-intl translation namespaces per route group
8. **`components/gallery/`** — artwork card, grid, lightbox; shared between main site and artist portfolio subdomains

**Database schema highlights:**
- `_tr` / `_en` column pairs on all user-facing text (simplest i18n at this scale, no join table)
- `products` and `portfolio_items` are separate tables — products carry price/sold status; portfolio items are curated personal works without commerce metadata
- Single `admin_sessions` table, no user table — single admin

### Critical Pitfalls

1. **Middleware-only admin auth (CVE-2025-29927, CVSS 9.1)** — Add `await getSession()` check in every admin Server Component and Route Handler in addition to middleware. Never rely on middleware redirect alone. Next.js 16+ on Vercel is patched, but defense-in-depth is mandatory.

2. **next-intl + subdomain routing middleware conflict** — Use the composition pattern: (1) extract tenant from `host` header, (2) rewrite path to internal route, (3) run next-intl locale detection on the rewritten path. Do NOT call `createMiddleware()` at the top level without tenant routing first. Failure mode: 404 "Unable to find next-intl locale" on all subdomain requests.

3. **`next/image` `remotePatterns` fails silently for Vercel Blob URLs** — Use `hostname: '*.public.blob.vercel-storage.com'` with no `search` key (omit to allow any query params). Use `remotePatterns` not the deprecated `images.domains` array. Validate with a real Blob URL in a preview deployment, not just local dev.

4. **Domain detection broken in local dev and Vercel preview** — Build environment-aware middleware from day one with a `?tenant=melike` query param fallback and `NEXT_PUBLIC_DEV_TENANT` env var. Verify on an actual Vercel preview with wildcard domain configured before declaring routing done.

5. **Database connection pool exhaustion on serverless** — Use the pooled connection string (port 6543) for all app queries. Use the direct connection string (port 5432) for `drizzle-kit migrate` only. Two separate connection configs required in `drizzle.config.ts` vs `lib/db.ts`.

---

## Implications for Roadmap

Based on the dependency chain identified in ARCHITECTURE.md and FEATURES.md, with pitfall prevention mapped to phases, the research strongly suggests this build order:

### Phase 1: Foundation — Middleware, Database, Auth

**Rationale:** Every feature depends on requests reaching the right route group, the database existing with the right schema, and admin routes being genuinely secure. These three concerns must be correct before any page work starts — mistakes here cascade into all subsequent phases.

**Delivers:** Working multi-domain routing for all 3 domains (including local dev simulation), Neon Postgres with Drizzle schema and migration pipeline, next-auth admin login with server-side session checks, basic project scaffold with Tailwind v4 and shared layout components.

**Addresses:** Multi-domain routing, admin authentication, database foundation

**Avoids:**
- CVE-2025-29927 (build double auth from the start)
- i18n + subdomain middleware conflict (compose correctly before adding next-intl)
- Connection pool exhaustion (split pooled/direct URLs from day one)
- Dev/preview domain detection gap (implement tenant simulation immediately)

**Research flag:** This phase needs careful verification. Middleware composition (domain routing + next-intl) is the highest-risk integration in the project. Recommend testing all three domain routes in a real Vercel preview deployment before proceeding.

---

### Phase 2: Data Layer + Image Storage

**Rationale:** The artwork data model must be finalized before any gallery pages are built — schema changes after pages are constructed cause cascading rewrites. Vercel Blob upload pipeline must be validated with real URLs before building gallery views that depend on those URLs.

**Delivers:** Complete Drizzle schema (artists, products, product_images, portfolio_items, exhibitions, messages), `lib/db.ts` query functions, Vercel Blob client-upload pipeline with auth-gated token handler, `next.config.ts` `remotePatterns` validated against real Blob URLs.

**Addresses:** Artwork data model foundation, image storage pipeline

**Avoids:**
- `next/image` Blob remotePatterns failure (validate in this phase before gallery is built)
- Oversized image uploads (set server-side file size limits before first admin test)
- Storing base64 images in DB (anti-pattern explicitly called out in ARCHITECTURE.md)

**Research flag:** Standard patterns — no additional research phase needed. Vercel Blob client-upload pattern is well-documented.

---

### Phase 3: Main Gallery (Public Site)

**Rationale:** Main gallery is the highest-visibility deliverable and the primary test of DB + image display integration. Building it after the data layer is ready means pages render real data from the first commit.

**Delivers:** Homepage / product showcase, gallery grid with category filter, artwork detail page (full metadata, lightbox, WhatsApp CTA, inquiry form), available/sold status badges, mobile-responsive layout, SEO basics (page titles, meta, alt text).

**Addresses:** Artwork grid + filter, artwork detail, image lightbox, WhatsApp CTA, mobile layout, availability status

**Avoids:**
- `priority` prop on all gallery images (use only for above-fold hero)
- Missing `width`/`height` on images (layout shift / CLS)
- No `blurDataURL` placeholder (flash of empty space)
- Gallery uniform thumbnail sizes (use masonry/varied-height grid)

**Research flag:** Standard patterns. yet-another-react-lightbox has explicit Next.js + `next/image` integration examples.

---

### Phase 4: i18n (TR / EN)

**Rationale:** ARCHITECTURE.md notes that i18n should be set up before page creation, but the PITFALLS.md warns against retrofitting — this phase does the retrofit pass on the pages already built. The research explicitly states i18n is "less risky as a final pass than interleaving with feature work" when using next-intl namespaces. Adding i18n after the main gallery and before artist pages means the artist pages can be built i18n-first from the start.

**Delivers:** next-intl fully wired across all `(main)` route group pages, `tr.json` and `en.json` translation files per namespace, language switcher component, `hreflang` tags, path-based locale prefix (`/tr/`, `/en/`) as canonical.

**Addresses:** TR/EN language support, SEO hreflang, language switcher

**Avoids:**
- `localePrefix: 'never'` (kills SEO indexability of both locales)
- Single flat translation file (namespace split per route group from the start)
- Language switcher shown on non-internationalized routes (detect programmatically)

**Research flag:** Standard patterns. next-intl 4.x App Router integration is well-documented.

---

### Phase 5: Artist CV Subdomains

**Rationale:** Artist pages depend on multi-domain routing (Phase 1), the database schema (Phase 2), shared gallery components (Phase 3), and i18n (Phase 4). Building them last in the public-facing sequence means all dependencies are in place and the `[artist]` slug pattern can be used cleanly.

**Delivers:** Artist bio/CV landing pages, portfolio gallery (reusing `components/gallery/`), exhibition / awards list, artist contact form routing to per-artist inbox, all content on both subdomains.

**Addresses:** Artist CV subdomains, exhibition history, portfolio gallery on subdomain, contact form per artist

**Avoids:**
- Building CV pages before routing is verified on Vercel preview (subdomains that only work on localhost)

**Research flag:** Standard patterns. Shares components built in Phase 3; main new concern is verifying subdomain routing end-to-end.

---

### Phase 6: Admin Panel

**Rationale:** Admin panel is the last major deliverable because it depends on every other piece being stable — the DB schema it manages must be finalized, the Blob upload pipeline must be working, and the auth layer must be correct. Building admin last avoids building CRUD forms for a schema that is still changing.

**Delivers:** Admin dashboard, artwork CRUD with image upload (Vercel Blob client-upload), artist CV editing (bio, exhibitions, awards), message inbox with read/unread state, admin login page.

**Addresses:** Admin artwork CRUD, admin CV editing, admin message inbox

**Avoids:**
- Admin UI built before auth is confirmed working (build auth first within this phase)
- `BLOB_READ_WRITE_TOKEN` exposed client-side (server-side token generation only)
- No file type validation on admin upload (validate MIME server-side)
- Admin login with no rate limiting (add Vercel Edge rate limiting on `/api/auth/*`)

**Research flag:** shadcn/ui + Server Actions admin patterns are well-documented. No additional research phase needed.

---

### Phase 7: Polish + SEO + Launch Prep

**Rationale:** schema.org structured data, Vercel Analytics, performance tuning (blur placeholders, caching strategy), and the "Looks Done But Isn't" checklist from PITFALLS.md all belong in a final validation pass before going live.

**Delivers:** schema.org VisualArtwork JSON-LD on artwork detail pages, Vercel Analytics integration, image caching strategy (`unstable_cache` on product queries), sold works archive/filter, artwork process notes field, final mobile QA pass, full i18n key audit (no missing keys in either locale).

**Addresses:** SEO structured data, analytics, sold works archive, artwork process notes

**Research flag:** Standard patterns. Google's structured data documentation covers VisualArtwork.

---

### Phase Ordering Rationale

- **Phases 1-2 are non-negotiable prerequisites.** The middleware composition and DB schema are load-bearing for everything else. Wrong choices here require rewrites across all subsequent phases.
- **i18n retrofitting (Phase 4) is intentionally deferred from Phase 1.** ARCHITECTURE.md recommends it in Phase 1 ideally, but PITFALLS.md warns that the middleware composition risk is high enough to warrant verifying domain routing is correct first, then layering in next-intl. The composition pattern is simpler to debug in isolation.
- **Admin last** prevents building CRUD forms for a changing schema and ensures auth is validated before the panel is useful.
- **Artist pages after main gallery** because they share gallery components and benefit from those being tested first.

### Research Flags

Phases likely needing `/gsd:research-phase` depth during planning:
- **Phase 1 (Foundation):** Middleware composition (domain routing + next-intl) is the highest-risk integration. The composition pattern is documented but has multiple failure modes. Recommend verifying against next-intl `app-router-tenants` example code before starting implementation.

Phases with standard, well-documented patterns (skip additional research):
- **Phase 2 (Data Layer):** Drizzle + Neon setup is extensively documented
- **Phase 3 (Main Gallery):** yet-another-react-lightbox Next.js integration has a dedicated example page
- **Phase 4 (i18n):** next-intl 4.x App Router docs are comprehensive
- **Phase 5 (Artist CV):** Reuses Phase 3 patterns; no new integrations
- **Phase 6 (Admin):** shadcn/ui + Server Actions + Vercel Blob upload are all well-documented independently
- **Phase 7 (Polish):** schema.org VisualArtwork is standard JSON-LD

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All choices verified against official docs and npm. Version numbers confirmed. Alternatives explicitly ruled out with documented rationale. |
| Features | HIGH | Based on art gallery / CV domain expertise sources, competitor analysis (Artsy, Artlogic, Saatchi Art), and professional art CV standards (College Art Association). |
| Architecture | HIGH (middleware), MEDIUM (i18n composition) | Middleware domain routing pattern is from official Vercel docs and Platforms Starter Kit. i18n + subdomain composition has limited production examples — pattern works but requires careful implementation. |
| Pitfalls | HIGH (auth, DB), MEDIUM (image perf) | Auth CVE is documented with CVSS score. DB connection strategy is from official Vercel KB. Image performance guidance is from community sources with consistent consensus. |

**Overall confidence: HIGH**

### Gaps to Address

- **next-intl composition with tenant routing:** The `app-router-tenants` pattern is referenced in docs but not a step-by-step guide. During Phase 1 implementation, validate the exact middleware composition order with a working prototype before building any route group content on top.
- **Vercel wildcard domain configuration:** Requires a wildcard DNS record (`*.uarttasarim.com` → Vercel) AND wildcard domain added in Vercel project settings. This is an ops step, not a code step — verify before Phase 5 launch testing.
- **Artist config driven by DB vs hardcoded:** Research notes that hardcoding `"melike"` and `"seref"` as artist slug constants is acceptable for v1 but must be refactored to DB-driven config before adding a third artist. Document this as explicit technical debt in Phase 1.
- **Email sending for contact forms:** ARCHITECTURE.md mentions Resend API or Nodemailer as optional. The decision (use Resend vs email-only vs DB-only) should be made in Phase 6 planning. Messages are persisted to DB regardless, so this does not block launch.

---

## Sources

### Primary (HIGH confidence)
- [Next.js Multi-Tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant) — middleware domain routing pattern
- [Vercel Multi-Tenant Application Guide](https://vercel.com/guides/nextjs-multi-tenant-application) — official Platforms Starter Kit reference
- [Neon Vercel Postgres Transition Guide](https://neon.com/docs/guides/vercel-postgres-transition-guide) — Neon as Vercel Postgres replacement
- [next-intl 4.0 release + routing docs](https://next-intl.dev/docs/routing/configuration) — domain routing, App Router integration
- [Vercel Blob client-upload docs](https://vercel.com/docs/vercel-blob/client-upload) — token exchange pattern
- [Auth.js v5 migration guide](https://authjs.dev/getting-started/migrating-to-v5) — credentials provider, `auth()` function
- [Next.js 16.2 release notes](https://nextjs.org/blog/next-16-2) — version confirmed
- [Tailwind CSS v4 release](https://tailwindcss.com/blog/tailwindcss-v4) — v4 stable with Next.js 16
- [yet-another-react-lightbox Next.js example](https://yet-another-react-lightbox.com/examples/nextjs) — next/image integration
- [College Art Association — Visual Artist CV Guidelines](https://www.collegeart.org/standards-and-guidelines/guidelines/visual-art-cv) — CV section standards

### Secondary (MEDIUM confidence)
- [CVE-2025-29927 — ProjectDiscovery](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — middleware auth bypass details
- [Vercel KB — Connection Pooling with Functions](https://vercel.com/kb/guide/connection-pooling-with-functions) — pooled vs direct connection
- [Drizzle vs Prisma — makerkit.dev 2026](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — cold-start benchmark
- [next-intl subdomain discussion #84461](https://github.com/vercel/next.js/discussions/84461) — composition pattern edge cases
- [next/image remotePatterns search params bug #80294](https://github.com/vercel/next.js/issues/80294) — Blob URL query param issue

### Tertiary (MEDIUM-LOW confidence)
- [Subdomain-Based Routing Complete Guide — Medium](https://medium.com/@sheharyarishfaq/subdomain-based-routing-in-next-js-a-complete-guide-for-multi-tenant-applications-1576244e799a) — community pattern, consistent with official docs

---
*Research completed: 2026-03-22*
*Ready for roadmap: yes*
