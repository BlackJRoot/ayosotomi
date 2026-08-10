# Progress Notes — Ayosotomi.com

<!--
A readable, human-facing summary of where the project stands: what's
built, the decisions behind it, and what's next. For the granular
technical log (bugs found/fixed, exact verification steps), see
LEARNING.md and MEMORY.md. This file is the higher-level view.
-->

**Last updated:** 2026-08-10 (content tooling)
**Live at:** https://ayosotomi.pages.dev/
**Repo:** github.com/BlackJRoot/ayosotomi

## Where things stand

**Phase 1 (Foundation) and Phase 2 (Core Features) are now both fully done** — Newsletter signup (Phase 2's last open item) is built and live. Phase 3 (Polish) is done except for one thing that needs you: running an actual Lighthouse score. Phase 4 (Launch) has started — SEO and the security pass are both done.

---

## Side project: content tooling

Not part of the phased roadmap — a set of tools you asked for, built and tested over several rounds. `npm run content` opens one menu for everything below (or run any of them directly):

- `npm run now` — update the Now page
- `npm run new-post` — scaffold a new essay/tutorial/project-log
- `npm run new-project` — scaffold a new project (this collection has no draft field, so it asks you to confirm before going live)

All three show one menu from the start — every field is editable at any time, in any order, with a "Quit" option always available and a clean Ctrl+C (no more error stack traces). They validate against the site's real schemas before writing anything, and `new-post`/`new-project` offer to open the file in your editor the moment it's saved. None of them touch git — you review and commit yourself. Fully tested by you in a real terminal, not just verified by me in isolation.

**README.md** was also rewritten — it was still the untouched generic Astro starter template, now describes the actual project.

## Phase 1 — Foundation ✅

Astro 7 + TypeScript (strict) + Tailwind 4, deployed to Cloudflare Pages as a plain static site (no backend, no database). The Dawn Light color palette and Newsreader/Inter/JetBrains Mono fonts were wired in from day one via CSS custom properties — a choice that paid off repeatedly later (see Dark Mode below).

## Phase 2 — Core Features ✅

- **Content Collections schema** (`blog`, `projects`, `now`) with Zod validation.
- **Homepage, Writing section, Projects section, Now page** all built and wired to real content.
- **Writing section** includes category filtering, syntax-highlighted code blocks, reading time, related posts, category-scoped Previous/Next navigation, and an RSS feed.
- **Substack migration:** your 4 real essays were migrated from your Substack export (not scraped — you provided the export directly, since live-scraping your own site ran into copyright-reproduction limits regardless of authorship). One dropped quote (a `callout-block` structure the converter missed) was caught and fixed after you compared against a screenshot of the real Substack page.
- **Blockquote/pull-quote styling** added so quoted material and emphasized lines read distinctly from body text.
- **Newsletter signup ✅** — a signup form lives at the end of every post and in the footer of every page *except the homepage*, which you asked to keep bare. It posts your email straight to Buttondown, with no server or API key involved on this site's side at all (more on that choice below). Double opt-in and one-click unsubscribe are both on, and the privacy policy now describes exactly what Buttondown collects. The footer heading also changes depending on what section you're on ("New writing, straight to your inbox" on writing pages, "Curious what's next? New write-ups by email." on Projects, "Want more of this? Occasional emails, no spam." on About/Now) instead of one line everywhere.
- **RSS feed now carries full post content**, not just the one-line excerpt — needed groundwork either way (any feed reader benefits), and specifically needed if you ever turn on Buttondown's RSS-to-email automation (see below). One known limitation: inline images inside a post body won't render in the feed — only affects posts with images embedded in the body text, not the featured cover image.

## Phase 3 — Polish ✅ (except the Lighthouse score)

- **About, Privacy Policy, custom 404 pages** built. About is intentionally draft-marked copy for you to personalize; Privacy describes only what's actually live (no cookies, no analytics yet — caught and fixed a stale claim that Analytics was already live when it wasn't, see 2026-08-10 below).
- **Homepage redesign** — went from a bare hero to an editorial layout: first-person greeting, a botanical sprig, a "Currently" pulse pulled live from the Now page, three navigation "bed" cards, and a featured-essay block with an optimized cover thumbnail. Went through several rounds of visual mockups before any code was written.
- **Dark Mode** — went well beyond the original spec (which just called for a time-based light/dark split) at your request to make it "much better": a three-state Auto/Light/Dark toggle (bookending your name in the header), Auto mode respects your OS preference before falling back to the clock, dual light/dark syntax-highlighting themes for code blocks, and a real bug fix along the way (article body text was briefly invisible in dark mode due to Tailwind Typography's own hardcoded colors).
- **Writing index polish** — a read/unread indicator bullet (uses the browser's native link-visited history, zero JavaScript) and a half-width divider between posts.
- **Fanned-deck project cards** — the Projects grid cards now have a layered, "stack of cards" hover effect.
- **Mobile + accessibility pass** — every one of the 15 routes verified clean at 375px width (zero horizontal overflow anywhere). Added a skip-to-content link, keyboard focus-visible styling, and fixed one heading-hierarchy slip in an essay.
- **Content cleanup** — separated your real writing (the 4 Substack essays) from everything I'd authored as sample/filler content. The sample project-log, tutorial, and project posts were removed and replaced with clearly-labeled, fully-worked reference examples you can copy from when writing real ones, plus a written guide (`specs/content-guide.md`) on how the `/writing` and `/projects` index pages work.
- **Still open:** the actual Lighthouse Performance/Accessibility score. There's no Lighthouse CLI available in this environment — you'll need to run it yourself (via Chrome DevTools or pagespeed.web.dev) against the live site. Everything on the code side is in good shape for a strong score (optimized images, self-hosted fonts, minimal JS), but the number itself hasn't been measured yet.

## Phase 4 — Launch ⏳ (SEO + security done, rest not started)

- **SEO ✅** — every page now has a canonical URL, OpenGraph tags, and Twitter Card tags. Blog posts use their existing homepage cover image (the one in `src/assets/covers/`) as the social-share preview image automatically — no extra work needed per post, it's the same image already used on the homepage. A sitemap now generates automatically at build time, and `robots.txt` points search engines at it. The RSS feed was checked and is structurally valid. Projects don't get a share image yet — the `cover` field on that schema isn't actually wired up to anything in the codebase yet, so there was no existing convention to build on; that's a separate small task if you want it later.
- **Security pass ✅** — every page now ships a security-headers set (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, and a few others) via a small script that runs after every build and writes them straight from the actual built HTML, so they can never drift out of sync with the site's real scripts. Verified working in a real browser (dark mode toggle and the Writing page's filter buttons both tested with the headers active, no errors). Also turned on Dependabot (automatic weekly PRs if a dependency needs a security update) and confirmed nothing sensitive has ever been committed to this repo's history. `npm audit` comes back clean.
- **Still open:** Comments (Cusdis), Analytics (Cloudflare Web Analytics — one click, no code), and the actual production launch checklist.

---

## Key decisions worth remembering

- **Astro 7.x, not 5.x** — the docs originally specified 5.x, but `npm create astro@latest` installed 7 by the time the project was scaffolded. Confirmed with you to go with latest rather than pin back.
- **Tailwind 4 is CSS-first** — no `tailwind.config.mjs`; design tokens live in an `@theme` block in `global.css`. This is also *why* dark mode was cheap to add later: every page already used semantic color tokens (`bg-bg`, `text-text`, etc.) instead of literal colors.
- **Cloudflare: classic Pages, not Workers Builds.** The first deploy attempt used Cloudflare's newer Workers Builds pipeline, which silently added an unused Workers adapter and bindings. Reconnected via the classic Pages project type instead — plain static hosting, matching the site's actual architecture.
- **`projects` collection has no `draft` field** — a deliberate choice (confirmed with you twice, most recently when declined again during the content cleanup) rather than an oversight. Anything added to `/projects` is immediately public.
- **Cover images use a folder convention, not a schema field** (`src/assets/covers/<post-slug>.<ext>`) — avoids touching the content schema (a Protected Area) while still getting full image optimization. Documented in `specs/content-guide.md`.
- **AI-authored content is never published live without your review.** Every piece of sample/placeholder content this project generated — draft blog posts, the About page copy, project write-ups, Now content — was either marked `draft: true`, clearly labeled `[Template]`, or held for your explicit sign-off before going live. This was treated as a hard rule throughout, not a one-off.
- **Newsletter signup has no API key, on purpose.** The original plan called for a Buttondown API key and a bit of server-side code to use it safely. Since this site has no server, that would've meant adding one just for this — a real change to how the whole site works, not just a feature. Buttondown has a public signup endpoint made for exactly this situation (plain static sites), so the form uses that instead: no key, nothing new to secure, and the site stays exactly as simple as it's been from day one. If you ever want extras that genuinely need the API (a live subscriber count, custom confirmation emails), that's the point to revisit this — not before.
- **RSS-to-email automation (Buttondown watching your feed and drafting/sending emails for you) is real and exists, but costs +$9/month** and you decided to hold off for now. If you turn it on later, use "create a draft" mode rather than auto-send, so you still get a last look before anything goes out.

## Next steps

1. **Run Lighthouse** (Performance + Accessibility) against https://ayosotomi.pages.dev/ — Chrome DevTools or pagespeed.web.dev, both mobile and desktop, ideally on the homepage and one image-heavy essay. Send back the scores and anything flagged; that closes out Phase 3.
2. **Fill in real content** — the About page, and your first real project/tutorial/project-log post, are still placeholders or templates waiting on your real words. (The Now page is done — it has your real content now.) `npm run new-post` / `npm run new-project` make this easier than hand-editing.
3. **Remaining Phase 4 items** — comments (Cusdis), analytics (Cloudflare Web Analytics), and the actual beta launch checklist.
4. **Optional, whenever you feel like it:** Buttondown branding, dashboard-side (not code) — update the Archives page to match the site (I gave you exact values earlier), and check whether "Custom CSS" under Settings → Email is free on your plan.
