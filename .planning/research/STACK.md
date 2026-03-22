# Stack Research

**Domain:** Multi-domain art gallery / portfolio vitrine (Next.js on Vercel)
**Researched:** 2026-03-22
**Confidence:** HIGH (all core choices verified against official docs / npm)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2 (latest stable) | Full-stack framework | Vercel-native, App Router is the production standard; v16 ships Turbopack by default — meaningfully faster builds. v15 is maintenance-only. |
| React | 19 | UI rendering | Ships with Next.js 16; required for Server Components, async components, and modern Suspense patterns. |
| TypeScript | 5.x | Type safety | Required by the project; Zod + Drizzle schemas flow through to UI types with zero boilerplate. |
| Tailwind CSS | 4.x | Styling | v4 ships with Next.js 16 scaffolding by default. CSS-first config, ~5x faster builds than v3. No `tailwind.config.js` needed. |

### Database Layer

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Neon Postgres | managed | Serverless PostgreSQL | Vercel Postgres was deprecated — all stores migrated to Neon (Vercel Marketplace). Neon is the official Vercel-native Postgres. Branch-per-preview-deploy out of the box. |
| Drizzle ORM | 0.45 (stable) | ORM / query builder | 7.4 KB bundle vs Prisma's ~40 MB binary. No cold-start penalty. Edge-native. SQL-like syntax keeps queries readable. For a project with a handful of simple tables (products, artists, messages) Prisma's abstraction cost is not worth it. |
| @neondatabase/serverless | latest | Edge/serverless DB driver | Required for Vercel Edge Middleware or Edge Runtime API routes. Use `neon()` for single-query paths, `Pool` for multi-statement transactions. |
| drizzle-kit | 0.x | Migrations / schema push | Companion CLI for Drizzle. Schema introspection, migration generation. |

### Image Handling

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| next/image | (built-in) | Image optimization | Auto-converts to WebP/AVIF, lazy-loads, prevents layout shift. For an art gallery it is non-negotiable — every artwork photo gets free CDN optimization on Vercel's edge. Configure `remotePatterns` to allow `*.vercel-storage.com` (Blob CDN hostname). |
| @vercel/blob | 2.3.1 | File / image storage | Official Vercel object storage. Simple `put()` API, global CDN, public URLs directly servable by `next/image`. 500 MB per file, 100 GB/month free bandwidth. Admin upload path: client token from server → direct browser-to-blob upload (avoids 4.5 MB serverless body limit). |
| yet-another-react-lightbox | 3.29.1 | Gallery lightbox | 205 K weekly downloads; explicit Next.js integration guide (uses `next/image` via custom render). Plugin-based: add Captions, Thumbnails, Zoom, Fullscreen only as needed. React 19 compatible. |

### Internationalisation (i18n)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| next-intl | 4.8.3 (latest) | TR + EN translations | The clear winner for Next.js App Router in 2025/2026 — 931 K weekly downloads. Built for React Server Components; translations load on the server with zero hydration overhead. Supports domain-based routing via `defineRouting({ domains: [...] })`, which maps directly onto the multi-domain architecture. |

### Authentication (Admin Panel)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| next-auth | 5.0.0-beta.25 ("v5") | Admin session auth | Widely used in production despite the beta tag — v5 is stable enough, actively maintained, and the v4 line is in maintenance. Credentials provider + JWT session satisfies single-admin use case with no vendor dependency. Server-side `auth()` function protects `/admin/*` routes in middleware. |

### Forms & Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-hook-form | 7.x | Form state management | Uncontrolled components → minimal re-renders. Works with Server Actions pattern (client-side validation before submit). Industry standard for Next.js admin forms. |
| zod | 3.x | Schema validation | TypeScript-first. Shared schema between client (RHF resolver) and server (Server Action validation). Single source of truth for input shapes. Integrates with Drizzle type inference. |
| @hookform/resolvers | 5.2.2 | RHF ↔ Zod bridge | Required adapter. Zod v4 resolver support confirmed in latest release. |

### UI Component Library

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| shadcn/ui | latest (CLI-installed) | Admin UI components | Not a package — copies components into your codebase. Radix UI primitives + Tailwind v4. Standard choice for Next.js admin panels in 2025/2026. Use for admin-only pages (DataTable, Dialog, Select, Toast). Do NOT use for the public-facing gallery — hand-craft those for the minimal gallery aesthetic. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm | Package manager | Faster than npm/yarn; lockfile deterministic. Use `pnpm create next-app` for scaffolding. |
| ESLint + Next.js config | Linting | Ships with `create-next-app`. Keep defaults. |
| Prettier | Formatting | Add `prettier-plugin-tailwindcss` to auto-sort Tailwind classes. |
| Drizzle Studio | Database GUI | `drizzle-kit studio` — local visual DB browser during development. No separate tool needed. |

---

## Installation

```bash
# Scaffold
pnpm create next-app@latest sanat-galeri \
  --typescript --tailwind --app --src-dir --import-alias "@/*"

# Database
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Image storage
pnpm add @vercel/blob

# i18n
pnpm add next-intl

# Auth
pnpm add next-auth@beta

# Forms & validation
pnpm add react-hook-form zod @hookform/resolvers

# Gallery lightbox
pnpm add yet-another-react-lightbox

# Admin UI components (interactive CLI — run after project init)
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input table dialog select toast
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Drizzle ORM | Prisma | Prisma cold-start overhead (1–3 s) is unacceptable for serverless Vercel functions. 90% larger bundle. For a small schema (5–6 tables) there is no DX benefit that justifies the cost. |
| Neon (via Vercel Marketplace) | Supabase | Supabase is a full platform (Auth, Storage, Realtime) — overengineered for this project which already uses Vercel Blob and next-auth. Neon is pure Postgres, easier to reason about, officially recommended by Vercel post-deprecation of Vercel Postgres. |
| @vercel/blob | Cloudinary / AWS S3 | Vercel Blob requires zero extra accounts and integrates directly with the Vercel dashboard. Cloudinary adds a free-tier dependency with sharp transformation costs; S3 adds IAM complexity. |
| next-intl | next-i18next | next-i18next was built for Pages Router. App Router requires manual wiring with react-i18next directly — ambiguous setup, more complex. next-intl has first-class App Router + RSC support. |
| yet-another-react-lightbox | react-image-lightbox | `react-image-lightbox` is effectively unmaintained (last release 2021). yet-another-react-lightbox explicitly supports next/image via custom render, which is required to keep image CDN optimization working inside the lightbox. |
| next-auth v5 (beta) | Lucia auth | Lucia v3 deprecated its session management utilities in late 2024; the maintainer recommends rolling your own. next-auth v5 is production-proven at scale and has a larger support community. |
| shadcn/ui (admin only) | Full component lib (MUI, Ant Design) | MUI / Ant Design impose their own design language — incompatible with the minimal gallery aesthetic. shadcn/ui copies headless primitives you own; only used in admin, so zero visual bleed onto public pages. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Prisma (on Vercel serverless) | Binary engine causes 1–3 s cold starts; 40 MB bundle hits Vercel's 250 MB function size warning. | Drizzle ORM |
| next-i18next | Designed for Pages Router; App Router setup is undocumented and fragile. | next-intl 4.x |
| react-image-lightbox | Unmaintained since 2021, does not support React 18+. | yet-another-react-lightbox |
| Supabase Auth | Auth layer is duplicated by next-auth; Supabase DB is redundant with Neon. Combining both creates two database connections and two auth systems. | next-auth v5 + Neon |
| Payload CMS / Sanity / Contentful | A headless CMS adds a dependency, a separate admin UI to learn, and often a paid tier. The project's admin requirements (product CRUD, CV editing, message inbox) are simple enough to build in-app in a day. | Custom `/admin` route group with shadcn/ui components |
| `pages/` router | Legacy. No RSC, no Server Actions, no co-located layouts. next-intl v4 drops Pages Router support. | App Router only |
| Cloudinary free tier | Vendor lock-in, transformation costs, separate account. Not needed when next/image + Vercel Blob already handles optimization and storage. | next/image + @vercel/blob |

---

## Stack Patterns by Variant

**Multi-domain routing (subdomain per artist):**
- Use a single `middleware.ts` that reads `request.headers.get('host')`, extracts the subdomain, and rewrites to `/[subdomain]/...` route segment.
- next-intl middleware wraps the domain-routing middleware — compose them with `chain()`.
- Vercel project settings: add all custom domains to one project. No separate deployments needed.

**Admin panel protection:**
- Place all admin routes under `app/(admin)/admin/...`.
- Middleware matches `/admin/:path*` and calls `auth()` (next-auth v5) — redirect to `/admin/login` if no session.
- No RBAC needed — single admin user.

**Image upload in admin:**
- Use Vercel Blob client-upload pattern: Server Action generates a upload token → browser uploads directly to Blob CDN → Server Action receives the returned URL and persists to DB.
- This bypasses the 4.5 MB serverless request body limit entirely.

**Gallery lightbox with next/image:**
```typescript
import Lightbox from "yet-another-react-lightbox";
import NextJsImage from "@/components/NextJsImage"; // custom render using next/image
// pass render={{ slide: NextJsImage }} to Lightbox
```

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next-intl@4.x | Next.js 15 + 16, React 18 + 19 | Drops Pages Router. Min TypeScript 5. |
| next-auth@5.0.0-beta.25 | Next.js 14, 15, 16 | Still beta tag; API is stable for credentials provider use case. |
| yet-another-react-lightbox@3.x | React 16.8+, 17, 18, 19 | Confirmed React 19 support. |
| drizzle-orm@0.45 | @neondatabase/serverless, node-postgres | Avoid drizzle-orm@1.0.0-beta — not yet stable. |
| Tailwind CSS v4 | Next.js 16 (ships by default) | Incompatible with Tailwind v3 plugins that rely on `tailwind.config.js`. shadcn/ui CLI handles this correctly when run with `--tailwind-v4` flag. |
| @hookform/resolvers@5.x | zod v3 and zod v4 | zodResolver works with both zod versions in resolvers 5.x. |

---

## Sources

- [Vercel Postgres Transition Guide — Neon Docs](https://neon.com/docs/guides/vercel-postgres-transition-guide) — confirmed Vercel Postgres → Neon migration, HIGH confidence
- [Vercel Build a multi-tenant app guide](https://vercel.com/guides/nextjs-multi-tenant-application) — middleware domain routing pattern, HIGH confidence
- [next-intl 4.0 release blog](https://next-intl.dev/blog/next-intl-4-0) — version 4.8.3 confirmed latest, domain routing config, HIGH confidence
- [next-intl routing configuration docs](https://next-intl.dev/docs/routing/configuration) — `defineRouting({ domains })` API, HIGH confidence
- [yet-another-react-lightbox npm](https://www.npmjs.com/package/yet-another-react-lightbox) — v3.29.1 confirmed, 205 K weekly downloads, HIGH confidence
- [yet-another-react-lightbox Next.js example](https://yet-another-react-lightbox.com/examples/nextjs) — next/image integration pattern, HIGH confidence
- [Drizzle vs Prisma — makerkit.dev 2026](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — cold-start comparison data, MEDIUM confidence (third-party benchmark)
- [Vercel Blob docs](https://vercel.com/docs/vercel-blob/client-upload) — client upload pattern, token generation, HIGH confidence
- [@vercel/blob npm v2.3.1](https://www.npmjs.com/package/@vercel/blob) — version confirmed, HIGH confidence
- [Auth.js v5 migration guide](https://authjs.dev/getting-started/migrating-to-v5) — credentials provider, App Router auth() function, HIGH confidence
- [next-auth npm](https://www.npmjs.com/package/next-auth) — v4.24.13 stable, v5.0.0-beta.25 latest beta, HIGH confidence
- [Next.js 16.2 release](https://nextjs.org/blog/next-16-2) — current stable version confirmed, HIGH confidence
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) — v4 stable, ships with Next.js 16, HIGH confidence
- [drizzle-orm npm](https://www.npmjs.com/drizzle-orm) — v0.45.1 stable confirmed, HIGH confidence

---

*Stack research for: U-Art Tasarım multi-domain art gallery / portfolio platform*
*Researched: 2026-03-22*
