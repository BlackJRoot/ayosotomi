# Progress Notes — Ayosotomi.com

<!--
A readable, human-facing summary of where the project stands: what's
built, the decisions behind it, and what's next. For the granular
technical log (bugs found/fixed, exact verification steps), see
LEARNING.md and MEMORY.md. This file is the higher-level view.
-->

**Last updated:** 2026-08-17 (numbered homepage sections, personality 404, Playground page)
**Live at:** https://ayosotomi.pages.dev/
**Repo:** github.com/BlackJRoot/ayosotomi

## Where things stand

**Phase 1 (Foundation) and Phase 2 (Core Features) are now both fully done** — Newsletter signup (Phase 2's last open item) is built and live. Phase 3 (Polish) is done except for one thing that needs you: running an actual Lighthouse score. Phase 4 (Launch) has started — SEO and the security pass are both done.

---

## Side project: colored tag/tech pills

Post tags (Writing index + post detail pages) and project tech stacks (Projects index + project detail pages) now render as colored pills instead of plain text/borders. The color is assigned deterministically by hashing the tag's own text into one of six hues — same tag always gets the same color everywhere it shows up, no hand-maintained color list to keep in sync as tags are added. All 12 light/dark color pairs verified at 5.5:1+ contrast (WCAG AA needs 4.5:1). Verified in the browser across both index and detail pages, both themes; `astro check` and a production build both clean.

## Side project: OG images + RSS polish (2026-08-17)

- **Auto-generated social-share images** (`astro-og-canvas`): every page
  now gets a branded OG card (Dawn Light colors, Newsreader/Inter, accent
  spine) generated at build time via `src/pages/og/[...route].ts`. A
  post's real cover still wins when it exists (BaseLayout falls back to
  `/og/<path>.png` only when no `image` prop is passed). This closed the
  known gap of projects having no share image. `/og/` excluded from the
  sitemap. Note: v0.13 API — `await OGImageRoute({...})`, no `param`.
- **RSS feed polish** (`/rss.xml`): XSL stylesheet (`public/rss/styles.xsl`)
  so humans clicking the feed link see a styled explainer page instead of
  raw XML (feed readers unaffected; browsers that don't do XSLT just show
  raw XML as before — verify in a real browser on the live site, the
  embedded dev browser sniffs feeds nonstandardly). For readers: items
  now carry `<category>` elements (category + tags), the channel has an
  atom:link self-reference and `<language>`, and inline images with
  unresolvable relative paths are dropped instead of shipped broken.

## Parked: Astro integrations shortlist (adopt when the moment comes)

Reviewed the integrations catalog 2026-08-17 (~1,800 listed; almost all
are framework adapters/CMS/deploy duplicates that don't fit). Worth
adopting later, in order:

1. **`astro-pagefind`** — fully static site search, no server. Adopt when
   post count makes `/writing` hard to scan (~20+ posts).
2. **`astro-expressive-code`** — copy buttons, file-name frames, line
   highlighting for code blocks. Adopt with the first real tutorial;
   needs care to preserve the dual light/dark Shiki setup.
3. **`@astrojs/mdx`** — components inside posts. Adopt only when a
   specific post needs one (diagram, callout).
4. **`astro-embed`** — lazy YouTube/tweet embeds; adopt with the first
   post that embeds media.
5. **`astro-icon`** — DX sugar for the hand-inlined SVGs; anytime.
- Skipped deliberately: Sentry (no meaningful client JS), astro-compress
  (measure Lighthouse first), framework adapters / server adapters /
  `@astrojs/db` / auth (need the server this site deliberately lacks),
  `@astrojs/tailwind` (old Tailwind way; the Vite plugin is correct for v4).
- **`astro-og-canvas` was #2 on this list and was adopted immediately** (see above).

## Side project: Pages CMS (write from your phone)

Set up 2026-08-17, confirmed working. The pain points were writing in raw
markdown and not being able to write away from the laptop — solved with
[Pages CMS](https://app.pagescms.org): a hosted UI over the GitHub repo,
no code or dependencies added to the site (just `.pages.yml` at the repo
root). Writing/Projects/Now all editable with proper form fields (the
Zod schema rules mirrored as UI validation) and a rich-text editor that
saves as markdown. Every save is a commit to main → Cloudflare deploy,
so **new posts default to draft: true in the CMS** (flip it off when
ready). Projects still have no draft field — saving one publishes it.
If a schema in `src/content/*.schema.ts` changes, update `.pages.yml`
to match. Editing from the phone: app.pagescms.org → bookmark it.

## Side project: content tooling

Not part of the phased roadmap — a set of tools you asked for, built and tested over several rounds. `npm run content` opens one menu for everything below (or run any of them directly):

- `npm run now` — update the Now page
- `npm run new-post` / `npm run edit-post` — scaffold a new essay/tutorial/project-log, or fix one that already exists
- `npm run new-project` / `npm run edit-project` — scaffold a new project, or fix one that already exists (this collection has no draft field, so both ask you to confirm before anything goes live)
- `npm run validate-content` — a non-interactive check you can run any time: validates every content file against the real rules, plus catches the two specific mistakes we found by hand in the Now page early on (things crammed into one comma-separated entry, unedited placeholder text left behind)

All the interactive ones show one menu from the start — every field editable at any time, in any order, with a "Quit" option always available and a clean Ctrl+C (no more error stack traces). The `edit-*` ones never touch the body text of an existing post/project, only its frontmatter, and safely rename the file (with a confirm first) if you change its slug. None of them touch git — you review and commit yourself.

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
- **Still open:** Comments (Cusdis), Analytics (attempted — Cloudflare's dashboard nav didn't cooperate, paused for now, not abandoned), and the actual production launch checklist.

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

## Side project: ideas from comparing against lifeofdanel.xyz

Not built yet — a brainstorm from a deep compare-and-contrast against Daniel Anomfueme's site (https://www.lifeofdanel.xyz/), a portfolio/homelab site you admire. Verified directly against the live site (DOM/CSS inspection, not guesswork). Recorded here so it survives a `/clear` — this list got lost once already after a chat clear and had to be rebuilt from scratch.

**Shipped from this comparison so far:**
- **Colored tag/tech pills** on posts and projects (see the section above) — his site hashes each tag to one of a fixed set of tinted, fully-rounded pill colors; ours works the same way.
- **Numbered homepage sections (2026-08-17)** — "01 Writing" / "02 Projects" sections on the homepage, each listing the 5 newest entries as numbered, clickable rows generated from the content collections at build time (auto-updates with new content). Added below the existing hero/beds/featured-essay layout.
- **Personality 404 (2026-08-17)** — "There's nothing planted here." (garden thread, matching the botanical sprig), a Klaus Mikaelson quote ("Every king needs an heir." — The Originals, picked per your request; swappable), and suggested paths (`/writing`, `/projects`, `/now` — home deliberately dropped per your request).
- **Playground page (2026-08-17)** — see below.

**Still just ideas:**
1. **Click-to-filter by tag** — his Blog/Projects pages show a full tag cloud; click a tag to filter the list. Ours only filters Writing by category (All/Essay). Would reuse the pill component we already built, just make it clickable and wire a filter.
2. **Hero typewriter animation** — confirmed via live DOM inspection: his hero headline types out role phrases word-by-word with a blinking cursor. The natural equivalent for us isn't job titles — it's cycling through the Now page's `workingOn`/`learning`/`reading` items (the same data already powering the homepage's "Currently" pulse in `src/pages/index.astro`) directly in the hero, more visually present than the current small pulse line.
3. **Dual project CTAs** — "View Details" / "Live Demo" as two distinct buttons on project cards instead of one link.
4. **Post share links** — his posts have LinkedIn/Twitter share links at the bottom; would fit a writing-focused site.

**Playground page — built (2026-08-17), unlisted.** Lives at `/playground`; all content in `src/data/playground.ts` (edit that file as the lab changes, page rebuilds from it). Design chosen from three mockup rounds: Daniel's bordered-card language re-inked in Dawn Light, services grouped under mono stack headings mirroring the real `~/docker` compose layout (photos/media/download/automation/monitoring), green status dots, tech pills only where they add info (Docker pill dropped everywhere as redundant — the intro says "self-host on Docker" once). Stat tiles: Containers (manual — from `docker ps -q | wc -l`, currently 15), Services + Stacks (auto-counted from the data), "1 Laptop". A "Public Services" section (LIVE badges, external links) renders automatically once the first internet-reachable service is added to the data file — nothing is public yet. "Open Source Homelab" GitHub callout card at the bottom currently points at the GitHub profile as a **placeholder** — swap in the real repo URL in `playground.ts` once the sanitized repo exists (scrub `gluetun/auth`, `common.env`, `*/config` before publishing!). Unlisted three ways: no nav link, `noindex` meta (new `noindex` prop on BaseLayout), excluded from the sitemap (filter in `astro.config.mjs`). Security note stands: anything not meant to be public should be unreachable from the internet (e.g. behind Tailscale), not just unlinked.

**Experience/Resume page — undecided, needs your call.** Ayosotomi reads as a personal-essay/writing site, not a job-hunting portfolio, so a literal corporate resume page may fight the brand. Two honest options on the table: skip it entirely (About + Now already cover "who you are"/"what you're doing"), or a loose milestones-style timeline framed around things built/shipped rather than job titles, if you do want history on the site.

**Noted but not recommended for direct copying:** his Speaking page and full corporate-style Experience timeline — both fit his consultant/speaker positioning, not obviously ayosotomi's. And a reminder of where we're already ahead of his site: the 3-state Auto/Light/Dark toggle (his is manual light/dark only), and RSS carrying full post content.

## Next steps

1. **Run Lighthouse** (Performance + Accessibility) against https://ayosotomi.pages.dev/ — Chrome DevTools or pagespeed.web.dev, both mobile and desktop, ideally on the homepage and one image-heavy essay. Send back the scores and anything flagged; that closes out Phase 3.
2. **Fill in real content** — the About page, and your first real project/tutorial/project-log post, are still placeholders or templates waiting on your real words. (The Now page is done — it has your real content now.) `npm run new-post` / `npm run new-project` make this easier than hand-editing.
3. **Remaining Phase 4 items** — comments (Cusdis), and the actual beta launch checklist.
4. **Analytics, whenever you're up for tackling Cloudflare's dashboard again** — the standalone Web Analytics page didn't have a working setup snippet for this site; worth checking the `ayosotomi` project directly under Workers & Pages / Compute for an Analytics tab instead, next time.
5. **Optional, whenever you feel like it:** Buttondown branding, dashboard-side (not code) — update the Archives page to match the site (I gave you exact values earlier), and check whether "Custom CSS" under Settings → Email is free on your plan.
