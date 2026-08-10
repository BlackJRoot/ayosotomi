import { z } from 'astro/zod';

// Pulled out of content.config.ts so the now-cli tool (scripts/now-cli.ts)
// can import the exact same validation rules instead of re-implementing
// them by hand and risking drift. Only imports `astro/zod` (a real
// package subpath, just zod re-exported) -- NOT `astro:content`, which is
// a Vite-injected virtual module and can't be imported from a plain Node
// script outside Astro's own pipeline. Keep it that way, or the CLI
// import breaks.
export const nowSchema = z.object({
  updatedAt: z.coerce.date(),
  workingOn: z.array(z.string()).max(5),
  learning: z.array(z.string()).max(5),
  reading: z.array(z.string()).max(5),
  tools: z.array(z.string()).max(5),
  // Optional, lighter "outside of work" fields -- kept separate from and
  // fully backward-compatible with the four required fields above.
  // Rendered together in one condensed section, not full standalone blocks.
  watching: z.array(z.string()).max(3).optional(),
  doing: z.array(z.string()).max(3).optional(),
});
