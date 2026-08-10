// Standing content lint pass across all three collections. Run via
// `npm run validate-content`. Non-interactive by design -- unlike the
// other tools in this folder, this isn't a prompt flow, it's a check
// you run any time (or could wire into a pre-commit hook later).
//
// Catches two different classes of problem:
//   1. Real schema violations (wrong type, missing field, bad enum
//      value, URL that doesn't parse, SEO length overage) -- the same
//      checks `npx astro check` runs, just reported per-file here.
//   2. Two specific heuristic checks that mirror actual mistakes found
//      by hand in this project's own history (see MEMORY.md,
//      2026-08-10): array items with multiple things crammed into one
//      comma-separated string instead of separate entries, and
//      unedited `[bracketed placeholder]` template text left in a
//      field. Both are schema-valid (a string is a string), which is
//      exactly why `astro check` can't catch them -- this can.
//
// This is a dev-only tool. It never runs as part of `npm run build` and
// nothing it imports ships in the built site.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'astro/zod';
import { blogSchema } from '../src/content/blog.schema';
import { projectsSchema } from '../src/content/projects.schema';
import { nowSchema } from '../src/content/now.schema';
import { splitFrontmatterAndBody } from './lib/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');

interface Issue {
  file: string;
  level: 'error' | 'warning';
  message: string;
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(full)));
    } else if (entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

// A single array item with 3+ comma-separated segments is a strong
// signal that multiple distinct things got crammed into one entry
// instead of being split into separate array items -- exactly what
// happened with the Now page's `learning`/`tools` fields (see
// MEMORY.md). One comma is common in ordinary short phrases and isn't
// flagged; two or more is the actual smell.
function hasCrammedCommas(value: string): boolean {
  return (value.match(/,/g) ?? []).length >= 2;
}

// Fully bracket-wrapped text ("[a book, article series, or delete this
// line]") is the Now/blog template convention for "not filled in yet."
// Deliberately checks the WHOLE trimmed string, not just a leading `[`
// -- "[Template] Home Network Monitor" (the projects convention for a
// no-draft-field placeholder) has real text after the bracket and is
// not flagged; only a field that's nothing BUT bracket text is.
function isUnfilledPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith('[') && trimmed.endsWith(']');
}

function checkArrayField(file: string, fieldName: string, values: unknown, issues: Issue[]): void {
  if (!Array.isArray(values)) return;
  for (const value of values) {
    if (typeof value !== 'string') continue;
    if (hasCrammedCommas(value)) {
      issues.push({
        file,
        level: 'warning',
        message: `${fieldName}: "${value}" looks like multiple items crammed into one comma-separated string (2+ commas) -- should probably be separate array entries`,
      });
    }
    if (isUnfilledPlaceholder(value)) {
      issues.push({
        file,
        level: 'warning',
        message: `${fieldName}: "${value}" looks like unedited template placeholder text`,
      });
    }
  }
}

async function validateFile(filePath: string, schema: ZodType, arrayFieldsToCheck: string[]): Promise<Issue[]> {
  const issues: Issue[] = [];
  const relPath = path.relative(path.join(__dirname, '..'), filePath);
  const raw = await readFile(filePath, 'utf8');
  const { data } = splitFrontmatterAndBody(raw);

  const result = schema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      issues.push({ file: relPath, level: 'error', message: `${issue.path.join('.')}: ${issue.message}` });
    }
    // Don't run heuristic checks against data that didn't even pass
    // schema validation -- fix the real error first.
    return issues;
  }

  for (const field of arrayFieldsToCheck) {
    checkArrayField(relPath, field, data[field], issues);
  }

  return issues;
}

export async function main(): Promise<{ issues: Issue[]; filesChecked: number }> {
  const allIssues: Issue[] = [];
  let filesChecked = 0;

  const blogFiles = await walkMarkdownFiles(path.join(CONTENT_DIR, 'blog'));
  for (const file of blogFiles) {
    filesChecked++;
    allIssues.push(...(await validateFile(file, blogSchema, ['tags'])));
  }

  const projectFiles = await walkMarkdownFiles(path.join(CONTENT_DIR, 'projects'));
  for (const file of projectFiles) {
    filesChecked++;
    allIssues.push(...(await validateFile(file, projectsSchema, ['tech'])));
  }

  const nowFiles = await walkMarkdownFiles(path.join(CONTENT_DIR, 'now'));
  for (const file of nowFiles) {
    filesChecked++;
    allIssues.push(...(await validateFile(file, nowSchema, ['workingOn', 'learning', 'reading', 'tools', 'watching', 'doing'])));
  }

  return { issues: allIssues, filesChecked };
}

async function run() {
  const { issues, filesChecked } = await main();

  if (issues.length === 0) {
    console.log(`✓ Checked ${filesChecked} content file(s) across blog/projects/now -- no issues found.`);
    return;
  }

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');

  const byFile = new Map<string, Issue[]>();
  for (const issue of issues) {
    if (!byFile.has(issue.file)) byFile.set(issue.file, []);
    byFile.get(issue.file)!.push(issue);
  }

  for (const [file, fileIssues] of byFile) {
    console.log(`\n${file}`);
    for (const issue of fileIssues) {
      console.log(`  ${issue.level === 'error' ? '✗' : '⚠'} ${issue.message}`);
    }
  }

  console.log(`\nChecked ${filesChecked} file(s): ${errors.length} error(s), ${warnings.length} warning(s).`);
  if (errors.length > 0) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
