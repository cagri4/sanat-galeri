# Phase 3: Platform (i18n + Nav + SEO) - Research

**Researched:** 2026-03-24
**Domain:** next-intl translation wiring, language switcher UI, cross-domain navigation, Next.js Metadata API
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLT-02 | Tüm sayfalar Türkçe ve İngilizce olarak görüntülenebilir | Translation key expansion, `useTranslations` / `getTranslations` patterns for every page |
| PLT-04 | 3 domain arasında tutarlı navigasyon vardır | Cross-domain link construction, Navbar/LanguageSwitcher component patterns |
| PLT-05 | SEO temelleri: sayfa başlıkları, meta açıklamalar, görsel alt text | `generateMetadata` / `metadata` export patterns, per-page title/description strategy, image alt text conventions |
</phase_requirements>

---

## Summary

Phase 3 is a **wiring and surfacing** phase — the infrastructure (next-intl middleware, `[locale]` route segments, `messages/tr.json` + `messages/en.json`, `NextIntlClientProvider` in layouts) is already built and correct from Phases 1 and 2. No new packages need to be installed and middleware does not need to change.

What is missing is: (1) the translation strings themselves — almost every user-facing string in Phase 2 components is still hardcoded as `locale === 'tr' ? '...' : '...'` ternaries instead of `t('key')` calls; (2) a LanguageSwitcher component and a Navbar that exposes it and cross-domain links on every page; (3) proper `generateMetadata` exports on every page that use locale-aware titles and descriptions from DB data or from translation files.

**Primary recommendation:** Work in three focused tasks: (1) expand translation JSON files and replace all inline ternaries with `useTranslations`/`getTranslations` calls across every component and page, (2) build LanguageSwitcher + Navbar shared components and inject them into both layouts, (3) wire `generateMetadata` on every page that lacks it and fill image `alt` props from the `_tr`/`_en` DB columns.

---

## What Already Exists (DO NOT Re-implement)

Understanding what Phase 1 and 2 already built is critical to avoid duplication.

| Already Built | Location | Notes |
|--------------|----------|-------|
| next-intl middleware composition | `src/middleware.ts` | Working; admin guard → getTenant → intlMiddleware |
| `defineRouting` config | `src/lib/i18n/routing.ts` | `locales: ['tr','en']`, `defaultLocale: 'tr'` |
| `getRequestConfig` | `src/lib/i18n/request.ts` | Loads `messages/${locale}.json` per request |
| `NextIntlClientProvider` in both layouts | `(main)/[locale]/layout.tsx`, `(artist)/[locale]/[artist]/layout.tsx` | Already wraps children correctly |
| `tr.json` + `en.json` stub files | `src/messages/` | Only have `common.siteTitle` and `common.loading` right now |
| `generateMetadata` on artwork detail page | `(main)/[locale]/urun/[slug]/page.tsx` | Locale-aware, DB-driven — use as the reference pattern |
| `generateMetadata` on gallery page | `(main)/[locale]/galeri/page.tsx` | Hardcoded string, needs upgrade |
| next-intl plugin in next.config.ts | `next.config.ts` | `withNextIntl('./src/lib/i18n/request.ts')` already wired |
| `useTranslations` on homepage | `(main)/[locale]/page.tsx` | Uses `t('common.siteTitle')` — correct pattern |
| DB columns for i18n | schema | `title_tr/en`, `description_tr/en`, `alt_tr/en`, `name_tr/en` etc. all present |

---

## Standard Stack

### Core (no new installs needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| next-intl | 4.8.3 (already installed) | Translation hooks, locale-aware Link/usePathname | Use `useTranslations` (Client) and `getTranslations` (Server) |
| next/navigation | built-in | `usePathname`, `useRouter` in Client Components for language switcher | Already used in CategoryFilter |
| Next.js Metadata API | built-in | `generateMetadata` function export and static `metadata` export | Already used in artwork detail page |

### next-intl APIs Used in This Phase

| API | Import | Where |
|-----|--------|-------|
| `useTranslations(ns)` | `next-intl` | Client Components (LanguageSwitcher, CategoryFilter labels) |
| `getTranslations(ns)` | `next-intl/server` | Server Components and `generateMetadata` |
| `useLocale()` | `next-intl` | LanguageSwitcher — reads current locale |
| `usePathname()` | `next-intl/navigation` | LanguageSwitcher — reads current path without locale prefix |
| `Link` (next-intl) | `next-intl/navigation` | Locale-aware internal links inside (main) and (artist) |

**IMPORTANT:** `usePathname` from `next-intl/navigation` returns the path WITHOUT the locale prefix (e.g. `/galeri` not `/tr/galeri`). The regular `next/navigation` `usePathname` returns the raw pathname WITH locale prefix. Use the next-intl version for the language switcher so the switch logic is locale-agnostic.

**IMPORTANT:** `Link` from `next-intl/navigation` (not `next/link`) automatically prepends the current locale to `href`. Use it for internal links. Cross-domain links (to artist subdomains) must remain plain `<a>` tags with full absolute URLs — they cannot use next-intl's Link because they cross domain boundaries.

---

## Architecture Patterns

### Pattern 1: Language Switcher Component

The language switcher reads the current locale and current path, then renders two links that point to the same path but with alternate locale prefix. It must be a Client Component to use `useLocale` and `usePathname`.

```typescript
// src/components/shared/language-switcher.tsx
'use client'
import { useLocale } from 'next-intl'
import { usePathname } from 'next-intl/navigation'
import Link from 'next/link'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname() // path WITHOUT locale prefix, e.g. '/galeri'

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href={pathname}
        locale="tr"
        className={locale === 'tr' ? 'font-semibold' : 'text-neutral-500 hover:text-neutral-900'}
      >
        TR
      </Link>
      <span className="text-neutral-300">|</span>
      <Link
        href={pathname}
        locale="en"
        className={locale === 'en' ? 'font-semibold' : 'text-neutral-500 hover:text-neutral-900'}
      >
        EN
      </Link>
    </div>
  )
}
```

**Key:** `Link` from `next/link` accepts a `locale` prop when next-intl's plugin is active. Pass the target locale explicitly; this is the correct pattern per next-intl docs (not `href="/en${pathname}"`).

**Alternative implementation:** Use next-intl's own `Link` with `locale` prop. Both approaches work. The `next/link` + `locale` prop approach is simpler since the project already imports from `next/link` everywhere.

### Pattern 2: Navbar Component

The Navbar is a Server Component that renders the site branding and includes the Client Component language switcher. It also contains cross-domain navigation links.

```typescript
// src/components/shared/navbar.tsx
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from './language-switcher'

interface NavbarProps {
  locale: string
  domain?: 'main' | 'melike' | 'seref'
}

export default async function Navbar({ locale, domain = 'main' }: NavbarProps) {
  const t = await getTranslations({ locale, namespace: 'nav' })

  // Cross-domain URLs — must be absolute, cannot use next-intl Link
  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? 'https://uarttasarim.com'
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? 'https://melike.uarttasarim.com'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? 'https://seref.uarttasarim.com'

  return (
    <header className="border-b border-neutral-100">
      <nav className="flex items-center justify-between py-4">
        <a href={`${MAIN_URL}/${locale}`} className="text-lg font-semibold tracking-tight">
          {t('siteTitle')}
        </a>
        <div className="flex items-center gap-6">
          {/* Cross-domain artist links */}
          <a href={`${MELIKE_URL}/${locale}`} className="text-sm text-neutral-600 hover:text-neutral-900">
            Melike
          </a>
          <a href={`${SEREF_URL}/${locale}`} className="text-sm text-neutral-600 hover:text-neutral-900">
            Şeref
          </a>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  )
}
```

**Cross-domain links carry the locale segment:** `${ARTIST_URL}/${locale}` — this ensures when a visitor switches from the main site to an artist subdomain, they land in their current language. Locale cookie set by next-intl will also carry it forward, but explicit URL is more reliable.

### Pattern 3: Injecting Navbar Into Layouts

Both layouts already have `NextIntlClientProvider` wrapping. Navbar goes inside the provider but outside `{children}`:

```typescript
// (main)/[locale]/layout.tsx — after adding Navbar
import Navbar from '@/components/shared/navbar'

// Inside the return:
<NextIntlClientProvider messages={messages}>
  <div className="min-w-[320px] mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
    <Navbar locale={locale} domain="main" />
    {children}
  </div>
</NextIntlClientProvider>
```

For the artist layout, pass `domain={artist as 'melike' | 'seref'}`.

### Pattern 4: Replacing Inline Ternaries With `getTranslations`

Every Phase 2 Server Component uses the pattern `locale === 'tr' ? 'Türkçe' : 'English'` inline. This must be replaced in Phase 3. The correct Server Component pattern:

```typescript
// In any Server Component (page.tsx or layout.tsx):
import { getTranslations } from 'next-intl/server'

// Inside async function:
const t = await getTranslations({ locale, namespace: 'gallery' })

// Then use:
t('filterAll')          // was: locale === 'tr' ? 'Tümü' : 'All'
t('contactTitle')       // was: locale === 'tr' ? 'Bilgi Al' : 'Get in Touch'
```

For Client Components like CategoryFilter, use the sync hook:

```typescript
'use client'
import { useTranslations } from 'next-intl'

// Inside component:
const t = useTranslations('gallery')
t('filterAll')
```

**Note:** `CategoryFilter` is a Client Component, so it must use `useTranslations`. The messages are already loaded into the `NextIntlClientProvider` by the layout, so no extra fetch happens.

### Pattern 5: Locale-Aware `generateMetadata`

The artwork detail page already demonstrates the correct pattern. Apply to every page:

```typescript
// In any page.tsx with locale-aware SEO
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('galleryTitle'),        // "Galeri | U-Art Tasarım" or "Gallery | U-Art Design"
    description: t('galleryDesc'),
  }
}
```

For pages with static metadata that doesn't need locale (e.g. admin pages), use:
```typescript
export const metadata: Metadata = { title: 'Admin | U-Art' }
```

### Pattern 6: Image Alt Text from DB Columns

The DB schema has `alt_tr` and `alt_en` columns on `product_images`. These are already fetched via Drizzle relations. The pattern is already partially implemented in artwork-detail and artwork-card — ensure it is consistently applied:

```typescript
// In ArtworkCard (Server Component):
alt={locale === 'tr' ? (image.altTr ?? title) : (image.altEn ?? title)}

// After translation refactor — keep the locale ternary here since
// alt text must ultimately be a string, not a translation key.
// The ?? title fallback is correct and must be preserved.
```

**Alt text is NOT a translation key** — it is data from the DB. The fallback to `title` (which IS locale-aware) is the right pattern. Do not move alt text into `messages.json`.

### Pattern 7: Translation Namespace Structure

The current `tr.json` / `en.json` only has `common.siteTitle` and `common.loading`. Phase 3 must expand both files with a consistent namespace structure. Recommended namespaces:

```json
{
  "common": {
    "siteTitle": "U-Art Tasarım",
    "loading": "Yükleniyor..."
  },
  "nav": {
    "gallery": "Galeri",
    "contact": "İletişim",
    "artists": "Sanatçılar"
  },
  "gallery": {
    "filterAll": "Tümü",
    "emptyState": "Bu kategoride eser bulunamadı.",
    "price": "Fiyat",
    "contactForPrice": "Fiyat için iletişime geçin",
    "sold": "Satıldı",
    "artist": "Sanatçı",
    "medium": "Teknik",
    "dimensions": "Boyut",
    "year": "Yıl",
    "contactTitle": "Bilgi Al",
    "whatsappCta": "WhatsApp ile Sor"
  },
  "meta": {
    "galleryTitle": "Galeri | U-Art Tasarım",
    "galleryDesc": "Özgün tablolar, heykeller ve baskı resimler.",
    "homeTitle": "U-Art Tasarım",
    "homeDesc": "Sade, galeri kalitesinde sanat vitrini."
  },
  "contact": {
    "namePlaceholder": "Adınız",
    "emailPlaceholder": "E-posta",
    "messagePlaceholder": "Mesajınız",
    "submit": "Gönder",
    "successMessage": "Mesajınız iletildi.",
    "errorMessage": "Bir hata oluştu. Lütfen tekrar deneyin."
  }
}
```

Both `tr.json` and `en.json` MUST have identical key structures. Missing keys in one file cause next-intl to silently fall back to the key name at runtime.

### Anti-Patterns to Avoid

- **Don't use hardcoded absolute domain URLs** without env vars — use `NEXT_PUBLIC_*` env vars so the dev/preview/production environments can all work correctly.
- **Don't mix `Link` from `next/link` and `Link` from `next-intl/navigation` accidentally** — import carefully. For cross-domain links always use `<a>`.
- **Don't call `useTranslations` in a Server Component** — use `getTranslations` (async) instead. Wrong: `const t = useTranslations()` in a server function.
- **Don't use `localePrefix: 'never'`** — the project already uses path-based prefixes (`/tr/`, `/en/`). Cookie-only locale would break SEO crawlability of the alternate language.
- **Don't add `hreflang` tags in this phase** — that is a v2 requirement (SEO-02). Phase 3 only requires title/description/alt text.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Language switching URL construction | Manual string concatenation of `/${otherLocale}${path}` | `Link` with `locale` prop (next/link with next-intl plugin active), or next-intl's own `Link` from `next-intl/navigation` |
| Current locale detection | Parse URL pathname manually | `useLocale()` from `next-intl` |
| Current path without locale prefix | Strip locale from `usePathname()` result | `usePathname()` from `next-intl/navigation` (already strips locale) |
| Metadata title/description | Duplicate strings in components | `generateMetadata` export per page + `getTranslations` |
| Locale validation in middleware | Custom regex | Already handled by `createIntlMiddleware(routing)` — do not duplicate |

---

## Common Pitfalls

### Pitfall 1: `usePathname` From Wrong Package
**What goes wrong:** Import `usePathname` from `next/navigation` instead of `next-intl/navigation`. The result includes the locale prefix (`/tr/galeri`). Building the alternate-locale URL becomes `/en/tr/galeri` — a doubled locale.
**How to avoid:** In the LanguageSwitcher, import from `'next-intl/navigation'`.
**Warning signs:** Language switcher URLs have double locale segments.

### Pitfall 2: Translation Keys Missing in One Language File
**What goes wrong:** `tr.json` has `gallery.emptyState` but `en.json` does not. next-intl renders the raw key string ("gallery.emptyState") for English users silently with no error.
**How to avoid:** Keep both files structurally identical. After adding keys to `tr.json`, immediately add the English equivalent to `en.json`. Add a test that verifies key parity between the two files.
**Warning signs:** English UI shows raw dotted key strings like "gallery.filterAll".

### Pitfall 3: Cross-Domain Links Break in Preview Deployments
**What goes wrong:** Navbar hard-codes `https://melike.uarttasarim.com` as the artist link. In Vercel preview deployments, the subdomains don't exist — the link is broken.
**How to avoid:** Read cross-domain URLs from `NEXT_PUBLIC_MELIKE_URL` and `NEXT_PUBLIC_SEREF_URL` env vars. In `.env.local`, set these to the `?tenant=melike` localhost URLs for development.
**Warning signs:** Navbar artist links 404 in preview deployments.

### Pitfall 4: `generateMetadata` Not Re-exported After Converting Static String
**What goes wrong:** `galeri/page.tsx` currently exports `generateMetadata` as a function that returns a hardcoded string `{ title: 'Galeri | U-Art Tasarım' }`. After adding locale support, the function signature must accept `params` or the locale won't be available.
**How to avoid:** Every `generateMetadata` that needs locale must be `async function generateMetadata({ params })` and `await params` to extract locale. The current artwork detail page already does this correctly — use it as the template.

### Pitfall 5: Artist Layout Doesn't Pass `domain` to Navbar
**What goes wrong:** The artist layout renders Navbar with `domain="main"` (copy-paste error), so the "back to main gallery" link on artist subdomains points to the wrong place.
**How to avoid:** The artist layout receives `artist` from params. Pass it as `domain={artist as 'melike' | 'seref'}` to Navbar. Navbar uses `domain` to decide which links to emphasize.

### Pitfall 6: ContactForm Translation After Refactor
**What goes wrong:** `ContactForm` is a Client Component that currently uses hardcoded strings for placeholder text and button labels. After translation refactor, it needs `useTranslations('contact')`. But if the messages are not in `NextIntlClientProvider`, this will throw at runtime.
**How to avoid:** The layouts already call `getMessages()` and pass all messages to `NextIntlClientProvider`. This means `useTranslations` in any Client Component inside those layouts will work. No extra setup needed — just add the `contact` namespace keys to the JSON files.

---

## Code Examples

### Setting Up Locale-Aware Internal Navigation (From next-intl Docs)

```typescript
// For internal links (same domain) — use next/link with locale prop
import Link from 'next/link'

// Current locale is auto-detected from context
<Link href="/galeri" locale="en">Gallery</Link>
// renders as <a href="/en/galeri">

// For locale-preserving links (follow current locale):
<Link href="/galeri">Gallery</Link>
// renders as <a href="/tr/galeri"> when current locale is 'tr'
```

### Using `getTranslations` in `generateMetadata` (From next-intl Docs)

```typescript
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('galleryTitle'),
    description: t('galleryDesc'),
  }
}
```

### Pages That Need `generateMetadata` Added or Updated

| Page | Current State | Action |
|------|--------------|--------|
| `(main)/[locale]/page.tsx` | No metadata export | Add `generateMetadata` with `meta.homeTitle`, `meta.homeDesc` |
| `(main)/[locale]/galeri/page.tsx` | Hardcoded `{ title: 'Galeri | U-Art Tasarım' }` | Upgrade to locale-aware function |
| `(main)/[locale]/urun/[slug]/page.tsx` | Correct, locale-aware | No change needed — use as reference |
| `(artist)/[locale]/[artist]/page.tsx` | No metadata export | Add `generateMetadata` |

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `getStaticProps` + `serverSideTranslations` (next-i18next) | `getTranslations()` Server Component, `useTranslations()` Client Component (next-intl) | Zero hydration overhead; translations on server |
| Manual `locale` ternaries in components | Translation keys via `t('key')` | Maintainable, translator-ready |
| `metadata.title` as static string | `generateMetadata` async function | Locale-aware, dynamic data-driven titles |

---

## Scope Boundary: What This Phase Does NOT Include

| Item | Reason |
|------|--------|
| `hreflang` alternate link tags | v2 requirement (SEO-02) |
| OpenGraph / og:image | v2+ |
| Sitemap / robots.txt | v2+ |
| Artist CV pages i18n | Phase 4 (CV pages not built yet) |
| Admin i18n | Admin is single-user Turkish-only; not required |
| schema.org VisualArtwork | v2 requirement (SEO-01) |
| Locale persistence via cookie beyond next-intl default | next-intl already sets `NEXT_LOCALE` cookie on locale switch; no extra work needed |

---

## Open Questions

1. **Local dev cross-domain URL for artist subdomains in Navbar**
   - What we know: `?tenant=melike` simulates subdomain routing on localhost
   - What's unclear: Should `NEXT_PUBLIC_MELIKE_URL` be set to `http://localhost:3000?tenant=melike` for dev, or should the Navbar just suppress subdomain links in localhost dev?
   - Recommendation: Set env var to `http://localhost:3000?tenant=melike` in `.env.local`. Add it to the env var list in project docs. This is the least-friction solution — no conditional rendering logic needed.

2. **CategoryFilter labels — currently no translation**
   - What we know: Category values come from the DB (e.g., "tablo", "heykel") and are rendered as-is. The "All" / "Tümü" filter button is hardcoded.
   - What's unclear: Should category display names be translated (DB-driven `name_tr`/`name_en`) or keep raw slugs?
   - Recommendation: For Phase 3, translate only the "All" button (translation key) and leave category names as raw DB values — no schema change needed. Phase 5 admin can add translated category display names if needed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest |
| Config file | `jest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLT-02 | Both `tr.json` and `en.json` have identical key sets | unit | `pnpm test -- --testPathPattern=i18n-keys` | ❌ Wave 0 |
| PLT-02 | LanguageSwitcher renders TR/EN links with correct hrefs | unit | `pnpm test -- --testPathPattern=language-switcher` | ❌ Wave 0 |
| PLT-04 | Navbar renders cross-domain links for all three domains | unit | `pnpm test -- --testPathPattern=navbar` | ❌ Wave 0 |
| PLT-05 | Gallery page `generateMetadata` returns locale-aware title | unit | `pnpm test -- --testPathPattern=gallery-metadata` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/i18n-keys.test.ts` — verifies TR and EN JSON files have identical key structures (PLT-02)
- [ ] `src/__tests__/language-switcher.test.ts` — contract test for LanguageSwitcher locale link generation (PLT-02)
- [ ] `src/__tests__/navbar.test.ts` — contract test for Navbar cross-domain link rendering (PLT-04)
- [ ] `src/__tests__/gallery-metadata.test.ts` — contract test for locale-aware `generateMetadata` (PLT-05)

**Note:** The i18n-keys test requires no mocking — it directly imports and compares the two JSON files. It is the most valuable test in this phase because it catches the silent "missing key renders raw key string" failure at commit time.

---

## Sources

### Primary (HIGH confidence)
- next-intl official docs — `useLocale`, `usePathname` from `next-intl/navigation`, `getTranslations`, `Link` with locale prop
- next-intl official docs — `getRequestConfig`, namespace loading patterns
- Next.js official docs — `generateMetadata` async function signature, `params` as Promise in Next.js 16
- Existing codebase — `src/middleware.ts`, `src/lib/i18n/routing.ts`, `src/lib/i18n/request.ts`, `src/app/(main)/[locale]/urun/[slug]/page.tsx` (reference implementation of locale-aware `generateMetadata`)

### Secondary (MEDIUM confidence)
- Existing Phase 1 SUMMARY — confirmed middleware composition pattern, `NextIntlClientProvider` scope per route group
- Existing Phase 2 SUMMARY — confirmed inline `locale === 'tr' ? ... : ...` pattern used throughout Phase 2 components (source of the translation debt this phase resolves)

### Tertiary (LOW confidence)
- None — all Phase 3 patterns are verifiable from the existing codebase and next-intl docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — next-intl already installed and working; no new dependencies
- Architecture: HIGH — language switcher and navbar patterns verified from next-intl docs and existing codebase
- Pitfalls: HIGH — most pitfalls are derived from reading the actual Phase 2 code and spotting the inline ternaries

**Research date:** 2026-03-24
**Valid until:** 2026-06-24 (stable ecosystem; next-intl 4.x API is stable)
