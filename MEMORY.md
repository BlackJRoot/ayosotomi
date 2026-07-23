# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** Phase 1 — Foundation: scaffold done and verified. Remaining: human pushes to GitHub and connects Cloudflare Pages.
**Next Steps:**
1. Human: create the GitHub repo, `git push`, connect the repo to Cloudflare Pages (build command `npm run build`, output dir `dist`).
2. Once live, start Phase 2 — Core Features (content collections schema, homepage content, writing/projects sections).

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- **2026-07-23 — Astro 7.x, not 5.x:** `npm create astro@latest` installed Astro ^7.1.3 (docs originally said 5.x). Confirmed with the human to proceed on latest rather than pin to 5.x. `AGENTS.md` and `agent_docs/tech_stack.md` updated to say 7.x.
- **2026-07-23 — Tailwind 4 is CSS-first, no `tailwind.config.mjs`:** `astro add tailwind` wires up `@tailwindcss/vite` in `astro.config.mjs`; design tokens (Dawn Light palette, fonts) live in an `@theme` block in `src/styles/global.css` instead. Docs updated accordingly.
- **2026-07-23 — Dark mode deferred:** Only light-mode Dawn Light tokens were added to `@theme` in Phase 1. The `[data-theme="dark"]` override values and the toggle script are Phase 3 scope per the roadmap — not added yet.
- **2026-07-23 — Header nav kept minimal:** `Header.astro` currently only links the site name back to `/`. Nav links to Writing/Projects/Now will be added once those pages exist in Phase 2, to avoid shipping dead links.

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- `npm` 9.2.0 is below Astro 7's stated minimum (9.6.5) — installs work and `npm audit` shows 0 vulnerabilities, but `EBADENGINE` warnings appear on install. Not blocking; revisit if it ever causes a real failure.

## 📜 Completed Phases
- [x] Initial Astro + Tailwind scaffold (Astro 7.x, TypeScript strict, Tailwind 4 CSS-first)
- [x] Dawn Light palette (light mode) + Newsreader/Inter/JetBrains Mono fonts wired into `global.css` and `BaseLayout.astro`
- [x] `BaseLayout.astro`, `Header.astro`, `Footer.astro` built and verified (`npm run build`, `npx astro check`, dev server + mobile viewport check — no console errors, no horizontal overflow)
- [ ] Content Collections schema defined (`blog`, `projects`, `now`) — Phase 2
- [ ] Cloudflare Pages deploy (hello world) — human-owned, pending
