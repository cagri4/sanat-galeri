# Phase 5: Admin Paneli - Research

**Researched:** 2026-03-25
**Domain:** Next.js App Router Admin CRUD — Server Actions, Vercel Blob client upload, Drizzle ORM mutations
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADM-01 | Admin eser ekleyebilir, düzenleyebilir ve silebilir (fotoğraf yükleme dahil) | Server Actions for insert/update/delete on `products` + `product_images`; Vercel Blob client upload already wired via `/api/upload` route |
| ADM-02 | Admin sanatçı CV içeriklerini düzenleyebilir | Server Actions for `artists` (bio, statement, photo) + `exhibitions` (insert/update/delete rows) + `portfolio_items` (insert/update/delete rows) |
| ADM-03 | Admin gelen mesajları görüntüleyebilir | Query `messages` with JOIN to `artists`; product context extracted from body prefix `[Eser: slug]`; mark-as-read via `UPDATE messages SET is_read = true` |
</phase_requirements>

---

## Summary

Phase 5 builds the actual CRUD UI on top of the authentication scaffold created in Phase 1. The protected layout (`src/app/(admin)/(protected)/layout.tsx`) already enforces `await auth()` on every server render, and the Vercel Blob token exchange route (`/api/upload`) already validates the admin session. The dashboard page is a placeholder. This phase fills all three content areas: artwork CRUD, artist CV editing, and the message inbox.

The standard Next.js App Router pattern for admin panels combines Server Actions (mutations) with Client Components (forms). `react-hook-form` + `zod` are already installed and used by the existing contact form, so the same pattern is used for admin forms. Vercel Blob client upload (`upload()` from `@vercel/blob/client`) fires from a Client Component, receives the URL, then the Server Action stores it in Postgres — this sidesteps the 4.5 MB body limit on Server Actions.

The messages table stores product context as a text prefix `[Eser: slug]` in the body column (not a foreign key). For ADM-03, displaying which product a message relates to means parsing that prefix at render time. No schema migration is needed for ADM-03.

**Primary recommendation:** Use Server Actions with `revalidatePath()` for all mutations. Keep forms as Client Components using `react-hook-form`. Use the existing `/api/upload` route for image uploads — do NOT stream blobs through Server Actions.

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-hook-form` | ^7.72.0 | Form state, validation UX | Already installed; used in contact forms |
| `zod` | ^4.3.6 | Schema validation for Server Action inputs | Already installed; used in contact actions |
| `@hookform/resolvers` | ^5.2.2 | Bridges react-hook-form with zod | Already installed |
| `drizzle-orm` | ^0.45.1 | DB mutations (insert, update, delete) | Already installed; existing query layer |
| `@vercel/blob` | ^2.3.1 | Image upload to Blob CDN | Already installed; `/api/upload` route exists |
| `next-auth` | 5.0.0-beta.30 | Session check in Server Actions | Already installed; `auth()` used in layout |

### No New Dependencies Required

All libraries needed for Phase 5 are already present. No `npm install` step needed.

### Supporting Patterns

| Pattern | Purpose | Notes |
|---------|---------|-------|
| `revalidatePath()` | Invalidates Next.js RSC cache after mutation | Call inside Server Action after each DB write |
| `redirect()` | Navigate after form submit (e.g., create → edit) | Import from `next/navigation` inside Server Action |
| `upload()` from `@vercel/blob/client` | Browser-to-Blob direct upload | Already wired via `/api/upload` token exchange route |

---

## Architecture Patterns

### Recommended Admin Route Structure

```
src/app/(admin)/(protected)/
├── layout.tsx                  # EXISTING — auth() guard
├── dashboard/
│   └── page.tsx                # EXISTING placeholder — replace with nav links
├── urunler/
│   ├── page.tsx                # Product list (Server Component)
│   ├── yeni/
│   │   └── page.tsx            # New product form (Client Component)
│   └── [id]/
│       └── page.tsx            # Edit product form (Client Component)
├── sanatcilar/
│   ├── page.tsx                # Artist list (Server Component, links to each CV editor)
│   └── [slug]/
│       └── page.tsx            # Edit artist CV — bio, statement, exhibitions, portfolio
└── mesajlar/
    └── page.tsx                # Message inbox (Server Component + mark-read button)
```

### Admin Server Actions Structure

```
src/lib/actions/
├── contact.ts                  # EXISTING
├── product.ts                  # NEW — createProduct, updateProduct, deleteProduct
├── product-image.ts            # NEW — addProductImage, deleteProductImage, reorderImages
├── artist.ts                   # NEW — updateArtistBio, updateArtistStatement, updateArtistPhoto
├── exhibition.ts               # NEW — createExhibition, updateExhibition, deleteExhibition
├── portfolio.ts                # NEW — createPortfolioItem, deletePortfolioItem
└── message.ts                  # NEW — markMessageRead, getMessages (query, not mutation)
```

### Admin Query Layer

```
src/lib/queries/
├── gallery.ts                  # EXISTING — public queries (isVisible filter)
├── artist.ts                   # EXISTING — public queries
└── admin.ts                    # NEW — admin queries (no isVisible filter, includes all records)
```

### Pattern 1: Server Action with Auth Guard

Every Server Action that mutates data MUST verify the session. The auth layout guards the page render, but Server Actions are callable from any Client Component and must independently verify.

**What:** Call `auth()` at the top of every mutating Server Action, return early if no session.
**When to use:** Every `'use server'` function that writes to the DB.

```typescript
// src/lib/actions/product.ts
'use server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const productSchema = z.object({
  titleTr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  category: z.string().min(1),
  price: z.string().optional(),
  // ... other fields
})

export async function createProduct(data: z.infer<typeof productSchema>) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = productSchema.safeParse(data)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors }

  const slug = generateSlug(parsed.data.titleTr)
  const [newProduct] = await db.insert(products).values({
    ...parsed.data,
    slug,
    price: parsed.data.price ? parsed.data.price : null,
  }).returning({ id: products.id })

  revalidatePath('/admin/urunler')
  revalidatePath('/') // Invalidate public gallery
  redirect(`/admin/urunler/${newProduct.id}`)
}
```

### Pattern 2: Client Component Form with Server Action

Forms are Client Components. On submit, call the Server Action directly. Handle loading and error states in the component.

```typescript
// src/app/(admin)/(protected)/urunler/yeni/page.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProduct } from '@/lib/actions/product'

export default function NewProductPage() {
  const form = useForm({ resolver: zodResolver(productSchema) })

  async function onSubmit(data: ProductFormData) {
    const result = await createProduct(data)
    if (!result?.success && result?.errors) {
      // set field errors
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

### Pattern 3: Vercel Blob Upload → Server Action Saves URL

Upload happens browser-to-CDN. The blob URL is returned to the Client Component. The component then calls a Server Action to save the URL to Postgres. This is the ONLY correct pattern — do not pipe file bytes through a Server Action.

```typescript
// In a Client Component
import { upload } from '@vercel/blob/client'

async function handleImageUpload(file: File, productId: number) {
  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/upload', // existing route — validates auth
  })
  // blob.url is now on Vercel CDN
  await addProductImage({ productId, url: blob.url, altTr: '', altEn: '', sortOrder: 0 })
}
```

### Pattern 4: Mark-as-Read with Server Action

Simple update mutation — no form, just a button. Use a `form` element with a hidden input and a Server Action as the action attribute, or call the action from an `onClick` handler.

```typescript
// src/lib/actions/message.ts
'use server'
export async function markMessageRead(messageId: number) {
  const session = await auth()
  if (!session) return

  await db.update(messages)
    .set({ isRead: true })
    .where(eq(messages.id, messageId))

  revalidatePath('/admin/mesajlar')
}
```

### Anti-Patterns to Avoid

- **No auth guard in Server Actions:** The layout guard only protects rendering. Server Actions at `/api/action` are HTTP endpoints — always call `await auth()` at the top.
- **Streaming file bytes through Server Action:** Next.js has a 4.5 MB body limit on Server Actions. Use the existing `/api/upload` route for all image uploads.
- **Calling `revalidatePath()` without invalidating public pages:** After product create/update/delete, also invalidate `/` and `/galeri` so the public gallery reflects changes immediately.
- **Re-implementing the auth check:** Do NOT write a custom session cookie parser. Use `await auth()` from `@/auth` — it is already configured and tested.
- **Fetching admin data with the public queries:** `getProducts()` in `gallery.ts` filters `isVisible = true`. The admin product list must show ALL products including hidden ones. Use a separate admin query.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom regex/if-chains | `zod` + `react-hook-form` (already installed) | Already proven in contact forms; consistent error shape |
| Image CDN upload | Multipart POST to your own API | `upload()` from `@vercel/blob/client` + existing `/api/upload` route | Blob handles CDN, caching, and URL generation |
| Auth check | Cookie parsing / JWT decode | `await auth()` from `@/auth` | next-auth handles session lifecycle; already tested |
| Slug generation | Ad-hoc string manipulation | Simple utility function (3 lines) using `.toLowerCase().replace(/\s+/g, '-')` | No library needed; straightforward |
| Rich text editor | Custom textarea with HTML | Plain `<textarea>` | Bio and statement are plain text in the DB schema; no HTML stored |

**Key insight:** All critical infrastructure (auth, upload route, DB, form libraries) is already present. Phase 5 is primarily wiring existing pieces together.

---

## Common Pitfalls

### Pitfall 1: Server Action Auth Not Checked

**What goes wrong:** Admin form submits, Server Action mutates data without checking session. Any user who discovers the action URL can call it.
**Why it happens:** The protected layout `await auth()` only runs during page render, not when Server Actions are invoked directly.
**How to avoid:** First line of every mutating Server Action: `const session = await auth(); if (!session) return { success: false, error: 'Unauthorized' }`
**Warning signs:** Server Action file that imports `db` but does not import `auth`.

### Pitfall 2: Product Context in Messages Not Parsed

**What goes wrong:** The messages table has no `product_id` FK. Product context is stored as `[Eser: mavi-akin]` text prefix in `body`. If the admin inbox renders the raw body, the product context is buried in the message text.
**Why it happens:** Phase 2 decision to embed slug in body rather than add a FK column.
**How to avoid:** Parse the `[Eser: slug]` prefix out of `body` at render time. Show the slug as a badge, then show the remaining message body. A simple regex or `startsWith('[Eser:')` split is sufficient.
**Warning signs:** Inbox showing full raw body with `[Eser: slug]` prefix mixed into message text.

### Pitfall 3: Public Cache Not Invalidated After Admin Mutation

**What goes wrong:** Admin creates a new product, but the public gallery still shows the old list because Next.js RSC cache was not invalidated.
**Why it happens:** `revalidatePath('/admin/urunler')` only invalidates the admin list. Public gallery paths are separate.
**How to avoid:** In each product mutation action, call `revalidatePath('/', 'layout')` or specific paths like `revalidatePath('/[locale]/galeri', 'page')`. The simplest safe approach is `revalidatePath('/', 'layout')` which purges all routes.
**Warning signs:** Admin sees new product in `/admin/urunler` but public `/galeri` still shows old data.

### Pitfall 4: Drizzle `.returning()` Required for Post-Insert Redirect

**What goes wrong:** After `db.insert(products)`, you need the new product ID to redirect to the edit page. Drizzle does not return the inserted row by default.
**Why it happens:** Unlike ORMs that return the inserted record automatically, Drizzle requires explicit `.returning()`.
**How to avoid:** Always use `.returning({ id: products.id })` on insert operations that need the generated ID.

```typescript
const [newProduct] = await db.insert(products).values({...}).returning({ id: products.id })
redirect(`/admin/urunler/${newProduct.id}`)
```

**Warning signs:** `undefined` when trying to access the ID of a newly inserted row.

### Pitfall 5: Image Upload Before Product Exists

**What goes wrong:** On the "New Product" form, user tries to upload an image but `productId` doesn't exist yet (product hasn't been created).
**Why it happens:** `product_images` has a NOT NULL FK to `products.id`.
**How to avoid:** Two-step flow: (1) create the product record first with required fields, get back the ID, (2) redirect to the edit page where image upload is available. Alternatively, accept images on the edit page only (not new product page).

### Pitfall 6: Admin Queries Must Not Filter `isVisible`

**What goes wrong:** Admin product list calls `getProducts()` from `gallery.ts`, which filters `WHERE is_visible = true`. Hidden/draft products are invisible to admin.
**Why it happens:** Public queries apply visibility filters; the admin needs all records.
**How to avoid:** Add `src/lib/queries/admin.ts` with separate functions: `getAllProducts()` (no `isVisible` filter), `getProductById(id)`, `getAllMessages()`.

---

## Code Examples

### Drizzle Update Pattern (Artist Bio)

```typescript
// src/lib/actions/artist.ts
'use server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { artists } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateArtistBio(
  artistId: number,
  bioTr: string,
  bioEn: string,
) {
  const session = await auth()
  if (!session) return { success: false }

  await db.update(artists)
    .set({ bioTr, bioEn })
    .where(eq(artists.id, artistId))

  revalidatePath('/', 'layout') // invalidates all artist subdomain pages
  return { success: true }
}
```

### Drizzle Delete with Cascade

```typescript
// src/lib/actions/product.ts — delete product
export async function deleteProduct(productId: number) {
  const session = await auth()
  if (!session) return { success: false }

  // product_images has ON DELETE CASCADE — images deleted automatically
  await db.delete(products).where(eq(products.id, productId))

  revalidatePath('/', 'layout')
  redirect('/admin/urunler')
}
```

### Messages Query with Artist JOIN

```typescript
// src/lib/queries/admin.ts
import { db } from '@/lib/db'
import { messages, artists, products } from '@/lib/db/schema'
import { eq, desc, isNull } from 'drizzle-orm'

export async function getAllMessages() {
  return db.query.messages.findMany({
    orderBy: [desc(messages.createdAt)],
    with: {
      artist: true,
    },
  })
}
```

Note: `messages` does not have a `products` relation in the schema. Product context must be extracted from `body` using string parsing:

```typescript
// Utility to parse product slug from message body
function parseProductContext(body: string): { productSlug: string | null; cleanBody: string } {
  const match = body.match(/^\[Eser: ([^\]]+)\]\n\n/)
  if (match) {
    return { productSlug: match[1], cleanBody: body.slice(match[0].length) }
  }
  return { productSlug: null, cleanBody: body }
}
```

### Blob Upload + Image Save

```typescript
// In Client Component (image uploader)
import { upload } from '@vercel/blob/client'
import { addProductImage } from '@/lib/actions/product-image'

async function handleUpload(file: File, productId: number) {
  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
  })
  await addProductImage({
    productId,
    url: blob.url,
    altTr: '',
    altEn: '',
    sortOrder: 0,
  })
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `useActionState` hook for form state | Call Server Action directly in `handleSubmit` (react-hook-form pattern) | Simpler; consistent with existing `ContactForm` pattern in this codebase |
| `router.refresh()` for cache invalidation | `revalidatePath()` inside Server Action | More targeted; action controls its own cache invalidation |
| Route Handler for mutations | Server Actions | Less boilerplate; no fetch() call needed from client |

**Existing codebase decision (from Phase 2 decisions):** `ContactForm` calls `submitContact()` directly (not `useActionState`) for simpler async/await pattern. Phase 5 admin forms MUST follow the same pattern for consistency.

---

## Open Questions

1. **Product image reordering UX**
   - What we know: `product_images.sort_order` exists; the schema supports ordered images
   - What's unclear: Does the planner want drag-and-drop reordering or simple up/down buttons?
   - Recommendation: Simple up/down buttons are sufficient for a single-admin panel; no drag library needed

2. **Portfolio items vs product images — separate upload flows**
   - What we know: `portfolio_items.image_url` is a single field (not a `_images` table); `product_images` is a separate table with multiple rows per product
   - What's unclear: Does artist portfolio editing need image upload, or just text field updates?
   - Recommendation: Include image upload for `portfolio_items` (single image per item, upload to Blob, save URL)

3. **Artist photo upload**
   - What we know: `artists.photo_url` is a single field
   - What's unclear: Is artist photo uploaded separately from bio editing, or same form?
   - Recommendation: Include in the artist CV edit page as an image upload field alongside bio/statement

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30 + ts-jest |
| Config file | `jest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |
| Test location | `src/__tests__/*.test.ts` (node environment, no jsdom) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-01 | `createProduct` validates input, inserts row, rejects unauthorized | unit | `pnpm test -- --testPathPattern admin-product` | ❌ Wave 0 |
| ADM-01 | `updateProduct` validates, updates row, rejects unauthorized | unit | `pnpm test -- --testPathPattern admin-product` | ❌ Wave 0 |
| ADM-01 | `deleteProduct` removes row, rejects unauthorized | unit | `pnpm test -- --testPathPattern admin-product` | ❌ Wave 0 |
| ADM-02 | `updateArtistBio` validates, updates artists row, rejects unauthorized | unit | `pnpm test -- --testPathPattern admin-artist` | ❌ Wave 0 |
| ADM-02 | `createExhibition` / `deleteExhibition` insert/delete rows correctly | unit | `pnpm test -- --testPathPattern admin-exhibition` | ❌ Wave 0 |
| ADM-03 | `getAllMessages` returns messages with artist context | unit | `pnpm test -- --testPathPattern admin-messages` | ❌ Wave 0 |
| ADM-03 | `markMessageRead` updates `is_read`, rejects unauthorized | unit | `pnpm test -- --testPathPattern admin-messages` | ❌ Wave 0 |
| ADM-03 | `parseProductContext` extracts slug and clean body | unit | `pnpm test -- --testPathPattern admin-messages` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test -- --testPathPattern "admin-"` (runs only new admin tests)
- **Per wave merge:** `pnpm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/admin-product.test.ts` — covers ADM-01 (createProduct, updateProduct, deleteProduct)
- [ ] `src/__tests__/admin-artist.test.ts` — covers ADM-02 (updateArtistBio, createExhibition, deleteExhibition)
- [ ] `src/__tests__/admin-messages.test.ts` — covers ADM-03 (getAllMessages, markMessageRead, parseProductContext)

Test pattern to follow: same mock-db approach as `contact-action.test.ts` — mock `@/lib/db` and `@/auth`, test Server Action logic without real DB calls.

---

## Sources

### Primary (HIGH confidence)

- Codebase inspection: `src/lib/db/schema.ts` — authoritative schema; confirmed `messages` has no `product_id` FK
- Codebase inspection: `src/app/api/upload/route.ts` — confirmed Blob token exchange route exists and validates `auth()`
- Codebase inspection: `src/lib/actions/contact.ts` — confirms Server Action pattern used in this project (direct call, not `useActionState`)
- Codebase inspection: `src/app/(admin)/(protected)/layout.tsx` — confirms `await auth()` as double-layer guard
- Codebase inspection: `src/__tests__/contact-action.test.ts` — confirms test pattern (mock db, mock auth, test action logic)
- Codebase inspection: `package.json` — confirmed all needed packages already installed; no new dependencies required

### Secondary (MEDIUM confidence)

- Next.js App Router docs pattern: Server Actions with `revalidatePath()` is standard mutation pattern
- Vercel Blob docs: `upload()` from `@vercel/blob/client` for browser-to-CDN upload is the documented pattern
- Drizzle ORM docs: `.returning()` required for post-insert ID retrieval

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use
- Architecture: HIGH — patterns already established in Phases 1–4; this phase extends them
- Pitfalls: HIGH — most are directly observable from existing codebase decisions logged in STATE.md

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable stack; no fast-moving dependencies)
