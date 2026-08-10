// Shared by now-cli.ts, new-post-cli.ts, new-project-cli.ts, and the
// edit-*-cli.ts tools -- pulled out rather than duplicated after
// multiple tools needed the exact same "read a content file's
// frontmatter as a plain object" logic.
import { parse as parseYaml } from 'yaml';

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n?/;

export function splitFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) return {};
  return (parseYaml(match[1]) as Record<string, unknown>) ?? {};
}

// Like splitFrontmatter, but also returns everything after the closing
// `---` untouched. The edit-*-cli.ts tools need this: they must never
// regenerate or alter a post's body, only its frontmatter, so the body
// has to be read out and carried through exactly as-is, not
// reconstructed from a parsed representation of it.
export interface FrontmatterAndBody {
  data: Record<string, unknown>;
  body: string;
}

export function splitFrontmatterAndBody(raw: string): FrontmatterAndBody {
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) return { data: {}, body: raw };
  const data = (parseYaml(match[1]) as Record<string, unknown>) ?? {};
  const body = raw.slice(match[0].length);
  return { data, body };
}
