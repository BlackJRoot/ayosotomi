// Interactive editor for the `now` content collection (src/content/now/).
// Run via `npm run now`. Prompts field-by-field, reuses the site's actual
// Zod schema (src/content/now.schema.ts) to validate before writing, and
// writes a new dated snapshot file rather than overwriting history --
// the collection already picks whichever file has the newest `updatedAt`
// (see now.astro / index.astro), so this is just using that as designed.
//
// This is a dev-only tool. It never runs as part of `npm run build` and
// nothing it imports ships in the built site.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { input, confirm } from '@inquirer/prompts';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { nowSchema } from '../src/content/now.schema';
import { parseInlineLinks } from '../src/lib/utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOW_DIR = path.join(__dirname, '..', 'src', 'content', 'now');
const URL_PATTERN = /^https?:\/\//;

interface NowData {
  updatedAt: string;
  workingOn: string[];
  learning: string[];
  reading: string[];
  tools: string[];
  watching?: string[];
  doing?: string[];
}

const REQUIRED_FIELDS: { key: keyof NowData; label: string; max: number }[] = [
  { key: 'workingOn', label: 'Working on', max: 5 },
  { key: 'learning', label: 'Learning', max: 5 },
  { key: 'reading', label: 'Reading', max: 5 },
  { key: 'tools', label: 'Tools', max: 5 },
];

const OPTIONAL_FIELDS: { key: keyof NowData; label: string; max: number }[] = [
  { key: 'watching', label: 'Watching', max: 3 },
  { key: 'doing', label: 'Doing', max: 3 },
];

export function splitFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return (parseYaml(match[1]) as Record<string, unknown>) ?? {};
}

export async function loadLatestEntry(): Promise<Partial<NowData>> {
  if (!existsSync(NOW_DIR)) return {};
  const files = (await readdir(NOW_DIR)).filter((f) => f.endsWith('.md'));

  let latest: Partial<NowData> = {};
  let latestTime = -Infinity;

  for (const file of files) {
    const raw = await readFile(path.join(NOW_DIR, file), 'utf8');
    const data = splitFrontmatter(raw) as Partial<NowData> & { updatedAt?: unknown };
    const time = data.updatedAt ? new Date(data.updatedAt as string).valueOf() : -Infinity;
    if (time > latestTime) {
      latest = data;
      latestTime = time;
    }
  }

  return latest;
}

// Splits an existing value like "[Death Note](https://...)" back into an
// editable {text, href} pair. Falls back to treating the whole thing as
// plain text if it's not a single clean link segment (e.g. mixed
// plain-text-plus-link items aren't round-tripped perfectly -- rare for
// this kind of short field, and just re-typing it is fine in that case).
export function toEditable(value: string): { text: string; href?: string } {
  const segments = parseInlineLinks(value);
  if (segments.length === 1) {
    return { text: segments[0].text, href: segments[0].href };
  }
  return { text: value };
}

export function composeValue(text: string, href: string | undefined): string {
  return href ? `[${text}](${href})` : text;
}

async function promptItem(existing?: string): Promise<string | null> {
  const seed = existing ? toEditable(existing) : { text: '', href: undefined as string | undefined };

  const text = await input({
    message: existing ? '  (blank to remove)' : '  (blank to stop)',
    default: seed.text,
  });
  if (!text.trim()) return null;

  const wantsLink = await confirm({
    message: '  Add a link?',
    default: !!seed.href,
  });

  let href: string | undefined;
  if (wantsLink) {
    href = await input({
      message: '  URL',
      default: seed.href,
      validate: (value) => URL_PATTERN.test(value) || 'Must start with http:// or https://',
    });
  }

  return composeValue(text.trim(), href);
}

async function promptList(label: string, max: number, existingValues: string[]): Promise<string[]> {
  console.log(`\n── ${label} ── (up to ${max})`);
  const result: string[] = [];

  // Existing items first, so they can be kept as-is (Enter), edited, or
  // dropped (blank) -- rather than always starting from scratch.
  for (const existing of existingValues.slice(0, max)) {
    const value = await promptItem(existing);
    if (value !== null) result.push(value);
  }

  while (result.length < max) {
    const value = await promptItem();
    if (value === null) break;
    result.push(value);
  }

  return result;
}

async function promptOptionalList(
  label: string,
  max: number,
  existingValues: string[] | undefined
): Promise<string[] | undefined> {
  const hasExisting = !!existingValues?.length;
  const include = await confirm({
    message: `\nInclude "${label}"? ${hasExisting ? '(currently in use)' : '(currently unused)'}`,
    default: hasExisting,
  });
  if (!include) return undefined;

  const values = await promptList(label, max, existingValues ?? []);
  return values.length > 0 ? values : undefined;
}

async function main() {
  console.log(
    "Editing your Now page — press Enter to keep a value shown as a default, or leave blank to stop a section early.\n"
  );

  const latest = await loadLatestEntry();
  const dateStr = new Date().toISOString().slice(0, 10);

  const data: NowData = {
    updatedAt: dateStr,
    workingOn: [],
    learning: [],
    reading: [],
    tools: [],
  };

  for (const field of REQUIRED_FIELDS) {
    (data[field.key] as string[]) = await promptList(field.label, field.max, (latest[field.key] as string[]) ?? []);
  }

  for (const field of OPTIONAL_FIELDS) {
    const values = await promptOptionalList(field.label, field.max, latest[field.key] as string[] | undefined);
    if (values) (data[field.key] as string[] | undefined) = values;
  }

  const result = nowSchema.safeParse(data);
  if (!result.success) {
    console.error('\n✗ Validation failed against the now collection schema:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const targetPath = path.join(NOW_DIR, `${dateStr}.md`);

  if (existsSync(targetPath)) {
    const overwrite = await confirm({
      message: `\n${dateStr}.md already exists (you've edited today already) — overwrite it?`,
      default: false,
    });
    if (!overwrite) {
      console.log('Cancelled. Nothing was written.');
      return;
    }
  }

  const frontmatter = stringifyYaml(data, {
    defaultKeyType: 'PLAIN',
    defaultStringType: 'QUOTE_DOUBLE',
    lineWidth: 0,
  });
  await writeFile(targetPath, `---\n${frontmatter}---\n`, 'utf8');

  console.log(`\n✓ Validated against the now collection's schema`);
  console.log(`✓ Written to src/content/now/${dateStr}.md\n`);
  console.log("Done. Review the file and commit/push when you're happy with it — this tool doesn't touch git.");
}

// Guard so this module can be imported (e.g. by a test script) without
// immediately kicking off the interactive prompts.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
