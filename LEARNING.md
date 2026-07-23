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
