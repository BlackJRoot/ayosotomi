// Interactive editor for EXISTING entries in the `blog` content
// collection. Run via `npm run edit-post`. Same menu shape as
// new-post-cli.ts, with three differences that matter because this
// tool touches something already written and possibly already live:
//
// 1. The post body is read once and carried through completely
//    untouched -- only frontmatter is ever regenerated. Never
//    reconstructs or rewrites prose.
// 2. Changing the slug or post type moves the file (a real rename),
//    with an explicit confirm first, since either one changes the
//    post's live URL.
// 3. Collision checks exclude the file being edited itself -- editing
//    a post in place is not a collision with itself.
//
// This is a dev-only tool. It never runs as part of `npm run build` and
// nothing it imports ships in the built site.
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { input, confirm, select, checkbox } from '@inquirer/prompts';
import { stringify as stringifyYaml } from 'yaml';
import { blogSchema } from '../src/content/blog.schema';
import { splitFrontmatter, splitFrontmatterAndBody } from './lib/frontmatter';
import { runCli } from './lib/quit';
import { openInEditor } from './lib/open-editor';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface PostType {
  category: 'essay' | 'tutorial' | 'project-log';
  folder: 'essays' | 'tutorials' | 'project-logs';
  label: string;
}

const POST_TYPES: PostType[] = [
  { category: 'essay', folder: 'essays', label: 'Essay — reflective/opinion writing' },
  { category: 'tutorial', folder: 'tutorials', label: 'Tutorial — step-by-step instructional writing' },
  { category: 'project-log', folder: 'project-logs', label: 'Project log — build diary, homelab/project write-up' },
];

interface PostData {
  postType: PostType;
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  tags: string[];
  draft: boolean;
}

interface ExistingPost {
  folder: PostType['folder'];
  slug: string;
  title: string;
  category: string;
}

async function listExistingPosts(): Promise<ExistingPost[]> {
  const posts: ExistingPost[] = [];
  for (const type of POST_TYPES) {
    const dir = path.join(BLOG_DIR, type.folder);
    if (!existsSync(dir)) continue;
    for (const file of await readdir(dir)) {
      if (!file.endsWith('.md')) continue;
      const raw = await readFile(path.join(dir, file), 'utf8');
      const data = splitFrontmatter(raw) as { title?: unknown; category?: unknown };
      posts.push({
        folder: type.folder,
        slug: file.replace(/\.md$/, ''),
        title: typeof data.title === 'string' ? data.title : file,
        category: typeof data.category === 'string' ? data.category : type.category,
      });
    }
  }
  return posts.sort((a, b) => a.title.localeCompare(b.title));
}

async function loadExistingTags(): Promise<string[]> {
  const tags = new Set<string>();
  for (const type of POST_TYPES) {
    const dir = path.join(BLOG_DIR, type.folder);
    if (!existsSync(dir)) continue;
    for (const file of await readdir(dir)) {
      if (!file.endsWith('.md')) continue;
      const raw = await readFile(path.join(dir, file), 'utf8');
      const data = splitFrontmatter(raw) as { tags?: unknown };
      if (Array.isArray(data.tags)) {
        for (const tag of data.tags) if (typeof tag === 'string') tags.add(tag);
      }
    }
  }
  return [...tags].sort();
}

// Excludes the file currently being edited -- editing a post in place
// is not a collision with itself.
function slugCollision(folder: string, slug: string, skipPath: string): boolean {
  const candidate = path.join(BLOG_DIR, folder, `${slug}.md`);
  return candidate !== skipPath && existsSync(candidate);
}

async function promptPostType(existing: PostType): Promise<PostType> {
  return select({ message: 'What kind of post is this?', default: existing, choices: POST_TYPES.map((t) => ({ name: t.label, value: t })) });
}

async function promptTitle(existing: string): Promise<string> {
  return input({
    message: 'Title',
    default: existing,
    transformer: (value) => `${value} (${value.length}/80)`,
    validate: (value) => {
      if (!value.trim()) return 'Title is required';
      if (value.length > 80) return `Too long for SEO -- ${value.length}/80`;
      return true;
    },
  });
}

async function promptDescription(existing: string): Promise<string> {
  return input({
    message: 'Description',
    default: existing,
    transformer: (value) => `${value} (${value.length}/160)`,
    validate: (value) => {
      if (!value.trim()) return 'Description is required';
      if (value.length > 160) return `Too long for SEO -- ${value.length}/160`;
      return true;
    },
  });
}

// Deliberately does NOT default to slugify(title) the way new-post-cli's
// promptSlug does -- a changed slug here renames a file that may already
// be live, so the default has to be "keep the current URL" rather than
// "suggest a new one from whatever the title now says."
async function promptSlug(folder: string, existing: string, originalPath: string): Promise<string> {
  return input({
    message: "Slug (changing this renames the file AND the post's live URL)",
    default: existing,
    validate: (value) => {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
        return 'Lowercase letters, numbers, and single hyphens only (e.g. my-post-title)';
      }
      if (slugCollision(folder, value, originalPath)) {
        return `src/content/blog/${folder}/${value}.md already exists -- pick a different slug`;
      }
      return true;
    },
  });
}

async function promptPublishedAt(existing: string): Promise<string> {
  return input({ message: 'Published date', default: existing, validate: (v) => DATE_PATTERN.test(v) || 'Use YYYY-MM-DD' });
}

async function promptTags(existingOptions: string[], existingSelected: string[]): Promise<string[]> {
  let selected: string[] = [];
  if (existingOptions.length > 0) {
    selected = await checkbox({
      message: 'Tags already used elsewhere on the site (space to toggle, enter to confirm)',
      choices: existingOptions.map((tag) => ({ name: tag, value: tag, checked: existingSelected.includes(tag) })),
    });
  }
  console.log('Add any new tags (blank to stop):');
  while (true) {
    const tag = await input({ message: '  new tag' });
    if (!tag.trim()) break;
    if (!selected.includes(tag.trim())) selected.push(tag.trim());
  }
  return selected;
}

async function promptDraft(existing: boolean): Promise<boolean> {
  const publishNow = await confirm({
    message: 'Publish immediately? (No keeps it as a draft -- invisible on the site until you flip this later)',
    default: !existing,
  });
  return !publishNow;
}

function printSummary(data: PostData, originalPath: string): void {
  const newPath = path.join(BLOG_DIR, data.postType.folder, `${data.slug}.md`);
  console.log('\n──────── Editing post ────────');
  console.log(`Post type:    ${data.postType.label}`);
  console.log(`Title:        ${data.title}`);
  console.log(`Slug:         ${data.slug}`);
  console.log(`Description:  ${data.description}`);
  console.log(`Tags:         ${data.tags.length ? data.tags.join(', ') : '(none)'}`);
  console.log(`Published:    ${data.publishedAt}`);
  console.log(`Draft:        ${data.draft ? 'yes (hidden until published)' : 'no (live)'}`);
  if (newPath !== originalPath) {
    console.log(`\n⚠ Slug/type changed -- saving will MOVE this file and change its URL:`);
    console.log(`  ${path.relative(BLOG_DIR, originalPath)} → ${path.relative(BLOG_DIR, newPath)}`);
  }
  console.log('───────────────────────────────');
}

export async function main() {
  const existingPosts = await listExistingPosts();
  if (existingPosts.length === 0) {
    console.log('No existing posts found in src/content/blog/. Use `npm run new-post` to create one.');
    return;
  }

  const chosen = await select({
    message: 'Which post do you want to edit?',
    choices: existingPosts.map((p) => ({ name: `[${p.category}] ${p.title}`, value: p })),
  });

  const originalPath = path.join(BLOG_DIR, chosen.folder, `${chosen.slug}.md`);
  const raw = await readFile(originalPath, 'utf8');
  const { data: loaded, body } = splitFrontmatterAndBody(raw);

  const postType = POST_TYPES.find((t) => t.category === loaded.category) ?? POST_TYPES.find((t) => t.folder === chosen.folder)!;
  const data: PostData = {
    postType,
    title: (loaded.title as string) ?? '',
    slug: chosen.slug,
    description: (loaded.description as string) ?? '',
    publishedAt: loaded.publishedAt ? new Date(loaded.publishedAt as string).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    tags: Array.isArray(loaded.tags) ? (loaded.tags as string[]) : [],
    draft: !!loaded.draft,
  };

  const existingTags = await loadExistingTags();

  console.log(`\nEditing "${data.title}" — the body text is untouched no matter what you change here.\n`);

  while (true) {
    printSummary(data, originalPath);

    const action = await select({
      message: '\nWhat next?',
      choices: [
        { name: 'Save changes', value: 'save' as const },
        { name: 'Edit a field', value: 'edit' as const },
        { name: 'Quit (discard changes, nothing saved)', value: 'quit' as const },
      ],
    });

    if (action === 'quit') {
      console.log('Cancelled — nothing was changed.');
      return;
    }

    if (action === 'save') {
      // Validated against `toWrite`, and ALSO serialized from `toWrite`
      // rather than `result.data` -- see new-post-cli.ts for why:
      // z.coerce.date() turns a plain date string into a real Date
      // object during validation, which would otherwise serialize as a
      // full ISO timestamp instead of the clean date-only string every
      // other file uses.
      const toWrite = {
        title: data.title,
        description: data.description,
        publishedAt: data.publishedAt,
        category: data.postType.category,
        tags: data.tags,
        draft: data.draft,
      };
      const result = blogSchema.safeParse(toWrite);
      if (!result.success) {
        console.log('\n✗ Validation failed against the blog collection schema:');
        for (const issue of result.error.issues) console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
        continue;
      }

      const newPath = path.join(BLOG_DIR, data.postType.folder, `${data.slug}.md`);
      if (slugCollision(data.postType.folder, data.slug, originalPath)) {
        console.log(`\n✗ src/content/blog/${data.postType.folder}/${data.slug}.md already exists.`);
        continue;
      }

      if (newPath !== originalPath) {
        const reallyMove = await confirm({
          message: `This will move the file and change the post's live URL. Continue?`,
          default: false,
        });
        if (!reallyMove) continue;
      }

      const frontmatter = stringifyYaml(toWrite, {
        defaultKeyType: 'PLAIN',
        defaultStringType: 'QUOTE_DOUBLE',
        lineWidth: 0,
      });
      await writeFile(newPath, `---\n${frontmatter}---\n${body}`, 'utf8');
      if (newPath !== originalPath && existsSync(originalPath)) {
        await unlink(originalPath);
      }

      console.log(`\n✓ Validated against the blog collection's schema`);
      console.log(`✓ Saved to src/content/blog/${data.postType.folder}/${data.slug}.md\n`);

      const openNow = await confirm({ message: 'Open it in your editor now?', default: false });
      if (openNow) await openInEditor(newPath);
      return;
    }

    const field = await select({
      message: 'Which field?',
      choices: [
        { name: 'Post type', value: 'postType' as const },
        { name: 'Title', value: 'title' as const },
        { name: 'Slug', value: 'slug' as const },
        { name: 'Description', value: 'description' as const },
        { name: 'Tags', value: 'tags' as const },
        { name: 'Published date', value: 'publishedAt' as const },
        { name: 'Draft status', value: 'draft' as const },
      ],
    });

    if (field === 'postType') data.postType = await promptPostType(data.postType);
    if (field === 'title') data.title = await promptTitle(data.title);
    if (field === 'slug') data.slug = await promptSlug(data.postType.folder, data.slug, originalPath);
    if (field === 'description') data.description = await promptDescription(data.description);
    if (field === 'tags') data.tags = await promptTags(existingTags, data.tags);
    if (field === 'publishedAt') data.publishedAt = await promptPublishedAt(data.publishedAt);
    if (field === 'draft') data.draft = await promptDraft(data.draft);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli(main);
}
