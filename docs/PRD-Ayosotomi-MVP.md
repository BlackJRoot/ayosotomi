# Product Requirements Document: Ayosotomi.com MVP

## Overview

**Product Name:** Ayosotomi.com
**Problem Statement:** My identity, writing, and projects are scattered across Substack, GitHub, and social platforms I don't control. I need one owned space that reveals layers of who I am — not a billboard, but a conversation that deepens with each click. A site where anyone can visit and instantly know about 50% of who I am and what I'm up to.
**MVP Goal:** A beta launch I'm proud to share — a site I built with my own hands, understand deeply, and feel good inviting people into.
**Target Launch:** ~60 days from start

---

## Target Users

### Primary User Profile

**Who:** Three overlapping audiences:
1. **Friends & general visitors** — People who know me and want to keep up
2. **Potential clients** — People assessing my capability and communication style
3. **Homelab/Docker newcomers** — People in my niche looking for accessible tutorials and relatable learning journeys

**Their main problem:** No single place to understand "who is Ayomiposi Sotomi?" Current solutions (LinkedIn, Substack, GitHub) each show a slice, never the whole.

**Current solution they use:** Substack for writing, GitHub for projects, social media for presence, LinkedIn for credibility. All fragmented, all platform-controlled.

**Why they'll switch to my site:** It's the only place that shows the full onion — person, works, hobbies, thoughts, ideologies, morals, online presence — in a space that feels like a personal relationship, not a platform.

### User Persona: "The Curious Visitor"

- **Demographics:** 20-40, tech-adjacent or tech-curious, values authenticity over polish
- **Tech level:** Varies widely — from non-technical friends to fellow cybersecurity students
- **Goals:** Understand who I am, find useful content, feel like they discovered something genuine
- **Frustrations:** Corporate portfolios, sterile LinkedIn profiles, algorithm-driven content feeds

---

## User Journey

### The Story

**Discovery:** A friend mentions my site over coffee, or someone finds a blog post via search/Google ranking for "Ayomiposi Sotomi." They click the link.

**First Contact:** They land on the homepage — warm linen background, my name in a serif font, a quiet "Currently" section, one featured post excerpt. No popups, no banners, no pressure. They feel like they've stepped into a room, not a store.

**Onboarding:** There is no onboarding. They simply explore. The navigation is minimal: Writing, Projects, About, Now. They pick what interests them.

**Core Loop:** They read a post. If it resonates, they browse related posts. They might leave a comment (no signup required). They might subscribe to the newsletter (optional, footer-only). They bookmark the site or add the RSS feed.

**Retention:** They return because the "Now" page changes, new posts appear, and the site feels alive — not a static portfolio, but a living document.

**Success Moment:** They close the tab thinking, "I want to come back here." Or they tell someone, "You should check out this site."

### Key Touchpoints

| Touchpoint | What They See | Feeling |
|------------|---------------|---------|
| Homepage | Name, descriptor, "Currently," one post excerpt | "This is a person, not a product" |
| Writing index | Filterable posts by category | "There's depth here" |
| Individual post | Clean reading experience, code blocks, comments | "This was written by someone who cares" |
| Project page | Status, tech stack, honest write-up | "They're learning in public — I can relate" |
| Now page | Current activities, reading, learning | "This is alive, not abandoned" |
| Footer | Newsletter (subtle), RSS, contact | "I can engage without pressure" |

---

## MVP Features

### Core Features (Must Have)

#### 1. Quiet Garden Homepage
- **Description:** The front door. Warm linen background, generous whitespace, name + one-line descriptor, "Currently" section (3-4 items), one featured post excerpt. Navigation in footer or subtle header. No clutter, no CTAs above the fold.
- **User Value:** First impression that says "person, not platform." Peels the first layer of the onion.
- **Success Criteria:**
  - [ ] Loads in < 2 seconds on 3G
  - [ ] Content is readable without scrolling on mobile
  - [ ] "Currently" section is editable via Markdown frontmatter
  - [ ] Featured post auto-rotates to latest published post
  - [ ] No layout shift on load
- **Priority:** Critical (P0)

#### 2. Writing Section
- **Description:** All blog posts — essays, tutorials, project logs — rendered from Markdown files. Filterable by category (Essays, Tutorials, Project Logs). Individual post pages with syntax highlighting, reading time estimate, publication date, tags, and related posts.
- **User Value:** Core content. Where thoughts live. Where expertise is demonstrated.
- **Success Criteria:**
  - [ ] All posts render correctly with Markdown + frontmatter
  - [ ] Category filtering works without page reload (Astro islands)
  - [ ] Syntax highlighting for code blocks (Shiki)
  - [ ] Reading time calculated automatically
  - [ ] Related posts shown at bottom (3 max, same category)
  - [ ] RSS feed auto-generated at `/rss.xml`
- **Priority:** Critical (P0)

#### 3. Projects Section
- **Description:** Showcase of homelab, Docker, and cybersecurity projects. Each project has: title, status badge (Active/Completed/Learning), tech stack tags, cover image/diagram, long-form writeup (What, Why, How, What I Learned, What's Next), links to GitHub/demo if applicable.
- **User Value:** Demonstrates capability to clients. Builds community with newbies. Shows process, not just product.
- **Success Criteria:**
  - [ ] Project index page with filterable cards
  - [ ] Individual project pages with full writeup template
  - [ ] Status badges visually distinct
  - [ ] Tech stack tags link to filtered writing posts
  - [ ] Cover images optimized (WebP, lazy loading)
- **Priority:** Critical (P0)

#### 4. Now Page
- **Description:** A living document of current activities. Last updated date prominently shown. Sections: Currently working on, Currently learning, Currently reading, Current tools (links to /uses). Editable via Markdown.
- **User Value:** Friends check in here. Clients see you're active. Newbies see what you're exploring.
- **Success Criteria:**
  - [ ] "Last updated" date auto-generated from git commit or frontmatter
  - [ ] Each section supports 3-5 items
  - [ ] Links to related posts/projects where applicable
  - [ ] Easy to update (single Markdown file)
- **Priority:** Critical (P0)

#### 5. Newsletter Signup
- **Description:** Non-imposing email subscription via Buttondown. Form in footer of every page + end of each blog post. No popups, no modals, no scroll triggers. Optional RSS link always visible as alternative.
- **User Value:** Owns audience relationship. Gradual Substack migration. No pressure.
- **Success Criteria:**
  - [ ] Form submits to Buttondown API without page reload
  - [ ] Success/error states handled gracefully
  - [ ] GDPR-compliant (no pre-ticked boxes, clear privacy link)
  - [ ] RSS feed prominently linked as alternative
  - [ ] No cookies or tracking on the form itself
- **Priority:** Critical (P0)

### Supporting Features (Should Have for v1)

| Feature | Why | Effort |
|---------|-----|--------|
| **About page** | Essential for context, but can be minimal | Low |
| **Privacy policy page** | Required for GDPR compliance | Low |
| **Dark mode (time-based)** | Dawn Light palette shifts at sunset | Medium |
| **Custom 404 page** | On-brand, helpful, links back home | Low |

---

## Out of Scope (Not in MVP)

| Feature | Why Wait | Planned For |
|---------|----------|-------------|
| **Media gallery** (photos, videos) | Adds storage/complexity; no visual work to share yet | v2 — when you have a body of media |
| **Search functionality** (Pagefind) | Navigation + categories suffice for <20 posts | v2 — when you hit 20+ posts |
| **Client inquiry form** | No active client acquisition yet; `mailto:` works | v2.1 — when you want to field inquiries |
| **Advanced analytics** (custom events, funnels) | Cloudflare Web Analytics covers "nice to know reach" | v2.1 — when you have conversion goals |
| **Portfolio/case study templates** | "Project logs" format works; formal case studies feel corporate | v2 — when you have completed client work |
| **Comments on project pages** | Writing comments are the engagement priority | v2 — when project pages get traffic |
| **Multi-language support** | Single audience, single language for now | Future — if audience diversifies |
| **CMS backend** | Markdown files in Git are sufficient for one author | Future — if non-technical collaborators join |

*Why we're waiting: Keeps MVP focused on building something I'm proud of and truly understand. Every deferred feature is a future learning opportunity, not a missing piece.*

---

## Success Metrics

### Primary Metrics

1. **Pride & Understanding (Qualitative, Self-Assessed)**
   - Target: "I can add a new feature without looking up the docs every minute" by day 70
   - How to measure: Journal check-ins at day 35 and day 60
   - Why it matters: This is the real goal — autonomy, not just a live site

2. **Beta Launch Completion**
   - Target: Site live on custom domain or `.pages.dev`, shared with 5+ friends
   - How to measure: Site is accessible, all P0 features functional
   - Why it matters: Ships the thing. Gets feedback. Starts the flywheel.

### Secondary Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| First newsletter signup | 1+ | Within 2 weeks of launch |
| First comment | 1+ | Within 1 month of launch |
| Lighthouse performance score | 90+ | At launch |
| Substack post mirrored to site | 5+ existing posts | By day 45 |
| New post published on site | 2+ original posts | By day 60 |

---

## UI/UX Direction

### Design Feel
**Quiet garden feeling** — not literal flora, but the *sensation* of being somewhere intentional, unhurried, where things grow at their own pace. Warm, peaceful, calm, soft yet catching.

### Selected Palette: Dawn Light

| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| **Background** | `#FAF6F1` (warm linen) | `#1E1B18` (deep warm charcoal) |
| **Text primary** | `#3D3632` (deep umber) | `#E8E2DB` (warm off-white) |
| **Text secondary** | `#9A918A` (warm stone) | `#A8A29E` (muted warm gray) |
| **Accent** | `#C4956A` (muted ochre) | `#A67B52` (deeper ochre) |
| **Link** | `#B87B6A` (dusty rosewood) | `#C4956A` (warm ochre) |
| **Border/divider** | `#E5DDD4` (warm sand) | `#3D3834` (warm dark gray) |
| **Code background** | `#F3EDE6` (soft parchment) | `#2A2623` (deep brown-gray) |

### Typography

| Role | Font | Weight | Size (mobile / desktop) |
|------|------|--------|------------------------|
| **Headings** | Newsreader (Google Fonts) | 400-500 | 28px / 48px hero, 24px / 32px h1 |
| **Body** | Inter | 400 | 16px / 18px, line-height 1.7 |
| **Code** | JetBrains Mono | 400 | 14px, line-height 1.6 |

### Design Principles

1. **Whitespace is structure, not emptiness** — 2-3x normal margins. Content breathes. No sidebars, no clutter.
2. **One thing at a time** — Single focal point per screen. No competing CTAs.
3. **Slow and gentle** — Transitions at 300-400ms ease. Nothing snaps or bounces.
4. **Warmth over coolness** — Every color has a temperature. No pure black, no pure white.
5. **Typography does the work** — Serif for headings (literary, unhurried), sans-serif for body (clear, modern).
6. **Time-aware** — Light mode 6am–6pm, dark mode 6pm–6am. Manual override in footer.

### Key Screens

1. **Homepage (`/`)**
   - Purpose: First impression. The outer layer of the onion.
   - Key Elements: Name, descriptor, "Currently" section, one featured post excerpt, footer nav.
   - User Actions: Scroll, click into a post, explore navigation.

2. **Writing Index (`/writing`)**
   - Purpose: Browse all content.
   - Key Elements: Category filter tabs, post list (title + date + category + excerpt), pagination.
   - User Actions: Filter by category, click to read, subscribe to RSS.

3. **Individual Post (`/writing/[slug]`)**
   - Purpose: Deep reading experience.
   - Key Elements: Title, metadata, body (Markdown rendered), code blocks, related posts, comments (Cusdis), newsletter signup.
   - User Actions: Read, copy code, leave comment, subscribe, share.

4. **Projects Index (`/projects`)**
   - Purpose: Showcase capability and process.
   - Key Elements: Project cards (title, status, tech tags, brief desc), filter by status/tech.
   - User Actions: Browse, click for detail, navigate to GitHub.

5. **Individual Project (`/projects/[slug]`)**
   - Purpose: Deep dive into a specific project.
   - Key Elements: Title, status badge, tech stack, cover image, writeup (What/Why/How/Learned/Next), links.
   - User Actions: Read, comment, check GitHub, read related tutorials.

6. **Now Page (`/now`)**
   - Purpose: Living document of current state.
   - Key Elements: "Last updated" date, sections (Working on, Learning, Reading, Tools).
   - User Actions: Read, click through to related posts/projects.

7. **About Page (`/about`)**
   - Purpose: The deeper layers of the onion.
   - Key Elements: Bio, approach, values, contact method.
   - User Actions: Read, understand the person behind the work.

---

## Technical Considerations

**Platform:** Web app
**Responsive:** Mobile-first, then scale up
**Performance Goals:**
- First Contentful Paint: < 1.5s
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 90+
- Total JS on initial load: < 10 KB (Astro default)
- Images: WebP, lazy-loaded, responsive srcset

**Security/Privacy:**
- HTTPS enforced (Cloudflare Pages auto)
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- No cookies for analytics or comments
- No third-party tracking scripts
- GDPR-compliant privacy policy
- Dependency scanning via `npm audit` + Dependabot

**Scalability:**
- Static site = handles traffic spikes effortlessly
- Cloudflare Pages = unlimited bandwidth on free tier
- No database = no connection limits

**Browser/Device Support:**
- Chrome, Safari, Firefox, Edge (latest 2 versions)
- iOS 14+, Android 10+
- Tablet: optimized layout between mobile and desktop

**Technical Stack (from research):**

| Layer | Tool | Why |
|-------|------|-----|
| **Framework** | Astro | Hands-on code ownership, zero JS by default, Content Collections |
| **Styling** | Tailwind CSS + Typography | Utility-first, design system, beautiful Markdown rendering |
| **Content** | Markdown + Astro Content Collections | Full control, type-safe, Git-versioned |
| **Hosting** | Cloudflare Pages | Unlimited bandwidth, privacy-first analytics, DDoS protection, free |
| **Comments** | Cusdis (self-hosted on Railway free tier) | No signup required, cookieless, data ownership |
| **Newsletter** | Buttondown (free tier, <100 subs) | GDPR-compliant, Markdown-native, RSS integration |
| **Analytics** | Cloudflare Web Analytics | Cookieless, zero setup, no consent banner needed |
| **Version Control** | GitHub | Free, familiar, enables CI/CD |

---

## Constraints & Requirements

### Budget
| Item | Tool | Cost |
|------|------|------|
| Framework | Astro | Free |
| Hosting | Cloudflare Pages | Free |
| Analytics | Cloudflare Web Analytics | Free |
| Comments | Cusdis (Railway free tier) | Free |
| Newsletter | Buttondown (<100 subs) | Free |
| Code hosting | GitHub | Free |
| Domain | (optional, post-launch) | ~$10-15/year |
| **Total (now)** | | **$0/month** |

### Timeline
| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Foundation (Astro, layout, first posts) | Days 1-16 | Local site with homepage, writing, about |
| Content & Design (polish, migration, projects) | Days 17-32 | Distinct visual identity, real content, dark mode |
| Engagement (comments, newsletter, analytics) | Days 33-48 | Interactive features, measurable |
| Security & Launch | Days 49-70 | Hardened, compliant, live beta |
| Post-launch refinement | Ongoing | Iterate based on feedback |

### Technical Constraints
- Free tier only — no paid services until post-launch
- No database — static site, Markdown files
- No user accounts — comments via Cusdis (no auth), newsletter via Buttondown
- Minimal JavaScript — only where interactivity is essential

---

## Open Questions & Assumptions

### Assumptions
- Substack RSS feed will continue to be available for one-time import
- Railway free tier will remain available for Cusdis hosting
- Cloudflare Pages free tier limits (500 build minutes/mo) will not be exceeded
- I will write 2+ original posts during the 70-day period

### Open Questions
- Will I purchase a custom domain at launch or keep `.pages.dev` initially? → **Decision: Keep `.pages.dev` for beta, migrate to custom domain when proud of the result.**
- Should project pages include a "difficulty" rating for newbie accessibility? → **Decision: Defer to v2. Use tags and writing tone to signal accessibility.**
- How often should the "Now" page be updated? → **Decision: Weekly minimum, or whenever something meaningful changes.**

---

## Quality Standards

### Code Quality
- Use TypeScript where possible — it catches errors early
- Handle errors explicitly — don't hide them
- Test the important paths before launch (homepage → post → comment → newsletter)
- Every feature must work on mobile before it works on desktop

### Design Quality
- Use consistent colors and spacing (Tailwind design tokens)
- No placeholder content ("Lorem ipsum") at launch
- Every page must pass Lighthouse accessibility audit (90+)
- Check contrast ratios for all text/background combinations

### What This Project Will NOT Accept
- Placeholder content in production
- Features that half-work — complete or cut
- Skipping mobile testing
- Ignoring accessibility basics (alt text, labels, focus states)
- Adding tracking or cookies without explicit privacy documentation

---

## Risk Mitigation

| Risk | Impact | Likigation Strategy |
|------|--------|---------------------|
| **Learning curve steeper than expected** | High | 70-day timeline has buffer; prioritize shipping over perfection; cut scope if needed |
| **Cusdis self-hosting fails or Railway changes free tier** | Medium | Have Giscus as backup (accept GitHub-only comments); or skip comments for v1 |
| **Buttondown free tier limits reached quickly** | Low | 100 subscribers is generous for a new site; migrate to paid or Listmonk if needed |
| **Design doesn't feel "me" after building** | Medium | Iterate in browser; use Astro's fast dev server; seek feedback from 2-3 friends at day 35 |
| **Content migration from Substack is tedious** | Medium | One-time script for bulk import; manual cleanup for formatting; not all posts need to migrate |
| **Scope creep (wanting to add v2 features)** | High | Revisit this PRD when tempted; write the idea down for v2; stay disciplined |

---

## MVP Completion Checklist

### Development Complete
- [ ] All P0 features working (homepage, writing, projects, now, newsletter)
- [ ] About page and privacy policy pages exist
- [ ] Dark mode (time-based) functional
- [ ] Mobile responsive on all key screens
- [ ] Cross-browser tested (Chrome, Safari, Firefox)

### Launch Ready
- [ ] Analytics configured (Cloudflare Web Analytics)
- [ ] RSS feed auto-generating and valid
- [ ] Newsletter signup tested end-to-end
- [ ] Comments (Cusdis) embedded and working
- [ ] Privacy policy page published
- [ ] Custom 404 page implemented
- [ ] Lighthouse scores: Performance 90+, Accessibility 90+

### Quality Checks
- [ ] 3-5 friends/family tested the site and gave feedback
- [ ] Core user journey works end-to-end (homepage → post → comment → newsletter)
- [ ] No critical bugs
- [ ] Performance acceptable on 3G
- [ ] Security headers configured and verified

### Content
- [ ] 5+ Substack posts migrated
- [ ] 2+ original posts published
- [ ] Now page populated with current activities
- [ ] About page written and published
- [ ] At least 1 project documented

---

## Next Steps

1. **Immediate:** Review and approve this PRD
2. **Next:** Create Technical Design Document (Part 3) — component structure, file organization, content schema, deployment pipeline
3. **Then:** Set up development environment (Node.js, Astro, Tailwind, Git)
4. **Build:** Implement with AI assistance, following the 49-70 day roadmap
5. **Test:** Beta with 5-10 friends, gather feedback
6. **Launch:** Go live, announce, iterate

---

*Created: 2026-07-23*
*Status: Ready for Technical Design*
*Owner: Ayomiposi Sotomi*

---

## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: prd
- App name: Ayosotomi.com
- User level: C (in-between)
- Target platform: web
- Budget: free only
- Timeline: ~70 days to beta launch
- Source files: research-PersonalDigitalHub.md → PRD-Ayosotomi-MVP.md
---
