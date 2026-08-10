import { z } from 'astro/zod';

// Pulled out of content.config.ts for the same reason as now.schema.ts and
// blog.schema.ts: scripts/new-project-cli.ts imports this directly to
// validate against the site's actual rules instead of a hand-copied
// duplicate. Only imports `astro/zod` (a real package subpath) -- NOT
// `astro:content`, which is a Vite-injected virtual module a plain
// Node/tsx script can't resolve.
export const projectsSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.enum(['active', 'completed', 'learning', 'archived']),
  tech: z.array(z.string()),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
  cover: z.string().optional(),
  githubUrl: z.url().optional(),
  demoUrl: z.url().optional(),
});
