# Technical Design Document: Ayosotomi.com MVP

## Recommended Approach

**Primary approach: Learn-by-doing with Astro + AI-assisted guidance** — you write real code, understand every layer, and ship a site you're proud of.
- **Time to MVP:** ~10 weeks (70 days) | **Learning curve:** Moderate (gentle start, deepening) | **Cost:** $0/month

### Why This Approach Fits You

1. **You rejected Hugo for being "too abstract."** Astro gives you real `.astro` component files, real TypeScript schemas, real CSS. You see every layer.
2. **You want to understand, not just ship.** Astro's "HTML + JS" mental model is transparent. No hidden magic.
3. **Your cybersecurity mindset values control.** Static output = minimal attack surface. No runtime, no database, no secrets in server memory.
4. **Free tier covers everything.** No credit card required to launch.

---

## Tech Stack Decision

### Full Stack Overview

| Layer | Tool | Role | Why |
|-------|------|------|-----|
| **Framework** | Astro 5.x | Static site generator + component framework | Zero JS by default, Content Collections, framework-agnostic |
| **Language** | TypeScript | Type safety across the project | Catches errors at build time, teaches you patterns |
| **Styling** | Tailwind CSS 4.x | Utility-first CSS | Design system in code, mobile-first by default |
| **Typography** | @tailwindcss/typography | Prose styling for Markdown | Beautiful reading experience with zero custom CSS |
| **Content** | Markdown + Astro Content Collections | Blog posts, projects, now page | Git-versioned, type-safe, fully controlled |
| **Syntax Highlighting** | Shiki (built into Astro) | Code blocks in posts | Fast, beautiful, no extra dependency |
| **Images** | Astro Assets (`astro:assets`) | Optimization, WebP, responsive | Automatic optimization, lazy loading, srcset |
| **Fonts** | Google Fonts (Newsreader, Inter, JetBrains Mono) | Typography | Loaded via `@fontsource` packages for performance |
| **Hosting** | Cloudflare Pages | Static site hosting | Unlimited bandwidth, privacy analytics, DDoS protection, free |
| **Comments** | Cusdis | Privacy-first comments | No signup required, cookieless, self-hosted |
| **Newsletter** | Buttondown | Email subscriptions | GDPR-compliant, Markdown-native, free tier |
| **Analytics** | Cloudflare Web Analytics | Privacy-first traffic data | Cookieless, zero setup, no consent banner |
| **Version Control** | Git + GitHub | Code history, CI/CD | Free, familiar, enables automated deployment |
| **IDE** | VS Code + extensions | Development environment | Free, Astro/Tailwind support, AI-assisted |

### Alternative Stacks Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| **Next.js + Vercel** | Huge ecosystem, full-stack capable | Ships 85-120 KB JS by default, steep learning curve (App Router), Vercel lock-in | Overkill for static content; hides too much; not hands-on enough |
| **Eleventy + Netlify** | Simpler, maximum control, no framework lock-in | No component model, no type safety, less structured learning | Astro teaches better modern web patterns while keeping transparency |
| **WordPress + cheap host** | Familiar (intermediate knowledge), easy content management | Not hands-on, hides the stack, security/maintenance burden, not free at quality level | Violates your "get hands dirty" goal |
| **SvelteKit + Vercel** | Excellent developer experience, reactive | Requires committing to Svelte, smaller content-site ecosystem | Astro defers UI framework decision |

**Trade-off honesty:** Astro is slightly more complex than Eleventy for a simple blog. You gain: component model, type safety, image optimization, and a transferable skill. You lose: absolute simplicity. For your 70-day timeline and learning goals, the trade-off is worth it.

---

## Project Structure

```
ayosotomi/
├── src/
│   ├── components/           # Reusable UI pieces
│   │   ├── BaseHead.astro    # Shared <head> content (meta, fonts, analytics)
│   │   ├── Header.astro      # Site header with navigation
│   │   ├── Footer.astro      # Site footer with newsletter, links
│   │   ├── ThemeToggle.astro # Light/dark mode toggle
│   │   ├── PostCard.astro    # Blog post preview card
│   │   ├── ProjectCard.astro # Project preview card
│   │   ├── CommentEmbed.astro # Cusdis iframe wrapper
│   │   ├── NewsletterForm.astro # Buttondown signup form
│   │   └── ReadingTime.astro  # Reading time calculation display
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Root layout (HTML shell, fonts, theme)
│   │   ├── PostLayout.astro   # Blog post layout (header, body, comments, related)
│   │   └── ProjectLayout.astro # Project page layout
│   ├── pages/                # File-based routing
│   │   ├── index.astro       # Homepage (quiet garden)
│   │   ├── writing/
│   │   │   ├── index.astro   # Writing index with filters
│   │   │   └── [slug].astro  # Individual blog post
│   │   ├── projects/
│   │   │   ├── index.astro   # Projects index
│   │   │   └── [slug].astro  # Individual project
│   │   ├── now.astro         # Now page (living document)
│   │   ├── about.astro       # About page
│   │   ├── uses.astro        # Tools I use
│   │   ├── privacy.astro     # Privacy policy
│   │   ├── 404.astro         # Custom 404
│   │   └── rss.xml.ts        # RSS feed endpoint
│   ├── content/              # Markdown content (Git-managed)
│   │   ├── blog/             # Blog posts
│   │   │   ├── essays/
│   │   │   ├── tutorials/
│   │   │   └── project-logs/
│   │   ├── projects/         # Project writeups
│   │   └── now/              # Now page content
│   ├── content.config.ts     # Content Collections schema (Zod)
│   ├── styles/
│   │   └── global.css        # Tailwind directives + custom properties
│   ├── lib/
│   │   ├── utils.ts          # Helper functions (reading time, date formatting)
│   │   └── buttondown.ts     # Newsletter API client
│   └── env.d.ts              # TypeScript environment types
├── public/
│   ├── fonts/                # Self-hosted font files (optional)
│   └── images/                # Static images (favicon, og-image)
├── astro.config.mjs          # Astro configuration
├── tailwind.config.mjs       # Tailwind configuration (colors, fonts)
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── README.md                 # Project docs + deployment notes
```

**Why this structure:**
- **`src/components/`** = LEGO blocks. Small, reusable, testable in isolation.
- **`src/layouts/`** = Page wrappers. Define the shell (head, nav, footer) once.
- **`src/pages/`** = Routes. Astro turns each file into a URL automatically.
- **`src/content/`** = Your words. Markdown files, fully owned, Git-versioned.
- **`src/content.config.ts`** = Your data model. You define what fields exist. Astro validates.
- **`src/lib/`** = Utilities. Pure functions you write and understand.

---

## Building Each Feature

### Feature 1: Quiet Garden Homepage — Complexity: Medium

**What it is:** The front door. Warm linen background, name + descriptor, "Currently" section, one featured post excerpt.

**How to build:**
1. **Create `src/pages/index.astro`** — This is your homepage file. Astro turns this into `/` automatically.
2. **Query content** — Use `getCollection('blog')` to fetch posts, filter by `draft: false`, sort by date, take the first one as featured.
3. **Query "Now" content** — Use `getCollection('now')` to fetch the latest now page data.
4. **Layout** — Wrap in `BaseLayout`. Pass `title` and `description` as props.
5. **Style** — Use Tailwind utilities: `bg-[#FAF6F1]`, `max-w-2xl mx-auto`, `px-6 py-20`, `space-y-16`.

**Key code pattern you'll learn:**
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';

const posts = await getCollection('blog', ({ data }) => !data.draft);
posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
const featuredPost = posts[0];

const nowEntries = await getCollection('now');
const currentNow = nowEntries.sort((a, b) => ...)[0];
---

<BaseLayout title="Ayomiposi Sotomi" description="Writer. Builder. Security-minded human.">
  <main class="max-w-2xl mx-auto px-6 py-20 space-y-16">
    <!-- Hero -->
    <section>
      <h1 class="font-serif text-4xl md:text-5xl text-[#3D3632] font-medium">
        Ayomiposi Sotomi
      </h1>
      <p class="mt-4 text-lg text-[#9A918A]">
        Writer. Builder. Security-minded human.
      </p>
    </section>

    <!-- Currently -->
    <section>
      <h2 class="text-sm uppercase tracking-wider text-[#9A918A] mb-4">Currently</h2>
      <ul class="space-y-2">
        {currentNow.data.workingOn.map(item => (
          <li class="text-[#3D3632]">→ {item}</li>
        ))}
      </ul>
    </section>

    <!-- Featured Post -->
    <section>
      <h2 class="text-sm uppercase tracking-wider text-[#9A918A] mb-4">Latest</h2>
      <PostCard post={featuredPost} />
    </section>
  </main>
</BaseLayout>
```

**Learning points:**
- Astro's frontmatter (the `---` block) runs at build time, not in the browser.
- `getCollection()` is your content API — you defined the schema, Astro gives you typed data.
- Tailwind classes are just CSS — but organized as a design system.

**Test it by:** Run `npm run dev`, visit `http://localhost:4321`, verify: name shows, "Currently" items render, featured post appears.

---

### Feature 2: Writing Section — Complexity: Medium

**What it is:** All blog posts, filterable by category, individual post pages with syntax highlighting, reading time, related posts.

**How to build:**
1. **Content schema** — Already defined in `src/content.config.ts` (from research). Key fields: `title`, `description`, `publishedAt`, `category`, `tags`, `draft`.
2. **Index page (`src/pages/writing/index.astro`)** — Fetch all posts, render as list. Add category filter buttons (client-side JS, minimal).
3. **Individual post (`src/pages/writing/[slug].astro`)** — Dynamic route. Astro generates one page per post at build time.
4. **Reading time** — Utility function: `wordCount / 200` (average reading speed in words per minute).
5. **Related posts** — Filter posts by same category, exclude current, sort by date, take 3.
6. **Syntax highlighting** — Astro's built-in Shiki handles this automatically for Markdown code blocks.

**Key code pattern you'll learn:**
```astro
---
// src/pages/writing/[slug].astro
import { getCollection, getEntry } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();

// Related posts
const allPosts = await getCollection('blog');
const related = allPosts
  .filter(p => p.data.category === post.data.category && p.slug !== post.slug)
  .slice(0, 3);
---

<PostLayout frontmatter={post.data} readingTime={calculateReadingTime(post.body)}>
  <Content />

  <section class="mt-16">
    <h3 class="text-sm uppercase tracking-wider text-[#9A918A] mb-4">Related</h3>
    <div class="space-y-4">
      {related.map(p => <PostCard post={p} />)}
    </div>
  </section>
</PostLayout>
```

**Learning points:**
- `getStaticPaths()` tells Astro which pages to generate at build time. No server needed.
- `post.render()` turns Markdown into HTML + metadata.
- Dynamic routes (`[slug]`) create one file that serves infinite content.

**Test it by:** Create 3 test posts in `src/content/blog/`. Verify index shows all 3. Verify each post page renders correctly. Verify related posts appear. Test category filtering.

---

### Feature 3: Projects Section — Complexity: Medium

**What it is:** Showcase of homelab/Docker/cybersecurity projects with status badges, tech stack, writeups.

**How to build:**
1. **Content schema** — Define in `src/content.config.ts`: `title`, `description`, `status` (enum), `tech` (array), `startedAt`, `cover`, `githubUrl`, `demoUrl`.
2. **Index page** — Grid of project cards. Filter by status or tech tag.
3. **Individual project** — Same pattern as blog posts: `getStaticPaths()` + dynamic route.
4. **Status badges** — Tailwind components: green for Active, blue for Learning, gray for Completed.
5. **Cover images** — Use Astro's `<Image />` component for automatic optimization.

**Key code pattern:**
```typescript
// src/content/config.ts — Projects collection
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['active', 'completed', 'learning', 'archived']),
    tech: z.array(z.string()),
    startedAt: z.coerce.date(),
    cover: z.string().optional(),
    githubUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
  }),
});
```

**Learning points:**
- Zod enums enforce valid values at build time. Try `status: 'activee'` and the build fails with a clear error.
- Optional fields (`z.string().optional()`) mean you don't have to provide them every time.
- Arrays (`z.array(z.string())`) let you tag projects with multiple technologies.

**Test it by:** Create 2 test projects. Verify index shows cards with correct status colors. Verify individual pages render full writeups. Test tech tag filtering.

---

### Feature 4: Now Page — Complexity: Low

**What it is:** Living document of current activities. Last updated date. Sections: Working on, Learning, Reading, Tools.

**How to build:**
1. **Content schema** — Simple structure in `src/content.config.ts`.
2. **Single file** — `src/content/now/2026-07.md` (or just `current.md`). Update by editing and committing.
3. **"Last updated" date** — Use `fs.statSync()` on the file to get modification time, or store `updatedAt` in frontmatter.
4. **Render** — Fetch the latest now entry, render sections.

**Key code pattern:**
```astro
---
const nowEntries = await getCollection('now');
const current = nowEntries.sort((a, b) => ...)[0];
const lastUpdated = current.data.updatedAt || new Date();
---

<section>
  <p class="text-sm text-[#9A918A]">
    Last updated: {lastUpdated.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
  </p>

  <div class="mt-8 space-y-8">
    <div>
      <h2 class="text-sm uppercase tracking-wider text-[#9A918A] mb-3">Working on</h2>
      <ul class="space-y-2">
        {current.data.workingOn.map(item => (
          <li class="text-[#3D3632]">→ {item}</li>
        ))}
      </ul>
    </div>
    <!-- Repeat for learning, reading, tools -->
  </div>
</section>
```

**Learning points:**
- Content Collections work for non-blog content too. Any structured Markdown fits.
- Date formatting is a standard JS skill — `toLocaleDateString()` is your friend.

**Test it by:** Create a now file. Verify all sections render. Verify date shows correctly. Update the file and verify date changes.

---

### Feature 5: Newsletter Signup — Complexity: Low

**What it is:** Non-imposing email subscription via Buttondown. Form in footer + end of posts.

**How to build:**
1. **Buttondown account** — Sign up at buttondown.email. Get your API key.
2. **API client** — Simple `fetch()` wrapper in `src/lib/buttondown.ts`.
3. **Form component** — `NewsletterForm.astro`. Email input + submit button. Client-side JS for submission.
4. **Placement** — Include in `Footer.astro` and at the end of `PostLayout.astro`.
5. **GDPR compliance** — No pre-ticked boxes. Clear privacy policy link. Easy unsubscribe (handled by Buttondown).

**Key code pattern:**
```typescript
// src/lib/buttondown.ts
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
```

**Learning points:**
- `import.meta.env` is how Astro handles environment variables. Never commit secrets.
- API wrappers separate network logic from UI logic.
- Error handling is explicit — no silent failures.

**Test it by:** Create a test subscriber with your own email. Verify Buttondown dashboard shows the subscriber. Test error states (invalid email, network failure).

---

### Feature 6: Dark Mode (Time-Based) — Complexity: Low-Medium

**What it is:** Light mode 6am–6pm, dark mode 6pm–6am. Manual override toggle in footer.

**How to build:**
1. **CSS custom properties** — Define colors as variables in `global.css`.
2. **Tailwind dark mode** — Use `dark:` prefix for dark variants.
3. **Time detection** — Small inline script in `BaseHead.astro` runs before page render.
4. **Toggle** — `ThemeToggle.astro` component sets `data-theme` attribute on `<html>`.
5. **Persistence** — Store override in `localStorage`. Check on page load.

**Key code pattern:**
```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-bg: #FAF6F1;
    --color-text: #3D3632;
    --color-text-secondary: #9A918A;
    --color-accent: #C4956A;
    --color-link: #B87B6A;
    --color-border: #E5DDD4;
    --color-code-bg: #F3EDE6;
  }

  [data-theme="dark"] {
    --color-bg: #1E1B18;
    --color-text: #E8E2DB;
    --color-text-secondary: #A8A29E;
    --color-accent: #A67B52;
    --color-link: #C4956A;
    --color-border: #3D3834;
    --color-code-bg: #2A2623;
  }
}
```

```astro
<!-- Inline script in BaseHead.astro — runs before render -->
<script is:inline>
  const hour = new Date().getHours();
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || (hour >= 6 && hour < 18 ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', theme);
</script>
```

**Learning points:**
- CSS custom properties (variables) are the modern way to theme.
- `is:inline` tells Astro not to process this script — it runs exactly as written.
- `localStorage` persists user preference across sessions.

**Test it by:** Change system time or manually set `data-theme`. Verify colors shift. Verify toggle works. Verify preference persists after refresh.

---

### Feature 7: Comments (Cusdis) — Complexity: Medium

**What it is:** Privacy-first comments on blog posts. No signup required.

**How to build:**
1. **Self-host Cusdis** — Deploy via Docker on Railway free tier (or your homelab server).
2. **Get embed code** — Cusdis provides a `<script>` tag for embedding.
3. **Create wrapper component** — `CommentEmbed.astro` accepts `pageId` and `pageTitle`.
4. **Add to PostLayout** — Include at bottom of post pages.
5. **Styling** — Cusdis iframe inherits your site's CSS if configured.

**Key code pattern:**
```astro
---
// src/components/CommentEmbed.astro
interface Props {
  pageId: string;
  pageTitle: string;
}

const { pageId, pageTitle } = Astro.props;
const cusdisHost = import.meta.env.CUSDIS_HOST; // e.g., "https://cusdis.yourdomain.com"
---

<div id="cusdis_thread"
  data-host={cusdisHost}
  data-app-id={import.meta.env.CUSDIS_APP_ID}
  data-page-id={pageId}
  data-page-title={pageTitle}
  data-theme={document.documentElement.getAttribute('data-theme')}
></div>
<script src={`${cusdisHost}/js/cusdis.es.js`} async></script>
```

**Learning points:**
- Iframes embed external content safely. Cusdis runs on your domain but isolates from your main site.
- Environment variables keep config flexible (different hosts for dev/prod).

**Test it by:** Deploy Cusdis. Embed on a test post. Leave a comment. Verify it appears in Cusdis dashboard. Test moderation (approve/reject).

---

## Data Model (Content Collections)

### Blog Collection Schema

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(80, 'Title too long for SEO'),
    description: z.string().max(160, 'Description too long for SEO'),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.enum(['essay', 'tutorial', 'project-log', 'now-update']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
  }),
});
```

### Projects Collection Schema

```typescript
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['active', 'completed', 'learning', 'archived']),
    tech: z.array(z.string()),
    startedAt: z.coerce.date(),
    completedAt: z.coerce.date().optional(),
    cover: z.string().optional(),
    githubUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
  }),
});
```

### Now Collection Schema

```typescript
const now = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/now' }),
  schema: z.object({
    updatedAt: z.coerce.date(),
    workingOn: z.array(z.string()).max(5),
    learning: z.array(z.string()).max(5),
    reading: z.array(z.string()).max(5),
    tools: z.array(z.string()).max(5),
  }),
});
```

**Why Zod schemas matter:**
- **Type safety:** TypeScript knows the shape of your data everywhere.
- **Validation:** Invalid frontmatter fails the build with a clear error.
- **Documentation:** The schema *is* documentation. New contributors (or future you) know exactly what fields exist.

---

## Development Setup

### Step 1: Install Tools (Day 1, ~2 hours)

1. **Node.js** — Install LTS version (v20+) from [nodejs.org](https://nodejs.org). Verify: `node -v`
2. **Git** — Install from [git-scm.com](https://git-scm.com). Verify: `git -v`
3. **VS Code** — Install from [code.visualstudio.com](https://code.visualstudio.com)
4. **VS Code Extensions:**
   - Astro (official extension)
   - Tailwind CSS IntelliSense
   - TypeScript Importer
   - Prettier (code formatting)
   - ESLint (error catching)
5. **GitHub account** — Create if you don't have one.

### Step 2: Initialize Project (Day 1, ~1 hour)

```bash
# Create new Astro project
npm create astro@latest ayosotomi
# Select: TypeScript, strict, yes to install dependencies

# Enter project
cd ayosotomi

# Install Tailwind
npx astro add tailwind

# Install additional packages
npm install @tailwindcss/typography
npm install @fontsource/newsreader @fontsource/inter @fontsource/jetbrains-mono

# Initialize Git
git init
git add .
git commit -m "Initial commit: Astro + Tailwind setup"
```

### Step 3: Configure Tailwind (Day 1, ~30 min)

```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        linen: '#FAF6F1',
        umber: '#3D3632',
        stone: '#9A918A',
        ochre: '#C4956A',
        rosewood: '#B87B6A',
        sand: '#E5DDD4',
        parchment: '#F3EDE6',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

### Step 4: First Deploy (Day 1-2, ~1 hour)

1. Push to GitHub: `git remote add origin ...`, `git push -u origin main`
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create Project
3. Connect GitHub repo, select Astro framework preset
4. Deploy — your site is live at `ayosotomi.pages.dev`

**Why deploy on day 1?** You now have a live URL to share. Every subsequent change gets its own preview URL. This is motivating and catches deployment issues early.

---

## AI Assistance Strategy

### Which AI Tool for What

| Task | Best AI Tool | How You Use It | What You Learn |
|------|--------------|----------------|----------------|
| **Architecture decisions** | Claude (me) | "Should I use Content Collections or file-based routing?" | Why patterns exist, trade-offs |
| **Writing components** | Cursor / Claude Code | "Create a PostCard component that shows title, date, and excerpt" | Astro component syntax, props, slots |
| **Debugging errors** | ChatGPT / Claude | Paste error message + relevant code, ask "Explain what's wrong and how to fix it" | Error reading, debugging process |
| **Understanding concepts** | Claude (me) | "What does `getStaticPaths()` actually do?" | Build-time vs runtime, static generation |
| **CSS/Tailwind help** | Cursor / Tailwind docs | "How do I center this vertically with Tailwind?" | Utility class patterns |
| **Security review** | Claude (me) | "Is this CSP header secure enough?" | Security headers, attack surfaces |

### Your Learning Protocol

1. **AI writes, you read.** Before accepting any AI-generated code, read it line by line. Ask: "What does this line do?"
2. **AI explains, you type.** For critical sections (Content Collections schema, layout structure), have AI explain, then type it yourself.
3. **Break it, fix it.** Intentionally break working code, observe the error, fix it. This builds debugging intuition.
4. **Document your learning.** Keep a `LEARNING.md` file: "Today I learned that `getCollection()` runs at build time, not in the browser."

---

## Deployment Pipeline

### Continuous Deployment with Cloudflare Pages

```
You push to GitHub → Cloudflare Pages detects change → Builds Astro site → Deploys to global CDN
```

**Setup:**
1. In Cloudflare Pages dashboard: Connect GitHub repo
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Environment variables: Add `BUTTONDOWN_API_KEY`, `CUSDIS_HOST`, `CUSDIS_APP_ID` (never commit these)

**Branch behavior:**
- `main` branch → Production deploy (`ayosotomi.pages.dev`)
- Pull requests → Preview deploys (unique URL for testing)

**Why this matters:** Every commit gets a live URL. You can share preview links with friends for feedback before merging to production.

---

## Cost Breakdown

### Development Phase (Now)

| Service | Tool | Cost | Notes |
|---------|------|------|-------|
| IDE | VS Code | Free | Open source |
| AI Assistant | Cursor (free tier) / Claude (free tier) | Free | Cursor: 2000 completions/mo; Claude: free tier available |
| Framework | Astro | Free | Open source |
| Styling | Tailwind CSS | Free | Open source |
| Hosting | Cloudflare Pages | Free | Unlimited bandwidth |
| Analytics | Cloudflare Web Analytics | Free | Built into Pages |
| Comments | Cusdis (Railway free tier) | Free | 500 hours/mo compute |
| Newsletter | Buttondown (<100 subs) | Free | Free tier generous |
| Code hosting | GitHub | Free | Public repos |
| **Total** | | **$0/month** | |

### Post-Launch Phase (When Ready)

| Upgrade | Cost | Trigger |
|---------|------|---------|
| Custom domain | ~$10-15/year | You want a professional URL |
| Buttondown paid | $9/mo | >100 subscribers |
| Cursor Pro | $20/mo | You exceed free tier completions |
| Plausible self-hosted | ~$5/mo VPS | You want deeper analytics |

---

## Security Implementation

### Pre-Launch Checklist

| Layer | Implementation | How |
|-------|---------------|-----|
| **HTTPS** | Auto via Cloudflare Pages | Enabled by default, no action needed |
| **Security Headers** | Astro middleware or Cloudflare Transform Rules | Add CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| **CSP (Content Security Policy)** | Restrictive default, relax as needed | `default-src 'self'; script-src 'self' 'unsafe-inline' https://cusdis.yourdomain.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.buttondown.email; frame-src 'self' https://cusdis.yourdomain.com` |
| **Dependency Scanning** | `npm audit` + Dependabot | Run before every deploy; enable Dependabot in GitHub repo settings |
| **No Secrets in Git** | `.env` in `.gitignore` | All API keys in Cloudflare Pages environment variables |
| **Privacy Policy** | Static page at `/privacy` | Explain what data is collected (minimal) and why |

### GDPR Compliance

- **No cookies** for analytics (Cloudflare Web Analytics is cookieless)
- **No tracking** or fingerprinting
- **Minimal data collection** — only what's necessary
- **No consent banner needed** for Cloudflare Web Analytics
- **Newsletter consent** — Clear subscribe action, easy unsubscribe (Buttondown handles this)
- **Comment data** — Cusdis stores name, optional email, comment text. You are controller.

---

## Testing Strategy

### What to Test (Minimal but Critical)

| Test | How | When |
|------|-----|------|
| **Build succeeds** | `npm run build` | After every significant change |
| **Homepage renders** | Visit `/` | After homepage changes |
| **Post pages render** | Visit 3+ posts | After content/schema changes |
| **Dark mode works** | Toggle + time simulation | After theme changes |
| **Newsletter signup** | Test email submission | After form implementation |
| **Comments load** | Visit post with comments | After Cusdis integration |
| **Mobile layout** | Chrome DevTools mobile view | After every layout change |
| **Lighthouse scores** | Chrome DevTools Lighthouse | Weekly, and before launch |

### No Formal Test Suite Needed

For a static personal site, unit tests are overkill. Your "tests" are:
1. Does it build? (`npm run build`)
2. Does it look right? (Visual inspection)
3. Does it work on your phone? (Real device testing)
4. Do friends confirm it works? (Beta testing)

**Exception:** If you write complex utility functions (reading time calculation, date formatting), a simple `console.assert()` or Jest test is worthwhile.

---

## 10-Week Implementation Roadmap

### Week 1: Foundation (Days 1-7, ~8 hrs)
- [ ] Install tools (Node, Git, VS Code, extensions)
- [ ] Initialize Astro project with Tailwind
- [ ] Configure Tailwind with Dawn Light colors
- [ ] Set up GitHub repo, push initial commit
- [ ] Deploy to Cloudflare Pages (hello world)
- [ ] Create `BaseLayout.astro` with HTML shell, fonts, theme script
- [ ] Create `Header.astro` and `Footer.astro` components
- [ ] **Milestone:** Live site with your name on it

### Week 2: Content & Homepage (Days 8-14, ~8 hrs)
- [ ] Define Content Collections schema (`src/content.config.ts`)
- [ ] Create first blog post in Markdown
- [ ] Build homepage (`src/pages/index.astro`) with "Currently" + featured post
- [ ] Build writing index page (`src/pages/writing/index.astro`)
- [ ] Build individual post page (`src/pages/writing/[slug].astro`)
- [ ] Add reading time calculation
- [ ] **Milestone:** Can publish and read blog posts

### Week 3: Projects & Polish (Days 15-21, ~8 hrs)
- [ ] Define projects schema
- [ ] Create first project writeup
- [ ] Build projects index and individual pages
- [ ] Add status badges and tech tags
- [ ] Implement related posts on blog pages
- [ ] Add RSS feed (`src/pages/rss.xml.ts`)
- [ ] **Milestone:** Projects section live, RSS working

### Week 4: Design Identity (Days 22-28, ~8 hrs)
- [ ] Refine typography scale (mobile vs desktop)
- [ ] Implement Dawn Light palette across all components
- [ ] Add dark mode (time-based + toggle)
- [ ] Style code blocks (Shiki themes)
- [ ] Add custom 404 page
- [ ] Test on real mobile device
- [ ] **Milestone:** Site has distinct visual identity, dark mode works

### Week 5: Content Migration (Days 29-35, ~8 hrs)
- [ ] Migrate 5+ Substack posts to Markdown
- [ ] Standardize frontmatter across all posts
- [ ] Create "Now" page with living content
- [ ] Write About page
- [ ] Add privacy policy page
- [ ] Create `uses.astro` page
- [ ] **Milestone:** Real content, all core pages exist

### Week 6: Engagement (Days 36-42, ~8 hrs)
- [ ] Set up Buttondown account, get API key
- [ ] Build `NewsletterForm.astro` component
- [ ] Add form to footer and post layouts
- [ ] Test end-to-end subscription flow
- [ ] Deploy Cusdis on Railway
- [ ] Embed comments in post layout
- [ ] Test comment submission and moderation
- [ ] **Milestone:** Newsletter + comments working

### Week 7: Analytics & SEO (Days 43-49, ~8 hrs)
- [ ] Enable Cloudflare Web Analytics
- [ ] Add meta tags (OpenGraph, Twitter cards)
- [ ] Add structured data (JSON-LD for articles)
- [ ] Generate sitemap (`@astrojs/sitemap`)
- [ ] Verify RSS feed validity
- [ ] Test social sharing previews
- [ ] **Milestone:** Measurable, discoverable, shareable

### Week 8: Security Hardening (Days 50-56, ~8 hrs)
- [ ] Configure security headers (CSP, HSTS, etc.)
- [ ] Run `npm audit`, fix vulnerabilities
- [ ] Enable Dependabot
- [ ] Verify no secrets in Git history (`git log --all --full-history -- .env`)
- [ ] Test CSP doesn't break comments or analytics
- [ ] **Milestone:** Security checklist complete

### Week 9: Beta Testing (Days 57-63, ~8 hrs)
- [ ] Share with 5 friends, collect feedback
- [ ] Fix bugs, polish rough edges
- [ ] Test on multiple devices/browsers
- [ ] Run Lighthouse audit, optimize scores
- [ ] Verify all P0 features work end-to-end
- [ ] **Milestone:** Beta feedback incorporated

### Week 10: Launch (Days 64-70, ~8 hrs)
- [ ] Final content check (no placeholders, all links work)
- [ ] Final performance check
- [ ] Write launch post
- [ ] Announce to friends, social media
- [ ] Monitor analytics for first week
- [ ] Celebrate
- [ ] **Milestone:** LIVE 🎉

---

## Common Challenges & Solutions

| Challenge | Solution | When It Happens |
|-----------|----------|-----------------|
| **"I don't understand this error"** | Paste exact error + relevant code into AI. Ask: "Explain what's wrong in simple terms and how to fix it." | Weeks 1-3 |
| **"This feels too complex"** | Break the feature into smaller pieces. Build the simplest version first. Ask AI to explain line by line. | Weeks 2-4 |
| **"Design doesn't feel like 'me'"** | Iterate in browser. Change one color at a time. Show a friend and ask: "What feeling does this give you?" | Week 4 |
| **"Content migration is tedious"** | Don't migrate everything. Pick your 5 best posts. Write new ones. Quality over quantity. | Week 5 |
| **"Cusdis hosting fails"** | Backup plan: Skip comments for v1. Or use Giscus (accept GitHub-only auth). Don't let one feature block launch. | Week 6 |
| **"Scope creep — I want to add X"** | Write it in `V2-IDEAS.md`. Revisit after launch. Discipline now = pride later. | Anytime |
| **"I feel like I'm not learning"** | Review your `LEARNING.md`. Look at week 1 code vs now. The gap is your growth. | Weeks 4-6 |

---

## Maintenance Plan

### Monthly (Post-Launch)
- [ ] Run `npm audit` and update vulnerable dependencies
- [ ] Review Cloudflare analytics — what's popular? What's not?
- [ ] Update "Now" page
- [ ] Check for broken links (`npm install -g linkinator`, then `linkinator dist`)

### Quarterly
- [ ] Review and update `AGENTS.md` (Part 4 document) with new patterns learned
- [ ] Evaluate if any v2 features should be promoted
- [ ] Check if Buttondown free tier still sufficient
- [ ] Review security headers against current best practices

### Dependency Update Strategy
- **Astro:** Update within 1 month of minor releases, test before deploying
- **Tailwind:** Update when new features are needed
- **Node.js:** Update LTS when current version reaches end-of-life
- **Cusdis:** Monitor for security updates, pull latest Docker image

---

## Open Questions

| Question | Status | Decision Needed By |
|----------|--------|-------------------|
| Custom domain at launch or keep `.pages.dev`? | **Decided:** Keep `.pages.dev` for beta, migrate when proud of result | Week 8 |
| Should project pages include difficulty ratings? | **Decided:** Defer to v2 | Post-launch |
| How often to update "Now" page? | **Decided:** Weekly minimum, or when meaningful change occurs | Ongoing |
| Will I write original posts during build phase? | **Assumption:** Yes, 2+ original posts by day 60 | Week 5 |
| Backup plan if Railway free tier ends? | **TBD:** Evaluate Hetzner VPS (~$3.50/mo) or skip comments | Week 6 |

---

## Success Metrics (Technical)

- [ ] Build succeeds without errors (`npm run build`)
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 90+
- [ ] Zero JavaScript on homepage (Astro default)
- [ ] All images optimized (WebP, lazy loaded)
- [ ] Dark mode works without flash of wrong theme
- [ ] Newsletter form submits successfully
- [ ] Comments load and submit successfully
- [ ] RSS feed validates (rssboard.org/rss-validator)
- [ ] No secrets in Git history
- [ ] Security headers pass Mozilla Observatory scan

---

*Created for: Ayosotomi.com | Path: Learn-by-doing with Astro | Est. time: 10 weeks (70 days) | Est. cost: $0/month*

---

## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: techdesign
- App name: Ayosotomi.com
- User level: C (in-between)
- Target platform: web
- Budget: free only
- Timeline: ~70 days to beta launch (10 weeks, 6-10 hrs/week)
- Chosen stack: Astro 5.x + TypeScript + Tailwind CSS + Cloudflare Pages + Cusdis + Buttondown + Cloudflare Web Analytics
- AI coding tool: Cursor (components) + Claude (architecture/concept explanation)
- Source files: research-PersonalDigitalHub.md → PRD-Ayosotomi-MVP.md → TechDesign-Ayosotomi-MVP.md
---
