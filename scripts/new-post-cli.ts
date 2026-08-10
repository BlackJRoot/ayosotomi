// Interactive scaffolder for the `blog` content collection
// (src/content/blog/{essays,tutorials,project-logs}/). Run via
// `npm run new-post`. Same shape as now-cli.ts: reuses the site's actual
// Zod schema (src/content/blog.schema.ts) to validate before writing,
// and never generates the post body -- only frontmatter. The body stays
// 100% yours to write.
//
// This is a dev-only tool. It never runs as part of `npm run build` and
// nothing it imports ships in the built site.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { input, confirm, select, checkbox } from '@inquirer/prompts';
import { stringify as stringifyYaml } from 'yaml';
import { blogSchema } from '../src/content/blog.schema';
import { splitFrontmatter } from './lib/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface PostType {
  category: 'essay' | 'tutorial' | 'project-log';
  folder: 'essays' | 'tutorials' | 'project-logs';
  label: string;
}

// Only the three subfolders actually documented/used in
// specs/content-guide.md and every real post so far. `now-update` is a
// valid category in the schema but has no corresponding folder or any
// precedent in existing content -- deliberately not offered here rather
// than guessing at a convention that doesn't exist yet.
const POST_TYPES: PostType[] = [
  { category: 'essay', folder: 'essays', label: 'Essay — reflective/opinion writing' },
  { category: 'tutorial', folder: 'tutorials', label: 'Tutorial — step-by-step instructional writing' },
  { category: 'project-log', folder: 'project-logs', label: 'Project log — build diary, homelab/project write-up' },
];

interface PostData {
  title: string;
  description: string;
  publishedAt: string;
  category: PostType['category'];
  tags: string[];
  draft: boolean;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/['']/g, '') // drop apostrophes rather than turning them into hyphens
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

function slugCollision(folder: string, slug: string): boolean {
  return existsSync(path.join(BLOG_DIR, folder, `${slug}.md`));
}

async function promptTitle(existing?: string): Promise<string> {
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

async function promptDescription(existing?: string): Promise<string> {
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

async function promptSlug(title: string, folder: string, existing?: string): Promise<string> {
  return input({
    message: 'Slug (this becomes the URL and the filename)',
    default: existing ?? slugify(title),
    validate: (value) => {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
        return 'Lowercase letters, numbers, and single hyphens only (e.g. my-post-title)';
      }
      if (value !== existing && slugCollision(folder, value)) {
        return `src/content/blog/${folder}/${value}.md already exists -- pick a different slug`;
      }
      return true;
    },
  });
}

async function promptPublishedAt(existing?: string): Promise<string> {
  return input({
    message: 'Published date',
    default: existing ?? new Date().toISOString().slice(0, 10),
    validate: (value) => DATE_PATTERN.test(value) || 'Use YYYY-MM-DD',
  });
}

async function promptTags(existingTags: string[], existingSelected?: string[]): Promise<string[]> {
  let selected: string[] = [];
  if (existingTags.length > 0) {
    selected = await checkbox({
      message: 'Tags already used elsewhere on the site (space to toggle, enter to confirm)',
      choices: existingTags.map((tag) => ({ name: tag, value: tag, checked: existingSelected?.includes(tag) })),
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

async function promptDraft(existing?: boolean): Promise<boolean> {
  const publishNow = await confirm({
    message: 'Publish immediately? (No keeps it as a draft -- invisible on the site until you flip this later)',
    default: existing === false,
  });
  return !publishNow;
}

function printSummary(data: PostData, folder: string): void {
  console.log('\n──────── Review ────────');
  console.log(`Title:        ${data.title}`);
  console.log(`Description:  ${data.description}`);
  console.log(`File:         src/content/blog/${folder}/${slugify(data.title)}.md`);
  console.log(`Published:    ${data.publishedAt}`);
  console.log(`Category:     ${data.category}`);
  console.log(`Tags:         ${data.tags.length ? data.tags.join(', ') : '(none)'}`);
  console.log(`Draft:        ${data.draft ? 'yes (hidden until published)' : 'no (goes live immediately)'}`);
  console.log('────────────────────────');
}

export async function main() {
  console.log('Scaffolding a new blog post — this only writes the frontmatter, never the body.\n');

  const existingTags = await loadExistingTags();

  const postType = await select({
    message: 'What kind of post is this?',
    choices: POST_TYPES.map((type) => ({ name: type.label, value: type })),
  });

  const title = await promptTitle();
  let slug = await promptSlug(title, postType.folder);
  const description = await promptDescription();
  const tags = await promptTags(existingTags);
  const publishedAt = await promptPublishedAt();
  const draft = await promptDraft();

  const data: PostData = { title, description, publishedAt, category: postType.category, tags, draft };

  while (true) {
    printSummary(data, postType.folder);

    const action = await select({
      message: '\nWhat next?',
      choices: [
        { name: 'Create the file', value: 'save' as const },
        { name: 'Edit a field', value: 'edit' as const },
        { name: 'Cancel (discard everything)', value: 'cancel' as const },
      ],
    });

    if (action === 'cancel') {
      console.log('Cancelled. Nothing was written.');
      return;
    }
    if (action === 'save') break;

    const field = await select({
      message: 'Which field?',
      choices: [
        { name: 'Title', value: 'title' as const },
        { name: 'Slug', value: 'slug' as const },
        { name: 'Description', value: 'description' as const },
        { name: 'Tags', value: 'tags' as const },
        { name: 'Published date', value: 'publishedAt' as const },
        { name: 'Draft status', value: 'draft' as const },
      ],
    });

    if (field === 'title') data.title = await promptTitle(data.title);
    if (field === 'slug') slug = await promptSlug(data.title, postType.folder, slug);
    if (field === 'description') data.description = await promptDescription(data.description);
    if (field === 'tags') data.tags = await promptTags(existingTags, data.tags);
    if (field === 'publishedAt') data.publishedAt = await promptPublishedAt(data.publishedAt);
    if (field === 'draft') data.draft = await promptDraft(data.draft);
  }

  const result = blogSchema.safeParse(data);
  if (!result.success) {
    console.error('\n✗ Validation failed against the blog collection schema:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  // Re-check the slug right before writing -- it was validated against
  // collisions when first entered, but Tags/Title/etc. could have been
  // re-edited afterward without re-touching the slug prompt.
  if (slugCollision(postType.folder, slug)) {
    console.error(`\n✗ src/content/blog/${postType.folder}/${slug}.md already exists. Nothing was written.`);
    process.exitCode = 1;
    return;
  }

  const targetPath = path.join(BLOG_DIR, postType.folder, `${slug}.md`);
  const frontmatter = stringifyYaml(data, {
    defaultKeyType: 'PLAIN',
    defaultStringType: 'QUOTE_DOUBLE',
    lineWidth: 0,
  });
  await writeFile(targetPath, `---\n${frontmatter}---\n\n`, 'utf8');

  console.log(`\n✓ Validated against the blog collection's schema`);
  console.log(`✓ Written to src/content/blog/${postType.folder}/${slug}.md\n`);
  if (data.draft) {
    console.log("This post is a draft -- invisible on the site until you flip `draft` to false.");
  } else {
    console.log('This post is NOT a draft -- it will appear on the site as soon as this is built and deployed.');
  }
  console.log(
    `\nOptional homepage cover: drop an image at src/assets/covers/${slug}.<jpeg|jpg|png|webp> (portrait, 13:16, ≥520×640px) -- see specs/content-guide.md.`
  );
  console.log("\nNow write the body in the file this created — that part's yours.");
}

// Guard so this module can be imported (e.g. by a test script) without
// immediately kicking off the interactive prompts.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
