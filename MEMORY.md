# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** Phase 2 — Core Features. Steps 1-7 done: schema, utils, content, Now Page, Homepage, Writing section + RSS, Projects section. Site has real content live end-to-end (homepage → writing → post, homepage → projects → project). Only Step 8 (Newsletter) remains for Phase 2. Workflow: commit + push after each step, log concepts/problems in `LEARNING.md` after every step (standing instruction from the human).
**Next Steps:**
1. Step 8 — Newsletter signup (needs a Buttondown account/API key from the human first — cannot proceed until they provide one).
2. Once Phase 2 wraps: Phase 3 (About/Privacy pages, dark mode, custom 404, mobile pass, Lighthouse pass).

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- **2026-07-23 — Astro 7.x, not 5.x:** `npm create astro@latest` installed Astro ^7.1.3 (docs originally said 5.x). Confirmed with the human to proceed on latest rather than pin to 5.x. `AGENTS.md` and `agent_docs/tech_stack.md` updated to say 7.x.
- **2026-07-23 — Tailwind 4 is CSS-first, no `tailwind.config.mjs`:** `astro add tailwind` wires up `@tailwindcss/vite` in `astro.config.mjs`; design tokens (Dawn Light palette, fonts) live in an `@theme` block in `src/styles/global.css` instead. Docs updated accordingly.
- **2026-07-23 — Dark mode deferred:** Only light-mode Dawn Light tokens were added to `@theme` in Phase 1. The `[data-theme="dark"]` override values and the toggle script are Phase 3 scope per the roadmap — not added yet.
- **2026-07-23 — Header nav grows with the site:** `Header.astro` started linking only the site name back to `/`; added "Now" (Step 4), then "Writing" and "Projects" (Steps 6-7) as each page went live. Nav is now complete for all Phase 2 sections.
- **2026-07-23 — `projects` schema left without a `draft` field.** The open question from Step 3 was resolved by inaction: Step 7 built the Projects index using the schema as-is (no `content.config.ts` change, which is a Protected Area). `projects/ayosotomi-com.md` is now genuinely public — acceptable since its content is 100% factual. If future project write-ups need a staging/review period before publishing, `projects` will need the same `draft: z.boolean().default(false)` field `blog` has — ask the human before adding it (schema change).
- **2026-07-23 — Blog post routes use `[...slug].astro`, not `[slug].astro`.** Nested content IDs (e.g. `essays/on-quiet-building`, from files under `blog/essays/`) contain `/`. A single dynamic segment can't hold that — Astro's rest-parameter syntax (`[...slug]`) is required for any collection with subfolders. `projects` has no subfolders, so `projects/[slug].astro` (no rest param) is correct there. **If more nested blog subfolders get added later, this still works — but don't "clean up" the Writing route back to `[slug].astro`, it will break.**
- **2026-07-23 — `site` set in `astro.config.mjs`:** `site: 'https://ayosotomi.pages.dev'` added so `@astrojs/rss` (new dependency, Step 6) generates absolute URLs instead of relative ones. Update this if/when a custom domain replaces the `.pages.dev` one.
- **2026-07-23 — `z` now imported from `astro/zod`, not `astro:content`:** Astro 7 deprecated `import { z } from 'astro:content'` in favor of `import { z } from 'astro/zod'` (which re-exports Zod v4). Also switched `z.string().url()` → `z.url()` (Zod v4's top-level format validators). `npx astro check` confirms 0 errors/warnings/hints with this setup.
- **2026-07-23 — Sample content: drafted, then un-drafted, then made public.** 3 blog posts were written `draft: true` (Step 3, since they're AI-written in the site owner's voice), flipped to `draft: false` after human review (Interlude, before Step 4), and are now genuinely live and public since Step 6 built the Writing pages that render them. If real posts get added later, remember `draft: true` is the mechanism to stage them privately first.
- **2026-07-23 — Cloudflare: classic Pages, not Workers Builds.** First connection attempt used Cloudflare's newer Workers Builds pipeline (`npx wrangler deploy`), which auto-ran `astro add cloudflare` non-interactively inside the CI container since no `wrangler.jsonc` existed — this silently added the `@astrojs/cloudflare` adapter plus a KV namespace (`SESSION`) and Images binding (`IMAGES`) that the site doesn't use, and deployed to a `workers.dev` subdomain. None of that landed in git (repo stayed plain static). Reconnected via classic Cloudflare Pages instead (dashboard project type, not Workers Builds) — deploy log confirms "No Wrangler configuration file found," plain `dist/` static asset upload, no adapter, no bindings. Live at https://ayosotomi.pages.dev/. **If reconnecting Cloudflare again, use the Pages project type, not Workers Builds/Wrangler**, to avoid this auto-adapter behavior recurring.

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- `npm` 9.2.0 is below Astro 7's stated minimum (9.6.5) — installs work and `npm audit` shows 0 vulnerabilities, but `EBADENGINE` warnings appear on install. Not blocking; revisit if it ever causes a real failure.

## 📜 Completed Phases
- [x] Initial Astro + Tailwind scaffold (Astro 7.x, TypeScript strict, Tailwind 4 CSS-first)
- [x] Dawn Light palette (light mode) + Newsreader/Inter/JetBrains Mono fonts wired into `global.css` and `BaseLayout.astro`
- [x] `BaseLayout.astro`, `Header.astro`, `Footer.astro` built and verified (`npm run build`, `npx astro check`, dev server + mobile viewport check — no console errors, no horizontal overflow)
- [x] Cloudflare Pages deploy (hello world) — live at https://ayosotomi.pages.dev/, verified palette/fonts render correctly in production
- [x] Content Collections schema defined (`blog`, `projects`, `now`) in `src/content.config.ts` — verified with `npx astro check` (0 errors/warnings/hints) and `npm run build`
- [x] `src/lib/utils.ts` — `calculateReadingTime` + `formatDate` (UTC-pinned to avoid a build-timezone date-shift bug), with dev-only `console.assert` checks per `code_patterns.md`'s testing guidance
- [x] Sample content: 3 blog posts (un-drafted per human request), 1 project, 1 now entry — all validate against the Step 1 schemas (`npx astro check` + `npm run build`, 0 errors)
- [x] Now Page (`src/pages/now.astro`) — renders the `now` collection, verified live in dev server (page text matches frontmatter, no console errors, no mobile overflow, nav link click-through works)
- [x] Homepage wired to real content (`now` "Currently" + featured `blog` post)
- [x] Writing section: index with client-side category filter, `[...slug].astro` post pages, related posts, RSS feed (`@astrojs/rss`, new dependency; `site` added to `astro.config.mjs`)
- [x] Projects section: index grid, `[slug].astro` detail pages, status badges (Tailwind's built-in green/blue/gray, not custom Dawn Light tokens)
- [x] Full click-through verification in dev server (homepage → writing → post, homepage → projects → project, RSS feed, category filter, mobile viewport on every page including one with a code block) + `astro check` (0 errors/19 files) + `npm run build` (8 pages) — all clean
