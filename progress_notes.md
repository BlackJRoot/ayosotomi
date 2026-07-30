# Progress Notes — Ayosotomi.com

<!--
A readable, human-facing summary of where the project stands: what's
built, the decisions behind it, and what's next. For the granular
technical log (bugs found/fixed, exact verification steps), see
LEARNING.md and MEMORY.md. This file is the higher-level view.
-->

**Last updated:** 2026-07-31
**Live at:** https://ayosotomi.pages.dev/
**Repo:** github.com/BlackJRoot/ayosotomi

## Where things stand

**Phase 1 (Foundation) and Phase 2 (Core Features) are done.** Phase 3 (Polish) is done except for one thing that needs you: running an actual Lighthouse score. Phase 4 (Launch) hasn't started.

---

## Phase 1 — Foundation ✅

Astro 7 + TypeScript (strict) + Tailwind 4, deployed to Cloudflare Pages as a plain static site (no backend, no database). The Dawn Light color palette and Newsreader/Inter/JetBrains Mono fonts were wired in from day one via CSS custom properties — a choice that paid off repeatedly later (see Dark Mode below).

## Phase 2 — Core Features ✅ (except Newsletter)

- **Content Collections schema** (`blog`, `projects`, `now`) with Zod validation.
- **Homepage, Writing section, Projects section, Now page** all built and wired to real content.
- **Writing section** includes category filtering, syntax-highlighted code blocks, reading time, related posts, category-scoped Previous/Next navigation, and an RSS feed.
- **Substack migration:** your 4 real essays were migrated from your Substack export (not scraped — you provided the export directly, since live-scraping your own site ran into copyright-reproduction limits regardless of authorship). One dropped quote (a `callout-block` structure the converter missed) was caught and fixed after you compared against a screenshot of the real Substack page.
- **Blockquote/pull-quote styling** added so quoted material and emphasized lines read distinctly from body text.
- **Newsletter signup is on hold** — needs a Buttondown account and API key from you before it can be built. Nothing blocks the rest of the site on this.

## Phase 3 — Polish ✅ (except the Lighthouse score)

- **About, Privacy Policy, custom 404 pages** built. About is intentionally draft-marked copy for you to personalize; Privacy describes only what's actually live (no cookies, Cloudflare Web Analytics only).
- **Homepage redesign** — went from a bare hero to an editorial layout: first-person greeting, a botanical sprig, a "Currently" pulse pulled live from the Now page, three navigation "bed" cards, and a featured-essay block with an optimized cover thumbnail. Went through several rounds of visual mockups before any code was written.
- **Dark Mode** — went well beyond the original spec (which just called for a time-based light/dark split) at your request to make it "much better": a three-state Auto/Light/Dark toggle (bookending your name in the header), Auto mode respects your OS preference before falling back to the clock, dual light/dark syntax-highlighting themes for code blocks, and a real bug fix along the way (article body text was briefly invisible in dark mode due to Tailwind Typography's own hardcoded colors).
- **Writing index polish** — a read/unread indicator bullet (uses the browser's native link-visited history, zero JavaScript) and a half-width divider between posts.
- **Fanned-deck project cards** — the Projects grid cards now have a layered, "stack of cards" hover effect.
- **Mobile + accessibility pass** — every one of the 15 routes verified clean at 375px width (zero horizontal overflow anywhere). Added a skip-to-content link, keyboard focus-visible styling, and fixed one heading-hierarchy slip in an essay.
- **Content cleanup** — separated your real writing (the 4 Substack essays) from everything I'd authored as sample/filler content. The sample project-log, tutorial, and project posts were removed and replaced with clearly-labeled, fully-worked reference examples you can copy from when writing real ones, plus a written guide (`specs/content-guide.md`) on how the `/writing` and `/projects` index pages work.
- **Still open:** the actual Lighthouse Performance/Accessibility score. There's no Lighthouse CLI available in this environment — you'll need to run it yourself (via Chrome DevTools or pagespeed.web.dev) against the live site. Everything on the code side is in good shape for a strong score (optimized images, self-hosted fonts, minimal JS), but the number itself hasn't been measured yet.

## Phase 4 — Launch ⏳ (not started)

Comments (Cusdis), Analytics (Cloudflare Web Analytics — one click, no code), SEO (meta tags, OpenGraph images, sitemap), a security pass, and the actual production launch checklist.

---

## Key decisions worth remembering

- **Astro 7.x, not 5.x** — the docs originally specified 5.x, but `npm create astro@latest` installed 7 by the time the project was scaffolded. Confirmed with you to go with latest rather than pin back.
- **Tailwind 4 is CSS-first** — no `tailwind.config.mjs`; design tokens live in an `@theme` block in `global.css`. This is also *why* dark mode was cheap to add later: every page already used semantic color tokens (`bg-bg`, `text-text`, etc.) instead of literal colors.
- **Cloudflare: classic Pages, not Workers Builds.** The first deploy attempt used Cloudflare's newer Workers Builds pipeline, which silently added an unused Workers adapter and bindings. Reconnected via the classic Pages project type instead — plain static hosting, matching the site's actual architecture.
- **`projects` collection has no `draft` field** — a deliberate choice (confirmed with you twice, most recently when declined again during the content cleanup) rather than an oversight. Anything added to `/projects` is immediately public.
- **Cover images use a folder convention, not a schema field** (`src/assets/covers/<post-slug>.<ext>`) — avoids touching the content schema (a Protected Area) while still getting full image optimization. Documented in `specs/content-guide.md`.
- **AI-authored content is never published live without your review.** Every piece of sample/placeholder content this project generated — draft blog posts, the About page copy, project write-ups, Now content — was either marked `draft: true`, clearly labeled `[Template]`, or held for your explicit sign-off before going live. This was treated as a hard rule throughout, not a one-off.

## Next steps

1. **Run Lighthouse** (Performance + Accessibility) against https://ayosotomi.pages.dev/ — Chrome DevTools or pagespeed.web.dev, both mobile and desktop, ideally on the homepage and one image-heavy essay. Send back the scores and anything flagged; that closes out Phase 3.
2. **Newsletter signup** — whenever you set up a Buttondown account and API key, that resumes Phase 2's last open item.
3. **Fill in real content** — the About page, the Now page, and your first real project/tutorial/project-log post are all currently placeholders or templates waiting on your real words.
4. **Phase 4 (Launch)** once the above are settled — comments, analytics, SEO, security, and the actual beta launch.
