# Code Patterns

## Purpose
This file defines the implementation patterns the agent should follow for this project.
Prefer these patterns over inventing new ones. Fill in each section from the Technical Design document.

## Architecture Pattern
- **Primary pattern:** Framework default — Astro's own conventions. `src/components/` for small reusable pieces, `src/layouts/` for page shells (`BaseLayout`, `PostLayout`, `ProjectLayout`), `src/pages/` for file-based routes, `src/content/` for Markdown content, `src/lib/` for pure utility functions.
- **Rule:** Keep domain logic separate from transport/UI concerns — a page's frontmatter should fetch and pass data, not contain business logic beyond simple filtering/sorting.
- **Rule:** Reuse existing modules before creating new abstractions.

## Data Fetching
- **Primary approach:** Direct build-time calls via Astro's Content Collections API — `getCollection()` / `getEntry()` inside a page or layout's frontmatter. There is no client-side data fetching, no query library, and no server to call at runtime; everything resolves at build time.
- **Rule:** Do not introduce a data-fetching library (React Query, SWR, etc.) — this project has no client-side app state to sync. Check `tech_stack.md` before adding one anyway.
- **Rule:** Keep fetch logic (`getCollection`, sorting, filtering) in the page/layout frontmatter, which is exactly where Astro expects it — don't extract it into a separate "hook" pattern that doesn't exist in Astro.

## State Management
- **Server state:** None — the site is fully static. Content is resolved once, at build time, via `getCollection()`.
- **Client state:** Minimal vanilla JS only, and only where the PRD calls for interactivity: the dark-mode toggle stores its override in `localStorage`; the writing-index category filter uses plain DOM manipulation. No client state library.
- **Forms:** Plain HTML `<form>` + a small `fetch()` wrapper (see `src/lib/buttondown.ts`) for the newsletter signup. No form library needed for a single email field.
- **Rule:** Prefer the simplest working approach for MVP scope. Do not add a state library "just in case."

## Error Handling
- Normalize errors at service/API boundaries — never let raw exceptions reach the UI.
- Never swallow errors silently; always log or surface them (see the `subscribeEmail` pattern in `tech_stack.md`).
- Return user-safe messages in the UI; log developer context server-side (or, for this static site, in the browser console during development).
- Use a consistent error shape (`{ success: boolean; error?: string }`) across the few places this project talks to an external API (Buttondown, Cusdis).

## Validation
- Validate all external inputs: Markdown frontmatter (via the Zod schemas in `src/content.config.ts`), the newsletter email field, and any URL params used by the writing/projects filters.
- Apply runtime validation at system boundaries (content schema, form submission); trust internal types inside those boundaries.
- Keep validation rules co-located with the relevant contract — collection schemas live in `src/content.config.ts` next to the collections they validate.

## File and Naming Conventions
- **Files:** Framework default / Astro community convention — PascalCase for `.astro` components and layouts (`PostCard.astro`, `BaseLayout.astro`), camelCase for utility/lib files (`utils.ts`, `buttondown.ts`), kebab-case for Markdown content files (`setting-up-pihole-with-docker.md`).
- **Components / classes:** PascalCase
- **Functions / variables:** camelCase
- **Constants / env vars:** UPPER_SNAKE_CASE (`BUTTONDOWN_API_KEY`, `CUSDIS_HOST`, `CUSDIS_APP_ID`)

## Testing Pattern
- Add a simple assertion (or a Vitest test if one gets introduced) for pure utility logic — reading-time calculation, date formatting.
- No integration or E2E suite for this MVP (see `agent_docs/testing.md`) — verify content/schema changes and page rendering manually.
- Run `npm run build && npx astro check` after every feature; fix failures before moving on.

## Change Discipline
- Prefer focused, minimal edits over large rewrites.
- Do not introduce new dependencies without checking `agent_docs/tech_stack.md` first.
- Do not change the content schema (`src/content.config.ts`), Cloudflare Pages deployment config, or Cusdis/Buttondown integration without explicit approval — see `AGENTS.md` → Protected Areas.
- One feature at a time — commit or checkpoint after each working feature.
