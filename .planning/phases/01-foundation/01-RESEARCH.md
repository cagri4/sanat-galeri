# Phase 1: Foundation - Research

**Researched:** 2026-03-23
**Domain:** Next.js 16 multi-domain routing, Drizzle + Neon Postgres, Vercel Blob, next-auth v5 admin auth
**Confidence:** HIGH (routing, auth, DB), MEDIUM (next-intl + subdomain middleware composition)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLT-01 | Site 3 domain üzerinden çalışır (ana + 2 subdomain) | Middleware domain routing pattern fully documented; `DOMAIN_MAP` + `NextResponse.rewrite()` to route groups |
| PLT-03 | Tüm sayfalar mobil cihazlarda düzgün çalışır | Tailwind v4 responsive breakpoints; 320px min-width validated via `min-w-[320px]` utility |
| ADM-04 | Admin paneline güvenli giriş yapılabilir | next-auth v5 credentials provider + server-side `auth()` in every admin Server Component; CVE-2025-29927 defense-in-depth |
</phase_requirements>

---

## Summary

Phase 1 lays the load-bearing infrastructure for all subsequent phases: the middleware that routes three domains to the correct route groups, the Drizzle+Neon database schema and migration pipeline, Vercel Blob storage scaffolding, and the next-auth v5 admin authentication layer. Every later phase depends on requests reaching the right place, data existing in the correct schema, and admin routes being genuinely secure.

The primary technical risk in this phase is the middleware composition order when combining tenant/subdomain routing with next-intl locale detection. Research confirms this works but requires a specific sequence: tenant extraction from `host` header first, URL rewrite to internal route, then next-intl locale detection on the already-rewritten path. The naive approach (running `createMiddleware()` at the top level) produces 404s on subdomain requests. This must be verified in a live Vercel preview with all three domains before any feature work begins.

Admin security has one non-negotiable rule: middleware redirection is not sufficient. CVE-2025-29927 (CVSS 9.1) allows middleware bypass via crafted headers. The mitigation is a server-side `await auth()` call in every admin layout and page. This is the standard next-auth v5 pattern and does not require extra code — it just cannot be omitted.

**Primary recommendation:** Build middleware first in isolation (no next-intl yet), verify all three domains route correctly in a Vercel preview, then layer in next-intl composition. This sequencing avoids debugging two systems simultaneously.

---

## Standard Stack

### Core (Phase 1 relevant)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2 | App Router, middleware, route groups | Vercel-native; Turbopack default; v15 is maintenance-only |
| TypeScript | 5.x | Type safety | Ships with create-next-app; Drizzle schemas flow to UI types |
| Tailwind CSS | 4.x | Styling + responsive layout | Ships with Next.js 16 scaffolding by default; CSS-first config |
| next-auth | 5.0.0-beta.25 | Admin session auth | Production-proven despite beta tag; `auth()` is the App Router standard |
| Drizzle ORM | 0.45.x | ORM + schema definition | 7.4 KB bundle, no cold-start penalty, edge-native; Prisma explicitly ruled out |
| drizzle-kit | 0.x | Migration CLI | Companion to drizzle-orm; `drizzle-kit migrate` runs against direct DB URL |
| @neondatabase/serverless | latest | DB driver | Required for Vercel serverless/edge; use `neon()` for single queries, `Pool` for transactions |
| @vercel/blob | 2.3.1 | File/image storage | Zero extra accounts; global CDN; client-upload pattern bypasses 4.5 MB serverless limit |
| next-intl | 4.8.3 | i18n middleware scaffolding | Needed in Phase 1 to establish composition order; full wiring in Phase 3 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | CLI-installed | Admin UI components | Phase 1: init only (`pnpm dlx shadcn@latest init`); components added in Phase 5 |
| zod | 3.x | Schema validation | Auth credentials validation server-side |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Drizzle ORM | Prisma | Prisma: 1-3s cold starts on Vercel serverless, 40 MB binary. Drizzle is 7.4 KB with no cold start. Never use Prisma on Vercel. |
| Neon (via Vercel Marketplace) | Supabase Postgres | Supabase adds redundant auth/storage layers; Neon is pure Postgres, officially recommended by Vercel post-Vercel-Postgres deprecation |
| next-auth v5 | Lucia | Lucia v3 deprecated its session utilities in late 2024; maintainer recommends rolling your own. next-auth v5 is production-proven. |

**Installation:**

```bash
# Project scaffold
pnpm create next-app@latest sanat-galeri \
  --typescript --tailwind --app --src-dir --import-alias "@/*"

# Database
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Auth
pnpm add next-auth@beta

# Image storage (scaffold API route; full use in Phase 5)
pnpm add @vercel/blob

# i18n (middleware composition scaffold; full wiring in Phase 3)
pnpm add next-intl

# Validation
pnpm add zod

# Admin UI init (components added in Phase 5)
pnpm dlx shadcn@latest init
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── middleware.ts                    # Domain routing + next-intl + admin auth guard
├── auth.ts                          # next-auth config (credentials provider)
├── app/
│   ├── (main)/                      # uarttasarim.com
│   │   └── [locale]/
│   │       └── page.tsx             # Placeholder index for Phase 1
│   ├── (artist)/                    # melike.* and seref.*
│   │   └── [locale]/
│   │       └── [artist]/
│   │           └── page.tsx         # Placeholder for Phase 1
│   ├── (admin)/                     # /admin path
│   │   ├── layout.tsx               # Server-side auth check
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts         # next-auth handler
│       └── upload/
│           └── route.ts             # Vercel Blob token handler (stub)
├── lib/
│   ├── db/
│   │   ├── index.ts                 # Drizzle client (pooled connection)
│   │   └── schema.ts                # All table definitions
│   ├── auth.ts                      # auth() helper re-export
│   └── blob.ts                      # @vercel/blob helpers (stub)
├── components/
│   └── shared/
│       └── ui/                      # shadcn/ui primitives (added as needed)
└── drizzle.config.ts                # Points to DIRECT connection URL for migrations
```

### Pattern 1: Middleware Domain Routing

**What:** Single `middleware.ts` reads the `host` header, identifies the domain variant (main / melike / seref), rewrites the internal URL to the correct route group, then runs locale detection. Admin path protected by cookie check plus redirect.

**When to use:** Required on every request; this is the entry point for all domain routing.

```typescript
// src/middleware.ts
import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const DOMAIN_MAP: Record<string, string> = {
  'uarttasarim.com': 'main',
  'www.uarttasarim.com': 'main',
  'melike.uarttasarim.com': 'melike',
  'seref.uarttasarim.com': 'seref',
}

function getTenant(request: NextRequest): string {
  const hostname = request.headers.get('host') ?? ''
  // Local dev: ?tenant=melike query param override
  const tenantOverride = request.nextUrl.searchParams.get('tenant')
  if (tenantOverride) return tenantOverride
  // Vercel preview: hostname includes .vercel.app — default to 'main'
  if (hostname.includes('.vercel.app') || hostname.includes('localhost')) {
    return 'main'
  }
  return DOMAIN_MAP[hostname] ?? 'main'
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Admin guard: check cookie BEFORE domain rewrite
  if (pathname.startsWith('/admin')) {
    // next-auth session cookie check
    const sessionCookie =
      request.cookies.get('authjs.session-token') ??
      request.cookies.get('__Secure-authjs.session-token')
    if (!sessionCookie && !pathname.startsWith('/admin/login')) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // 2. Tenant detection
  const tenant = getTenant(request)

  if (tenant === 'main') {
    // Let next-intl handle locale routing for main domain
    return intlMiddleware(request)
  }

  // 3. Artist subdomain: rewrite path then run intl
  const rewrittenRequest = request.clone() as NextRequest
  const url = request.nextUrl.clone()
  // Prepend tenant segment so (artist)/[locale]/[artist]/ resolves correctly
  // next-intl will detect locale from the rewritten URL
  url.pathname = `/${tenant}${pathname}`
  // Run intl middleware on rewritten URL
  const intlResponse = intlMiddleware(
    new Request(url.toString(), request) as NextRequest,
  )
  return intlResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Source:** Official pattern from [Vercel Multi-Tenant Guide](https://vercel.com/guides/nextjs-multi-tenant-application) + [next-intl middleware docs](https://next-intl.dev/docs/routing/middleware) — MEDIUM confidence on exact composition order; validate with live test.

### Pattern 2: Admin Server-Side Auth (Defense-in-Depth)

**What:** Every admin layout and page calls `await auth()` and redirects to login if no session. This is the mandatory second layer after middleware — CVE-2025-29927 means middleware alone is bypassable.

**When to use:** In `app/(admin)/layout.tsx` and any admin page that fetches sensitive data.

```typescript
// src/app/(admin)/layout.tsx
// Source: https://authjs.dev/getting-started/session-management/protecting
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect('/admin/login')
  }
  return <>{children}</>
}
```

```typescript
// src/auth.ts
// Source: https://authjs.dev/getting-started/migrating-to-v5
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
})

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
        const { username, password } = parsed.data
        // Compare against env vars — no user table needed for single admin
        if (
          username === process.env.ADMIN_USERNAME &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: '1', name: 'Admin' }
        }
        return null
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  callbacks: {
    authorized: async ({ auth }) => !!auth,
  },
})
```

### Pattern 3: Drizzle Schema + Two Connection Strings

**What:** `drizzle.config.ts` uses the DIRECT (non-pooled) connection URL for migrations. `lib/db/index.ts` uses the POOLED connection URL for all app queries.

**Why critical:** PgBouncer (pooled endpoint) runs in transaction mode and rejects prepared statements used by `drizzle-kit migrate`. Using pooled URL for migrations causes "prepared statement already exists" errors. Using direct URL in the app causes connection pool exhaustion under load.

```typescript
// drizzle.config.ts — uses DIRECT connection (port 5432)
// Source: https://neon.com/docs/guides/drizzle-migrations
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT!, // direct, non-pooled
  },
})
```

```typescript
// src/lib/db/index.ts — uses POOLED connection (port 6543)
// Source: https://orm.drizzle.team/docs/connect-neon
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!) // pooled connection string
export const db = drizzle(sql, { schema })
```

```typescript
// src/lib/db/schema.ts — Phase 1 minimal schema
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core'

export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  slug: text('slug').unique().notNull(),          // "melike" | "seref"
  nameTr: text('name_tr').notNull(),
  nameEn: text('name_en').notNull(),
  bioTr: text('bio_tr'),
  bioEn: text('bio_en'),
  photoUrl: text('photo_url'),
  email: text('email'),
  whatsapp: text('whatsapp'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id),
  slug: text('slug').unique().notNull(),
  titleTr: text('title_tr').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionTr: text('description_tr'),
  descriptionEn: text('description_en'),
  category: text('category').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }),
  currency: text('currency').default('TRY'),
  isSold: boolean('is_sold').default(false),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  altTr: text('alt_tr'),
  altEn: text('alt_en'),
  sortOrder: integer('sort_order').default(0),
})

export const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id),
  titleTr: text('title_tr'),
  titleEn: text('title_en'),
  year: integer('year'),
  mediumTr: text('medium_tr'),
  mediumEn: text('medium_en'),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').default(0),
})

export const exhibitions = pgTable('exhibitions', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id),
  type: text('type').notNull(),               // "sergi" | "odul" | "etkinlik"
  titleTr: text('title_tr').notNull(),
  titleEn: text('title_en').notNull(),
  location: text('location'),
  year: integer('year'),
  sortOrder: integer('sort_order').default(0),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id), // NULL = main site
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})
```

### Pattern 4: Vercel Blob remotePatterns (next.config.ts)

**What:** Configure `next/image` to accept Vercel Blob CDN URLs. The `search` key must be omitted entirely — including it (even as empty string) blocks URLs with query parameters, which Blob URLs frequently contain.

```typescript
// next.config.ts
// Source: PITFALLS.md — remotePatterns search params bug
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        // Do NOT include 'search' key — omitting it allows any query params
      },
    ],
  },
}

export default nextConfig
```

### Pattern 5: Responsive Mobile-First Layout (PLT-03)

**What:** Tailwind v4 responsive utilities. Minimum supported width: 320px. Maximum tested: 1440px.

```typescript
// Base layout pattern — works for (main), (artist), (admin)
// min-w-[320px] ensures nothing breaks at iPhone SE width
<div className="min-w-[320px] mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
  {children}
</div>
```

### Anti-Patterns to Avoid

- **Middleware-only admin auth:** Never protect admin routes with only a cookie check in middleware. Always add `await auth()` in admin layout/pages. CVE-2025-29927 bypasses middleware.
- **`createMiddleware()` at top level without tenant routing first:** Causes "Unable to find next-intl locale" 404s on all subdomain requests. Run tenant detection first.
- **`images.domains` array:** Deprecated since Next.js 13. Use `remotePatterns` exclusively.
- **Single `DATABASE_URL` for both app queries and migrations:** Pooled URL (port 6543) breaks `drizzle-kit migrate`. Direct URL (port 5432) causes connection exhaustion in app. Always two separate env vars.
- **Not implementing `?tenant=` override in local dev:** Subdomain routing can never be tested locally without this fallback. Build it on day one.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin session auth | Custom JWT/cookie system | next-auth v5 credentials provider | Session management, CSRF, secure cookies, rotation — all handled; hand-rolled auth has well-known pitfall surface area |
| Database migrations | Custom SQL scripts | drizzle-kit (generate + migrate) | Schema introspection, journal tracking, safe up/down migration generation |
| Image optimization/CDN | Custom resize pipeline | next/image + Vercel Blob | Auto-converts to WebP/AVIF, CDN caching, lazy-load, CLS prevention — free on Vercel |
| Locale detection | Manual Accept-Language parsing | next-intl middleware | Header parsing edge cases, cookie fallback, path prefix routing — complex to get right |
| Multi-domain routing | Dynamic `[domain]` catch-all route | Middleware + route groups | Catch-all leaks domain logic into every page; middleware rewrite keeps pages ignorant of hostname |

**Key insight:** In a Vercel-native Next.js project, every infrastructure concern (auth, storage, DB, i18n, CDN) has a battle-tested first-party or ecosystem-standard solution. Custom implementations in these areas are maintenance liabilities, not differentiators.

---

## Common Pitfalls

### Pitfall 1: CVE-2025-29927 — Middleware Auth Bypass

**What goes wrong:** Admin panel accessible without credentials via crafted `x-middleware-subrequest` header.

**Why it happens:** Next.js middleware can be bypassed by external callers using an internal header. Middleware-only auth is the default tutorial pattern but is insecure. Affects all Next.js versions before 15.2.3.

**How to avoid:** Run Next.js 16 (patched on Vercel). AND add `await auth()` check in every admin Server Component/layout — belt and suspenders.

**Warning signs:** Admin `page.tsx` has no session check. Only `middleware.ts` redirects to login.

### Pitfall 2: next-intl + Subdomain Middleware 404s

**What goes wrong:** All subdomain requests return 404 with "Unable to find next-intl locale" error.

**Why it happens:** `createMiddleware()` runs before tenant extraction, tries to detect locale from the original path (`/`), finds nothing, 404s.

**How to avoid:** Composition order: (1) detect tenant from `host` header, (2) rewrite URL to include tenant segment, (3) run next-intl on rewritten URL. Test with `?tenant=melike` locally before Vercel preview.

**Warning signs:** Works on `localhost:3000` (main domain fallback) but breaks when accessing with `?tenant=melike`.

### Pitfall 3: Pooled vs Direct DB Connection Confusion

**What goes wrong:** `drizzle-kit migrate` fails with "prepared statement already exists" — OR app throws "connection timeout" under load.

**Why it happens:** PgBouncer (pooled, port 6543) rejects prepared statements used in migrations. Direct connection (port 5432) creates a new TCP connection per serverless invocation, exhausting the pool.

**How to avoid:** `drizzle.config.ts` uses `DATABASE_URL_DIRECT` (port 5432). App's `lib/db/index.ts` uses `DATABASE_URL` (port 6543, pooled). Never mix.

**Warning signs:** Single `DATABASE_URL` env var used in both files.

### Pitfall 4: `onUploadCompleted` Doesn't Fire Locally

**What goes wrong:** Vercel Blob upload succeeds but the database record is never created in local dev.

**Why it happens:** `onUploadCompleted` is a webhook called by Vercel's servers. In local dev, `localhost` is not reachable from Vercel's servers.

**How to avoid:** In local dev, persist the blob URL from the client-side `upload()` return value directly. Use `onUploadCompleted` only in production. Document this behavioral difference.

**Warning signs:** Upload works, preview shows image, but DB has no record after refreshing.

### Pitfall 5: Vercel Wildcard Domain Not Configured

**What goes wrong:** Middleware routing is correct but subdomain requests 404 in production.

**Why it happens:** Both wildcard DNS (`*.uarttasarim.com → Vercel`) AND a wildcard domain in Vercel project settings are required. Either missing = 404.

**How to avoid:** Add `*.uarttasarim.com` as a domain in Vercel project settings before testing subdomains in production or Vercel preview.

**Warning signs:** Only `uarttasarim.com` is added to Vercel project domains; subdomains not listed.

---

## Code Examples

### Admin Login Page (next-auth v5 Server Action)

```typescript
// src/app/(admin)/login/page.tsx
// Source: https://authjs.dev/getting-started/migrating-to-v5
import { signIn } from '@/auth'

export default function LoginPage() {
  return (
    <form
      action={async (formData: FormData) => {
        'use server'
        await signIn('credentials', {
          username: formData.get('username'),
          password: formData.get('password'),
          redirectTo: '/admin/dashboard',
        })
      }}
    >
      <input name="username" type="text" required />
      <input name="password" type="password" required />
      <button type="submit">Giriş Yap</button>
    </form>
  )
}
```

### next-auth Route Handler

```typescript
// src/app/api/auth/[...nextauth]/route.ts
// Source: https://authjs.dev/getting-started/migrating-to-v5
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### Drizzle Migration Commands

```bash
# Generate migration files from schema changes
pnpm drizzle-kit generate

# Apply migrations to DB (uses DATABASE_URL_DIRECT in drizzle.config.ts)
pnpm drizzle-kit migrate

# Local development DB browser
pnpm drizzle-kit studio
```

### Vercel Blob Upload Route Handler (Phase 1 Stub)

```typescript
// src/app/api/upload/route.ts
// Source: https://vercel.com/docs/vercel-blob/client-upload
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        // NOTE: Does not fire in local dev — use client-side blob.url instead
        console.log('Upload completed:', blob.url)
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
```

### Environment Variables Required for Phase 1

```bash
# .env.local

# Neon Postgres — pooled (app queries)
DATABASE_URL=postgresql://...@pooler.neon.tech:6543/dbname?sslmode=require

# Neon Postgres — direct (drizzle-kit migrations only)
DATABASE_URL_DIRECT=postgresql://...@ep-xxx.eu-central-1.aws.neon.tech:5432/dbname?sslmode=require

# next-auth
AUTH_SECRET=<generate with: openssl rand -base64 32>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>

# Vercel Blob
BLOB_READ_WRITE_TOKEN=<from Vercel dashboard>

# Local dev tenant simulation
NEXT_PUBLIC_DEV_TENANT=main   # change to "melike" or "seref" to test artist routes
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vercel Postgres | Neon Postgres (via Vercel Marketplace) | 2024 | Vercel Postgres was deprecated; all stores migrated to Neon |
| Prisma on Vercel | Drizzle ORM | 2023-2024 | Prisma binary engine causes 1-3s cold starts; Drizzle has no binary |
| `middleware.ts` (Next.js) | `proxy.ts` (Next.js 16 name change) | Next.js 16 | `middleware.ts` still works but `proxy.ts` is the new canonical name in Next.js 16 docs; both are supported |
| `images.domains` array | `images.remotePatterns` | Next.js 13+ | `domains` is deprecated; `remotePatterns` is required for Blob URLs with query params |
| next-auth v4 | next-auth v5 (beta) | 2024 | v5 has proper App Router integration; `auth()` function works as Server Component; v4 is maintenance-only |

**Deprecated/outdated:**
- `pages/` router: No RSC, no Server Actions, dropped by next-intl v4. Never use for new projects.
- `next-i18next`: Built for Pages Router; App Router wiring is undocumented and fragile. Use next-intl.
- `Lucia auth v3`: Maintainer deprecated session management utilities in late 2024. Use next-auth.

---

## Open Questions

1. **Exact middleware.ts composition order for next-intl + artist subdomain**
   - What we know: Tenant must be extracted before intl middleware runs; composition pattern exists in next-intl `app-router-tenants` example
   - What's unclear: The exact API for passing a rewritten request to `createIntlMiddleware()` — the example code is not step-by-step in official docs
   - Recommendation: Implement middleware in two stages — first get tenant routing working without next-intl, verify `?tenant=melike` works in local dev, then add intl composition. This way you can isolate which layer breaks if there are issues.

2. **`proxy.ts` vs `middleware.ts` naming in Next.js 16**
   - What we know: Next.js 16 documentation refers to `proxy.ts` in some places for auth. Both filenames may work.
   - What's unclear: Whether `proxy.ts` is a replacement or an alias in Next.js 16
   - Recommendation: Use `middleware.ts` (established, universally documented) unless official Next.js 16 release notes explicitly state otherwise.

3. **Vercel Blob store creation timing**
   - What we know: `BLOB_READ_WRITE_TOKEN` is required at build time; the store must be created in the Vercel dashboard before first deploy
   - What's unclear: Whether the blob store can be pre-created before the project is linked to Vercel, or requires a live project
   - Recommendation: Create the Vercel project and link it to the repo early in Phase 1 (before needing the token locally). Use `vercel env pull` to get tokens locally.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — Wave 0 must install |
| Config file | `jest.config.ts` — Wave 0 |
| Quick run command | `pnpm test --testPathPattern=middleware` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLT-01 | Domain `uarttasarim.com` routes to `(main)` route group | unit | `pnpm test -- middleware.test.ts` | Wave 0 |
| PLT-01 | `?tenant=melike` routes to `(artist)/melike` in local dev | unit | `pnpm test -- middleware.test.ts` | Wave 0 |
| PLT-01 | Admin path without session redirects to `/admin/login` | unit | `pnpm test -- middleware.test.ts` | Wave 0 |
| PLT-03 | 320px viewport renders without horizontal scroll | manual | Manual browser test at 320px | N/A |
| PLT-03 | 1440px viewport renders without layout breaks | manual | Manual browser test at 1440px | N/A |
| ADM-04 | `/admin/dashboard` without cookie redirects to login | integration | `pnpm test -- admin-auth.test.ts` | Wave 0 |
| ADM-04 | Server Component `auth()` check redirects unauthenticated request | unit | `pnpm test -- admin-layout.test.ts` | Wave 0 |
| N/A | DB migration runs cleanly against Neon direct URL | smoke | `pnpm drizzle-kit migrate` | Verify in CI |
| N/A | Vercel Blob test upload succeeds and URL renders in `next/image` | smoke | Manual upload + visual check in preview | N/A |

### Sampling Rate

- **Per task commit:** `pnpm test -- middleware.test.ts` (middleware unit tests, < 5 seconds)
- **Per wave merge:** `pnpm test` (full suite)
- **Phase gate:** Full suite green + manual mobile viewport check + Vercel preview subdomain routing verified before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/middleware.test.ts` — covers PLT-01 domain routing and admin redirect
- [ ] `src/__tests__/admin-auth.test.ts` — covers ADM-04 server-side session check
- [ ] `jest.config.ts` + `jest.setup.ts` — framework config
- [ ] Framework install: `pnpm add -D jest @types/jest jest-environment-node ts-jest`

---

## Sources

### Primary (HIGH confidence)

- [Auth.js v5 — Session Protection](https://authjs.dev/getting-started/session-management/protecting) — server-side `auth()` in layouts, credentials provider setup
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5) — `handlers`, `signIn`, `signOut` exports
- [Vercel Blob Client Upload](https://vercel.com/docs/vercel-blob/client-upload) — `handleUpload()`, token exchange, `onUploadCompleted` local dev caveat
- [Neon Drizzle Migrations Guide](https://neon.com/docs/guides/drizzle-migrations) — direct vs pooled connection for migrations
- [Drizzle ORM — Connect Neon](https://orm.drizzle.team/docs/connect-neon) — `neon()` driver, `drizzle()` instantiation
- [CVE-2025-29927 — ProjectDiscovery](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — middleware auth bypass, CVSS 9.1
- [next-intl Middleware Docs](https://next-intl.dev/docs/routing/middleware) — `createMiddleware()`, composition pattern

### Secondary (MEDIUM confidence)

- [next.js Discussion #84461 — Subdomain + next-intl + Supabase](https://github.com/vercel/next.js/discussions/84461) — practical middleware composition example; verified composition order
- [next-intl Discussion #1613 — Composing with existing middleware](https://github.com/amannn/next-intl/discussions/1613) — i18n middleware + auth middleware composition; locale-stripping anti-loop pattern
- [Vercel Multi-Tenant Guide](https://vercel.com/guides/nextjs-multi-tenant-application) — single-project multi-domain architecture overview

### Tertiary (LOW confidence — needs validation)

- [Medium — Subdomain-Based Routing Complete Guide](https://medium.com/@sheharyarishfaq/subdomain-based-routing-in-next-js-a-complete-guide-for-multi-tenant-applications-1576244e799a) — community tutorial; consistent with official patterns but unverified edge cases

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified against official docs and npm; versions confirmed
- Middleware routing: HIGH — Vercel official docs + Platforms Starter Kit pattern
- i18n + subdomain composition: MEDIUM — pattern documented, exact API interaction requires live validation
- Admin auth (next-auth v5): HIGH — official authjs.dev docs, defense-in-depth pattern well-documented
- DB setup (Drizzle + Neon): HIGH — official Neon + Drizzle docs confirm two-connection strategy
- Vercel Blob: HIGH — official Vercel docs; `onUploadCompleted` local dev caveat confirmed

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (30 days; stack is stable)
