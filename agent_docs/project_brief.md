# Project Brief

- **Product vision:** One owned, privacy-respecting personal site that reveals layers of who Ayomiposi Sotomi is — writing, projects, and identity — replacing a fragmented presence scattered across Substack, GitHub, and social platforms. A "quiet garden," not a portfolio: it celebrates process and work-in-progress, not just finished output.
- **Target Audience:** Three overlapping groups — friends & general visitors who want to keep up, potential clients assessing capability and communication style, and homelab/Docker/cybersecurity newcomers looking for accessible, relatable tutorials.

## Conventions
- **Naming:** Astro components and layouts in PascalCase (`PostCard.astro`, `BaseLayout.astro`); utility/lib files in camelCase (`utils.ts`, `buttondown.ts`); Markdown content files in kebab-case (`setting-up-pihole-with-docker.md`).
- **File Structure:** Follow the Tech Design's `src/` layout exactly — `components/`, `layouts/`, `pages/`, `content/`, `lib/`, `styles/`. Content lives under `src/content/{blog/{essays,tutorials,project-logs},projects,now}/`. Don't invent new top-level folders without checking `docs/TechDesign-Ayosotomi-MVP.md` first.

## Key Principles
- Ship the simplest possible solution that solves the user story.
- If a simpler low-code integration exists (e.g. Buttondown's hosted subscribe form instead of a fully custom one), use it — but keep it non-imposing per the PRD (no popups, no modals, no scroll triggers).
- Static-first: ship zero client-side JavaScript by default. Only add interactivity (theme toggle, comment embed, newsletter form, category filter) where the PRD explicitly calls for it.
- Privacy by default: no cookies, no third-party trackers, GDPR-compliant by design (Cloudflare Web Analytics, Cusdis, Buttondown were all chosen specifically for this).
- Warmth and restraint over polish-for-its-own-sake: the Dawn Light palette, generous whitespace, and slow transitions (300–400ms) are part of the product, not decoration — see `agent_docs/product_requirements.md` for the full design direction.
