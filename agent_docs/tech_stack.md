# Tech Stack & Tools

- **Frontend:** Astro 7.x (static site generator + component framework), TypeScript (strict mode) — zero JS shipped by default, opt in only where interactivity is needed.
- **Backend:** None. This is a fully static site — no server runtime, no API routes beyond the RSS endpoint (`src/pages/rss.xml.ts`), deployed as static files to Cloudflare Pages.
- **Database:** None. Content lives as Markdown files under `src/content/`, validated and typed via Astro Content Collections with Zod schemas (`src/content.config.ts`). Git is the version history.
- **Styling:** Tailwind CSS 4.x + `@tailwindcss/typography` (prose styling for rendered Markdown). Tailwind 4 uses CSS-first config — there is no `tailwind.config.mjs`. Custom design tokens (Dawn Light palette, Newsreader/Inter/JetBrains Mono fonts) live in an `@theme` block in `src/styles/global.css`, loaded via the `@tailwindcss/vite` plugin in `astro.config.mjs`.
- **Authentication:** None — no user accounts anywhere in this project. Comments go through Cusdis (no signup required for commenters); the newsletter goes through Buttondown (email address only).

## Other Services (from the Tech Design)
- **Content:** Markdown + Astro Content Collections — `blog`, `projects`, and `now` collections, each with its own Zod schema (see `docs/TechDesign-Ayosotomi-MVP.md` → Data Model).
- **Syntax highlighting:** Shiki, built into Astro — no extra dependency for code blocks.
- **RSS:** `@astrojs/rss` (added Phase 2, Step 6) powers `src/pages/rss.xml.ts`. Requires `site` to be set in `astro.config.mjs` (currently `https://ayosotomi.pages.dev`) to produce absolute item links.
- **Images:** Astro Assets (`astro:assets`) for automatic WebP conversion, lazy loading, and responsive `srcset`.
- **Fonts:** Google Fonts (Newsreader, Inter, JetBrains Mono), self-hosted via `@fontsource/*` packages for performance and privacy (no Google Fonts CDN request).
- **Hosting:** Cloudflare Pages — build command `npm run build`, output directory `dist`.
- **Comments:** Cusdis, self-hosted via Docker on Railway's free tier (or a homelab server).
- **Newsletter:** Buttondown (free tier, <100 subscribers).
- **Analytics:** Cloudflare Web Analytics — cookieless, enabled with one click in the Cloudflare dashboard, no code changes needed.
- **Version control:** Git + GitHub, connected to Cloudflare Pages for continuous deployment (`main` → production, PRs → preview deploys).

## Setup Commands (first-time scaffold)
```bash
npm create astro@latest . -- --template minimal --install --no-git --yes --no-ai
# minimal template ships with strict tsconfig (extends astro/tsconfigs/strict) by default

npx astro add tailwind --yes
# installs @tailwindcss/vite + tailwindcss, wires the Vite plugin into astro.config.mjs
npm install @tailwindcss/typography
npm install @fontsource/newsreader @fontsource/inter @fontsource/jetbrains-mono
npm install --save-dev @astrojs/check typescript
# @astrojs/check + typescript are required for `npx astro check` (see AGENTS.md → Testing)

git init
git add .
git commit -m "Initial commit: Astro + Tailwind setup"
```

After the first scaffold, day-to-day commands are just `npm install`, `npm run dev`, `npm run build` (see `AGENTS.md` → Setup & Commands).

## Error Handling Pattern
```typescript
// src/lib/buttondown.ts — canonical example: explicit error handling, no silent failures.
const BUTTONDOWN_API_KEY = import.meta.env.BUTTONDOWN_API_KEY;

export async function subscribeEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, notes: 'Subscribed from ayosotomi.com' }),
    });

    if (response.ok) return { success: true };
    const error = await response.json();
    return { success: false, error: error.detail || 'Unknown error' };
  } catch (e) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}
// Never swallow the error — always return (or log) something the caller can act on.
```

## Styling & Component Examples
```astro
---
// src/pages/index.astro — canonical example: typed content queries + Tailwind design tokens.
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';

const posts = await getCollection('blog', ({ data }) => !data.draft);
posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
const featuredPost = posts[0];
---

<BaseLayout title="Ayomiposi Sotomi" description="Writer. Builder. Security-minded human.">
  <main class="max-w-2xl mx-auto px-6 py-20 space-y-16">
    <section>
      <h1 class="font-serif text-4xl md:text-5xl text-[#3D3632] font-medium">
        Ayomiposi Sotomi
      </h1>
      <p class="mt-4 text-lg text-[#9A918A]">Writer. Builder. Security-minded human.</p>
    </section>

    <section>
      <h2 class="text-sm uppercase tracking-wider text-[#9A918A] mb-4">Latest</h2>
      <PostCard post={featuredPost} />
    </section>
  </main>
</BaseLayout>
```
