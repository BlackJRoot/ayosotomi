# Learning Log 🎓

<!--
A running log of what I'm learning as this project gets built, step by step.
Each entry: what the step was, the concepts behind the code, and any
problems that came up + how they got solved.
-->

## Phase 2

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
