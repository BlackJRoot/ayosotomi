// Interactive editor for EXISTING entries in the `projects` content
// collection. Run via `npm run edit-project`. Same shape as
// edit-post-cli.ts -- body carried through untouched, slug changes
// rename the file with an explicit confirm first -- but the "no draft
// field, immediately public" warning from new-project-cli.ts applies
// here too: this collection has no staging step, so editing something
// already live changes it live, not in a draft.
//
// This is a dev-only tool. It never runs as part of `npm run build` and
// nothing it imports ships in the built site.
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { input, confirm, select, checkbox } from '@inquirer/prompts';
import { stringify as stringifyYaml } from 'yaml';
import { projectsSchema } from '../src/content/projects.schema';
import { splitFrontmatter, splitFrontmatterAndBody } from './lib/frontmatter';
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
  // No `cover` here on purpose -- see new-project-cli.ts for why.
}

interface ExistingProject {
  slug: string;
  title: string;
}

async function listExistingProjects(): Promise<ExistingProject[]> {
  if (!existsSync(PROJECTS_DIR)) return [];
  const projects: ExistingProject[] = [];
  for (const file of await readdir(PROJECTS_DIR)) {
    if (!file.endsWith('.md')) continue;
    const raw = await readFile(path.join(PROJECTS_DIR, file), 'utf8');
    const data = splitFrontmatter(raw) as { title?: unknown };
    projects.push({ slug: file.replace(/\.md$/, ''), title: typeof data.title === 'string' ? data.title : file });
  }
  return projects.sort((a, b) => a.title.localeCompare(b.title));
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

// Excludes the file currently being edited -- editing a project in
// place is not a collision with itself.
function slugCollision(slug: string, skipPath: string): boolean {
  const candidate = path.join(PROJECTS_DIR, `${slug}.md`);
  return candidate !== skipPath && existsSync(candidate);
}

async function promptTitle(existing: string): Promise<string> {
  return input({ message: 'Title', default: existing, validate: (v) => !!v.trim() || 'Title is required' });
}

// Deliberately does not default to a re-slugified title -- see the same
// note in edit-post-cli.ts. Editing should default to keeping the
// current URL, not suggesting a new one.
async function promptSlug(existing: string, originalPath: string): Promise<string> {
  return input({
    message: "Slug (changing this renames the file AND the project's live URL)",
    default: existing,
    validate: (value) => {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
        return 'Lowercase letters, numbers, and single hyphens only (e.g. my-project-name)';
      }
      if (slugCollision(value, originalPath)) {
        return `src/content/projects/${value}.md already exists -- pick a different slug`;
      }
      return true;
    },
  });
}

async function promptDescription(existing: string): Promise<string> {
  return input({ message: 'Description', default: existing, validate: (v) => !!v.trim() || 'Description is required' });
}

async function promptStatus(existing: Status): Promise<Status> {
  return select({ message: 'Status', default: existing, choices: STATUSES.map((s) => ({ name: s.label, value: s.value })) });
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
  return input({ message: 'Started date', default: existing, validate: (v) => DATE_PATTERN.test(v) || 'Use YYYY-MM-DD' });
}

async function promptCompletedAt(existing?: string): Promise<string | undefined> {
  const value = await input({
    message: 'Completed date (blank to skip)',
    default: existing,
    validate: (v) => !v.trim() || DATE_PATTERN.test(v) || 'Use YYYY-MM-DD, or leave blank',
  });
  return value.trim() || undefined;
}

async function promptUrl(label: string, existing?: string): Promise<string | undefined> {
  const value = await input({
    message: `${label} (blank to skip)`,
    default: existing,
    validate: (v) => !v.trim() || URL_PATTERN.test(v.trim()) || 'Must start with http:// or https://',
  });
  return value.trim() || undefined;
}

function printSummary(data: ProjectData, originalPath: string): void {
  const newPath = path.join(PROJECTS_DIR, `${data.slug}.md`);
  console.log('\n──────── Editing project ────────');
  console.log(`Title:        ${data.title}`);
  console.log(`Slug:         ${data.slug}`);
  console.log(`Description:  ${data.description}`);
  console.log(`Status:       ${data.status}`);
  console.log(`Tech:         ${data.tech.length ? data.tech.join(', ') : '(none)'}`);
  console.log(`Started:      ${data.startedAt}`);
  console.log(`Completed:    ${data.completedAt ?? '(not set)'}`);
  console.log(`GitHub:       ${data.githubUrl ?? '(not set)'}`);
  console.log(`Demo:         ${data.demoUrl ?? '(not set)'}`);
  if (newPath !== originalPath) {
    console.log(`\n⚠ Slug changed -- saving will MOVE this file and change its URL:`);
    console.log(`  ${path.relative(PROJECTS_DIR, originalPath)} → ${path.relative(PROJECTS_DIR, newPath)}`);
  }
  console.log('\n⚠ This collection has no draft field -- saving applies immediately, live.');
  console.log('──────────────────────────────────');
}

export async function main() {
  const existingProjects = await listExistingProjects();
  if (existingProjects.length === 0) {
    console.log('No existing projects found in src/content/projects/. Use `npm run new-project` to create one.');
    return;
  }

  const chosen = await select({
    message: 'Which project do you want to edit?',
    choices: existingProjects.map((p) => ({ name: p.title, value: p })),
  });

  const originalPath = path.join(PROJECTS_DIR, `${chosen.slug}.md`);
  const raw = await readFile(originalPath, 'utf8');
  const { data: loaded, body } = splitFrontmatterAndBody(raw);

  const data: ProjectData = {
    title: (loaded.title as string) ?? '',
    slug: chosen.slug,
    description: (loaded.description as string) ?? '',
    status: (loaded.status as Status) ?? 'active',
    tech: Array.isArray(loaded.tech) ? (loaded.tech as string[]) : [],
    startedAt: loaded.startedAt ? new Date(loaded.startedAt as string).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    completedAt: loaded.completedAt ? new Date(loaded.completedAt as string).toISOString().slice(0, 10) : undefined,
    githubUrl: typeof loaded.githubUrl === 'string' ? loaded.githubUrl : undefined,
    demoUrl: typeof loaded.demoUrl === 'string' ? loaded.demoUrl : undefined,
  };

  const existingTech = await loadExistingTech();

  console.log(`\nEditing "${data.title}" — the body text is untouched no matter what you change here.\n`);

  while (true) {
    printSummary(data, originalPath);

    const action = await select({
      message: '\nWhat next?',
      choices: [
        { name: 'Save changes (live immediately)', value: 'save' as const },
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
        status: data.status,
        tech: data.tech,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        githubUrl: data.githubUrl,
        demoUrl: data.demoUrl,
      };
      const result = projectsSchema.safeParse(toWrite);
      if (!result.success) {
        console.log('\n✗ Validation failed against the projects collection schema:');
        for (const issue of result.error.issues) console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
        continue;
      }

      const newPath = path.join(PROJECTS_DIR, `${data.slug}.md`);
      if (slugCollision(data.slug, originalPath)) {
        console.log(`\n✗ src/content/projects/${data.slug}.md already exists.`);
        continue;
      }

      const reallySure = await confirm({
        message:
          newPath !== originalPath
            ? "This will move the file and change the project's live URL, immediately. Continue?"
            : 'Save these changes now? There is no draft mode for projects.',
        default: false,
      });
      if (!reallySure) continue;

      const frontmatter = stringifyYaml(toWrite, {
        defaultKeyType: 'PLAIN',
        defaultStringType: 'QUOTE_DOUBLE',
        lineWidth: 0,
      });
      await writeFile(newPath, `---\n${frontmatter}---\n${body}`, 'utf8');
      if (newPath !== originalPath && existsSync(originalPath)) {
        await unlink(originalPath);
      }

      console.log(`\n✓ Validated against the projects collection's schema`);
      console.log(`✓ Saved to src/content/projects/${data.slug}.md`);
      console.log('✓ This is live on /projects as soon as this is built and deployed.\n');

      const openNow = await confirm({ message: 'Open it in your editor now?', default: false });
      if (openNow) await openInEditor(newPath);
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
    if (field === 'slug') data.slug = await promptSlug(data.slug, originalPath);
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli(main);
}
