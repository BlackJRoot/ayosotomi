# Learning Log 🎓

<!--
A running log of what I'm learning as this project gets built, step by step.
Each entry: what the step was, the concepts behind the code, and any
problems that came up + how they got solved.
-->

## Phase 2

<!-- Some Phase 2 content is migrated from https://theayodilemma.substack.com -->

### Step 1 — Content Collections schema (`src/content.config.ts`)

**What it is:** The typed contract for all Markdown content on the site. Three collections — `blog`, `projects`, `now` — each with a Zod schema describing exactly what fields its frontmatter must have.

**Concepts learned:**
- **`astro:content`** is a *virtual module* — it isn't a real file anywhere in `node_modules`, Astro generates it at build/dev time. That's why `defineCollection` "just works" without me writing the plumbing myself.
- **Loaders** tell Astro *where* content lives and how to find it. `glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' })` means "any `.md`/`.mdx` file, at any depth" — that's the mechanism that lets posts live nested under `blog/essays/`, `blog/tutorials/`, `blog/project-logs/` and still all get picked up as one `blog` collection.
- **Zod** (`z`) is the schema/validation layer. Each field in `schema: z.object({...})` maps to a frontmatter key:
  - `z.string().max(80, '...')` — a string, with a max length and a custom error message if it's exceeded.
  - `z.coerce.date()` — takes a plain string like `2026-07-23` from frontmatter and *coerces* it into a real JS `Date` object, so `.toLocaleDateString()` etc. work later without manual parsing.
  - `z.enum([...])` — the value must be exactly one of the listed strings. Typo `catagory: 'essai'` and the **build fails immediately** with a clear error — no silently-broken page in production.
  - `.optional()` — the field can be left out of frontmatter entirely.
  - `.default([])` — if omitted, Astro fills in a default (here, an empty array) so the field is never `undefined` in code.
- **Why this matters:** the schema is simultaneously validation *and* documentation — read this one file and you know exactly what every blog post/project/now-entry needs, and the build enforces it instead of trusting me to remember.
- **`export const collections = { blog, projects, now }`** is the actual thing Astro looks for — the name→definition map that `getCollection('blog')` reads from elsewhere in the app.

**Problems encountered + solutions:**
1. **`'z' is deprecated` (36 hints from `astro check`).** Astro 7 deprecated `import { z } from 'astro:content'` in favor of a dedicated export. **Fix:** `import { z } from 'astro/zod'` instead — same Zod (v4), just re-exported from a non-deprecated path.
2. **`z.string().url()` deprecated.** Zod v4 moved format validators like URL checking to top-level functions. **Fix:** `z.url().optional()` instead of `z.string().url().optional()` for `githubUrl`/`demoUrl` in the `projects` schema.
3. After both fixes, `npx astro check` reported **0 errors, 0 warnings, 0 hints**, and `npm run build` completed cleanly. The `[glob-loader] base directory does not exist` warnings that still show up are expected — no content files exist yet (that's Step 3), not a bug.

### Step 2 — Utility functions (`src/lib/utils.ts`)

**What it is:** Two pure functions — `calculateReadingTime` and `formatDate` — that the Writing/Projects/Now pages will all reuse instead of repeating date/word-count logic on every page.

**Concepts learned:**
- **Pure functions** — same input always gives the same output, no side effects (no DOM access, no network calls, no mutating arguments). That's exactly what makes them easy to sanity-check with plain assertions instead of a full test framework.
- **`content.trim().split(/\s+/).filter(Boolean)`** — three-step word count:
  - `.trim()` drops leading/trailing whitespace.
  - `.split(/\s+/)` splits on *any run* of whitespace (regex, not a literal `' '`) — handles multiple spaces, tabs, and newlines between words correctly.
  - `.filter(Boolean)` removes empty strings from the result. Gotcha: `''.split(/\s+/)` returns `['']`, not `[]` — without the filter, empty content would count as "1 word" instead of 0.
- **`Math.ceil()` + `Math.max(1, ...)`** — reading time always rounds *up* (a 3-min-10-sec read shows "4 min"), and never shows "0 min read" for a very short post.
- **Timezone bug in date formatting.** `z.coerce.date()` parses a frontmatter date like `2026-07-23` as **midnight UTC**. If `toLocaleDateString` isn't told which timezone to render in, it uses whatever timezone the *build machine* happens to be in — for any UTC-negative timezone, midnight UTC on the 23rd is still the *22nd* locally, so the date silently displays one day early. **Fix:** pass `timeZone: 'UTC'` explicitly, so the displayed date always matches what's written in frontmatter, no matter where the build runs. This wasn't in the original Tech Design snippet — added it as a correctness fix.
- **Dev-only assertions.** `if (import.meta.env.DEV) { console.assert(...) }` — `code_patterns.md` calls for "a simple assertion... for pure utility logic" since there's no Vitest suite yet. Gating on `import.meta.env.DEV` means these checks run in `astro dev`/`astro check` but never ship in the production build.

**Problems encountered + solutions:**
1. No type errors from `astro check` (0 errors/0 warnings/0 hints). Ran the same logic through plain Node outside the Astro/Vite pipeline as an extra sanity check — confirmed `calculateReadingTime('')` → 1, `calculateReadingTime('word '.repeat(400))` → 2, `formatDate(new Date('2026-07-23'))` → `"July 23, 2026"`. All matched expectations, including the UTC fix.

### Step 3 — Sample Markdown content (`src/content/{blog,projects,now}/`)

**What it is:** Real content files matching the Step 1 schemas — 3 blog posts (one per subfolder), 1 project, 1 now entry — so later steps have something real to render, and so the schemas themselves get exercised against real frontmatter instead of staying theoretical.

**Concepts learned:**
- **A schema is only proven by data hitting it.** `astro check`/`astro build` re-validate every content file's frontmatter against its Zod schema on every run — a bad date format, a mistyped enum value, or an array over its `.max()` limit fails the build immediately, naming the exact file. Writing real content right after the schema is the fastest way to find out if the schema itself has a mistake.
- **The glob loader's nesting.** Splitting posts across `blog/essays/`, `blog/tutorials/`, `blog/project-logs/` and still seeing them all validate as one `blog` collection confirms `pattern: '**/*.{md,mdx}'` really does mean "any depth," not just the top level.
- **HTML comments in Markdown don't render.** `<!-- DRAFT: ... -->` at the top of a post is visible in the source file but produces no output in the built HTML — useful for leaving instructions to a future editor without it leaking onto the page.
- **`draft` as a content-level kill switch.** The `blog` schema's `draft: z.boolean().default(false)` field, combined with a `getCollection('blog', ({ data }) => !data.draft)` filter (from `tech_stack.md`'s example), means content can exist in the repo and pass validation without ever appearing on the live site — the mechanism Astro Content Collections provides for "written but not ready."

**Problems encountered + solutions:**
1. **No draft field on the `projects` schema.** Unlike `blog`, the `projects` schema (Step 1) has no `draft` boolean, so the one project entry added here (`ayosotomi-com.md`) will be publicly visible as soon as the Projects page is built in Step 7 — there was no way to stage it as hidden. Not a bug, just a gap surfaced by writing real content: worth deciding *before* Step 7 whether `projects` should get a `draft` field too.
2. **Authenticity boundary for AI-written content on a real person's site.** All 3 blog posts are marked `draft: true` on purpose — the content is factually accurate (the project-log post is a true recap of the actual Phase 1 build; the Docker/Pi-hole tutorial is technically correct), but it's written in the site owner's voice by an AI, not the owner. `draft: true` keeps it out of production until reviewed/rewritten, in line with `AGENTS.md`'s "no placeholder content in production" rule.
3. `astro check` and `npm run build` both passed with 0 errors after adding all 6 files — confirms every frontmatter field (including the trickier ones: `z.coerce.date()`, `z.enum()`, `z.url()`, array `.max()`) validated correctly on the first attempt.

### Interlude — Flipping `draft: true` → `false` on all 3 posts

The human asked to un-draft the posts to see them live. Worth noting what that did and didn't do: flipping a frontmatter field is a one-line, always-safe edit (Zod just re-validates `draft` as a boolean either way) — but it has **zero visible effect** until a page actually calls `getCollection('blog', ...)`. Right now nothing does: the homepage is still the static Phase-1 hero, and there's no Writing page yet. This is a good illustration of the separation Astro's Content Collections create — content existing and passing validation is a completely different thing from content being *rendered somewhere*. Sticking to the original step order (Now Page → Homepage → Writing) means the posts will actually appear once Steps 5-6 land.

### Step 4 — Now Page (`src/pages/now.astro`)

**What it is:** The first page that actually renders content from a collection — fetches the single `now` entry and displays its four sections plus a "last updated" date.

**Concepts learned:**
- **`getCollection()` always returns an array**, even when there's only one file. Sorting-then-`[0]` (`nowEntries.sort((a, b) => b.data.updatedAt.valueOf() - a.data.updatedAt.valueOf())[0]`) is a pattern that keeps working if more dated `now` entries get added later to build up a history — no page code needs to change.
- **`Date.valueOf()`** converts a `Date` object to a plain number (milliseconds since epoch), which is what makes `b - a` a valid subtraction for sorting. You can't subtract two `Date` objects directly.
- **Deduplicating repeated markup with an array + `.map()`.** The Tech Design's example had a `<!-- Repeat for learning, reading, tools -->` comment implying four near-identical hand-written blocks. Built an array of `{ label, items }` pairs instead and mapped over it once — same output, and a 5th section later is one array entry, not a copied block.
- **Proof the Step 2 utility works end-to-end.** `formatDate(current.data.updatedAt)` rendered `2026-07-23` from frontmatter as "July 23, 2026" in the actual browser — confirming the UTC timezone fix isn't just theoretical, it's doing real work the moment content flows through a real page.
- **Nav grows with the site.** Added a "Now" link to `Header.astro` now that the page exists (previous steps deliberately kept nav to just the site name, to avoid linking to pages that didn't exist yet).

**Problems encountered + solutions:**
1. None — `astro check` (0 errors/warnings/hints), `npm run build` (both `/index.html` and `/now/index.html` generated), and a live dev-server check (page text matched frontmatter exactly, no console errors, no horizontal overflow at 375px mobile width, nav link click-through confirmed routing) all passed on the first attempt.

### Step 5 — Homepage goes live (`src/pages/index.astro`)

**What it is:** Wired the homepage to real data — the static hero now sits above a "Currently" section (from `now`) and a featured-post `PostCard` (newest non-draft `blog` post).

**Concepts learned:**
- **Sort-then-index-0 as "get the latest."** `posts` gets sorted newest-first once; `posts[0]` is simply the featured post — no separate "find the max" logic needed, because sorting already put it in the right place.
- **The `!data.draft` filter is what makes `draft: true` actually work.** Step 3 set `draft: true` on all 3 posts and Step 4's Interlude explained that had zero visible effect yet — this step is where `getCollection('blog', ({ data }) => !data.draft)` first runs against real pages, so it's also the first point where un-drafting (or leaving something drafted) has a visible consequence.

**Problems encountered + solutions:**
1. None — verified the featured post shown matched the newest `publishedAt` in the content, with correct date/reading-time rendering.

### Step 6 — Writing section (`src/pages/writing/`, `src/layouts/PostLayout.astro`, `src/pages/rss.xml.ts`)

**What it is:** The full Writing experience — an index with a client-side category filter, individual post pages via dynamic routing, related-posts logic, and an RSS feed.

**Concepts learned:**
- **Nested content IDs contain slashes, and `[slug].astro` can't hold one.** A post at `blog/essays/on-quiet-building.md` gets the id `essays/on-quiet-building` (from the glob loader — id is the file's path relative to `base`, minus extension). A single dynamic segment (`[slug].astro`) only matches one path piece; Astro's build failed at `/writing/essays/on-quiet-building` with `Missing parameter: slug`. **Fix:** rename the route file to `[...slug].astro` — the `...` is Astro's *rest parameter* syntax, which matches (and accepts) a slash-containing string as a single value.
- **`getStaticPaths()` is the one-file-becomes-many-pages mechanism.** It returns an array of `{ params, props }`; Astro builds one static HTML file per entry. `params.slug` decides the URL, `props.post` is what the page component receives as `Astro.props`.
- **`render(entry)`**, imported from `astro:content`, is how you turn a content entry's raw Markdown `body` into an actual `<Content />` component — this is the Astro 5+ way; the old `entry.render()` method is gone.
- **Event delegation for the category filter.** One `click` listener on the parent `<ul id="post-list">`'s sibling filter bar, not one listener per button — `event.target.closest('button[data-filter]')` finds which button was actually clicked even though the listener lives higher up the tree. Toggling a `hidden` class based on `data-category` is the entire filtering mechanism — no re-fetch, no framework.
- **RSS needs a known site URL.** `@astrojs/rss`'s `link` fields are relative unless the feed knows the site's absolute origin — that's what `site: 'https://ayosotomi.pages.dev'` in `astro.config.mjs` is for. Without it, feed readers would get broken relative links.

**Problems encountered + solutions:**
1. **`Missing parameter: slug` build error** — see the rest-parameter fix above. Caught by `npm run build`, not `astro check` (which had passed cleanly) — a reminder that type-checking and build-time route generation check different things, and both matter.
2. Verified in the live dev server: writing index lists all 3 posts newest-first; clicking the "Tutorial" filter button hid the other 2 posts instantly (no page reload, confirmed via `get_page_text` before/after); an individual post rendered its Markdown correctly including a fenced code block, with no console errors; `/rss.xml` returned valid XML with correct absolute links and correct chronological order; no horizontal overflow at 375px width even on the post with a code block (the `@tailwindcss/typography` plugin gives `<pre>` blocks their own `overflow-x: auto`).

### Step 7 — Projects section (`src/pages/projects/`, `src/layouts/ProjectLayout.astro`)

**What it is:** Mirrors the Writing section's structure — index grid, `[slug].astro` detail page, status badges.

**Concepts learned:**
- **Reusing a proven pattern beats inventing a new one.** Projects don't have subfolders, so `project.id` never contains a slash — a plain `[slug].astro` (not `[...slug].astro`) works here, unlike Writing. Same `getStaticPaths()`/`render()` mechanics as Step 6, applied where they actually fit rather than copy-pasted blindly.
- **Status badges use Tailwind's built-in palette, not the custom Dawn Light tokens.** `@theme` in `global.css` only defines the site's neutral/warm palette (`bg`, `text`, `accent`, etc.) — there's no semantic "success green" or "info blue" token defined, so `ProjectCard.astro` reaches for Tailwind's default `green-100`/`blue-100`/`gray-100` utilities for status badges specifically, since those already exist and don't need new design tokens invented for one use case.

**Problems encountered + solutions:**
1. None beyond the shared RSS/routing work already covered in Step 6 — verified project index shows the status badge and tech tags correctly, and the detail page's GitHub/demo links resolve to the exact URLs from frontmatter.

### Fix — Header/Footer "clumped together" (flexbox auto-margin bug)

**What it was:** The human flagged the header nav looking clumped together. Measuring it (via `getBoundingClientRect()` in the browser console, not eyeballing a screenshot) showed the logo and nav links had a literal **0px gap** between them — not "too tight," actually touching.

**Concepts learned:**
- **A flex item with `mx-auto` doesn't stretch, even if the parent uses `align-items: stretch` (the default).** `BaseLayout.astro`'s `<body>` is `flex flex-col`, making `<Header>` and `<Footer>` flex items. Per the flexbox spec, if a flex item has an auto margin on its cross axis (here, horizontal — since the flex direction is column, the cross axis is horizontal), that auto margin **absorbs the free space instead of the item stretching**. So `header`'s `mx-auto max-w-2xl` never actually reached 672px — it collapsed to fit-content width (its logo + nav content, nothing more), leaving `justify-between` with zero slack to distribute. This is a subtle interaction between two unrelated-looking utility classes (`flex-col` on a distant ancestor, `mx-auto` on the element itself) — the kind of bug that's very hard to spot by reading the code, but obvious once you measure actual rendered widths.
- **The fix:** add `w-full` so `width` is an explicit `100%` (capped by `max-width`) instead of the implicit `auto` that triggers the auto-margin/stretch conflict. Once width isn't `auto`, `stretch` doesn't apply in the first place, so there's nothing for the auto margins to override — they just center the (now full-width-capped) box normally, like an ordinary centered block.
- **Measuring beats guessing.** Screenshots aren't available in this environment, so the fix was verified by reading `getBoundingClientRect()` directly — comparing `logoRight`/`navLeft` gap before (0px) and after (288.5px at desktop width) is unambiguous in a way "does this look right" isn't.
- **A second, unrelated problem hid behind the first.** Even after fixing the width bug, mobile width (375px) still had ~0px gap — but for a completely different reason: the full wordmark "Ayomiposi Sotomi" plus 3 nav links simply don't fit in ~327px of available space with *any* gap. That's not a bug, just too much content for the space. **Fix:** `flex-col` below the `sm` (640px) breakpoint, `sm:flex-row` above it — header stacks vertically on narrow screens instead of squeezing everything into one row. Two different problems that looked like the same symptom at first glance.

**Problems encountered + solutions:**
1. The width bug and the content-density problem both presented as "things are touching" at mobile width, which could have led to fixing only one and thinking the job was done. Checking the *desktop* gap first (where only the width bug applied, not content density) isolated the two issues clearly: desktop went from 0px → 288.5px gap with just the `w-full` fix, while mobile needed the additional `flex-col`/`sm:flex-row` responsive change. Verified both fixes at the 600px/750px breakpoint boundary, `astro check` (0 errors), and a full rebuild (8 pages, no regressions).

### Feature request round — Substack migration (blocked), prev/next nav, fanned-deck cards

**What happened:** The human asked for three things in one message: (1) migrate 4 posts from their Substack, (2) category-scoped Previous/Next links on posts, (3) a "stack of cards" hover design for the Projects grid, brainstormed first via a visual mockup before building.

**Concepts learned:**
- **Checking feasibility before committing to a plan is worth doing up front.** Before answering "is this possible," actually opened the Substack archive and checked each post for paywalls, image counts, and word counts rather than guessing. That reconnaissance (read-only metadata, no full-text extraction) was the right amount of investigation to answer the question honestly.
- **"I can read it" and "I can reproduce it" are different questions.** Confirming no paywall exists tells you access is possible; it says nothing about whether bulk-transcribing the full text into new files is appropriate. Those got conflated in the first pass ("no blockers, very doable") and had to be walked back once actual full-text extraction was attempted and hit a real limit.
- **First-party content migration still isn't the same as scraping-and-reproducing.** Even though this is the human's own writing, there's no reliable way for a browser-automation tool to *prove* authorship of a live third-party site's content. The fix isn't to refuse the task — it's to change how the content arrives: a human-provided export (Substack's own Settings → Exports zip) is the human directly supplying their own document, which is a fundamentally different situation from autonomous scraping, even though the end result (posts on the new site) is identical. Same task, different — and appropriate — path to it.
- **Category-scoped "sequence" navigation is just sort + filter + index math.** No new concepts beyond Step 6-7's patterns: filter the collection to one category, sort by date, `findIndex()` the current post, read the neighbors at `index - 1` / `index + 1`, treat out-of-bounds as "no neighbor" (`undefined`) rather than wrapping around. Couldn't be visually confirmed with real neighbor posts yet — every category currently has exactly 1 post, so the "hide when no neighbor" branch is the only one exercised so far.
- **Prototyping a design choice visually beats describing it in prose.** For the "stack of cards" ask, built 3 live, hoverable mockups (layered shadow / fanned deck / flat-lift) using the site's actual Dawn Light palette before writing any real component code, and let the human pick by feel rather than by reading a description of "rotate the pseudo-elements slightly."
- **`isolate` vs. negative `z-index`.** A flex item (or any element) with negative `z-index` doesn't necessarily stay contained within its own visual "stack" — it escapes to the nearest ancestor that actually establishes a stacking context (which `position: relative` alone does *not* do; it needs an explicit `z-index` or the `isolation: isolate` property). Caught this before shipping: the first fanned-deck implementation used `-z-10`/`-z-20` on the two background layers, which could have leaked behind sibling cards in the Projects grid. Fixed by adding `isolate` to each card's wrapper (a clean, self-contained stacking context, regardless of z-index values) and using small positive z-index values inside it.
- **Headless hover simulation is flaky; checking the compiled CSS is more reliable.** A `computer.hover` action followed immediately by a style read showed no change, which looked like a real bug — but `element.matches(':hover')` confirmed hover *was* active, and the actual bug was in the diagnostic script: Tailwind wraps its utilities in `@layer` blocks, and a naive `for (const rule of sheet.cssRules)` loop doesn't descend into nested layer rules, so it undercounts (in this case, to zero) even when the CSS is correct. Walking `rule.cssRules` recursively found the real `.group-hover\:border-accent:is(:where(.group):hover *)` rules — they were there all along.

**Problems encountered + solutions:**
1. Found and fixed an unrelated frontmatter corruption in `building-ayosotomi.md` (the closing `---` had gotten merged onto the same line as unrelated stray text) while verifying builds for this round — would have broken content parsing if left in.
2. Substack migration is **paused, not abandoned** — waiting on the human to provide a Substack export instead of live-scraping the archive.
3. `astro check` (0 errors/19 files) and `npm run build` (8 pages) both clean after the prev/next nav and card redesign changes.

### Substack migration, completed (using the human-provided export)

**What it is:** The human provided `substack_export.zip` (Settings → Exports from their own Substack dashboard) — the human-supplied-document path discussed earlier. Converted the 4 target posts (`you-might-be-somebodys-illusion`, `why-they-join`, `you-cant-die-at-least-not-to-yourself`, `why-do-i-always-have-to-be-the-one`) from Substack's export HTML into Markdown files under `src/content/blog/essays/`, all `draft: true` pending review, per the human's explicit choice.

**Concepts learned:**
- **`posts.csv` is more trustworthy than the public archive page for scope.** The export's `posts.csv` has an `is_published` column. It revealed 3 unpublished/draft posts (`the-darkness`, `ayos-opening-act-who-am-i`, plus 3 placeholder-slug drafts and a theme-preview file) that never appeared on the public archive page at all. Cross-checking against this file — rather than assuming "whatever's in the export folder is fair game" — confirmed the migration scope matched exactly what was asked for: the 4 target posts, nothing extra, nothing missing.
- **Substack represents images two different ways in its export HTML**, and a converter needs to handle both:
  - `<div class="image-gallery-embed" data-attrs="...">` — a JSON blob (HTML-entity-escaped) with the image URL(s) and alt text inside a `data-attrs` string attribute. Needs `json.loads()` after the entities are already decoded by the HTML parser.
  - `<div class="captioned-image-container"><figure><a class="image-link" href="...">...<img></a><figcaption>...</figcaption></figure></div>` — a completely different structure for Substack's standard "click to enlarge" image block, with the caption (if any) as separate sibling text.
  A converter that only handles one of these will silently produce **zero errors and zero images** for posts using the other — there's no exception to catch, the content just quietly goes missing. This is the kind of bug that only surfaces by explicitly counting expected-vs-actual images per post, not by "no errors thrown."
- **The `<a class="image-link" href="...">` URL is a resize proxy, not the original.** It points at `substackcdn.com/image/fetch/$s_!.../https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2F...` — a URL-encoded original URL embedded inside a resizing proxy URL. Decoding the `https%3A%2F%2F...` portion (regex + `urllib.parse.unquote`) gets the original, full-resolution S3 URL instead of a Substack-resized copy.
- **Astro's relative-path image handling in Markdown content only runs for pages that actually get rendered.** Draft posts never go through `getStaticPaths()`/`render()`, so their images are never processed by Astro's optimization pipeline — meaning `astro check`/`build` passing cleanly with drafts in place does **not** prove the images will actually work once un-drafted. Verified this properly: temporarily flipped one image-heavy post to `draft: false`, rebuilt, confirmed Astro generated real optimized WebP output (893kB → 174kB, 380kB → 77kB) at real routes, then reverted back to `draft: true` and rebuilt again to confirm the site returned to its exact pre-test state (8 pages, same as before).

**Problems encountered + solutions:**
1. **2 of 4 posts silently got 0 images** on the first conversion pass — see the "two different structures" point above. Caught by explicitly diffing "images downloaded" (4, via `curl`, confirmed by file size/type) against "images referenced in the generated Markdown" (only 1 present) — a mismatch that a bare "did the script error?" check would have missed entirely. Added `captioned-image-container` handling and regenerated all 4 files.
2. No other issues — frontmatter validated cleanly against the Step 1 schema on the first attempt for all 4 posts (title/description length limits, `category: "essay"`, tags, `publishedAt` dates from `posts.csv`).

### Fix — a genuinely dropped quote, caught by the human comparing against the real Substack page

**What happened:** After publishing, the human asked why "block and pull quotes" were missing, citing "You Might Be Somebody's Illusion" specifically and attaching a screenshot of the real Substack page showing a quote in a distinct callout box ("The reason I remembered you...") that doesn't appear on the migrated post at all.

**Concepts learned:**
- **Two different bugs can hide behind one symptom.** The initial read was "missing pull-quote styling" (true, and fixed — see below), but the human's screenshot revealed a second, more serious issue for this specific post: an entire quote was **silently absent from the Markdown**, not just under-styled. Word-count comparison (1079 → 1049, done earlier) didn't catch this because it was close enough to look like normal alt-text/whitespace variance — a ~30-word gap looked negligible until it turned out to be one specific, real sentence.
- **Root cause: `<div class="callout-block" data-callout="true">`** — a third way Substack represents special content (distinct from the `image-gallery-embed` and `captioned-image-container` divs handled earlier). The conversion script's div-handling only recognized two class names and a bare `<hr>`-detector; anything else fell through a silent "ignore anything else" branch — no error, no warning, just gone. Grepped all 4 posts' raw export HTML for `callout-block` afterward and confirmed only this one post used it — the other 3 were unaffected.
- **A live screenshot of the source is a stronger check than re-deriving metrics.** Rather than re-running word counts or re-reading the HTML from scratch, the human's screenshot of the actual rendered Substack page pinpointed the exact missing sentence immediately — visual comparison against ground truth caught what a text-diffing heuristic had glossed over.
- **Distinguishing genuine quotes from stylistic pull-quotes matters for correctness, not just aesthetics.** Fixed two related-but-different things in this pass: (1) added `prose-blockquote:*` Tailwind Typography modifiers to `PostLayout.astro` so real `<blockquote>` elements render distinctly (serif, larger, accent-colored left border, not italic) instead of blending into body text: verified via computed styles in the browser (`fontFamily: Newsreader`, `fontSize: 20px`, correct border color); (2) went back through all 4 posts and promoted both genuine quoted speech (e.g. the Dr. Mel tweet in "Why Do I Always Have to Be the One?") and the author's own standout standalone lines to real Markdown `> ` blockquotes, since neither had any structural signal in the source HTML (no `<blockquote>` tag exists anywhere in the export) — this required editorial judgment about which lines were emphasis-worthy, not a mechanical rule.

**Problems encountered + solutions:**
1. Inserted the missing quote directly into the already-hand-edited file (rather than regenerating from the converter, which would have discarded the blockquote edits already made) — verified via `astro check`, full build, and a live browser check confirming all 4 blockquotes (the restored quote + 3 pull-quotes) render with the correct distinct styling.

## Phase 3

### Items 1-3 — About page, Privacy Policy, custom 404

**What it is:** Three static pages, held for human review before pushing (unlike every prior step, which was pushed immediately after verification).

**Concepts learned:**
- **Biographical content needs the same authenticity boundary as the migrated blog posts.** The About page makes first-person claims about a real person's identity — even though nothing in it is *false* (it only draws on things already established in the project docs and existing writing), I'm not the person, so it's marked with the same `<!-- DRAFT: personalize... -->` convention used for the AI-authored sample content back in Phase 2, rather than presented as finished.
- **A Privacy Policy should describe reality, not aspiration.** Buttondown and Cusdis are planned (Newsletter is Step 8, on hold; comments were never scheduled for Phase 2) but not live — the policy explicitly says so and commits to updating itself *before* those services launch, rather than describing services that don't exist yet as if they already collect data.
- **Astro's whitespace handling around JSX-style tag boundaries isn't automatic HTML collapsing.** Writing `find me on\n<a ...\n  >GitHub</a\n>.` (splitting the closing `>` onto its own line, a common formatting style for controlling exactly where whitespace does or doesn't appear) resulted in **zero** space between "on" and the link in the rendered output, not the single collapsed space plain HTML would give. Caught this by reading `element.innerHTML` directly in the browser rather than trusting `get_page_text` (which had already silently absorbed the missing space when it displayed as "onGitHub" — worth noticing that visual/text-extraction checks can mask exactly this class of bug). Fixed with an explicit `{' '}` expression between the text and the link.

**Problems encountered + solutions:**
1. The missing-space bug above — found via `innerHTML` inspection, not the text-based check that ran first and didn't surface it.
2. `astro check` (0 errors/22 files), full build (15 pages, up from 12), and live browser verification of content + no console errors + no mobile overflow (375px) on all three new pages, all clean.
3. Per the human's explicit request, this round is **committed locally but not pushed** — first time deviating from the "push immediately after verifying" pattern established every prior step, since they asked for a review checkpoint before this particular deploy.
