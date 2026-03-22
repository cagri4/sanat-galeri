# Pitfalls Research

**Domain:** Multi-domain art gallery / portfolio web platform (Next.js + Vercel)
**Researched:** 2026-03-22
**Confidence:** HIGH (middleware/security), MEDIUM (i18n+subdomain combo, image perf), MEDIUM (DB migration)

---

## Critical Pitfalls

### Pitfall 1: Middleware-Only Admin Auth Is Bypassable

**What goes wrong:**
Admin panel protection relies entirely on Next.js middleware to gate `/admin` routes. An attacker crafts a request with the `x-middleware-subrequest` header set to bypass middleware execution entirely, gaining full admin access without credentials.

**Why it happens:**
CVE-2025-29927 (CVSS 9.1) — a design flaw in Next.js's internal subrequest header allows external callers to skip middleware. This is not a theoretical bug: PoCs are public and the affected pattern (middleware-only auth) is the default tutorial pattern. Patched in Next.js 15.2.3+, but only on Vercel hosting by default; self-hosted builds remain vulnerable unless patched.

**How to avoid:**
1. Keep Next.js at 15.2.3 or later (or Next.js 16+ equivalent patch).
2. Never use middleware as the sole auth gate. Add server-side session verification in every admin Server Component and Route Handler:
   ```ts
   // In every admin page/layout:
   const session = await getSession();
   if (!session) redirect('/login');
   ```
3. Configure `x-middleware-subrequest` header blocking at the Vercel Edge/proxy level as a belt-and-suspenders defense.

**Warning signs:**
- Admin page only checks auth in `middleware.ts` without any server-side check in the page itself.
- `next start` / `output: 'standalone'` deployment (self-hosted risk vector).

**Phase to address:**
Foundation phase (auth setup) — must be correct from the first commit.

---

### Pitfall 2: Subdomain Routing Breaks When i18n Middleware Also Runs

**What goes wrong:**
Combining subdomain routing (for `melike.*`, `seref.*`) with `next-intl` middleware in a single `middleware.ts` produces 404s on every subdomain request with the error: "Unable to find next-intl locale because the middleware didn't run on this request." Both middleware concerns fight over the same request lifecycle.

**Why it happens:**
Next.js enforces a single `middleware.ts` file per project. When `next-intl`'s `createMiddleware()` wraps everything, it may not correctly propagate subdomain rewrites before locale detection. Subdomain locale routing (`en.domain.com`) is explicitly described in the next-intl docs as an edge case with limited adoption and requiring careful composition.

**How to avoid:**
Use next-intl's advanced **composition pattern** (`app-router-tenants` example). Structure the single middleware file to:
1. First: parse the hostname and extract the tenant/subdomain.
2. Second: rewrite the request path to the correct internal route (`/melike/...`).
3. Third: run `next-intl` locale detection on the rewritten path, not the original hostname.

Keep locales unique per domain — never rely on subdomain to carry locale; use path prefix (`/tr/`, `/en/`) or cookie.

**Warning signs:**
- 404 with "Unable to find next-intl locale" on any subdomain request.
- Using `localePrefix: 'never'` with subdomain routing simultaneously.
- Two separate `createMiddleware()` calls composed naively without explicit chaining.

**Phase to address:**
Foundation phase (routing architecture) — middleware composition must be verified with all three domains in local dev before building any features on top.

---

### Pitfall 3: next/image Fails Silently for Vercel Blob URLs in Production

**What goes wrong:**
Gallery images uploaded to Vercel Blob render in development but throw "Un-configured host" errors or return broken images in production. Alternatively, images with query parameters in the Blob CDN URL (`?v=4`) are rejected by `remotePatterns` even when the hostname is correctly configured.

**Why it happens:**
- `remotePatterns` matching is exact and case-sensitive; a URL containing query parameters fails if the `search` key is omitted from the pattern (known bug in Next.js, tracked in multiple issues through mid-2025).
- Blob CDN hostnames differ between Vercel projects and aren't always predictable until the first deploy.
- Turbopack (used in `next dev --turbo`) has historically ignored `remotePatterns` config, creating a false "works locally" signal.

**How to avoid:**
```ts
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.public.blob.vercel-storage.com',
      // Omit 'search' key entirely to allow any query params
    },
  ],
}
```
Restart the dev server after every `next.config.ts` change. Test image loading with the same URL shape that production Blob URLs will have (including any `?` parameters) before shipping.

**Warning signs:**
- Images load in `npm run dev` but 400/403 in production preview.
- Console error: "url parameter is not allowed" or "Un-configured host".
- Using `images.domains` (deprecated) array instead of `remotePatterns`.

**Phase to address:**
Storage / image upload phase — validate Blob URL shapes and `remotePatterns` config with a real uploaded file before building gallery views.

---

### Pitfall 4: Middleware Domain Detection Breaks in Local Dev and Vercel Preview URLs

**What goes wrong:**
Subdomain routing works perfectly on `uarttasarim.com` in production but is completely non-functional in local development (`localhost:3000` has no subdomain) and in Vercel preview deployments (URLs are like `project-git-branch-xyz.vercel.app` — no custom subdomains).

**Why it happens:**
The hostname extraction logic `request.headers.get('host')` returns `localhost:3000` in dev, `project-abc.vercel.app` in preview, and `melike.uarttasarim.com` in production. Developers who only test locally ship broken middleware that has never been exercised against actual subdomains.

**How to avoid:**
Build environment-aware middleware from day one:
```ts
const hostname = request.headers.get('host') || '';
const isLocalhost = hostname.includes('localhost');
const isVercelPreview = hostname.includes('.vercel.app');

if (isLocalhost) {
  // Use query param or path prefix to simulate tenant: ?tenant=melike
} else {
  const subdomain = hostname.split('.')[0];
  // route by subdomain
}
```
Add a dev mode flag via `NEXT_PUBLIC_DEV_TENANT` env var for simulating subdomains locally. Verify on an actual Vercel preview with the wildcard domain configured before declaring routing "done."

**Warning signs:**
- Subdomain routing only ever tested on `localhost`.
- No mention of Vercel wildcard domain (`*.uarttasarim.com`) being configured in Vercel project settings.
- Preview deployment shows the main site for all subdomain routes.

**Phase to address:**
Foundation phase (routing) — implement dev-mode tenant simulation at the start.

---

### Pitfall 5: Database Connection Pool Exhaustion on Serverless

**What goes wrong:**
Gallery pages start throwing "Timed out fetching a new connection from the connection pool" errors under moderate traffic (or even during local testing with hot reload) because each serverless function invocation opens a new database connection without the pool being managed.

**Why it happens:**
Vercel functions are ephemeral — each request can spin up a fresh Node.js process. Standard `pg` Pool objects are not reused across invocations. Vercel Postgres (powered by Neon) mitigates this with PgBouncer-based pooling, but only when using the **pooled** connection URL, not the direct connection URL.

**How to avoid:**
- Always use the **pooled connection string** (port 6543 on Neon/Vercel Postgres) for all application queries.
- Use the direct connection string (port 5432) only for `drizzle-kit migrate` runs (migrations can't go through PgBouncer in transaction mode).
- With Drizzle: configure two separate connections in `drizzle.config.ts` (direct for migrations) and in the app's `db.ts` (pooled).
- Never run migrations at startup inside a serverless function.

**Warning signs:**
- Single database URL used for both application queries and migrations.
- Errors like `no more connections` or `connection timeout` under any non-trivial load.
- `drizzle-kit migrate` failing with `prepared statement already exists` (classic PgBouncer transaction mode incompatibility).

**Phase to address:**
Foundation phase (database setup) — connection strategy must be correctly split before any feature work.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding artist names ("melike", "seref") as constants | Avoids DB lookup for routing | Impossible to add a 3rd artist without code deploy | Only in Phase 1; refactor to DB-driven config before v2 |
| Using `images.domains` deprecated array | Simpler syntax | Breaks on Next.js 15+; blocks future hostnames | Never — use `remotePatterns` from the start |
| Running migrations inside a Vercel serverless function on boot | Zero-config deploy | Pool exhaustion, race conditions on concurrent cold starts | Never |
| Storing translation strings directly in component files | Faster initial development | Impossible to extract for professional translator later | Never — use next-intl JSON files from day one |
| `localePrefix: 'never'` (cookie-only locale detection) | Cleaner URLs | Search engines can't index TR vs EN separately | Never for SEO-critical pages |
| Admin routes protected only in middleware | Simple implementation | CVE-2025-29927 bypass; rewrite risk | Never — always double-check in Server Component |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel Blob | Using `BLOB_READ_WRITE_TOKEN` in client-side code | Generate upload tokens server-side with `handleUpload()`, never expose write token to browser |
| Vercel Blob | Setting `access: 'private'` for gallery images | Use `access: 'public'` for all publicly visible artwork; CDN caching makes delivery fast and egress cheap |
| Vercel Blob | Not setting `contentType` on upload | Browser downloads the file instead of displaying it; always set `contentType: file.type` |
| Vercel Postgres | Using one DATABASE_URL for everything | Use pooled URL in app, direct URL in drizzle-kit; mixing the two causes prepared statement errors |
| Drizzle migrations on Vercel | Relying on Vercel's deploy build step to find `meta/_journal.json` | Set `out` directory path explicitly in `drizzle.config.ts`; run migrations via a separate script, not inline |
| next-intl + subdomain | Calling `createMiddleware()` at the top level without tenant routing first | Use the composition pattern: extract tenant from host, rewrite URL, then pass to next-intl middleware |
| Vercel wildcard domains | Not adding `*.uarttasarim.com` wildcard in Vercel project domain settings | Subdomains 404 in production even when middleware is correct; wildcard DNS + wildcard Vercel domain are both required |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No `width`/`height` (or no `fill` parent constraint) on gallery images | High CLS score, layout jumps during load | Always specify `width` + `height`, or use `fill` inside a sized container | First real user on a slow connection |
| `priority` prop on every image | Perceived perf win, actually loads everything at once | Use `priority` only on above-fold hero images; rely on lazy-load for gallery grids | When gallery has 10+ images |
| Fetching all products in a single query without pagination | Fast on dev DB with 5 items | Slow page load, possible timeout with 100+ artworks | ~50+ products |
| Uploading original high-res scans to Blob without size limits | Works fine for first upload | Storage costs spike; 30 MB TIFF over a gallery page destroys LCP | First large artwork upload |
| No `blurDataURL` placeholder on gallery images | Flash of empty space before image loads | Generate base64 blur placeholder at upload time or use a static color placeholder | Immediately visible on any non-instant connection |
| Server component fetching DB data on every page request with no caching | Acceptable latency in dev | Unnecessary DB hits; gallery pages should cache product lists | Under any real traffic |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Middleware-only admin auth (no server-side check) | Full admin bypass via CVE-2025-29927 (CVSS 9.1) | Add `getSession()` check in every admin Server Component/Route Handler |
| Exposing `BLOB_READ_WRITE_TOKEN` client-side | Anyone can upload/delete all artwork files | Server-side upload only; use `handleUpload()` for client uploads |
| No file type validation on admin image upload | Malicious file upload (SVG with JS, executable) | Validate MIME type server-side (not just Content-Type header); restrict to `image/jpeg`, `image/png`, `image/webp` |
| Direct Postgres URL in environment variables accessible to client bundles | DB credentials leaked in JS bundle | Ensure `DATABASE_URL` is never prefixed with `NEXT_PUBLIC_`; audit with `NEXT_PUBLIC_` grep |
| Admin login with no rate limiting | Brute-force credential attack | Add rate limiting middleware on `/api/auth/*` routes (Vercel Edge rate limiting or `upstash/ratelimit`) |
| i18n locale detection from `Accept-Language` without path prefix | Search engines index same content twice | Use path-based locale prefix (`/tr/`, `/en/`) as canonical; `localePrefix: 'always'` in next-intl |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No language indicator in the URL | User shares a link; recipient sees wrong language | Path-based locale prefix (`/en/`, `/tr/`) makes URLs shareable and language-stable |
| Language switcher shown on pages without translations | User clicks TR/EN switch, gets 404 | Only render locale switcher on internationalized routes; detect programmatically |
| WhatsApp button/link with no pre-filled message | User has to type product name manually | Pre-fill WhatsApp link: `wa.me/905...?text=Ürün: ${title}` with encoded product name |
| Gallery grid with uniform thumbnail sizes | Fine art looks like a product catalog | Use masonry or varied-height grid to preserve each artwork's natural proportions |
| Mobile image viewer without zoom | Art buyers can't examine detail | Implement pinch-zoom or a lightbox (e.g. yet-another-react-lightbox) from the start |
| Admin panel accessible on the public-facing domain | Confuses gallery visitors; SEO crawls admin routes | Mount admin exclusively on a non-indexed path (`/admin`) and add `X-Robots-Tag: noindex` response header |

---

## "Looks Done But Isn't" Checklist

- [ ] **Subdomain routing:** Works on `localhost` does NOT mean it works on Vercel preview or production — verify with actual deployed subdomain URL.
- [ ] **Admin auth:** Middleware redirects to `/login` does NOT mean the admin page is protected — verify that accessing `/admin/products` directly without a session returns 401/redirect from the Server Component itself.
- [ ] **Image optimization:** Images display in `npm run dev` does NOT mean `remotePatterns` is correctly configured — test with a real Vercel Blob URL in a preview deployment.
- [ ] **i18n:** Translations load in TR does NOT mean EN is complete — verify every translation key exists in both `tr.json` and `en.json` with a missing-key detection run.
- [ ] **Vercel Blob delete:** A "delete" button in admin that calls `del(url)` does NOT remove the file from the CDN cache immediately — test that deleted images are actually gone, not cached.
- [ ] **Database migrations:** Migrations running locally does NOT mean they work on Vercel deploy — verify the migration script runs correctly against the pooled Vercel Postgres URL.
- [ ] **Mobile gallery:** Gallery looks correct on desktop does NOT mean it works on mobile — test pinch-zoom, landscape orientation, and image aspect ratios on an actual device.
- [ ] **Future domain migration:** Subdomains are configured in middleware does NOT mean swapping to independent domains is trivial — verify the middleware hostname-matching logic handles both `melike.uarttasarim.com` AND `melikesanat.com` before planning the migration.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Admin auth bypass discovered post-launch | LOW (Vercel-hosted) / HIGH (self-hosted) | Upgrade Next.js immediately; add server-side session check to all admin routes; rotate admin credentials |
| Subdomain routing rewrite after i18n conflict | MEDIUM | Refactor single middleware file using composition pattern; regression-test all three domains |
| `next/image` broken in production after Blob migration | LOW | Update `remotePatterns` in `next.config.ts`; redeploy; clear Vercel Image Optimization cache via dashboard |
| Connection pool exhaustion in production | MEDIUM | Switch DATABASE_URL to pooled connection string; redeploy; no data loss |
| Translation keys missing at launch | LOW | Add missing keys to JSON files; no DB change needed; fast deploy |
| Oversized images causing slow gallery | MEDIUM | Write a one-time migration script to re-upload images through a resize pipeline; update Blob URLs in DB |
| Domain migration (subdomain → independent domain) breaks routing | MEDIUM | Add new hostname to middleware match list alongside old subdomain; test before DNS cutover |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Middleware-only admin auth | Foundation — Auth setup | Access `/admin` directly without a cookie; verify redirect from Server Component |
| i18n + subdomain middleware conflict | Foundation — Routing architecture | Request `http://melike.localhost:3000/` with tenant simulation; no 404 |
| next/image Blob remotePatterns | Storage phase — Image upload | Upload a real file to Blob; render it via `<Image>`; verify in preview deployment |
| Dev vs production domain detection | Foundation — Routing architecture | Deploy preview branch; verify all three domain routes resolve correctly |
| DB connection pool exhaustion | Foundation — Database setup | Run `drizzle-kit migrate` with direct URL; run app queries with pooled URL; confirm no errors |
| Oversized image uploads | Storage phase — Admin image upload | Set server-side file size limit before first admin test; attempt upload of a 10 MB file |
| Missing hreflang / locale SEO | i18n phase | Use Google Search Console URL Inspection on both `/tr/` and `/en/` equivalents |
| Future domain migration untested | Multi-domain routing phase | Add a second hostname alias to middleware; verify routing resolves before DNS changes |

---

## Sources

- [CVE-2025-29927 Technical Analysis — ProjectDiscovery](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)
- [CVE-2025-29927 — Snyk](https://snyk.io/blog/cve-2025-29927-authorization-bypass-in-next-js-middleware/)
- [Next.js Middleware Practical Guide: Path Matching & Pitfalls](https://eastondev.com/blog/en/posts/dev/20251225-nextjs-middleware-guide/)
- [Internationalization and subdomains — Next.js Discussion #68114](https://github.com/vercel/next.js/discussions/68114)
- [next-intl: Proxy / middleware docs](https://next-intl.dev/docs/routing/middleware)
- [How to set up subdomain multi-tenancy with next-intl — Discussion #84461](https://github.com/vercel/next.js/discussions/84461)
- [next/image remotePatterns search params bug — Issue #80294](https://github.com/vercel/next.js/issues/80294)
- [next/image Blob URL discussion — Discussion #19732](https://github.com/vercel/next.js/discussions/19732)
- [Next.js 16 remotePatterns issue — Issue #88873](https://github.com/vercel/next.js/issues/88873)
- [Vercel Blob Server Uploads docs](https://vercel.com/docs/vercel-blob/server-upload)
- [Connection Pooling with Vercel Functions](https://vercel.com/kb/guide/connection-pooling-with-functions)
- [Drizzle + Vercel Postgres migration not using env vars — Issue #4019](https://github.com/drizzle-team/drizzle-orm/issues/4019)
- [Drizzle migrations on Vercel — Discussion #71191](https://github.com/vercel/next.js/discussions/71191)
- [next-intl hreflang SEO guidance — buildwithmatija.com](https://www.buildwithmatija.com/blog/nextjs-internationalization-guide-next-intl-2025)
- [Subdomain-Based Routing Complete Guide — Medium](https://medium.com/@sheharyarishfaq/subdomain-based-routing-in-next-js-a-complete-guide-for-multi-tenant-applications-1576244e799a)
- [Build a multi-tenant app with Next.js and Vercel — Official Guide](https://vercel.com/guides/nextjs-multi-tenant-application)

---
*Pitfalls research for: Multi-domain art gallery / portfolio (Next.js 15+ / Vercel)*
*Researched: 2026-03-22*
