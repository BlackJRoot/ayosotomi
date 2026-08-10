// Interactive scaffolder for the `blog` content collection
// (src/content/blog/{essays,tutorials,project-logs}/). Run via
// `npm run new-post`. Same shape as now-cli.ts: one menu from the very
// first screen (no forced linear pass before you can fix something),
// reuses the site's actual Zod schema (src/content/blog.schema.ts) to
// validate before writing, and never generates the post body -- only
// frontmatter. The body stays 100% yours to write.
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
  postType: PostType;
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
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

async function promptPostType(existing?: PostType): Promise<PostType> {
  return select({
    message: 'What kind of post is this?',
    default: existing,
    choices: POST_TYPES.map((type) => ({ name: type.label, value: type })),
  });
}

async function promptTitle(existing: string): Promise<string> {
  return input({
    message: 'Title',
    default: existing || undefined,
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
    default: existing || undefined,
    transformer: (value) => `${value} (${value.length}/160)`,
    validate: (value) => {
      if (!value.trim()) return 'Description is required';
      if (value.length > 160) return `Too long for SEO -- ${value.length}/160`;
      return true;
    },
  });
}

async function promptSlug(title: string, folder: string, existing: string): Promise<string> {
  return input({
    message: 'Slug (this becomes the URL and the filename)',
    default: existing || slugify(title),
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

async function promptPublishedAt(existing: string): Promise<string> {
  return input({
    message: 'Published date',
    default: existing,
    validate: (value) => DATE_PATTERN.test(value) || 'Use YYYY-MM-DD',
  });
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

function printSummary(data: PostData): void {
  console.log('\n──────── New post ────────');
  console.log(`Post type:    ${data.postType.label}`);
  console.log(`Title:        ${data.title || '(not set)'}`);
  console.log(`Slug:         ${data.slug || '(not set)'}  → src/content/blog/${data.postType.folder}/${data.slug || '<slug>'}.md`);
  console.log(`Description:  ${data.description || '(not set)'}`);
  console.log(`Tags:         ${data.tags.length ? data.tags.join(', ') : '(none)'}`);
  console.log(`Published:    ${data.publishedAt}`);
  console.log(`Draft:        ${data.draft ? 'yes (hidden until published)' : 'no (goes live immediately)'}`);
  console.log('──────────────────────────');
}

export async function main() {
  console.log(
    'Scaffolding a new blog post — this only writes the frontmatter, never the body. Pick a field to fill it in, or Save once everything looks right.\n'
  );

  const existingTags = await loadExistingTags();

  const initialPostType = await promptPostType();
  const data: PostData = {
    postType: initialPostType,
    title: '',
    slug: '',
    description: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    tags: [],
    draft: true,
  };

  // One menu, from the very first screen -- no separate "collect
  // everything in order" pass before you're allowed to fix something.
  // Jump to any field, in any order, as many times as you want, before
  // ever committing to Save.
  while (true) {
    printSummary(data);

    const action = await select({
      message: '\nWhat next?',
      choices: [
        { name: 'Save', value: 'save' as const },
        { name: 'Edit a field', value: 'edit' as const },
        { name: 'Quit (discard everything, nothing saved)', value: 'quit' as const },
      ],
    });

    if (action === 'quit') {
      console.log('Cancelled — nothing was written.');
      return;
    }

    if (action === 'save') {
      if (!data.title.trim() || !data.slug.trim() || !data.description.trim()) {
        console.log('\n✗ Title, slug, and description are all required before saving.');
        continue;
      }

      const result = blogSchema.safeParse({
        title: data.title,
        description: data.description,
        publishedAt: data.publishedAt,
        category: data.postType.category,
        tags: data.tags,
        draft: data.draft,
      });
      if (!result.success) {
        console.log('\n✗ Validation failed against the blog collection schema:');
        for (const issue of result.error.issues) console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
        continue;
      }

      // Re-check the slug right before writing -- it was validated
      // against collisions when first entered, but the post type (and
      // therefore the folder) could have been changed afterward without
      // re-touching the slug prompt.
      if (slugCollision(data.postType.folder, data.slug)) {
        console.log(`\n✗ src/content/blog/${data.postType.folder}/${data.slug}.md already exists.`);
        continue;
      }

      const targetPath = path.join(BLOG_DIR, data.postType.folder, `${data.slug}.md`);
      const frontmatter = stringifyYaml(result.data, {
        defaultKeyType: 'PLAIN',
        defaultStringType: 'QUOTE_DOUBLE',
        lineWidth: 0,
      });
      await writeFile(targetPath, `---\n${frontmatter}---\n\n`, 'utf8');

      console.log(`\n✓ Validated against the blog collection's schema`);
      console.log(`✓ Written to src/content/blog/${data.postType.folder}/${data.slug}.md\n`);
      if (data.draft) {
        console.log("This post is a draft -- invisible on the site until you flip `draft` to false.");
      } else {
        console.log('This post is NOT a draft -- it will appear on the site as soon as this is built and deployed.');
      }
      console.log(
        `\nOptional homepage cover: drop an image at src/assets/covers/${data.slug}.<jpeg|jpg|png|webp> (portrait, 13:16, ≥520×640px) -- see specs/content-guide.md.`
      );
      console.log("\nNow write the body in the file this created — that part's yours.");

      const openNow = await confirm({ message: 'Open it in your editor now?', default: true });
      if (openNow) await openInEditor(targetPath);
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
    if (field === 'slug') data.slug = await promptSlug(data.title, data.postType.folder, data.slug);
    if (field === 'description') data.description = await promptDescription(data.description);
    if (field === 'tags') data.tags = await promptTags(existingTags, data.tags);
    if (field === 'publishedAt') data.publishedAt = await promptPublishedAt(data.publishedAt);
    if (field === 'draft') data.draft = await promptDraft(data.draft);
  }
}

// Guard so this module can be imported (e.g. by a test script, or the
// combined `npm run content` menu) without immediately kicking off the
// interactive prompts.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli(main);
}
