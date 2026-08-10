import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { nowSchema } from './content/now.schema';
import { blogSchema } from './content/blog.schema';
import { projectsSchema } from './content/projects.schema';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: blogSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectsSchema,
});

const now = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/now' }),
  schema: nowSchema,
});

export const collections = { blog, projects, now };
