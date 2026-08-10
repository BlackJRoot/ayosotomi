// Shared by now-cli.ts and new-post-cli.ts -- pulled out rather than
// duplicated after new-post-cli.ts needed the exact same "read a content
// file's frontmatter as a plain object" logic now-cli.ts already had.
import { parse as parseYaml } from 'yaml';

export function splitFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return (parseYaml(match[1]) as Record<string, unknown>) ?? {};
}
