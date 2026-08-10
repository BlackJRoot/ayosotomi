import { z } from 'astro/zod';

// Pulled out of content.config.ts for the same reason as now.schema.ts:
// scripts/new-post-cli.ts imports this directly to validate against the
// site's actual rules instead of a hand-copied duplicate. Only imports
// `astro/zod` (a real package subpath) -- NOT `astro:content`, which is a
// Vite-injected virtual module a plain Node/tsx script can't resolve.
export const blogSchema = z.object({
  title: z.string().max(80, 'Title too long for SEO'),
  description: z.string().max(160, 'Description too long for SEO'),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  category: z.enum(['essay', 'tutorial', 'project-log', 'now-update']),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: z
    .object({
      src: z.string(),
      alt: z.string(),
    })
    .optional(),
});
