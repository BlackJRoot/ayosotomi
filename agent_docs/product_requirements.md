# Product Requirements

> Filled in from `docs/PRD-Ayosotomi-MVP.md`. This is the agent's quick-reference version — keep it short and current.

## Product Summary
- **Product:** Ayosotomi.com
- **One-liner:** A quiet, multi-layered personal site — writing, projects, and identity — for friends, potential clients, and homelab/Docker newcomers.
- **Target users:** Friends & general visitors; potential clients assessing capability; homelab/Docker/cybersecurity newcomers.

## User Stories
- As a friend or general visitor, I want to land on a warm, uncluttered homepage that shows what Ayomiposi is currently doing, so that I feel like I've stepped into a room, not a store.
- As a potential client, I want to browse honest project write-ups and writing samples, so that I can assess capability and communication style beyond what a polished portfolio shows.
- As a homelab/Docker newcomer, I want accessible, relatable tutorials and project logs (including the struggles, not just the finished steps), so that I can learn without feeling talked down to by dry official docs.

## Feature List (MoSCoW)

### Must Have
- [ ] Quiet Garden Homepage — warm linen background, name + one-line descriptor, "Currently" section (3-4 items), one auto-rotating featured post excerpt, loads in <2s on 3G, no layout shift
- [ ] Writing Section — Markdown blog posts filterable by category (Essays/Tutorials/Project Logs), syntax-highlighted code blocks, reading time, related posts (3 max, same category), auto-generated RSS feed at `/rss.xml`
- [ ] Projects Section — filterable project index + individual write-ups (What/Why/How/Learned/Next), status badges (Active/Completed/Learning), tech tags, optimized cover images
- [ ] Now Page — living document with "last updated" date, sections for Working on / Learning / Reading / Tools, editable via a single Markdown file
- [ ] Newsletter Signup — non-imposing Buttondown form in the footer and end of posts, GDPR-compliant (no pre-ticked boxes), RSS shown as an alternative, no cookies on the form

### Should Have
- [ ] About page
- [ ] Privacy policy page
- [ ] Dark mode (time-based: light 6am–6pm / dark 6pm–6am, manual override toggle)
- [ ] Custom 404 page

### Could Have
- _Not distinguished as a separate tier in the PRD — see "Out of Scope" below for the features explicitly deferred to v2/v2.1/future._

### Won't Have (this version)
- Media gallery (photos, videos) — deferred to v2, once there's a body of media to show
- Search functionality (Pagefind) — deferred to v2, once there are 20+ posts
- Client inquiry form — deferred to v2.1 (`mailto:` works for now)
- Advanced analytics (custom events, funnels) — deferred to v2.1
- Portfolio/case study templates — deferred to v2, once there's completed client work
- Comments on project pages — deferred to v2 (writing comments are the priority)
- Multi-language support — deferred to future, if the audience diversifies
- CMS backend — deferred to future, if non-technical collaborators join (Markdown + Git is sufficient for one author)

## Success Metrics
- **Pride & Understanding (primary, self-assessed):** "I can add a new feature without looking up the docs every minute" by day 70 — checked in journal check-ins at day 35 and day 60.
- **Beta Launch Completion (primary):** Site live (custom domain or `.pages.dev`), shared with 5+ friends, all P0 features functional.
- **Secondary:** first newsletter signup within 2 weeks of launch; first comment within 1 month; Lighthouse performance score 90+ at launch; 5+ Substack posts mirrored to the site by day 45; 2+ new original posts published by day 60.

## Out of Scope
- Everything listed under "Won't Have (this version)" above. The agent must not build any of these mid-build even if asked, without first flagging that it's outside the current phase (see `AGENTS.md` → What NOT To Do).
