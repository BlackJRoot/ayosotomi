# Testing Strategy

## Frameworks
- **Unit Tests:** None formally required. This is a static content site with no complex business logic — per the Tech Design, unit tests are overkill. If a utility function gets non-trivial (reading-time calculation, date formatting in `src/lib/utils.ts`), add a simple `console.assert()` check, or introduce Vitest at that point if it's worth the setup.
- **E2E Tests:** None formally required. Manual browser verification is the primary check: run the dev server, visit the page in Chrome, use DevTools' mobile emulation. Add Playwright later only if the project grows complex enough to justify it.

## Rules & Requirements
- **Coverage:** No formal percentage target. Critical utility functions should have at least one assertion; everything else is verified through the manual checklist below.
- **Before Commit:** Always run `npm run build && npx astro check` before verifying a task complete — a failed build or type error means the task isn't done.
- **Failures:** NEVER skip tests or mock out assertions to make a pipeline pass without human approval. If an agent breaks a test (or the build), the agent must fix it before moving on.

## Execution
- Command to run all checks: `npm run build && npx astro check`
- Command to check a single utility: run the relevant `console.assert()` script directly with `node`, e.g. `node --experimental-strip-types src/lib/utils.ts` (or `npx vitest run <file>` if Vitest gets introduced later)

## Manual Verification Checklist (per the Tech Design)
Run through this after the relevant change — see `docs/TechDesign-Ayosotomi-MVP.md` → Testing Strategy for the full table:
- Build succeeds (`npm run build`) — after every significant change
- Homepage renders correctly — after homepage changes
- Post pages render correctly (check 3+ posts) — after content/schema changes
- Dark mode works (toggle + time simulation) — after theme changes
- Newsletter signup submits successfully — after form changes
- Comments load and submit — after Cusdis integration changes
- Mobile layout holds up (Chrome DevTools mobile view) — after every layout change
- Lighthouse Performance & Accessibility scores stay at 90+ — weekly, and required before launch
