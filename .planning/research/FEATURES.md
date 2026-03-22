# Feature Research

**Domain:** Multi-artist art gallery / portfolio / vitrine website
**Researched:** 2026-03-22
**Confidence:** HIGH

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unprofessional for an art context.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| High-quality image display with lightbox | Art visitors must zoom in to inspect brushwork, texture, detail — standard expectation on every gallery site | MEDIUM | Use PhotoSwipe or similar; serve 2500px+ originals; captions in lightbox |
| Artwork detail page: title, medium, dimensions, year, price | Collectors and curators expect full provenance data before inquiring | LOW | These are the minimum metadata fields — missing any feels amateurish |
| Category / medium filtering on main gallery | Visitors scan by type (painting, sculpture, ceramics, print) — unfiltered flat list is overwhelming | LOW | Simple URL-based filter; no JS-heavy client state needed |
| Contact / inquiry form per artwork or per artist | The vitrine model lives or dies here — if there is no clear path to "I want this," the sale is lost | LOW | Map to WhatsApp CTA + email form; both channels in parallel |
| Artist bio / about page | Collectors buy the story as much as the work; a bare gallery without biography feels anonymous | LOW | Photo + statement + short bio; same page on CV subdomain |
| Mobile-responsive layout | >60% of art browsing happens on mobile; a desktop-only experience looks neglected | MEDIUM | Gallery grid must reflow; lightbox must support pinch-to-zoom |
| Consistent navigation across all three domains | Users will land on a subdomain and need to find the main site and the other artist — broken wayfinding kills trust | LOW | Shared header/footer component; "U-Art Tasarim" link always present |
| Language switcher (TR / EN) | International collectors and exhibition curators are the target beyond local market; Turkish-only = invisible | LOW | next-intl or next-i18next; hreflang tags for SEO |
| Clear "Available / Not available / Sold" status per artwork | Serious buyers will not waste time inquiring about sold pieces; missing this wastes both sides' time | LOW | Single enum field; "Sold" artworks can remain visible as portfolio signal |
| SEO basics: page titles, meta descriptions, image alt text | Gallery content is highly visual — search engines need textual signals to index it; art is a high-intent search category | LOW | Each artwork gets title + artist + medium as alt text; structured data for artworks optional but valuable |
| Fast image loading | Art sites routinely fail here; slow images = visitors leave before seeing the work | MEDIUM | Vercel Blob + Next.js Image component with WebP/AVIF + lazy loading; critical above-fold image eager |

### Artist CV Subdomain Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Exhibition history (solo / group, reverse chronological) | The exhibition record is the most important credential in the art world — galleries and curators check this first | LOW | Simple list; solo / group / international / national grouping |
| Awards and grants section | Signals institutional recognition; missing it when an artist has awards looks like an oversight | LOW | Year + award name + awarding body |
| Education section | Standard CV section; expected even when de-emphasized | LOW |  |
| Artist statement | Provides context for the work; curators and press need a quotable, shareable statement | LOW | 150–300 words; translatable TR/EN |
| Portfolio gallery | The CV subdomain must also show work — bio without images is incomplete | LOW | Can reuse artwork data from main site, filtered by artist |
| Press / publications section (optional but expected for established artists) | Validates the artist in media; Melike and Şeref may have press coverage to list | LOW | Optional; show section only if content exists |
| Contact form on CV page | Exhibition inquiries, collaboration requests, and press contact go here — different intent than purchase inquiry | LOW | Distinct from main site form; routes to artist's own email |

---

### Differentiators (Competitive Advantage)

Features that set this platform apart. Not required by convention, but add value in this specific context.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| WhatsApp CTA as primary purchase channel | Turkish art market strongly favors WhatsApp for high-value personal transactions; frictionless mobile-first purchase path that most Western gallery platforms miss | LOW | `wa.me/` deep link with pre-filled message (artwork title + page URL); one button per artwork detail page |
| Two-artist shared platform with distinct identities | Most portfolio tools are single-artist; a shared vitrine with per-artist subdomains signals a real studio practice, not a hobbyist page | MEDIUM | Multi-domain Next.js middleware routing; each subdomain has distinct color accent or typography weight while sharing base design system |
| Artwork inquiry pre-fills artist + artwork context | When a buyer clicks "Inquire" on a specific artwork, the form/WhatsApp message pre-fills with artwork title, artist name, and page URL — reduces friction and gives artists full context without back-and-forth | LOW | Query param or state injected into contact form on artwork page |
| Gallery-aesthetic design language (white space, large type, minimal chrome) | Most small-artist websites use cluttered templates; a true gallery-minimalism aesthetic elevates perceived value of the work and matches how collectors expect to browse | MEDIUM | Tailwind design tokens: off-white background, single serif display font, generous padding — enforced as shared design system |
| Artwork process / detail notes (optional per piece) | Collectors of mixed-media and ceramics care deeply about technique and materials; a paragraph about the firing process or material sourcing creates connection and justifies price | LOW | Optional long-description field in admin; hidden if empty |
| Sold works visible as archive | Sold pieces signal demand and market activity; removing them entirely loses portfolio depth and credibility signals | LOW | "Sold" badge overlay; sold works still browsable; filter option to hide sold |
| hreflang + structured data (schema.org VisualArtwork) | Art is searchable — "ceramic sculpture Istanbul artist" has real organic search volume; structured data enables rich results in Google | MEDIUM | schema.org/VisualArtwork: name, creator, artMedium, width, height, dateCreated; JSON-LD in artwork detail page |
| Direct future domain migration support | Each artist subdomain will eventually become a standalone domain; building domain-routing in middleware from day one means zero future rewrite | MEDIUM | Next.js middleware checks `Host` header; artist config maps domains to artist ID — adding new domain = one config line |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas but create disproportionate cost or risk for this project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Online payment / checkout | "Why not sell directly?" | Requires payment gateway integration (Stripe/iyzico), Turkish financial regulations, order management, shipping logistics, returns policy — massive scope increase for v1 of a vitrine product | WhatsApp + contact form inquiry; revisit payment in v2 only after validating demand |
| User accounts for collectors / wishlist | Personalization, save favourites | Adds auth flow, session management, GDPR obligations, and email verification for a site whose entire audience is probably < 500 unique visitors/month at launch; complexity far exceeds value | Anonymous "Inquire" with email capture is sufficient; no sessions needed |
| Blog / news section | Content marketing, SEO | Requires ongoing editorial effort; two working artists will not maintain a blog; empty blog section signals neglect and hurts credibility | Exhibition history and artist statement serve the same SEO + credibility purpose with no maintenance overhead |
| Social media auto-posting | Reduce duplicate posting effort | Requires OAuth tokens, webhook maintenance, and platform API fragility (Instagram API changes constantly); high maintenance for marginal gain | Manual sharing with pre-generated image + caption in admin panel; link to Instagram in footer |
| Real-time chat widget | Instant buyer communication | Third-party scripts (Intercom, Tidio) add 100–300ms page load penalty; artists cannot monitor chat continuously; abandoned chats look worse than no chat | WhatsApp link is real-time and already on the artist's phone |
| Artwork print-on-demand | Passive revenue stream | Introduces fulfilment complexity and brand dilution risk; originals-only positioning is a key value signal for U-Art | Keep focus on original works; mention "prints available on request" in artwork description if applicable |
| Visitor analytics dashboard in admin | Know your audience | Adding a custom analytics UI in admin duplicates what Vercel Analytics or Plausible already provide for free; wasted dev time | Embed Vercel Analytics (zero config) or Plausible snippet; link to dashboard from admin sidebar |

---

## Feature Dependencies

```
[Multi-domain routing (middleware)]
    └──required by──> [Artist CV subdomains]
    └──required by──> [Future standalone domain migration]

[Artwork data model (title, medium, dimensions, price, status, images, artist FK)]
    └──required by──> [Gallery listing page with filter]
    └──required by──> [Artwork detail page]
    └──required by──> [Admin CRUD for artworks]
    └──required by──> [Artist portfolio on CV subdomain]
    └──required by──> [WhatsApp / inquiry pre-fill]

[Image storage (Vercel Blob)]
    └──required by──> [Artwork image display]
    └──required by──> [Admin image upload]
    └──required by──> [Artist profile photo]

[i18n setup (next-intl)]
    └──required by──> [All user-facing pages]
    └──required by──> [SEO hreflang tags]
    └──required by──> [Language switcher UI]

[Admin authentication]
    └──required by──> [Admin panel (all CRUD)]
    └──required by──> [Message inbox]

[Contact / inquiry form]
    └──enhances──> [WhatsApp CTA]  (both serve same user goal, different friction levels)

[Artwork "Available / Sold" status]
    └──enhances──> [Sold works archive]

[Artist CV sections (bio, exhibitions, awards)]
    └──independent of──> [Main gallery artwork data]  (different content, same artist FK)
```

### Dependency Notes

- **Artwork data model must be finalized before any other feature:** Every user-facing page — gallery, detail, artist CV gallery, admin — depends on the shape of the artwork record. Schema changes after pages are built cause cascading rewrites.
- **Multi-domain middleware must be built before subdomain pages:** Attempting to build CV pages before routing is in place means building against localhost assumptions that break on Vercel.
- **i18n setup must precede all page creation:** Retrofitting i18n into existing pages is painful; string extraction and locale files should exist from the first page.
- **Admin auth is a prerequisite gate for the entire admin panel:** Build it first within the admin phase; do not build admin UI before auth is confirmed working.
- **WhatsApp CTA enhances but does not replace contact form:** Buyers on desktop may prefer email; mobile buyers prefer WhatsApp. Both should coexist on artwork detail page.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what is needed to go live and validate the concept with real visitors.

- [ ] Main gallery: artwork grid with category filter — core browsing experience, without this there is no product
- [ ] Artwork detail page: full metadata, image lightbox, WhatsApp CTA + inquiry form — the conversion point of the vitrine model
- [ ] Artist CV subdomains: bio, photo, exhibition list, awards, portfolio gallery — the professional credential pages
- [ ] Artist contact form on CV pages — enables exhibition / collaboration inquiries separate from purchase inquiries
- [ ] Admin panel: artwork CRUD with image upload — artists must be able to manage content without developer involvement
- [ ] Admin panel: CV content editing (bio, exhibitions, awards) — same requirement
- [ ] Admin panel: message inbox — artists need to see inquiries without checking email only
- [ ] Multi-domain routing: uarttasarim.com + melike.uarttasarim.com + seref.uarttasarim.com — the three-site structure is a stated core requirement
- [ ] TR / EN language support on all pages — international reach is a stated goal
- [ ] Available / Sold status per artwork — functional necessity for a vitrine model
- [ ] Mobile-responsive layout — majority of traffic will be mobile

### Add After Validation (v1.x)

Features to add once core is confirmed working with real users.

- [ ] Sold works archive / filter — add when sold inventory grows enough to warrant it (trigger: 10+ sold works)
- [ ] Artwork process notes / extended description — add when artists have content to fill it (trigger: artists request it)
- [ ] Press / publications section on CV — add when content exists (trigger: artist provides press list)
- [ ] schema.org VisualArtwork structured data — add once pages are stable; SEO benefit accrues over months anyway
- [ ] Vercel Analytics integration — add at launch but monitoring becomes actionable after 4–6 weeks of data

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Online payment / checkout — defer until vitrine model is validated and demand clearly exceeds WhatsApp inquiry volume
- [ ] Standalone custom domains per artist (melike.com, seref.com) — infrastructure is built to support this; actual domain switch is a DNS + Vercel config operation, not a code change
- [ ] Print-on-demand integration — only if artists decide to offer prints; evaluate after v1 is live
- [ ] Email newsletter for new works / exhibitions — only if artists commit to a publishing cadence

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Artwork grid + category filter | HIGH | LOW | P1 |
| Artwork detail page + metadata | HIGH | LOW | P1 |
| Image lightbox with zoom | HIGH | LOW | P1 |
| WhatsApp CTA on artwork page | HIGH | LOW | P1 |
| Mobile responsive layout | HIGH | MEDIUM | P1 |
| Artist CV bio + photo | HIGH | LOW | P1 |
| Exhibition list on CV | HIGH | LOW | P1 |
| Multi-domain routing | HIGH | MEDIUM | P1 |
| TR / EN i18n | HIGH | MEDIUM | P1 |
| Admin artwork CRUD + image upload | HIGH | MEDIUM | P1 |
| Admin CV editing | MEDIUM | LOW | P1 |
| Admin message inbox | MEDIUM | LOW | P1 |
| Available / Sold status badge | HIGH | LOW | P1 |
| Contact form per artist CV | MEDIUM | LOW | P1 |
| Inquiry pre-fill with artwork context | MEDIUM | LOW | P2 |
| Sold works archive | MEDIUM | LOW | P2 |
| Artwork process / detail notes | MEDIUM | LOW | P2 |
| schema.org structured data | MEDIUM | LOW | P2 |
| Press / publications section | LOW | LOW | P2 |
| Analytics integration | MEDIUM | LOW | P2 |
| Future standalone domain support | LOW | LOW | P2 — infrastructure built in v1, activation is config |
| Online payment | MEDIUM | HIGH | P3 |
| Email newsletter | LOW | MEDIUM | P3 |
| Print-on-demand | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Artsy / Artlogic | Saatchi Art | Our Approach |
|---------|-----------------|-------------|--------------|
| Artist CV with exhibitions | Full structured CV, integrated into artwork listings | Basic bio only | Full CV on subdomain: exhibitions, awards, education, statement |
| Purchase flow | Inquiry form → gallery mediates | Checkout with cart, payment, shipping | WhatsApp CTA + inquiry form; no payment in v1 |
| Multi-artist shared platform | Yes — gallery represents many artists | Yes — marketplace model | Two artists, single codebase, per-artist subdomain identity |
| Artwork metadata | Comprehensive (provenance, exhibition history, literature) | Medium, price + medium + dimensions | Core fields: title, medium, dimensions, year, price, status, artist |
| Language support | English-primary, no per-site i18n | English only | TR + EN from day one, hreflang SEO |
| Admin / CMS | Full gallery management suite | Artist self-service portal | Custom admin panel: artwork CRUD, CV editing, message inbox |
| Sold works visible | Yes — archived with provenance | No — removed after sale | Visible with "Sold" badge; strengthens portfolio credibility |
| Mobile experience | Good on Artsy, poor on Artlogic | Good | First-class mobile; pinch-to-zoom lightbox |

---

## Sources

- [10 Essential Elements Every Visual Artist Portfolio Website Needs in 2025](https://www.workwithem.co.uk/blog/essential-elements-artist-portfolio-website-2025)
- [Art Portfolio Website Checklist 2025 — Vsble](https://www.getvsble.com/blog/art-portfolio-website-checklist-2025-en)
- [Visual Artist Curriculum Vitae: Recommended Conventions — College Art Association](https://www.collegeart.org/standards-and-guidelines/guidelines/visual-art-cv)
- [How to Write an Artist CV — Artwork Archive](https://www.artworkarchive.com/blog/how-to-write-an-artist-cv-to-get-more-opportunities)
- [Artlogic Gallery Website Features](https://artlogic.net/products/gallery/websites/)
- [Artlogic + Artsy Integration: shared fields](https://artlogic.net/products/gallery/artsy-integration/)
- [Enhance art portfolio website with advanced lightbox features — Beyondspace](https://www.beyondspace.studio/blog/enhance-art-portfolio-website-with-advanced-lightbox-features)
- [Should Artists Place Prices on Their Art Websites? — Renee Phillips](https://renee-phillips.com/should-artists-place-prices-on-their-art-websites/)
- [How to Create a Multilingual Portfolio Website — Pixpa](https://www.pixpa.com/blog/how-to-create-a-multilingual-portfolio-website)
- [7 Best Art Portfolio Websites for 2026 — Lovable](https://lovable.dev/guides/best-art-portfolio-websites-2026)

---

*Feature research for: multi-artist art gallery / portfolio / vitrine web platform (U-Art Tasarim)*
*Researched: 2026-03-22*
