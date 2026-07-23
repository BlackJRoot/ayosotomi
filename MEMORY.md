# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** Phase 2 — Core Features. Steps 1-3 done. Building step by step with the human, explaining code as we go (learning-focused). Workflow: commit + push after each step, and log concepts/problems in `LEARNING.md` after every step (standing instruction from the human).
**Next Steps:**
1. Step 4 — Now Page. Step 5 — Homepage. Step 6 — Writing section + RSS. Step 7 — Projects section (decide first whether `projects` schema needs a `draft` field — see Architectural Decisions). Step 8 — Newsletter signup (needs a Buttondown account/API key from the human first).

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- **2026-07-23 — Astro 7.x, not 5.x:** `npm create astro@latest` installed Astro ^7.1.3 (docs originally said 5.x). Confirmed with the human to proceed on latest rather than pin to 5.x. `AGENTS.md` and `agent_docs/tech_stack.md` updated to say 7.x.
- **2026-07-23 — Tailwind 4 is CSS-first, no `tailwind.config.mjs`:** `astro add tailwind` wires up `@tailwindcss/vite` in `astro.config.mjs`; design tokens (Dawn Light palette, fonts) live in an `@theme` block in `src/styles/global.css` instead. Docs updated accordingly.
- **2026-07-23 — Dark mode deferred:** Only light-mode Dawn Light tokens were added to `@theme` in Phase 1. The `[data-theme="dark"]` override values and the toggle script are Phase 3 scope per the roadmap — not added yet.
- **2026-07-23 — Header nav kept minimal:** `Header.astro` currently only links the site name back to `/`. Nav links to Writing/Projects/Now will be added once those pages exist in Phase 2, to avoid shipping dead links.
- **2026-07-23 — `z` now imported from `astro/zod`, not `astro:content`:** Astro 7 deprecated `import { z } from 'astro:content'` in favor of `import { z } from 'astro/zod'` (which re-exports Zod v4). Also switched `z.string().url()` → `z.url()` (Zod v4's top-level format validators). `npx astro check` confirms 0 errors/warnings/hints with this setup.
- **2026-07-23 — Sample content added as `draft: true`.** 3 blog posts (`project-logs/building-ayosotomi.md`, `tutorials/setting-up-pihole-with-docker.md`, `essays/on-quiet-building.md`) were written to exercise the schema with real data, but marked draft since they're AI-written in the site owner's voice and shouldn't go live unreviewed. The `projects` schema has **no `draft` field**, so `projects/ayosotomi-com.md` (content is all factually true, no review concern) will go public as soon as Step 7 builds the Projects index — open question: add a `draft` field to `projects` too before then?
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
- [x] Sample content: 3 blog posts (draft), 1 project, 1 now entry — all validate against the Step 1 schemas (`npx astro check` + `npm run build`, 0 errors)
