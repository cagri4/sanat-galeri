# Architecture Research

**Domain:** Multi-domain art gallery / portfolio platform (Next.js, Vercel)
**Researched:** 2026-03-22
**Confidence:** HIGH (middleware patterns), MEDIUM (DB schema, i18n composition)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          DNS / Vercel Edge                                │
│  uarttasarim.com   melike.uarttasarim.com   seref.uarttasarim.com        │
└────────────────────────┬─────────────────────────────────────────────────┘
                         │  All domains hit same Next.js project on Vercel
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       middleware.ts  (Edge Runtime)                       │
│                                                                           │
│  1. Extract hostname from request headers                                 │
│  2. Detect domain variant: "root" | "melike" | "seref" | "admin"         │
│  3. Detect locale from URL prefix or Accept-Language header              │
│  4. Rewrite URL to internal route group:                                  │
│     uarttasarim.com/tr/...  →  /app/(main)/[locale]/...                  │
│     melike.uarttasarim.com  →  /app/(artist)/[locale]/melike/...         │
│     seref.uarttasarim.com   →  /app/(artist)/[locale]/seref/...          │
│     */admin                 →  /app/(admin)/...  (auth check)            │
└────────────────────────┬─────────────────────────────────────────────────┘
                         │ NextResponse.rewrite()
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      Next.js App Router                                   │
├──────────────────┬──────────────────┬────────────────────────────────────┤
│   (main) group   │  (artist) group  │          (admin) group             │
│                  │                  │                                     │
│  [locale]/       │  [locale]/       │  /admin/login                      │
│  ├── page.tsx    │  [artist]/       │  /admin/dashboard                  │
│  ├── galeri/     │  ├── page.tsx    │  /admin/products                   │
│  ├── iletisim/   │  ├── portfolyo/  │  /admin/artists                    │
│  └── ...         │  ├── sergiler/   │  /admin/messages                   │
│                  │  └── iletisim/   │  /admin/cv/[artist]                │
└──────────────────┴──────────────────┴────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      Data / Storage Layer                                 │
│                                                                           │
│   Vercel Postgres (Neon)        Vercel Blob Storage                      │
│   ├── products                  ├── /products/{id}/{image}.webp           │
│   ├── product_images            ├── /artists/{slug}/{photo}.webp          │
│   ├── artists                   └── /portfolio/{artist}/{id}.webp         │
│   ├── artist_portfolio                                                    │
│   ├── exhibitions                                                         │
│   ├── messages                                                            │
│   └── admin_sessions                                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| middleware.ts | Domain detection, locale routing, admin auth guard | Edge function, NextResponse.rewrite/redirect |
| (main) route group | Product vitrine, category browsing, contact | Server Components + RSC data fetching |
| (artist) route group | CV/bio, portfolio gallery, exhibition list, contact form | Server Components, slug-based routing |
| (admin) route group | CRUD for all content, image uploads, message inbox | Client Components (forms), Server Actions |
| /api/upload | Vercel Blob token exchange for client uploads | Route Handler, handleUpload() |
| /api/contact | Contact form submission, email or WhatsApp routing | Route Handler |
| lib/db | Database access layer (Vercel Postgres queries) | Thin functions, no ORM required at this scale |
| lib/blob | Blob URL helpers, upload wrappers | @vercel/blob wrappers |
| components/shared | UI primitives used by all three domains | Server/Client components, no domain-specific logic |
| components/gallery | Image grid, lightbox, artwork card | Shared across main site and artist portfolios |


## Recommended Project Structure

```
src/
├── middleware.ts                    # Domain + locale + admin auth routing
├── app/
│   ├── (main)/                      # uarttasarim.com public site
│   │   └── [locale]/
│   │       ├── layout.tsx
│   │       ├── page.tsx             # Homepage / product showcase
│   │       ├── galeri/
│   │       │   ├── page.tsx         # All products
│   │       │   └── [category]/
│   │       │       └── page.tsx
│   │       ├── urun/
│   │       │   └── [slug]/
│   │       │       └── page.tsx     # Product detail
│   │       └── iletisim/
│   │           └── page.tsx
│   ├── (artist)/                    # melike.* and seref.* subdomains
│   │   └── [locale]/
│   │       └── [artist]/            # "melike" | "seref"
│   │           ├── layout.tsx
│   │           ├── page.tsx         # Bio/CV landing
│   │           ├── portfolyo/
│   │           │   └── page.tsx
│   │           ├── sergiler/
│   │           │   └── page.tsx
│   │           └── iletisim/
│   │               └── page.tsx
│   ├── (admin)/                     # admin.uarttasarim.com or /admin path
│   │   ├── layout.tsx               # Auth wrapper
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── urunler/             # Product CRUD
│   │       │   ├── page.tsx
│   │       │   ├── yeni/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── sanatcilar/          # Artist CV editing
│   │       │   └── [artist]/
│   │       │       └── page.tsx
│   │       └── mesajlar/            # Message inbox
│   │           └── page.tsx
│   └── api/
│       ├── upload/
│       │   └── route.ts             # Vercel Blob token handler
│       └── iletisim/
│           └── route.ts             # Contact form handler
├── components/
│   ├── shared/                      # Used everywhere
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── language-switcher.tsx
│   │   └── ui/                      # Buttons, inputs, typography primitives
│   ├── gallery/                     # Product + portfolio display
│   │   ├── artwork-card.tsx
│   │   ├── artwork-grid.tsx
│   │   └── lightbox.tsx
│   ├── artist/                      # Artist CV components
│   │   ├── bio-section.tsx
│   │   ├── exhibition-list.tsx
│   │   └── contact-form.tsx
│   └── admin/                       # Admin-only UI
│       ├── product-form.tsx
│       ├── image-uploader.tsx
│       └── message-list.tsx
├── lib/
│   ├── db.ts                        # Vercel Postgres client + query functions
│   ├── blob.ts                      # @vercel/blob upload helpers
│   ├── auth.ts                      # Admin session validation (iron-session or similar)
│   └── i18n/
│       ├── request.ts               # next-intl server config
│       └── routing.ts               # Locale configuration
├── messages/
│   ├── tr.json                      # Turkish translations
│   └── en.json                      # English translations
└── types/
    ├── product.ts
    ├── artist.ts
    └── domain.ts                    # Domain variant type: "main" | "melike" | "seref"
```

### Structure Rationale

- **(main)/, (artist)/, (admin)/**: Route groups keep domain concerns isolated; middleware rewrites to these groups without the group name appearing in URLs.
- **[locale]/ inside each group**: Locale prefix (`/tr/`, `/en/`) lives inside the route group so all domain variants get i18n uniformly.
- **[artist]/ segment inside (artist)**: One set of page files handles both Melike and Seref; artist slug drives which data is fetched.
- **components/shared vs components/gallery**: Gallery display components are shared between the main vitrine and artist portfolios, but don't leak admin logic.
- **lib/db.ts**: A thin module rather than an ORM keeps the DB footprint small at this scale. Direct SQL via `@vercel/postgres` is sufficient.


## Architectural Patterns

### Pattern 1: Middleware Domain Routing with URL Rewriting

**What:** Middleware reads the `host` header, identifies the domain variant, then uses `NextResponse.rewrite()` to map the request to an internal app route — without a visible URL change for the visitor.

**When to use:** Any single-codebase multi-domain setup. Essential for this project.

**Trade-offs:** Logic is centralized and fast (edge runtime). Harder to test locally without custom hosts configuration; use `localhost:3000?domain=melike` param fallback in dev.

**Example:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DOMAIN_MAP: Record<string, string> = {
  'uarttasarim.com': 'main',
  'melike.uarttasarim.com': 'melike',
  'seref.uarttasarim.com': 'seref',
  'localhost:3000': 'main',       // local dev default
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const url = request.nextUrl.clone()

  // Admin path: protect before domain check
  if (url.pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session')
    if (!session && !url.pathname.startsWith('/admin/login')) {
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Dev override: ?domain=melike
  const domainOverride = url.searchParams.get('domain')
  const variant = domainOverride ?? DOMAIN_MAP[hostname] ?? 'main'

  const locale = detectLocale(request)   // from Accept-Language or path prefix

  if (variant === 'main') {
    url.pathname = `/_main/${locale}${url.pathname}`
  } else {
    url.pathname = `/_artist/${locale}/${variant}${url.pathname}`
  }

  return NextResponse.rewrite(url)
}
```

### Pattern 2: Route Groups as Domain Buckets

**What:** `(main)`, `(artist)`, and `(admin)` are Next.js route groups (parentheses syntax). They allow independent layouts per domain without the group name appearing in public URLs.

**When to use:** Whenever different domains need different root layouts, metadata, and nav structures from the same codebase.

**Trade-offs:** Clean separation; no mixing of concerns. Slightly more files than a path-param approach, but layouts stay independent.

### Pattern 3: Vercel Blob Client Upload with Token Exchange

**What:** Admin uploads images directly from the browser to Vercel Blob. A Route Handler (`/api/upload`) generates a short-lived client token via `handleUpload()`, validates auth before issuing it, and receives a completion webhook to persist the Blob URL to Postgres.

**When to use:** Files larger than 4.5 MB (Next.js server action limit). All artwork images will likely exceed this.

**Trade-offs:** Requires a public callback URL for `onUploadCompleted`; in local dev, `onUploadCompleted` does not fire without a tunnel (ngrok). For local dev, persist the URL from the client-side response instead.

**Example (Route Handler):**
```typescript
// app/api/upload/route.ts
import { handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { validateAdminSession } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json()
  const session = // validate from cookie
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const response = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
      addRandomSuffix: true,
    }),
    onUploadCompleted: async ({ blob }) => {
      // Persist blob.url to DB after upload
      await db.insertProductImage({ url: blob.url })
    },
  })

  return NextResponse.json(response)
}
```

### Pattern 4: next-intl with Domain-Aware Locale Routing

**What:** next-intl middleware handles locale detection and message loading. In a multi-tenant context, compose it with the domain routing middleware — domain check runs first, then the locale prefix is resolved.

**When to use:** TR + EN support across all three domains.

**Trade-offs:** Middleware composition (domain → locale) adds ~10 lines. The `app-router-tenants` example from next-intl's learn site covers this exact pattern. Do not use next-intl's built-in `domains` config for this project since subdomains are not purely locale-driven here.


## Data Flow

### Request Flow: Main Site Product Page

```
Browser requests uarttasarim.com/tr/galeri/tablolar
        ↓
middleware.ts (edge)
  → hostname = "uarttasarim.com" → variant = "main"
  → locale = "tr"
  → rewrite to /_main/tr/galeri/tablolar
        ↓
(main)/[locale]/galeri/[category]/page.tsx (RSC)
  → await getProductsByCategory("tablolar", locale)
        ↓
lib/db.ts → Vercel Postgres
  → SELECT * FROM products WHERE category = 'tablolar'
        ↓
Server Component renders HTML → response to browser
```

### Request Flow: Admin Image Upload

```
Admin fills product form, selects image file
        ↓
components/admin/image-uploader.tsx (Client Component)
  → upload(filename, file, { handleUploadUrl: '/api/upload' })
        ↓
/api/upload Route Handler
  → validates admin session cookie
  → calls handleUpload() → returns client token
        ↓
@vercel/blob SDK (browser)
  → PUT file directly to Vercel Blob CDN
        ↓
onUploadCompleted webhook → /api/upload
  → db.insertProductImage({ url: blob.url, productId })
        ↓
Admin UI receives blob.url → shows preview
```

### Request Flow: Artist Contact Form

```
Visitor submits form on seref.uarttasarim.com/en/iletisim
        ↓
components/artist/contact-form.tsx
  → POST /api/iletisim { artist: "seref", locale: "en", ...fields }
        ↓
/api/iletisim Route Handler
  → inserts into messages table (artist_id, name, email, message)
  → optionally sends email notification
        ↓
Response: 200 OK → form shows success state
```

### State Management

This project has minimal client-side state. The App Router RSC model handles most data flow server-side.

```
Vercel Postgres (source of truth)
    ↓  (Server Component reads)
Page renders with data embedded in HTML
    ↓  (Client interaction)
Client Component (form, gallery) ←→ Server Action or Route Handler
                                            ↓
                                     Mutates Postgres/Blob
                                            ↓
                                     router.refresh() or revalidatePath()
```


## Database Schema

```sql
-- Artists (Melike, Seref)
CREATE TABLE artists (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,          -- "melike" | "seref"
  name_tr     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  bio_tr      TEXT,
  bio_en      TEXT,
  photo_url   TEXT,                          -- Vercel Blob URL
  email       TEXT,
  whatsapp    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Products (artwork for sale on main site)
CREATE TABLE products (
  id           SERIAL PRIMARY KEY,
  artist_id    INT REFERENCES artists(id),
  slug         TEXT UNIQUE NOT NULL,
  title_tr     TEXT NOT NULL,
  title_en     TEXT NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  category     TEXT NOT NULL,               -- "tablo" | "heykel" | "seramik" | "baski" etc.
  price        NUMERIC(10,2),
  currency     TEXT DEFAULT 'TRY',
  is_sold      BOOLEAN DEFAULT false,
  is_visible   BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Product images (multiple per product, ordered)
CREATE TABLE product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,               -- Vercel Blob URL
  alt_tr      TEXT,
  alt_en      TEXT,
  sort_order  INT DEFAULT 0
);

-- Artist portfolio (separate from products — personal works shown on subdomain CV)
CREATE TABLE portfolio_items (
  id          SERIAL PRIMARY KEY,
  artist_id   INT REFERENCES artists(id),
  title_tr    TEXT,
  title_en    TEXT,
  year        INT,
  medium_tr   TEXT,
  medium_en   TEXT,
  image_url   TEXT NOT NULL,
  sort_order  INT DEFAULT 0
);

-- Exhibitions / events / awards
CREATE TABLE exhibitions (
  id          SERIAL PRIMARY KEY,
  artist_id   INT REFERENCES artists(id),
  type        TEXT NOT NULL,              -- "sergi" | "odul" | "etkinlik"
  title_tr    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  location    TEXT,
  year        INT,
  sort_order  INT DEFAULT 0
);

-- Contact messages
CREATE TABLE messages (
  id          SERIAL PRIMARY KEY,
  artist_id   INT REFERENCES artists(id), -- NULL if from main site
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  body        TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Admin session (simple, no user table needed — single admin)
CREATE TABLE admin_sessions (
  id          TEXT PRIMARY KEY,           -- random token
  expires_at  TIMESTAMPTZ NOT NULL
);
```

**Schema rationale:**
- `_tr` / `_en` column pairs for all user-facing text: simplest i18n approach at this scale, avoids a translation join table.
- Products and portfolio items are separate tables because main-site products have price/sold status, while CV portfolio items are curated personal works without commerce metadata.
- Single admin session table with no user table — there is only one admin per project scope.


## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel Blob | `@vercel/blob` SDK — client upload via token exchange | `BLOB_READ_WRITE_TOKEN` env var; images served from Vercel CDN |
| Vercel Postgres | `@vercel/postgres` SQL client in lib/db.ts | Pool is auto-managed; no connection pooler config needed at this scale |
| next-intl | Middleware + `getTranslations()` in Server Components | TR/EN message JSON files in /messages/ |
| WhatsApp | URL link: `https://wa.me/{number}?text=...` | No API needed; plain href with pre-filled product info |
| Email (contact form) | Resend API or Nodemailer via Route Handler | Optional; messages are persisted to DB regardless |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| middleware → route groups | NextResponse.rewrite() | One-way; middleware does not import app code |
| Server Components → DB | Direct async calls via lib/db.ts | No intermediate API layer needed for reads |
| Client Components → Server | Server Actions (mutations) or Route Handlers | Admin forms use Server Actions; file upload uses Route Handler |
| Admin → Blob | Client-side upload SDK → /api/upload Route Handler | Auth checked in Route Handler before token is issued |
| (main) ↔ (artist) | None at runtime — they share DB and components/shared | No cross-domain communication; each domain is self-contained |


## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current monolith is ideal. No caching beyond Next.js defaults needed. |
| 1k-10k users | Add `unstable_cache` or `revalidateTag` on product queries. Vercel Edge Cache handles image CDN. |
| 10k+ users | Vercel Postgres connection limits may require Neon's connection pooler explicitly. Consider ISR for product pages. |

**First bottleneck:** DB connection exhaustion on Vercel Postgres (Neon) under high concurrent load. Mitigation: use `@vercel/postgres` which pools automatically; add ISR to product pages to reduce DB hits.


## Anti-Patterns

### Anti-Pattern 1: Separate Next.js Projects Per Domain

**What people do:** Create three separate Next.js apps, one per domain.
**Why it's wrong:** Code duplication, three deployment pipelines, can't share components or DB client, admin panel must be duplicated.
**Do this instead:** Single project with middleware-based domain routing. This is the pattern Vercel explicitly recommends and supports via the Platforms Starter Kit.

### Anti-Pattern 2: Dynamic Route `[domain]` at Top Level Instead of Middleware Rewrite

**What people do:** Use a root `[domain]/[locale]/` catch-all route and read `params.domain` in every page.
**Why it's wrong:** Leaks domain logic into every page component; visible in URLs; makes route grouping impossible; layouts cannot differ per domain.
**Do this instead:** Middleware rewrites to opaque internal paths; pages never see the original hostname.

### Anti-Pattern 3: Storing Images as Base64 in Postgres

**What people do:** Save uploaded artwork images directly into the database as base64 strings.
**Why it's wrong:** Massively inflates DB size, kills query performance, no CDN caching, defeats Vercel Blob's purpose.
**Do this instead:** Upload to Vercel Blob, store only the URL string in Postgres.

### Anti-Pattern 4: One Giant Translation File

**What people do:** Put all TR and EN strings in a single flat `messages.json`.
**Why it's wrong:** Grows unwieldy; no namespace separation; all translations loaded for every page.
**Do this instead:** next-intl namespace splitting — `common.json`, `main.json`, `artist.json`, `admin.json` — loaded per route group.

### Anti-Pattern 5: Putting Admin Auth in Client Components Only

**What people do:** Guard the admin UI with a client-side `useEffect` redirect.
**Why it's wrong:** HTML renders before the JS redirect fires; content is briefly visible; not a real security boundary.
**Do this instead:** Auth check in middleware.ts (cookie validation) before the request ever reaches the admin route group.


## Suggested Build Order

The component boundaries create a natural dependency chain:

1. **Middleware + route group scaffolding** — establishes domain routing; everything else depends on requests reaching the right place.
2. **DB schema + lib/db.ts** — data layer must exist before any page can render real data.
3. **Shared components** — navbar, footer, typography system; consumed by all route groups.
4. **Main site (main) route group** — product listing and detail pages; highest visibility, tests DB + image display.
5. **Artist CV (artist) route group** — bio, portfolio, exhibitions; shares gallery components from step 3.
6. **Admin panel (admin) route group** — CRUD forms, image upload pipeline; builds on DB layer and Blob integration.
7. **i18n wiring** — add next-intl translation keys throughout; less risky as a final pass than interleaving with feature work.
8. **Contact forms + messaging** — Route Handlers for form submission; depends on messages table (step 2) and admin inbox (step 6).


## Sources

- [Next.js Multi-Tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant) — Official, HIGH confidence
- [Vercel Multi-Tenant Guide](https://vercel.com/guides/nextjs-multi-tenant-application) — Official, HIGH confidence
- [Vercel Platforms Starter Kit](https://vercel.com/templates/next.js/platforms-starter-kit) — Reference implementation
- [Vercel Blob Client Upload Docs](https://vercel.com/docs/vercel-blob/client-upload) — Official, HIGH confidence
- [next-intl Middleware Docs](https://next-intl.dev/docs/routing/middleware) — Official, HIGH confidence
- [Subdomain Routing in Next.js (Medium)](https://trillionclues.medium.com/subdomains-in-next-js-14-how-to-structure-a-scalable-multitenant-frontend-application-f68edc526a60) — Community, MEDIUM confidence
- [next-intl app-router-tenants composition pattern](https://next-intl.dev/docs/routing/middleware) — Referenced in official docs, MEDIUM confidence

---
*Architecture research for: U-Art Tasarım — multi-domain art gallery platform*
*Researched: 2026-03-22*
