# AGENTS.md — Master Plan for Ayosotomi.com

<!--
Single source of truth for every AI coding assistant on this project.
Keep it lean — details live in the Context Files at the bottom. Update Current State and Roadmap as you build.
-->

## Project Overview & Stack
**App:** Ayosotomi.com
**Overview:** A minimalist personal "digital home" for Ayomiposi Sotomi — one owned, privacy-respecting site that unifies writing (migrated from Substack), homelab/Docker/cybersecurity project write-ups, and a living "Now" page. It replaces a fragmented presence across Substack, GitHub, and social platforms, and serves three audiences at once: friends who want to keep up, potential clients assessing capability, and homelab/Docker newcomers looking for relatable tutorials.
**Stack:** Astro 7.x + TypeScript (strict), Tailwind CSS 4.x (CSS-first config via `@theme` in `src/styles/global.css` — no `tailwind.config.mjs`) + `@tailwindcss/typography`, Markdown via Astro Content Collections (Zod schemas), Cloudflare Pages hosting, Cusdis (self-hosted comments), Buttondown (newsletter), Cloudflare Web Analytics.
**Critical Constraints:** Free-tier only ($0/month — no paid services until post-launch), mobile-first responsive, zero JS by default (opt in only where interactivity is essential), no database and no user accounts (Markdown + Git is the data layer), GDPR-compliant by design (no cookies, no third-party trackers).

## Setup & Commands
Execute these commands for standard development workflows. Do not invent new package manager commands.
- **Setup:** `npm install` — first-time scaffolding was `npm create astro@latest .` + `npx astro add tailwind` + `npm install @tailwindcss/typography @fontsource/newsreader @fontsource/inter @fontsource/jetbrains-mono` (see `agent_docs/tech_stack.md`)
- **Development:** `npm run dev` — Astro dev server at `http://localhost:4321`
- **Testing:** `npm run build && npx astro check` — no formal unit/E2E suite for this MVP; see `agent_docs/testing.md` for the manual verification checklist
- **Linting & Formatting:** `npx prettier --write .` (Prettier) — ESLint runs via the VS Code extension; ask before adding a dedicated `lint` npm script
- **Build:** `npm run build` — outputs the static site to `dist/`, deployed to Cloudflare Pages

## Protected Areas 🛡️
Do NOT modify these without explicit human approval:
- **Secrets:** NEVER commit `.env` files or hardcode API keys, tokens, or passwords (`BUTTONDOWN_API_KEY`, `CUSDIS_HOST`, `CUSDIS_APP_ID`). Use Cloudflare Pages environment variables and ask the human to set them up.
- **Infrastructure:** Cloudflare Pages build settings, `astro.config.mjs` deployment adapter config, and any GitHub Actions workflows.
- **Content Schema:** `src/content.config.ts` — changing a field's type or removing a required field breaks every existing Markdown file's frontmatter. Confirm with the human and update affected content before changing it.
- **Third-Party Integrations:** Cusdis self-hosting config and Buttondown API integration — these touch real subscriber/comment data.

## Coding Conventions
- **Formatting:** Prettier (default config) + ESLint via VS Code extension — no warnings in new code.
- **Architecture:** Framework default — Astro's file-based routing (`src/pages/`) plus its component convention (`src/components/`, `src/layouts/`, `src/content/`, `src/lib/`). See `agent_docs/code_patterns.md`.
- **Testing:** No integration/E2E suite for this static site. Utility functions (reading-time calculation, date formatting in `src/lib/utils.ts`) get a simple `console.assert()` or a Vitest test if one gets introduced. Core user flows (homepage → post → comment → newsletter) are verified manually before each milestone.
- **Type Safety:** Use strict typing. Avoid `any`; define precise interfaces or use `unknown`. Validate all external input (forms, frontmatter via Zod) at the boundary.

## How I Should Think 🧠
1. **Understand Intent First:** Identify what the user actually needs before answering.
2. **Ask If Unsure:** If critical information is missing, ask ONE specific question before proceeding.
3. **Plan Before Coding:** Propose a brief step-by-step plan and wait for approval before changing more than one file. (If your tool has a plan/reflect mode, use it.)
4. **Execute Incrementally:** Build one feature at a time. Prefer refactoring over rewriting large blocks.
5. **Verify After Changes:** Run `npm run build && npx astro check` and do a quick visual/mobile check after each logical change; fix failures before moving on (see `REVIEW-CHECKLIST.md`).
6. **Explain Trade-offs:** When recommending something, briefly mention alternatives — plain language is fine here, this project is being built while learning.
7. **Remember in Files:** Write state and decisions to `MEMORY.md` instead of relying on chat history.
8. **Use Subagents If Available:** If your tool supports subagents or parallel agents, assign roles and require a plan before edits.

## What NOT To Do ⛔
- Do NOT delete files without explicit confirmation.
- Do NOT modify the content schema (`src/content.config.ts`) without a backup plan for existing Markdown files.
- Do NOT add features not in the current phase.
- Do NOT skip tests for "simple" changes.
- Do NOT bypass failing tests or pre-commit hooks.
- Do NOT use deprecated libraries or patterns.
- Do NOT ship placeholder content ("Lorem ipsum") to production.
- Do NOT mark a feature done if it half-works — complete it or cut it from this phase.
- Do NOT skip mobile testing before marking a feature complete.
- Do NOT ignore accessibility basics (alt text, form labels, focus states, contrast ratios).
- Do NOT add cookies, analytics events, or third-party trackers without documenting them in the privacy policy first.

## Engineering Constraints 🏗️
- **Type Safety:** The `any` type is forbidden — use `unknown` with type guards. All function parameters and returns are typed. Frontmatter is validated by the Zod schemas in `src/content.config.ts`; other external input (forms) is validated at the boundary too.
- **Architectural Sovereignty:** This is a static site with no backend — keep it that way. Pages (`src/pages/`) fetch content (`getCollection()`) and render; anything more than simple filtering/sorting belongs in `src/lib/`. Layouts (`src/layouts/`) own the shell; components (`src/components/`) stay small and reusable.
- **Library Governance:** Check `package.json` before suggesting new dependencies. Prefer Astro/web-native APIs over new libraries. Use the data-fetching approach specified in `agent_docs/tech_stack.md` (Astro Content Collections — no query library needed).
- **Clear Communication:** State issues briefly and fix them — no apology loops or filler. If context is missing, ask ONE specific clarifying question.
- **Workflow Discipline:** If pre-commit hooks are added later, they must pass before commits (or ask before bypassing). If verification fails, fix it before continuing.

## Current State 📍
**Last Updated:** 2026-07-23
**Working On:** Phase 1 complete. Ready to start Phase 2 — Core Features.
**Recently Completed:** Astro 7.x + TypeScript strict scaffold, Tailwind 4 (CSS-first config), Dawn Light palette + fonts wired up, `BaseLayout`/`Header`/`Footer` built and verified. Pushed to GitHub (`github.com/BlackJRoot/ayosotomi`) and deployed to classic Cloudflare Pages (static assets, no adapter, no bindings) at https://ayosotomi.pages.dev/ — verified live with correct palette/fonts. See `MEMORY.md` for the Workers-vs-Pages detour and why we landed on plain static Pages.
**Blocked By:** None

## Roadmap 🗺️

### Phase 1: Foundation
- [x] Install tools (Node.js LTS, Git already present in the environment; VS Code + extensions are a human-side setup step)
- [x] Initialize the Astro project with TypeScript (strict) + Tailwind, configure the Dawn Light color palette
- [x] Set up the GitHub repo, push the initial commit — `github.com/BlackJRoot/ayosotomi` (human-owned)
- [x] Deploy a hello-world to Cloudflare Pages (day-1 deploy, so every change after has a live URL) — live at https://ayosotomi.pages.dev/, plain static deploy, no Workers adapter (human-owned)
- [x] Build `BaseLayout.astro`, `Header.astro`, `Footer.astro`

### Phase 2: Core Features
- [ ] Quiet Garden Homepage — warm linen background, name + descriptor, "Currently" section, one featured post excerpt
- [ ] Writing Section — Markdown blog posts filterable by category, individual post pages with syntax highlighting, reading time, related posts, RSS feed
- [ ] Projects Section — homelab/Docker/cybersecurity project write-ups with status badges, tech tags, GitHub/demo links
- [ ] Now Page — living document (Working on / Learning / Reading / Tools) with a "last updated" date
- [ ] Newsletter Signup — non-imposing Buttondown form in the footer and at the end of posts, GDPR-compliant

### Phase 3: Polish
- [ ] About page and Privacy Policy page
- [ ] Dark mode (time-based: light 6am–6pm / dark 6pm–6am, manual override toggle, persisted in `localStorage`)
- [ ] Custom 404 page
- [ ] Mobile responsiveness pass across all key screens
- [ ] Performance pass (Lighthouse Performance & Accessibility 90+)

### Phase 4: Launch
- [ ] Comments (Cusdis) — self-hosted on Railway free tier, embedded on posts, moderation tested
- [ ] Analytics — enable Cloudflare Web Analytics
- [ ] SEO — meta tags, OpenGraph/Twitter cards, sitemap, RSS feed validated
- [ ] Security pass (see `REVIEW-CHECKLIST.md`) — CSP/HSTS headers, `npm audit`, Dependabot enabled, no secrets in Git history
- [ ] Deploy to production (`.pages.dev`, custom domain optional post-launch)
- [ ] Beta launch checklist — shared with 5+ friends, all P0 features functional

## Context Files 📚
Load these only when needed — progressive disclosure keeps context lean:
- `agent_docs/tech_stack.md` — Stack details, libraries, setup commands
- `agent_docs/code_patterns.md` — Architecture and code style rules
- `agent_docs/project_brief.md` — Product vision and conventions
- `agent_docs/product_requirements.md` — Feature list and user stories
- `agent_docs/testing.md` — Test strategy and commands
- `MEMORY.md` — Session memory: decisions, known issues, active goal
- `REVIEW-CHECKLIST.md` — Definition of done before marking work complete
- `specs/` — Feature specs and handoff notes created during the build
