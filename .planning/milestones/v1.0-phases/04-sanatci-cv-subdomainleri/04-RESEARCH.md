# Phase 4: Sanatçı CV Subdomainleri - Research

**Researched:** 2026-03-25
**Domain:** Next.js App Router — artist CV pages within (artist) route group; Drizzle ORM queries; i18n with next-intl; Server Actions; component reuse
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CV-01 | Kullanıcı sanatçının biyografisini ve fotoğrafını görebilir | `artists` table has `bioTr/bioEn` and `photoUrl`; artist page.tsx is a placeholder ready to replace |
| CV-02 | Kullanıcı sanatçının portfolyo galerisini görüntüleyebilir | `portfolioItems` table exists in schema but has no Drizzle relation defined yet; `LightboxViewer` reusable |
| CV-03 | Kullanıcı sanatçının sergi listesini (solo/grup, ters kronolojik) görebilir | `exhibitions` table has `type` column for solo/group/award; needs enum clarification |
| CV-04 | Kullanıcı sanatçının ödüllerini görebilir | Same `exhibitions` table with `type = 'odul'`; shares query layer |
| CV-05 | Kullanıcı sanatçının eğitim geçmişini görebilir | NOT in current schema — `exhibitions` table has no education type; needs schema extension or new table |
| CV-06 | Kullanıcı sanatçının beyanını (artist statement) okuyabilir | NOT in current schema — `artists` table has no `statement_tr/statement_en` columns; needs migration |
| CV-07 | Kullanıcı sanatçının basın/yayın listesini görebilir | NOT in current schema — no `press` or `publications` table; needs new table or artists columns |
| CV-08 | Kullanıcı sanatçıya özel iletişim formu ile mesaj gönderebilir | `messages` table has `artist_id` FK; `submitContact` action already inserts with `artistId: null` — needs artist-aware variant |
</phase_requirements>

---

## Summary

Phase 4 builds the actual content pages within the already-wired `(artist)/[locale]/[artist]/` route group. The routing middleware, layout, i18n providers, and Navbar are all in place from Phases 1–3. This phase is primarily a content-rendering and data-fetching problem, not an infrastructure problem.

The existing schema covers bio/photo (CV-01), portfolio items (CV-02), exhibitions with type discrimination (CV-03, CV-04). However, three requirements have schema gaps: CV-05 (education) and CV-06 (artist statement) are not modeled in the `artists` table, and CV-07 (press/publications) has no table at all. A schema migration is required before implementation can start. This is the single most important pre-condition for Phase 4.

The contact form (CV-08) reuses the existing `submitContact` Server Action but needs an artist-aware variant that sets `artistId` rather than `null`. The existing `ContactForm` component is product-scoped (accepts `productSlug`) and must either be adapted or a new `ArtistContactForm` component created.

**Primary recommendation:** Start with a Wave 0 migration task that adds `statement_tr/statement_en` to `artists`, adds an `education` type to `exhibitions`, and creates a `press_items` table. Then build all CV page sections as Server Components reading from the expanded schema.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | already installed | DB queries for artist, portfolioItems, exhibitions | Established in Phases 1–3; all existing queries use it |
| next-intl | already installed | `getTranslations()` in Server Components | Phase 3 fully wired; `tr.json`/`en.json` need new namespaces |
| yet-another-react-lightbox | already installed | Portfolio gallery lightbox | `LightboxViewer` component already reusable — no new install |
| react-hook-form + zod | already installed | Artist contact form validation | Same stack as existing `ContactForm`; `contactSchema` reusable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/image | built-in | Artist profile photo display | Use for `photoUrl` from Vercel Blob; always use `fill` or explicit `width/height` |
| drizzle-orm `asc/desc` | built-in | Ordering exhibitions by year descending | Use `desc(exhibitions.year)` in the query |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Drizzle relations for portfolioItems | Raw `db.select().from(portfolioItems).where(...)` | Relations require defining `portfolioItemsRelations` in schema.ts and adding it to `artistsRelations`; raw select works without schema change but is less idiomatic |
| New `ArtistContactForm` component | Adapting existing `ContactForm` | Existing form accepts `productSlug` not `artistSlug`; creating a new component is cleaner and avoids conditional logic inside a shared component |

**No new npm installs required for this phase.**

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/(artist)/[locale]/[artist]/
│   ├── layout.tsx            # Already exists — no changes needed
│   ├── page.tsx              # REPLACE placeholder with full bio/statement page
│   ├── portfolyo/
│   │   └── page.tsx          # NEW — portfolio gallery with LightboxViewer
│   ├── sergiler/
│   │   └── page.tsx          # NEW — exhibition + awards list
│   └── iletisim/
│       └── page.tsx          # NEW — artist contact form page
├── components/artist/
│   ├── bio-section.tsx       # NEW — photo + bio text Server Component
│   ├── statement-section.tsx # NEW — artist statement Server Component
│   ├── portfolio-gallery.tsx # NEW — wraps LightboxViewer with artist data
│   ├── exhibition-list.tsx   # NEW — grouped by solo/group/award/education
│   ├── press-list.tsx        # NEW — optional press section; hidden if empty
│   └── artist-contact-form.tsx # NEW — artist-specific contact form
├── lib/
│   ├── queries/
│   │   └── artist.ts         # NEW — all artist CV query functions
│   └── actions/
│       └── contact.ts        # EXTEND — add submitArtistContact() variant
├── lib/db/
│   └── schema.ts             # EXTEND — statement columns, press_items table, relations
└── messages/
    ├── tr.json               # EXTEND — add `cv` namespace
    └── en.json               # EXTEND — add `cv` namespace
```

### Pattern 1: Server Component Page with Artist Slug Gate

The artist slug comes from `params` (rewritten by middleware). Every CV page reads the slug, queries the DB, and calls `notFound()` if no artist found.

**What:** Server Component pages directly await Drizzle queries using the `artist` slug.
**When to use:** All four CV pages (main, portfolyo, sergiler, iletisim).

```typescript
// src/app/(artist)/[locale]/[artist]/page.tsx
import { getArtistBySlug } from '@/lib/queries/artist'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const data = await getArtistBySlug(artist)
  if (!data) notFound()
  const t = await getTranslations({ locale, namespace: 'cv' })
  return (
    <main>
      <BioSection artist={data} locale={locale} t={t} />
      <StatementSection artist={data} locale={locale} t={t} />
    </main>
  )
}
```

### Pattern 2: Drizzle Query Function in `lib/queries/artist.ts`

All artist CV data access lives in one file, mirroring `lib/queries/gallery.ts`.

```typescript
// src/lib/queries/artist.ts
import { db } from '@/lib/db'
import { artists, portfolioItems, exhibitions, pressItems } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getArtistBySlug(slug: string) {
  return db.query.artists.findFirst({
    where: eq(artists.slug, slug),
  })
}

export async function getArtistPortfolio(artistId: number) {
  return db.query.portfolioItems.findMany({
    where: eq(portfolioItems.artistId, artistId),
    orderBy: [asc(portfolioItems.sortOrder)],
  })
}

export async function getArtistExhibitions(artistId: number) {
  return db
    .select()
    .from(exhibitions)
    .where(eq(exhibitions.artistId, artistId))
    .orderBy(desc(exhibitions.year))
}

export async function getArtistPressItems(artistId: number) {
  return db
    .select()
    .from(pressItems)
    .where(eq(pressItems.artistId, artistId))
    .orderBy(desc(pressItems.year))
}
```

### Pattern 3: Artist Contact Server Action

New `submitArtistContact()` in the existing `contact.ts` file, accepting `artistSlug` instead of `productSlug`. Looks up the artist ID from the slug before inserting.

```typescript
// src/lib/actions/contact.ts (extension)
export const artistContactSchema = z.object({
  senderName: z.string().min(2).max(100),
  senderEmail: z.string().email(),
  body: z.string().min(10).max(2000),
  artistSlug: z.string(),
})

export async function submitArtistContact(
  data: z.infer<typeof artistContactSchema>
): Promise<ContactFormState> {
  const parsed = artistContactSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }
  const artist = await db.query.artists.findFirst({
    where: eq(artists.slug, parsed.data.artistSlug),
  })
  if (!artist) return { success: false }
  await db.insert(messages).values({
    artistId: artist.id,
    senderName: parsed.data.senderName,
    senderEmail: parsed.data.senderEmail,
    body: parsed.data.body,
  })
  return { success: true }
}
```

### Pattern 4: Conditional Section Rendering (CV-07 press section)

The press section must be hidden entirely when no records exist. Check at the Server Component level before rendering, not with CSS visibility.

```typescript
// src/components/artist/press-list.tsx
export default async function PressList({
  artistId,
  locale,
}: {
  artistId: number
  locale: string
}) {
  const items = await getArtistPressItems(artistId)
  if (items.length === 0) return null  // section hidden, not empty
  // ... render list
}
```

### Pattern 5: Reusing LightboxViewer for Portfolio (CV-02)

`LightboxViewer` is already generic (`slides: LightboxSlide[]`, `thumbnails: ThumbnailImage[]`). The portfolio gallery page is a thin wrapper that shapes `portfolioItems` DB rows into the `LightboxSlide` interface.

```typescript
// src/components/artist/portfolio-gallery.tsx
import LightboxViewer from '@/components/gallery/lightbox-viewer'

export default function PortfolioGallery({
  items,
  locale,
}: {
  items: PortfolioItem[]
  locale: string
}) {
  const slides = items.map((item) => ({
    src: item.imageUrl,
    alt: locale === 'tr' ? (item.titleTr ?? '') : (item.titleEn ?? ''),
    title: locale === 'tr' ? item.titleTr : item.titleEn,
  }))
  const thumbnails = items.map((item) => ({
    src: item.imageUrl,
    alt: locale === 'tr' ? (item.titleTr ?? '') : (item.titleEn ?? ''),
  }))
  return <LightboxViewer slides={slides} thumbnails={thumbnails} />
}
```

### Anti-Patterns to Avoid

- **Fetching all exhibitions then filtering in JS:** Always filter by `artistId` in the SQL query using `eq(exhibitions.artistId, artistId)`. Never fetch all rows and filter client-side.
- **Putting artist contact logic in the existing `ContactForm`:** The existing component has `productSlug` hardcoded in its schema and hidden input. Create a separate `ArtistContactForm` component to avoid coupling.
- **Not adding Drizzle relations for portfolioItems:** Using `db.query.portfolioItems.findMany()` requires `portfolioItemsRelations` in schema.ts. Without it, the `with:` option on `db.query.artists` won't include portfolio items. Either define the relation or use raw `db.select()` — be consistent.
- **Skipping `notFound()` when artist slug is invalid:** The layout already validates slugs against `VALID_ARTISTS`, but sub-pages (portfolyo, sergiler, iletisim) also call `getArtistBySlug()` and must call `notFound()` themselves if the result is null.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Portfolio image gallery with zoom | Custom image grid + modal | `LightboxViewer` (already in codebase) | Already tested, uses `yet-another-react-lightbox` with Zoom+Captions plugins and `NextImageSlide` for CDN optimization |
| Contact form validation | Manual input validation | `zod` + `react-hook-form` (already in codebase) | `contactSchema` pattern is already established; copy it for `artistContactSchema` |
| Artist slug → artist ID lookup | Pass artist slug through props chain | DB lookup in the Server Action (`db.query.artists.findFirst`) | Single source of truth; slug is always available in the action context |
| Section visibility toggle (press) | CSS `hidden` class conditionally applied | Return `null` from Server Component | Returning null means the element never enters the DOM; no empty containers or wasted layout space |

**Key insight:** Phase 4 is almost entirely wiring — connecting existing schema tables to existing UI components. New code surface is minimal: queries file, a few presentational components, schema migration, translation keys.

---

## Common Pitfalls

### Pitfall 1: Missing Drizzle Relations for portfolioItems / pressItems

**What goes wrong:** `db.query.portfolioItems` is called but the relation is not registered in `schema.ts`, so Drizzle throws a runtime error or silently returns no data.

**Why it happens:** `portfolioItemsRelations` and `artistsRelations` were never updated to include `portfolioItems` or `pressItems` in the many-side. The Phase 2 decision log explicitly notes: "Drizzle relations required for `db.query.*` with `with:` option — FK columns alone insufficient."

**How to avoid:** After adding tables to schema.ts, add corresponding `relations()` calls. Add `portfolioItems: many(portfolioItems)` to `artistsRelations`, and define `portfolioItemsRelations` with the `one(artists)` back-reference.

**Warning signs:** TypeScript errors on `db.query.portfolioItems` or empty arrays returned when DB has data.

### Pitfall 2: Schema Migration Blocking All CV Features

**What goes wrong:** CV-05 (education), CV-06 (statement), and CV-07 (press) all need schema changes. If migration is deferred to a later plan, every plan that needs those columns blocks.

**Why it happens:** It is tempting to start with CV-01/CV-02 (bio/portfolio — already in schema) and add migration "later." But CV-03/04/05/06/07 all depend on the migration.

**How to avoid:** Wave 0 of the first plan must include the migration: add `statement_tr/statement_en` to `artists`, confirm `exhibitions.type` covers education (or add `'egitim'` as a valid value), add `press_items` table, run `pnpm drizzle-kit push`.

**Warning signs:** Plans that assume columns exist before the migration plan has been executed.

### Pitfall 3: Exhibition Type Values Not Matching CV Requirements

**What goes wrong:** `exhibitions.type` currently has values `"sergi" | "odul" | "etkinlik"` per the architecture research. CV-03 requires solo/group distinction, CV-04 requires awards, CV-05 requires education. There is no `"solo"`, `"grup"`, or `"egitim"` type defined.

**Why it happens:** The schema was designed before CV requirements were detailed. Solo/group distinction for exhibitions is a standard art CV convention but wasn't spelled out in the original schema design.

**How to avoid:** The migration must expand `exhibitions.type` to include `"solo_sergi"`, `"grup_sergi"`, `"odul"`, `"egitim"`. Update seed data to use the new values. Exhibition list component groups by type for rendering.

**Warning signs:** CV-03 can't distinguish solo from group exhibitions without this type expansion.

### Pitfall 4: Contact Form Sends to Wrong artistId

**What goes wrong:** The artist contact form submits but inserts `artistId: null` (main site behavior) instead of the correct artist's DB ID.

**Why it happens:** If the existing `submitContact` action is reused without modification, it always sets `artistId: null`. The artist slug must be passed from the page to the form component to the Server Action.

**How to avoid:** Create `submitArtistContact()` that accepts `artistSlug`, looks up the artist ID, and inserts with the correct FK. Pass the artist slug from the page via a hidden field or as a component prop.

**Warning signs:** Messages table rows show `artist_id = NULL` after submitting from a CV subdomain.

### Pitfall 5: Translation Keys Missing for CV Namespace

**What goes wrong:** `getTranslations({ locale, namespace: 'cv' })` throws or returns empty strings because `tr.json` and `en.json` have no `cv` namespace.

**Why it happens:** The i18n-keys parity test (from Phase 3) will catch this at commit time if key parity is enforced. But if CV keys are added to only one file, the test fails.

**How to avoid:** Add the full `cv` namespace to both `tr.json` and `en.json` in the same Wave 0 task. The existing i18n-keys parity test will enforce this.

**Warning signs:** `i18n-keys.test.ts` fails with "keys present in tr.json but missing from en.json" or vice versa.

---

## Schema Migration Required

This is the single blocking dependency for the phase. The current schema gaps vs. requirements:

### Changes to `artists` table

```sql
ALTER TABLE artists
  ADD COLUMN statement_tr TEXT,
  ADD COLUMN statement_en TEXT;
```

Drizzle schema addition:
```typescript
statementTr: text('statement_tr'),
statementEn: text('statement_en'),
```

### Expand `exhibitions.type` vocabulary

Current values in seed: none. The type column is `TEXT NOT NULL` — no DB-level constraint. The application code must handle these type strings:
- `"solo_sergi"` — solo exhibition (CV-03)
- `"grup_sergi"` — group exhibition (CV-03)
- `"odul"` — award (CV-04)
- `"egitim"` — education (CV-05)

No SQL migration needed for the column itself (it's a free-form `TEXT`), but seed data and query grouping logic must use these exact values.

### New `press_items` table

```sql
CREATE TABLE press_items (
  id          SERIAL PRIMARY KEY,
  artist_id   INT REFERENCES artists(id),
  title       TEXT NOT NULL,
  publication TEXT,
  url         TEXT,
  year        INT,
  sort_order  INT DEFAULT 0
);
```

Drizzle schema:
```typescript
export const pressItems = pgTable('press_items', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id),
  title: text('title').notNull(),
  publication: text('publication'),
  url: text('url'),
  year: integer('year'),
  sortOrder: integer('sort_order').default(0),
})
```

Note: `press_items.title` is not bilingual (title/publication are stored as-is, typically in the original language of the press piece). This keeps the table simple and matches real-world CV conventions.

### Drizzle Relations to Add

```typescript
// In schema.ts — extend existing artistsRelations
export const artistsRelations = relations(artists, ({ many }) => ({
  products: many(products),
  portfolioItems: many(portfolioItems),     // ADD
  exhibitions: many(exhibitions),           // ADD
  pressItems: many(pressItems),             // ADD
}))

// NEW
export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  artist: one(artists, { fields: [portfolioItems.artistId], references: [artists.id] }),
}))

export const exhibitionsRelations = relations(exhibitions, ({ one }) => ({
  artist: one(artists, { fields: [exhibitions.artistId], references: [artists.id] }),
}))

export const pressItemsRelations = relations(pressItems, ({ one }) => ({
  artist: one(artists, { fields: [pressItems.artistId], references: [artists.id] }),
}))
```

---

## Translation Keys Required

New `cv` namespace required in both `tr.json` and `en.json`:

```json
{
  "cv": {
    "bioTitle": "Hakkında",
    "statementTitle": "Sanatçı Beyanı",
    "portfolioTitle": "Portfolyo",
    "exhibitionsTitle": "Sergiler",
    "awardsTitle": "Ödüller",
    "educationTitle": "Eğitim",
    "pressTitle": "Basın / Yayın",
    "contactTitle": "İletişim",
    "soloExhibition": "Solo Sergi",
    "groupExhibition": "Grup Sergisi",
    "contactPlaceholder": "Sergi veya iş birliği teklifinizi yazınız...",
    "noPortfolio": "Henüz portfolyo eklenmedi"
  },
  "meta": {
    "artistTitle": "{name} | U-Art Tasarım",
    "artistDesc": "{name} - sanatçı portfolyosu ve CV",
    "portfolioTitle": "Portfolyo | {name}",
    "exhibitionsTitle": "Sergiler | {name}",
    "contactTitle": "İletişim | {name}"
  }
}
```

---

## Code Examples

### Generating Locale-Aware Artist Metadata

```typescript
// Follows the generateMetadata pattern from Phase 3
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}): Promise<Metadata> {
  const { locale, artist } = await params
  const data = await getArtistBySlug(artist)
  if (!data) return {}
  const t = await getTranslations({ locale, namespace: 'meta' })
  const name = locale === 'tr' ? data.nameTr : data.nameEn
  return {
    title: t('artistTitle', { name }),
    description: t('artistDesc', { name }),
    openGraph: {
      images: data.photoUrl ? [data.photoUrl] : [],
    },
  }
}
```

### Exhibition List Grouped by Type

```typescript
// In the exhibitions page Server Component
const allExhibitions = await getArtistExhibitions(artist.id)

const soloExhibitions = allExhibitions.filter(e => e.type === 'solo_sergi')
const groupExhibitions = allExhibitions.filter(e => e.type === 'grup_sergi')
const awards = allExhibitions.filter(e => e.type === 'odul')
const education = allExhibitions.filter(e => e.type === 'egitim')
// Each group rendered as a separate labeled section
```

### Seed Extension for CV Content

The seed.ts must be extended to insert test exhibitions, portfolio items, and press items so pages render real content during development. Pattern follows existing seed:

```typescript
await db.execute(sql`
  INSERT INTO exhibitions (artist_id, type, title_tr, title_en, location, year)
  VALUES
    (${melike.id}, 'solo_sergi', 'Renk ve Işık', 'Color and Light', 'İstanbul Modern', 2023),
    (${melike.id}, 'grup_sergi', 'Çağdaş Türk Sanatçılar', 'Contemporary Turkish Artists', 'SALT Galata', 2022),
    (${melike.id}, 'odul', 'Genç Sanatçı Ödülü', 'Young Artist Award', 'İstanbul Kültür Sanat Vakfı', 2021),
    (${melike.id}, 'egitim', 'Güzel Sanatlar Fakültesi, Yüksek Lisans', 'MFA, Fine Arts Faculty', 'Mimar Sinan Güzel Sanatlar Üniversitesi', 2019)
  ON CONFLICT DO NOTHING
`)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Placeholder artist page.tsx | Full bio/statement/portfolio page | Phase 4 (now) | page.tsx completely replaced |
| `artistsRelations` only has `products` | Expanded to include portfolioItems, exhibitions, pressItems | Phase 4 (now) | Required for `db.query.*` with `with:` |
| `contactSchema` with `productSlug` only | `artistContactSchema` with `artistSlug` | Phase 4 (now) | Enables artist-attributed messages |
| `tr.json`/`en.json` have no `cv` namespace | Full `cv` namespace added | Phase 4 (now) | i18n-keys test will enforce parity |

---

## Open Questions

1. **Does `exhibitions` need a `subtype` or is the expanded `type` vocabulary sufficient?**
   - What we know: `type` is free-form TEXT; expanding the vocabulary to `solo_sergi`, `grup_sergi`, `odul`, `egitim` covers all CV requirements.
   - What's unclear: Whether future admin requirements need more granular categorization (e.g., `odul` sub-types).
   - Recommendation: Use the four-value vocabulary for now. Admin Phase 5 can add a `subtype` column if needed.

2. **Should `press_items.title` be bilingual (`title_tr`/`title_en`)?**
   - What we know: Press articles typically have a single title in the original publication language.
   - What's unclear: Whether artists will want to translate press titles for the EN version.
   - Recommendation: Single `title` column (no locale split) for now. The publication language is self-evident from `publication` field. This can be revised in Phase 5 admin editing.

3. **Artist statement: separate page or inline on bio page?**
   - What we know: CV-06 says "artist statement ayrı bölüm olarak" (separate section). The success criterion groups bio + statement on the CV landing page.
   - What's unclear: Whether "ayrı bölüm" means a separate route or a separate section on the same page.
   - Recommendation: Place statement as a separate `<section>` on the main artist page (same route as bio). No separate sub-route needed. Matches standard CV convention.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + ts-jest |
| Config file | `jest.config.ts` (project root) |
| Quick run command | `pnpm test -- --testPathPattern="artist"` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CV-01 | `getArtistBySlug('melike')` returns artist with bio + photo | unit | `pnpm test -- --testPathPattern="artist-queries"` | ❌ Wave 0 |
| CV-02 | `getArtistPortfolio(artistId)` returns ordered portfolio items | unit | `pnpm test -- --testPathPattern="artist-queries"` | ❌ Wave 0 |
| CV-03 | Exhibition list sorted desc by year; solo/group separated | unit | `pnpm test -- --testPathPattern="artist-queries"` | ❌ Wave 0 |
| CV-04 | Awards filtered from exhibitions by type `'odul'` | unit | `pnpm test -- --testPathPattern="artist-queries"` | ❌ Wave 0 |
| CV-05 | Education filtered from exhibitions by type `'egitim'` | unit | `pnpm test -- --testPathPattern="artist-queries"` | ❌ Wave 0 |
| CV-06 | Artist record has `statementTr`/`statementEn` columns | unit (schema) | `pnpm test -- --testPathPattern="artist-queries"` | ❌ Wave 0 |
| CV-07 | `getArtistPressItems()` returns empty array when no items; null renders correctly | unit | `pnpm test -- --testPathPattern="artist-contact"` | ❌ Wave 0 |
| CV-08 | `submitArtistContact()` inserts with correct `artistId`; rejects invalid artist slug | unit | `pnpm test -- --testPathPattern="artist-contact"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- --testPathPattern="artist"`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/artist-queries.test.ts` — covers CV-01, CV-02, CV-03, CV-04, CV-05, CV-06 (mock `db.query.artists`, `db.select`)
- [ ] `src/__tests__/artist-contact.test.ts` — covers CV-07, CV-08 (mock `db.query.artists.findFirst`, `db.insert`)

*(Follows the established contract-testing pattern: mock `@/lib/db`, test the query/action functions directly without DB connection)*

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/db/schema.ts` — confirmed table shapes, existing columns
- Existing codebase: `src/components/gallery/lightbox-viewer.tsx` — confirmed `LightboxSlide`/`ThumbnailImage` interface
- Existing codebase: `src/lib/actions/contact.ts` — confirmed `submitContact` pattern, `contactSchema`, `messages` insert
- Existing codebase: `src/app/(artist)/[locale]/[artist]/layout.tsx` + `page.tsx` — confirmed route structure and current placeholder
- Existing codebase: `src/middleware.ts` — confirmed tenant detection and rewrite logic
- Existing codebase: `src/__tests__/contact-action.test.ts` — confirmed contract-testing pattern for new tests
- Existing codebase: `jest.config.ts` — confirmed test framework and `testMatch` pattern

### Secondary (MEDIUM confidence)
- `.planning/research/FEATURES.md` — artist CV section requirements, press as optional (show only if content exists)
- `.planning/research/ARCHITECTURE.md` — component structure, Drizzle query patterns, `neon-http` + `drizzle` setup
- `.planning/STATE.md` decisions log — Phase 2 Drizzle relations requirement confirmed

### Tertiary (LOW confidence)
- None — all findings verified against codebase directly.

---

## Metadata

**Confidence breakdown:**
- Schema gaps (CV-05, CV-06, CV-07): HIGH — confirmed by reading schema.ts; columns literally do not exist
- Component reuse (LightboxViewer, ContactForm pattern): HIGH — verified interface against component source
- Query patterns (Drizzle): HIGH — confirmed against working gallery.ts queries and schema relations
- Translation keys: HIGH — confirmed by reading tr.json/en.json; no `cv` namespace exists
- Test patterns: HIGH — confirmed against existing test files and jest.config.ts

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable stack; only schema additions, no third-party upgrades)
