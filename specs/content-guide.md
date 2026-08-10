# Content Guide — Writing & Projects

How new content actually reaches the live site: what "index pages" are, why you never edit them directly, and the exact steps to publish something new.

## The core idea: index pages are automatic

`/writing` and `/projects` are **index pages** — they don't hold any content of their own. At build time, each one reads *every file* in its content folder and renders a card for each one. You never touch `src/pages/writing/index.astro` or `src/pages/projects/index.astro` to add something new — you add a file to the right content folder, and the index page picks it up on the next build.

```
src/content/blog/essays/        →  filtered into /writing by category: "essay"
src/content/blog/tutorials/     →  filtered into /writing by category: "tutorial"
src/content/blog/project-logs/  →  filtered into /writing by category: "project-log"
src/content/projects/           →  listed on /projects
```

The `blog` collection covers all three of essays, tutorials, and project-logs — they all live under `src/content/blog/`, split into subfolders by type, and share one Zod schema. `projects` is a separate collection with its own schema.

## Adding a new blog post (essay / tutorial / project-log)

1. **Pick the right subfolder**, based on what kind of post it is:
   - `src/content/blog/essays/` — reflective/opinion writing
   - `src/content/blog/tutorials/` — step-by-step instructional writing
   - `src/content/blog/project-logs/` — build diaries, homelab/project write-ups
2. **Copy the matching reference post** (`example-project-log.md` or `example-tutorial.md`) as a starting structure, or write frontmatter from scratch using the fields below.
3. **Fill in the frontmatter:**

   | Field | Required? | Notes |
   |---|---|---|
   | `title` | yes | Max 80 characters (SEO) |
   | `description` | yes | Max 160 characters (SEO) — shows on cards and in search results |
   | `publishedAt` | yes | `YYYY-MM-DD` |
   | `updatedAt` | no | Only if you revise a post after publishing |
   | `category` | yes | Exactly one of: `essay`, `tutorial`, `project-log`, `now-update` — **must match the subfolder you put the file in** |
   | `tags` | no | Array of strings, defaults to empty |
   | `draft` | no | Defaults to `false`. Set `true` while writing — the post won't appear anywhere (index, homepage, RSS) until you flip it back |
   | `cover` | no | `{ src, alt }` object — inline image *inside* the post body, unrelated to the homepage featured-cover system (see below) |

4. **Write the body** in Markdown below the closing `---`.
5. **Leave `draft: true`** until it's ready, then flip to `false` to publish.

## Adding a new project

1. Add a file to `src/content/projects/`, e.g. `src/content/projects/my-new-thing.md`.
2. Copy `example-project.md` as a starting structure, or use these frontmatter fields:

   | Field | Required? | Notes |
   |---|---|---|
   | `title` | yes | |
   | `description` | yes | |
   | `status` | yes | Exactly one of: `active`, `completed`, `learning`, `archived` |
   | `tech` | yes | Array of strings — tech tags shown on the card |
   | `startedAt` | yes | `YYYY-MM-DD` |
   | `completedAt` | no | Only if `status` is `completed` |
   | `cover` | no | String path |
   | `githubUrl` | no | Must be a valid URL |
   | `demoUrl` | no | Must be a valid URL |

3. **Important:** the `projects` collection has **no `draft` field** (a deliberate decision — see `MEMORY.md`). Anything you add here is **immediately public** on `/projects` as soon as it's built and deployed. There's no way to stage a project privately the way you can with a blog post — write it fully before adding the file, or keep it in a personal note until it's ready.

## Giving a post a homepage featured cover

Separate system from the inline `cover` frontmatter field above. The homepage's featured-essay block looks for an image at:

```
src/assets/covers/<post-slug>.<jpeg|jpg|png|webp>
```

...where `<post-slug>` is the last segment of the post's URL (e.g. for `/writing/essays/you-might-be-somebodys-illusion/`, the slug is `you-might-be-somebodys-illusion`). Drop a matching image in that folder and it's picked up automatically — no frontmatter change needed. No matching file → the featured block just renders without an image.

**Dimensions:** portrait, **13:16 aspect ratio**, ideally **≥520×640px** or larger (renders at 208×256, displayed at 104×128 — 2x for sharp retina). The image is center-cropped (`object-cover`), so keep the subject roughly centered.

## Updating the Now page

Unlike `/writing` and `/projects`, `now` isn't an index of everything in its folder — the page (and the homepage's "Currently" pulse) always shows whichever file has the **newest `updatedAt`**. That means `src/content/now/` can hold multiple dated snapshots over time (e.g. `current.md`, `2026-08-10.md`, `2026-09-02.md`, ...) and the site automatically shows the latest one — nothing to clean up or rename.

The easiest way to update it: run `npm run now`. It's an interactive CLI (`scripts/now-cli.ts`) that walks through each field one at a time, pre-fills your current values so you can just press Enter to keep them, lets you attach a link to any item (rendered as a real clickable link — see `parseInlineLinks` in `src/lib/utils.ts`), validates everything against the collection's actual schema before writing anything, and saves a new dated file rather than overwriting history. It doesn't touch git — review the file it writes and commit/push yourself.

You can still hand-edit a `now/*.md` file directly if you'd rather; the fields are:

| Field | Required? | Notes |
|---|---|---|
| `updatedAt` | yes | `YYYY-MM-DD` — determines which file "wins" as the current one |
| `workingOn` | yes | Array of strings, up to 5. Empty array (`[]`) is valid if you have nothing to show |
| `learning` | yes | Same, up to 5 |
| `reading` | yes | Same, up to 5 |
| `tools` | yes | Same, up to 5 |
| `watching` | no | Up to 3. Omit the field entirely rather than leaving it empty/unused |
| `doing` | no | Same, up to 3 |

Any item in any of these fields can be `"plain text"` or `"[link text](https://...)"` — both render correctly. **One array item = one bullet on the page** — don't cram multiple things into one comma-separated string (`"Docker, TypeScript"` is one bullet reading exactly that; `- "Docker"` and `- "TypeScript"` as two separate list entries is what you want).

## Quick reference: where everything lives

```
src/content/blog/essays/         essays
src/content/blog/tutorials/      tutorials
src/content/blog/project-logs/   project-logs
src/content/projects/            projects
src/content/now/                 the Now page -- newest `updatedAt` wins; edit via `npm run now`
src/assets/covers/               optional homepage featured-cover images
```
