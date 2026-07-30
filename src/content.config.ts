import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
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
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['active', 'completed', 'learning', 'archived']),
    tech: z.array(z.string()),
    startedAt: z.coerce.date(),
    completedAt: z.coerce.date().optional(),
    cover: z.string().optional(),
    githubUrl: z.url().optional(),
    demoUrl: z.url().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/now' }),
  schema: z.object({
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
  }),
});

export const collections = { blog, projects, now };
