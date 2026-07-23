# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** Phase 1 — Foundation: complete. Site is live at https://ayosotomi.pages.dev/, repo pushed to `github.com/BlackJRoot/ayosotomi`.
**Next Steps:**
1. Start Phase 2 — Core Features: define the `blog`/`projects`/`now` Content Collections schema in `src/content.config.ts` (Protected Area — confirm with human before locking in field shapes), then build the homepage content, Writing section, Projects section, Now page.

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- **2026-07-23 — Astro 7.x, not 5.x:** `npm create astro@latest` installed Astro ^7.1.3 (docs originally said 5.x). Confirmed with the human to proceed on latest rather than pin to 5.x. `AGENTS.md` and `agent_docs/tech_stack.md` updated to say 7.x.
- **2026-07-23 — Tailwind 4 is CSS-first, no `tailwind.config.mjs`:** `astro add tailwind` wires up `@tailwindcss/vite` in `astro.config.mjs`; design tokens (Dawn Light palette, fonts) live in an `@theme` block in `src/styles/global.css` instead. Docs updated accordingly.
- **2026-07-23 — Dark mode deferred:** Only light-mode Dawn Light tokens were added to `@theme` in Phase 1. The `[data-theme="dark"]` override values and the toggle script are Phase 3 scope per the roadmap — not added yet.
- **2026-07-23 — Header nav kept minimal:** `Header.astro` currently only links the site name back to `/`. Nav links to Writing/Projects/Now will be added once those pages exist in Phase 2, to avoid shipping dead links.
- **2026-07-23 — Cloudflare: classic Pages, not Workers Builds.** First connection attempt used Cloudflare's newer Workers Builds pipeline (`npx wrangler deploy`), which auto-ran `astro add cloudflare` non-interactively inside the CI container since no `wrangler.jsonc` existed — this silently added the `@astrojs/cloudflare` adapter plus a KV namespace (`SESSION`) and Images binding (`IMAGES`) that the site doesn't use, and deployed to a `workers.dev` subdomain. None of that landed in git (repo stayed plain static). Reconnected via classic Cloudflare Pages instead (dashboard project type, not Workers Builds) — deploy log confirms "No Wrangler configuration file found," plain `dist/` static asset upload, no adapter, no bindings. Live at https://ayosotomi.pages.dev/. **If reconnecting Cloudflare again, use the Pages project type, not Workers Builds/Wrangler**, to avoid this auto-adapter behavior recurring.

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- `npm` 9.2.0 is below Astro 7's stated minimum (9.6.5) — installs work and `npm audit` shows 0 vulnerabilities, but `EBADENGINE` warnings appear on install. Not blocking; revisit if it ever causes a real failure.

## 📜 Completed Phases
- [x] Initial Astro + Tailwind scaffold (Astro 7.x, TypeScript strict, Tailwind 4 CSS-first)
- [x] Dawn Light palette (light mode) + Newsreader/Inter/JetBrains Mono fonts wired into `global.css` and `BaseLayout.astro`
- [x] `BaseLayout.astro`, `Header.astro`, `Footer.astro` built and verified (`npm run build`, `npx astro check`, dev server + mobile viewport check — no console errors, no horizontal overflow)
- [x] Cloudflare Pages deploy (hello world) — live at https://ayosotomi.pages.dev/, verified palette/fonts render correctly in production
- [ ] Content Collections schema defined (`blog`, `projects`, `now`) — Phase 2
