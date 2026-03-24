# Phase 2: Ana Galeri - Research

**Researched:** 2026-03-24
**Domain:** Next.js App Router gallery listing, artwork detail page, lightbox, WhatsApp CTA, contact form with Server Actions
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAL-01 | Kullanıcı eserleri kategoriye göre filtreleyerek grid'de görüntüleyebilir | URL-based category filter via `searchParams`, Drizzle `where` clause on `products.category`, `router.replace()` for no-JS-fallback filter buttons |
| GAL-02 | Kullanıcı eser detay sayfasında başlık, teknik, boyut, yıl ve fiyat bilgilerini görebilir | `products` + `productImages` tables already in schema; detail page at `(main)/[locale]/urun/[slug]/page.tsx` fetches full record |
| GAL-03 | Kullanıcı eserleri lightbox ile tam ekran zoom yaparak inceleyebilir | `yet-another-react-lightbox` already in stack; Zoom plugin + custom `next/image` render slide; pinch-zoom built-in on mobile |
| GAL-04 | Kullanıcı eser sayfasından WhatsApp ile ön doldurulmuş mesajla iletişim kurabilir | `wa.me/{number}?text=...` href — no API; `artists.whatsapp` field in schema; text pre-filled with artwork title + page URL |
| GAL-05 | Kullanıcı eser sayfasından iletişim formu ile soru gönderebilir | `messages` table in schema (artistId nullable for main-site); Server Action inserts row; `react-hook-form` + `zod` already in stack |
</phase_requirements>

---

## Summary

Phase 2 delivers the entire public-facing gallery: category-filtered artwork grid, individual artwork detail pages, lightbox zoom, WhatsApp contact, and a contact form. All foundational infrastructure is already in place from Phase 1 — the DB schema, Drizzle client, next-intl routing, middleware, and route group layouts are complete. Phase 2 is purely additive: it fills `(main)/[locale]/` with real pages and wires them to real data.

The pattern is straightforward: Server Components query Drizzle for products/images, render them as HTML, and hand off to two thin Client Components — the lightbox (requires browser APIs) and the contact form (requires `react-hook-form`). The Server Action pattern for the contact form insert is already validated in the stack research and follows the same auth-free path as the Vercel Blob upload stub (route handler → DB mutation). The lightbox library (`yet-another-react-lightbox`) is already installed and has an official Next.js integration guide.

No new dependencies are needed for this phase. The only integration point that requires care is the `yet-another-react-lightbox` render slide override using `next/image` — the library's default `<img>` does not go through Vercel's image CDN, so the override is mandatory. The WhatsApp CTA is a plain `<a href>` with `wa.me/` deep link: zero dependencies, zero API.

**Primary recommendation:** Implement as three Server Component pages (gallery index, category filter variant, artwork detail) plus two Client Component islands (lightbox, contact form). Use `searchParams` for category filtering — no client state, no `useState`, full URL shareability and back-button support.

---

## Standard Stack

### Core (already installed — no additions needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.2.1 | Server Components, `searchParams`, Server Actions | Already scaffold |
| Drizzle ORM | 0.45.1 | Query `products`, `productImages`, `messages` tables | Already configured with Neon |
| yet-another-react-lightbox | 3.29.1 | Lightbox + pinch-zoom | Already installed per STACK.md |
| react-hook-form | 7.x | Contact form state | Already installed |
| zod | 4.3.6 | Contact form validation schema | Already installed |
| @hookform/resolvers | 5.2.2 | RHF ↔ Zod bridge | Already installed |
| next-intl | 4.8.3 | `useTranslations` / `getTranslations` | Already configured |
| next/image | built-in | Artwork images via Vercel Blob CDN | remotePatterns configured |

### yet-another-react-lightbox Plugins Needed

| Plugin | Purpose | Import |
|--------|---------|--------|
| Zoom | Pinch-zoom + click-to-zoom (GAL-03) | `import Zoom from "yet-another-react-lightbox/plugins/zoom"` |
| Captions | Show artwork title in lightbox (UX) | `import Captions from "yet-another-react-lightbox/plugins/captions"` |

Note: `Fullscreen` plugin is optional — the Zoom plugin alone satisfies GAL-03's "tam ekran inceleyebilir" criterion.

### No New Dependencies Required

All libraries needed for Phase 2 were installed in Phase 1. Phase 2 adds zero entries to `package.json`.

---

## Architecture Patterns

### Recommended File Structure for Phase 2

```
src/
├── app/
│   └── (main)/
│       └── [locale]/
│           ├── galeri/
│           │   └── page.tsx              # GAL-01: gallery listing + category filter
│           └── urun/
│               └── [slug]/
│                   └── page.tsx          # GAL-02, GAL-03, GAL-04, GAL-05
├── components/
│   └── gallery/
│       ├── artwork-card.tsx              # Server Component — single artwork thumbnail
│       ├── artwork-grid.tsx              # Server Component — wraps artwork-card list
│       ├── category-filter.tsx           # Client Component — filter buttons
│       ├── lightbox-viewer.tsx           # Client Component — yet-another-react-lightbox
│       └── contact-form.tsx             # Client Component — RHF + zod + Server Action
└── lib/
    └── actions/
        └── contact.ts                    # Server Action: insert into messages table
```

### Pattern 1: URL-Based Category Filter (GAL-01)

**What:** Category filter reads and writes `?category=` search param. Page is a Server Component; switching category triggers a navigation that re-renders the page with filtered data. No `useState`, no client hydration for the grid.

**When to use:** Any server-side filter that can be expressed as a URL parameter.

**Why URL, not useState:**
- The filtered URL is shareable and bookmarkable
- Back/forward button works correctly
- Zero JS fallback: a plain `<form method="GET">` works without JavaScript
- Server renders the correct HTML for each filter state — no flash of unfiltered content

**Example:**
```typescript
// src/app/(main)/[locale]/galeri/page.tsx
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default async function GaleriPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const where = and(
    eq(products.isVisible, true),
    category ? eq(products.category, category) : undefined,
  )
  const eserleri = await db.query.products.findMany({
    where,
    with: { images: { limit: 1, orderBy: (img, { asc }) => [asc(img.sortOrder)] } },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  })
  return (
    <>
      <CategoryFilter active={category ?? null} />
      <ArtworkGrid eserleri={eserleri} />
    </>
  )
}
```

**CategoryFilter as Client Component:**
```typescript
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// Wraps in <Suspense> in the Server Component parent to avoid
// the static generation bail-out warning from useSearchParams
export function CategoryFilter({ active }: { active: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function select(cat: string | null) {
    const p = new URLSearchParams(params.toString())
    if (cat) p.set('category', cat)
    else p.delete('category')
    router.replace(`${pathname}?${p.toString()}`)
  }
  // ... render buttons
}
```

**CRITICAL: Wrap `<CategoryFilter>` in `<Suspense>` in the page.** Next.js requires this when a Client Component reads `useSearchParams()`. Without it the entire page bails out of static generation and emits a build warning.

### Pattern 2: Artwork Detail Page — Server Component with Client Islands (GAL-02, GAL-03, GAL-04, GAL-05)

**What:** The detail page is a Server Component that fetches the full product record (with all images) from Drizzle. It renders the metadata statically and passes the image URLs to two Client Component islands: LightboxViewer and ContactForm.

**Why two separate islands:** The lightbox requires browser APIs (`window`, touch events). The form requires `react-hook-form` and `useState` for submission state. Keeping them as isolated `'use client'` islands minimises the JS bundle sent to the browser — the surrounding metadata (title, technique, price) remains server-rendered HTML.

```typescript
// src/app/(main)/[locale]/urun/[slug]/page.tsx
import { db } from '@/lib/db'
import { products, productImages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { LightboxViewer } from '@/components/gallery/lightbox-viewer'
import { ContactForm } from '@/components/gallery/contact-form'

export default async function UrunDetayPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const eser = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] },
      artist: true,
    },
  })
  if (!eser || !eser.isVisible) notFound()

  const title = locale === 'tr' ? eser.titleTr : eser.titleEn
  // ... render metadata, LightboxViewer, WhatsApp href, ContactForm
}
```

### Pattern 3: yet-another-react-lightbox with next/image Render Override (GAL-03)

**What:** The lightbox library renders slides using a custom `render.slide` prop, replacing the default `<img>` with a `next/image` component. This ensures all lightbox images are served from Vercel's CDN with WebP conversion.

**Why mandatory:** The default lightbox render uses a plain `<img>` tag. Vercel CDN optimization only activates for images rendered via `next/image`. For an art gallery, serving unoptimized 3–8 MB original JPEGs in the lightbox would severely degrade performance.

```typescript
// src/components/gallery/next-image-slide.tsx
'use client'
import Image from 'next/image'
import type { RenderSlideProps, SlideImage } from 'yet-another-react-lightbox'
import { isImageFitCover, isImageSlide, useLightboxProps } from 'yet-another-react-lightbox'

export function NextImageSlide({ slide, offset, rect }: RenderSlideProps) {
  const { imageFit } = useLightboxProps().carousel
  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit)
  if (!isImageSlide(slide)) return undefined
  const width = !cover ? Math.round(Math.min(rect.width, (rect.height / (slide.height ?? 1)) * (slide.width ?? 1))) : rect.width
  const height = !cover ? Math.round(Math.min(rect.height, (rect.width / (slide.width ?? 1)) * (slide.height ?? 1))) : rect.height
  return (
    <div style={{ position: 'relative', width, height }}>
      <Image
        fill
        alt={slide.alt ?? ''}
        src={slide.src}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        style={{ objectFit: cover ? 'cover' : 'contain' }}
      />
    </div>
  )
}
```

```typescript
// src/components/gallery/lightbox-viewer.tsx
'use client'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import { NextImageSlide } from './next-image-slide'

// Source: https://yet-another-react-lightbox.com/examples/nextjs
```

### Pattern 4: WhatsApp CTA (GAL-04)

**What:** A plain `<a>` tag pointing to `https://wa.me/{number}?text={encodedText}`. The text is pre-filled with the artwork title and the current page URL. No JavaScript required, no API, no library.

**Number source:** `artists.whatsapp` column in DB (already in schema). Fetched server-side on the detail page.

```typescript
// Inside the Server Component detail page
function whatsAppHref(phone: string, artworkTitle: string, pageUrl: string) {
  const text = `Merhaba, "${artworkTitle}" eseri hakkında bilgi almak istiyorum: ${pageUrl}`
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}
```

**Format requirement:** `wa.me` numbers must be in international format without `+` or spaces (e.g. `905551234567`). Strip all non-digits from the stored number before constructing the URL.

### Pattern 5: Contact Form with Server Action (GAL-05)

**What:** A `'use client'` form component using `react-hook-form` + `zod` validation. On submit, it calls a Server Action that validates the input with the same Zod schema and inserts a row into the `messages` table.

**Why Server Action over Route Handler:** Server Actions are the App Router standard for form mutations. They eliminate the need for a separate `/api/contact` route and allow direct Drizzle calls on the server. The `messages` table is already in the schema with `artistId` nullable (NULL = main site inquiry).

```typescript
// src/lib/actions/contact.ts
'use server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'

const contactSchema = z.object({
  senderName: z.string().min(2).max(100),
  senderEmail: z.string().email(),
  body: z.string().min(10).max(2000),
  productId: z.number().optional(),   // for metadata in admin inbox
})

export async function submitContact(data: z.infer<typeof contactSchema>) {
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() }

  await db.insert(messages).values({
    artistId: null,          // main site — no artist assignment
    senderName: parsed.data.senderName,
    senderEmail: parsed.data.senderEmail,
    body: parsed.data.body,
  })
  return { success: true }
}
```

### Pattern 6: Seed Data for Development

Phase 2 pages need real DB data to render. The schema defines the tables but they are empty. A seed script (or manual `drizzle-kit studio` insert) is needed to populate:
- At least 2 `artists` rows (melike, seref)
- At least 4–6 `products` rows across 2+ categories
- At least 1 `productImages` row per product

**Approach:** Add a `src/lib/db/seed.ts` script runnable with `npx tsx src/lib/db/seed.ts`. This avoids any production data dependency.

### Anti-Patterns to Avoid

- **`useState` for category filter:** Don't hold category in client state. Use URL search params. Client state breaks shareable URLs and SSR data fetching.
- **Using lightbox default `<img>` render:** Must override with `next/image`. Default render bypasses CDN.
- **Phone number hardcoded in component:** Read from `artists.whatsapp` in DB. Hardcoding creates admin maintenance burden.
- **Route Handler for contact form:** Use Server Action instead — simpler, no extra route file, direct DB access.
- **Loading all products then filtering client-side:** Filter at the DB query level (`WHERE category = ?`). Client-side filtering means fetching all artwork on every page load.
- **`'use client'` on the detail page itself:** The detail page must be a Server Component. Only the lightbox viewer and contact form get `'use client'`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image lightbox with zoom | Custom modal with touch events | `yet-another-react-lightbox` + Zoom plugin | Pinch-to-zoom, keyboard nav, accessibility, focus trap, mobile touch — hundreds of edge cases |
| Form validation | Custom validation functions | Zod + @hookform/resolvers | Type-safe, composable, shared between client and server |
| Image CDN optimization | Manual image resizing | `next/image` with Vercel CDN | Auto WebP/AVIF, lazy loading, responsive sizes, CLS prevention |
| WhatsApp deep link | Custom integration | `wa.me/` URL scheme | WhatsApp provides this natively; no API, no library |

**Key insight:** Every custom-built solution in this domain has been superseded by a well-maintained library. The only bespoke code in this phase is data-fetching queries and layout composition.

---

## Common Pitfalls

### Pitfall 1: `useSearchParams()` without `<Suspense>` boundary

**What goes wrong:** Build succeeds locally but emits a warning; in production, Next.js bails the entire page out of static generation, adding unnecessary dynamic rendering cost.

**Why it happens:** Next.js requires that Client Components reading `useSearchParams()` be wrapped in `<Suspense>` because the search params are not known at build time.

**How to avoid:** Always wrap `<CategoryFilter>` (and any other component that calls `useSearchParams()`) in a `<Suspense fallback={...}>` in the parent Server Component.

**Warning signs:** Build output shows `"useSearchParams() should be wrapped in a suspense boundary"`.

### Pitfall 2: lightbox CSS import missing

**What goes wrong:** Lightbox opens but has no backdrop, mispositioned arrows, or invisible navigation controls.

**Why it happens:** The library requires explicit CSS imports. Tree-shaking removes them unless explicitly imported.

**How to avoid:** In the lightbox Client Component file, always include:
```typescript
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'  // if using Captions
```

### Pitfall 3: `wa.me` number format

**What goes wrong:** WhatsApp link opens the app but shows "phone number not valid" or fails silently on iOS.

**Why it happens:** `wa.me` requires the number in international format, all digits, no `+`, no spaces, no dashes (e.g. `905551234567` for a Turkish number, not `+90 555 123 45 67`).

**How to avoid:** Normalise the stored number: `phone.replace(/\D/g, '')`. The `artists.whatsapp` column can accept any format; normalise at render time.

### Pitfall 4: `db.query.products.findMany` with relations fails without `schema` in Drizzle client

**What goes wrong:** Using `db.query.products.findMany({ with: { images: true } })` throws "Cannot read properties of undefined (reading 'findMany')".

**Why it happens:** The relational query API (`db.query.*`) requires Drizzle to be initialised with the full schema object via `drizzle(sql, { schema })`. If the schema import is missing from `lib/db/index.ts`, the `query` namespace is undefined.

**How to avoid:** `src/lib/db/index.ts` already passes `{ schema }` — **verify this is not accidentally removed**. The current file confirms it: `export const db = drizzle(sql, { schema })`.

**Also required:** Add explicit Drizzle relations to `schema.ts` using `relations()`. The schema currently has FK columns but no `relations()` calls. Without them, `with: { images: true }` will fail at runtime even with schema passed.

```typescript
// Must add to src/lib/db/schema.ts
import { relations } from 'drizzle-orm'

export const productsRelations = relations(products, ({ many, one }) => ({
  images: many(productImages),
  artist: one(artists, { fields: [products.artistId], references: [artists.id] }),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))
```

**This schema addition is a Wave 0 task for Phase 2.** Without it, relational queries do not work.

### Pitfall 5: `searchParams` is async in Next.js 16

**What goes wrong:** `searchParams.category` is undefined even when the URL has `?category=tablo`.

**Why it happens:** In Next.js 15+, `searchParams` passed to a page component is a `Promise`. Must be `await`ed.

**How to avoid:** Always `await searchParams`:
```typescript
export default async function GaleriPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
```

### Pitfall 6: Missing `productId` / artwork context in contact form message

**What goes wrong:** Admin inbox shows messages with no indication of which artwork the buyer was asking about.

**Why it happens:** The contact form only captures name/email/body without storing which product prompted the inquiry.

**How to avoid:** Pass `product.id` and `product.slug` as hidden fields or as a Server Action argument. Store in `messages.body` as context prefix, or add a `product_id` column. Given the schema already has `artistId` nullable, the simplest approach is prefixing the body: `"[Eser: {title} - {slug}]\n\n{userMessage}"`.

---

## Code Examples

### Drizzle Relational Query — Products with Primary Image

```typescript
// Source: Drizzle ORM relational queries docs (drizzle-orm.com/docs/rqb)
const eserleri = await db.query.products.findMany({
  where: and(
    eq(products.isVisible, true),
    category ? eq(products.category, category) : undefined,
  ),
  with: {
    images: {
      limit: 1,
      orderBy: (img, { asc }) => [asc(img.sortOrder)],
    },
  },
  orderBy: (p, { desc }) => [desc(p.createdAt)],
})
```

### yet-another-react-lightbox — Minimal Working Setup

```typescript
// Source: https://yet-another-react-lightbox.com/examples/nextjs
'use client'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

export function LightboxViewer({ slides }: { slides: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(-1)
  return (
    <>
      {slides.map((s, i) => (
        <button key={s.src} onClick={() => setIndex(i)}>
          {/* thumbnail rendered with next/image here */}
        </button>
      ))}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom]}
        render={{ slide: NextImageSlide }}
      />
    </>
  )
}
```

### Server Action — Contact Form Submit

```typescript
// Server Action pattern — Next.js App Router
'use server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'

const schema = z.object({
  senderName: z.string().min(2).max(100),
  senderEmail: z.string().email(),
  body: z.string().min(10).max(2000),
})

export async function submitContact(
  _prevState: unknown,
  formData: FormData,
) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() }
  await db.insert(messages).values({
    artistId: null,
    senderName: parsed.data.senderName,
    senderEmail: parsed.data.senderEmail,
    body: parsed.data.body,
  })
  return { success: true }
}
```

### WhatsApp Href Construction

```typescript
// No library needed — plain URL construction
function buildWhatsAppHref(phone: string, title: string, pageUrl: string): string {
  const normalised = phone.replace(/\D/g, '') // strip non-digits
  const text = `Merhaba, "${title}" eseri hakkında bilgi almak istiyorum.\n${pageUrl}`
  return `https://wa.me/${normalised}?text=${encodeURIComponent(text)}`
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSideProps` for data fetching | async Server Components | Next.js 13+ App Router | No separate function — just `await` in component body |
| `pages/api/contact.ts` Route Handler for forms | Server Actions (`'use server'`) | Next.js 13.4+ | One file, direct DB call, no fetch boilerplate |
| `searchParams` as string in page props | `searchParams: Promise<...>` awaited | Next.js 15+ | Must await; breaking change vs Next.js 14 |
| react-image-lightbox | yet-another-react-lightbox | 2022–2023 | Old library unmaintained; new one has next/image integration |
| SWR / React Query for gallery data | Server Component with Drizzle | 2023+ | Zero client JS for read-only data fetching |

**Deprecated/outdated in this codebase:**
- `pages/` router: already excluded — all work in `app/`
- `getStaticProps` / `generateStaticParams` for artwork pages: not needed for Phase 2 (dynamic rendering is fine; ISR is a Phase 3+ optimisation)

---

## Open Questions

1. **Schema: `products` table is missing `year`, `medium` (teknik), and `dimensions` (boyut) columns**
   - What we know: GAL-02 requires "başlık, teknik, boyut, yıl ve fiyat" on the detail page. The `products` table has `title`, `price`, `category`, and `description` but NOT `year`, `medium` (separate from category), or `dimensions`.
   - What's unclear: Did the architecture research intend `category` to double as `medium`? Or are these separate fields?
   - Recommendation: Add `year INT`, `dimensionsTr TEXT`, `dimensionsEn TEXT`, `mediumTr TEXT`, `mediumEn TEXT` columns to the `products` table as a schema migration in Wave 0 of this phase. `category` is a grouping field (tablo/seramik); `medium` is descriptive text (e.g. "Yağlıboya / Oil on canvas"). They are different.

2. **Seed data strategy**
   - What we know: Phase 2 pages need real data to render and be testable
   - What's unclear: No seed script exists yet
   - Recommendation: Include a seed script (`src/lib/db/seed.ts` runnable with `npx tsx`) as a Wave 0 task. Vercel/Neon DB must have artists + products to validate the gallery.

3. **Category list: hardcoded or DB-derived?**
   - What we know: `products.category` is a free-text column; filter buttons need a known set of values
   - What's unclear: Should category options be a hardcoded constant or a `SELECT DISTINCT category FROM products`?
   - Recommendation: Use `SELECT DISTINCT` for now — simple, no maintenance. Switch to an enum or config array when admin CRUD is added in Phase 5.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + ts-jest 29.4.6 |
| Config file | `jest.config.ts` (root) |
| Quick run command | `pnpm test -- --testPathPatterns=gallery` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAL-01 | Category filter passes correct `where` clause to Drizzle | unit | `pnpm test -- --testPathPatterns=gallery-queries` | ❌ Wave 0 |
| GAL-01 | `CategoryFilter` component renders active category as selected | unit | `pnpm test -- --testPathPatterns=category-filter` | ❌ Wave 0 |
| GAL-02 | Detail page renders metadata fields (title, medium, dimensions, year, price) | unit (RSC mock) | `pnpm test -- --testPathPatterns=artwork-detail` | ❌ Wave 0 |
| GAL-03 | LightboxViewer opens on thumbnail click | manual-only | — | manual |
| GAL-03 | LightboxViewer receives `slides` array with correct `src` values | unit | `pnpm test -- --testPathPatterns=lightbox-viewer` | ❌ Wave 0 |
| GAL-04 | `buildWhatsAppHref` strips non-digits, encodes text correctly | unit | `pnpm test -- --testPathPatterns=whatsapp` | ❌ Wave 0 |
| GAL-05 | `submitContact` Server Action rejects invalid email | unit | `pnpm test -- --testPathPatterns=contact-action` | ❌ Wave 0 |
| GAL-05 | `submitContact` inserts a row and returns `{ success: true }` | unit (mock db) | `pnpm test -- --testPathPatterns=contact-action` | ❌ Wave 0 |

Note: GAL-03 lightbox open/close interaction is manual-only — Jest (jsdom) cannot replicate touch events reliably. The structural test (correct slide data passed to LightboxViewer) is automated.

### Sampling Rate

- **Per task commit:** `pnpm test -- --testPathPatterns=gallery`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/gallery-queries.test.ts` — covers GAL-01 filter logic
- [ ] `src/__tests__/category-filter.test.ts` — covers GAL-01 UI
- [ ] `src/__tests__/artwork-detail.test.ts` — covers GAL-02 metadata rendering
- [ ] `src/__tests__/lightbox-viewer.test.ts` — covers GAL-03 slide data
- [ ] `src/__tests__/whatsapp.test.ts` — covers GAL-04 href builder
- [ ] `src/__tests__/contact-action.test.ts` — covers GAL-05 Server Action
- [ ] Schema migration: add `year`, `mediumTr`, `mediumEn`, `dimensionsTr`, `dimensionsEn` to `products` table
- [ ] Schema addition: `productsRelations` and `productImagesRelations` in `schema.ts` (required for `db.query.*` with `with:`)
- [ ] Seed script: `src/lib/db/seed.ts` with artist + product data

---

## Sources

### Primary (HIGH confidence)

- `src/lib/db/schema.ts` — Existing Drizzle schema with 6 tables; direct inspection
- `src/lib/db/index.ts` — Drizzle client with `{ schema }` passed; direct inspection
- `src/middleware.ts` — Confirmed middleware structure; direct inspection
- `.planning/phases/01-foundation/01-01-SUMMARY.md` — tech-stack versions installed
- `.planning/phases/01-foundation/01-02-SUMMARY.md` — routing patterns established
- `.planning/research/STACK.md` — yet-another-react-lightbox v3.29.1 confirmed, next/image integration pattern
- [yet-another-react-lightbox Next.js example](https://yet-another-react-lightbox.com/examples/nextjs) — next/image render override pattern

### Secondary (MEDIUM confidence)

- `.planning/research/ARCHITECTURE.md` — WhatsApp `wa.me/` URL pattern, Server Action contact form pattern
- `.planning/research/FEATURES.md` — Category filter, lightbox, WhatsApp CTA feature specifications
- [Drizzle ORM relational queries docs](https://orm.drizzle.team/docs/rqb) — `relations()` requirement for `db.query.*`

### Tertiary (LOW confidence)

- None — all findings are grounded in the existing codebase or official documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed; confirmed from SUMMARY files
- Architecture: HIGH — data model in schema.ts inspected directly; patterns from ARCHITECTURE.md are authoritative
- Pitfalls: HIGH — schema gap (missing fields) and missing `relations()` identified by direct code inspection; Suspense/searchParams pitfalls from official Next.js docs
- Open questions: MEDIUM — year/medium/dimensions gap is confirmed missing from schema; category derivation strategy is a design decision not a technical unknown

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable stack; next-intl and yet-another-react-lightbox are stable releases)
