# Ayosotomi.com

Ayomiposi Sotomi's personal site — writing, homelab/project write-ups, and a living "Now" page. One owned, privacy-respecting home instead of a fragmented presence across Substack, GitHub, and social platforms.

**Live at:** [ayosotomi.pages.dev](https://ayosotomi.pages.dev/)

## Stack

- [Astro 7](https://astro.build/) + TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com/) — CSS-first config, no `tailwind.config.mjs` (design tokens live in `src/styles/global.css`)
- Markdown via [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) (Zod-validated frontmatter)
- [Cloudflare Pages](https://pages.cloudflare.com/) — plain static hosting, no backend, no database
- [Buttondown](https://buttondown.com/) for the newsletter (secretless — no API key, posts straight to a public embed endpoint)

## Development

```sh
npm install
npm run dev       # dev server at localhost:4321
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Adding content

Three interactive CLIs handle the repetitive/error-prone parts of adding content (deriving the right folder, validating against the real schema, catching SEO length limits before they're a problem) — see [`specs/content-guide.md`](specs/content-guide.md) for the full picture.

```sh
npm run content       # one menu for everything below
npm run now            # update the Now page
npm run new-post       # scaffold a new essay / tutorial / project-log
npm run new-project    # scaffold a new project (goes live immediately — no draft field)
```

Each one writes frontmatter only — the actual writing is always done by hand afterward, and `new-post`/`new-project` will offer to open the file straight into your editor once it's saved.

## Project structure

```
src/
├── content/           Blog posts, projects, and Now-page snapshots (Content Collections)
├── components/        Small, reusable Astro components
├── layouts/            Page shells (BaseLayout, PostLayout, ProjectLayout)
├── lib/                Shared utilities (reading time, date formatting, link parsing)
├── pages/              File-based routes
└── styles/             Tailwind's @theme block — the Dawn Light color palette lives here

scripts/                The content CLIs above, plus build-time tooling (e.g. security headers)
specs/                  Human-facing docs on how content actually gets published
```

## Project docs

This repo is developed with AI-assisted tooling as part of its own workflow — `AGENTS.md` (project conventions and current state), `MEMORY.md` (the technical decision log), and `progress_notes.md` (a plain-language status summary) are all kept up to date alongside the code, not just for humans.
