// Interactive scaffolder for the `projects` content collection
// (src/content/projects/). Run via `npm run new-project`. Same shape as
// now-cli.ts / new-post-cli.ts -- one menu from the very first screen,
// no forced linear pass before you can fix something -- but stricter:
// this collection has NO `draft` field (a deliberate decision -- see
// MEMORY.md), so whatever this writes is immediately public as soon as
// it's built and deployed. No silent-overwrite path exists here at all.
//
// This is a dev-only tool. It never runs as part of `npm run build` and
// nothing it imports ships in the built site.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { input, confirm, select, checkbox } from '@inquirer/prompts';
import { stringify as stringifyYaml } from 'yaml';
import { projectsSchema } from '../src/content/projects.schema';
import { splitFrontmatter } from './lib/frontmatter';
import { slugify } from './new-post-cli';
import { runCli } from './lib/quit';
import { openInEditor } from './lib/open-editor';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, '..', 'src', 'content', 'projects');
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /^https?:\/\//;

type Status = 'active' | 'completed' | 'learning' | 'archived';
const STATUSES: { value: Status; label: string }[] = [
  { value: 'active', label: 'Active — ongoing' },
  { value: 'completed', label: 'Completed — finished and working' },
  { value: 'learning', label: 'Learning — exploratory, not aiming for "done"' },
  { value: 'archived', label: 'Archived — no longer maintained' },
];

interface ProjectData {
  title: string;
  slug: string;
  description: string;
  status: Status;
  tech: string[];
  startedAt: string;
  completedAt?: string;
  githubUrl?: string;
  demoUrl?: string;
  // No `cover` here on purpose -- the schema has an optional `cover`
  // field, but nothing in the codebase actually renders it anywhere
  // (confirmed by grep -- ProjectCard.astro doesn't reference it). Asking
  // for a value that does nothing would be actively misleading.
}

function slugCollision(slug: string): boolean {
  return existsSync(path.join(PROJECTS_DIR, `${slug}.md`));
}

async function loadExistingTech(): Promise<string[]> {
  const tech = new Set<string>();
  if (!existsSync(PROJECTS_DIR)) return [];
  for (const file of await readdir(PROJECTS_DIR)) {
    if (!file.endsWith('.md')) continue;
    const raw = await readFile(path.join(PROJECTS_DIR, file), 'utf8');
    const data = splitFrontmatter(raw) as { tech?: unknown };
    if (Array.isArray(data.tech)) {
      for (const t of data.tech) if (typeof t === 'string') tech.add(t);
    }
  }
  return [...tech].sort();
}

async function promptTitle(existing: string): Promise<string> {
  return input({
    message: 'Title',
    default: existing || undefined,
    validate: (value) => !!value.trim() || 'Title is required',
  });
}

async function promptSlug(title: string, existing: string): Promise<string> {
  return input({
    message: 'Slug (this becomes the URL and the filename)',
    default: existing || slugify(title),
    validate: (value) => {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
        return 'Lowercase letters, numbers, and single hyphens only (e.g. my-project-name)';
      }
      if (value !== existing && slugCollision(value)) {
        return `src/content/projects/${value}.md already exists -- pick a different slug`;
      }
      return true;
    },
  });
}

async function promptDescription(existing: string): Promise<string> {
  return input({
    message: 'Description',
    default: existing || undefined,
    validate: (value) => !!value.trim() || 'Description is required',
  });
}

async function promptStatus(existing: Status): Promise<Status> {
  return select({
    message: 'Status',
    default: existing,
    choices: STATUSES.map((s) => ({ name: s.label, value: s.value })),
  });
}

async function promptTech(existingOptions: string[], existingSelected: string[]): Promise<string[]> {
  let selected: string[] = [];
  if (existingOptions.length > 0) {
    selected = await checkbox({
      message: 'Tech already used on other projects (space to toggle, enter to confirm)',
      choices: existingOptions.map((t) => ({ name: t, value: t, checked: existingSelected.includes(t) })),
    });
  }

  console.log('Add any new tech tags (blank to stop):');
  while (true) {
    const tech = await input({ message: '  new tag' });
    if (!tech.trim()) break;
    if (!selected.includes(tech.trim())) selected.push(tech.trim());
  }

  return selected;
}

async function promptStartedAt(existing: string): Promise<string> {
  return input({
    message: 'Started date',
    default: existing,
    validate: (value) => DATE_PATTERN.test(value) || 'Use YYYY-MM-DD',
  });
}

async function promptCompletedAt(existing?: string): Promise<string | undefined> {
  const value = await input({
    message: 'Completed date (blank to skip)',
    default: existing,
    validate: (value) => !value.trim() || DATE_PATTERN.test(value) || 'Use YYYY-MM-DD, or leave blank',
  });
  return value.trim() || undefined;
}

async function promptUrl(label: string, existing?: string): Promise<string | undefined> {
  const value = await input({
    message: `${label} (blank to skip)`,
    default: existing,
    validate: (value) => !value.trim() || URL_PATTERN.test(value.trim()) || 'Must start with http:// or https://',
  });
  return value.trim() || undefined;
}

function printSummary(data: ProjectData): void {
  console.log('\n──────── New project ────────');
  console.log(`Title:        ${data.title || '(not set)'}`);
  console.log(`Slug:         ${data.slug || '(not set)'}  → src/content/projects/${data.slug || '<slug>'}.md`);
  console.log(`Description:  ${data.description || '(not set)'}`);
  console.log(`Status:       ${data.status}`);
  console.log(`Tech:         ${data.tech.length ? data.tech.join(', ') : '(none)'}`);
  console.log(`Started:      ${data.startedAt}`);
  console.log(`Completed:    ${data.completedAt ?? '(not set)'}`);
  console.log(`GitHub:       ${data.githubUrl ?? '(not set)'}`);
  console.log(`Demo:         ${data.demoUrl ?? '(not set)'}`);
  console.log('\n⚠ This collection has no draft field -- saving makes this immediately');
  console.log("  public on /projects as soon as it's built and deployed.");
  console.log('──────────────────────────────');
}

export async function main() {
  console.log(
    "Scaffolding a new project — this collection has no draft field, so whatever gets saved here goes live immediately. Pick a field to fill it in, or Save once everything looks right.\n"
  );

  const existingTech = await loadExistingTech();

  const data: ProjectData = {
    title: '',
    slug: '',
    description: '',
    status: 'active',
    tech: [],
    startedAt: new Date().toISOString().slice(0, 10),
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
        { name: 'Save (goes live immediately)', value: 'save' as const },
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

      const result = projectsSchema.safeParse({
        title: data.title,
        description: data.description,
        status: data.status,
        tech: data.tech,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        githubUrl: data.githubUrl,
        demoUrl: data.demoUrl,
      });
      if (!result.success) {
        console.log('\n✗ Validation failed against the projects collection schema:');
        for (const issue of result.error.issues) console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
        continue;
      }

      if (slugCollision(data.slug)) {
        console.log(`\n✗ src/content/projects/${data.slug}.md already exists.`);
        continue;
      }

      const reallySure = await confirm({
        message: 'Really publish this now? There is no draft mode for projects.',
        default: false,
      });
      if (!reallySure) continue;

      const targetPath = path.join(PROJECTS_DIR, `${data.slug}.md`);
      const frontmatter = stringifyYaml(result.data, {
        defaultKeyType: 'PLAIN',
        defaultStringType: 'QUOTE_DOUBLE',
        lineWidth: 0,
      });
      await writeFile(targetPath, `---\n${frontmatter}---\n\n`, 'utf8');

      console.log(`\n✓ Validated against the projects collection's schema`);
      console.log(`✓ Written to src/content/projects/${data.slug}.md`);
      console.log("✓ This is live on /projects as soon as this is built and deployed -- no draft mode here.\n");
      console.log("Now write the body in the file this created — that part's yours.");

      const openNow = await confirm({ message: 'Open it in your editor now?', default: true });
      if (openNow) await openInEditor(targetPath);
      return;
    }

    const field = await select({
      message: 'Which field?',
      choices: [
        { name: 'Title', value: 'title' as const },
        { name: 'Slug', value: 'slug' as const },
        { name: 'Description', value: 'description' as const },
        { name: 'Status', value: 'status' as const },
        { name: 'Tech', value: 'tech' as const },
        { name: 'Started date', value: 'startedAt' as const },
        { name: 'Completed date', value: 'completedAt' as const },
        { name: 'GitHub URL', value: 'githubUrl' as const },
        { name: 'Demo URL', value: 'demoUrl' as const },
      ],
    });

    if (field === 'title') data.title = await promptTitle(data.title);
    if (field === 'slug') data.slug = await promptSlug(data.title, data.slug);
    if (field === 'description') data.description = await promptDescription(data.description);
    if (field === 'status') {
      data.status = await promptStatus(data.status);
      if (data.status !== 'completed') data.completedAt = undefined;
    }
    if (field === 'tech') data.tech = await promptTech(existingTech, data.tech);
    if (field === 'startedAt') data.startedAt = await promptStartedAt(data.startedAt);
    if (field === 'completedAt') {
      if (data.status !== 'completed') {
        console.log('  (only applies when status is "completed" -- change status first)');
      } else {
        data.completedAt = await promptCompletedAt(data.completedAt);
      }
    }
    if (field === 'githubUrl') data.githubUrl = await promptUrl('GitHub URL', data.githubUrl);
    if (field === 'demoUrl') data.demoUrl = await promptUrl('Demo URL', data.demoUrl);
  }
}

// Guard so this module can be imported (e.g. by a test script, or the
// combined `npm run content` menu) without immediately kicking off the
// interactive prompts.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli(main);
}
