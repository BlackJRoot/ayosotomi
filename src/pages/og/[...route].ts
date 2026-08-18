import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { renderCard, type CardInput } from '../../lib/og-card';

// Build-time generated social-share (OG) images — split-panel design
// (src/lib/og-card.ts). Every page gets a card; posts with a cover in
// src/assets/covers/ get it blurred behind the text (Treatment 1),
// everything else gets the cream panel. BaseLayout points og:image at
// /og/<path>.png for every page.

const posts = await getCollection('blog', ({ data }) => !data.draft);
const projects = await getCollection('projects');

const COVERS_DIR = join(process.cwd(), 'src/assets/covers');
const coverFiles = await readdir(COVERS_DIR).catch(() => [] as string[]);
function coverFor(postId: string): string | undefined {
  const slug = postId.split('/').pop();
  const match = coverFiles.find(
    (f) => f.replace(/\.[^.]+$/, '') === slug
  );
  return match ? join(COVERS_DIR, match) : undefined;
}

const pages: Record<string, CardInput> = {
  'index': {
    title: 'Ayomiposi Sotomi',
    description: 'Writer. Builder. Security-minded human.',
    label: 'ayosotomi.com',
  },
  'writing': {
    title: 'Writing',
    description: 'Essays, tutorials, and project logs by Ayomiposi Sotomi.',
    label: 'writing',
  },
  'projects': {
    title: 'Projects',
    description: 'Homelab, Docker, and cybersecurity project write-ups.',
    label: 'projects',
  },
  'now': {
    title: 'Now',
    description: "What Ayomiposi is working on, learning, and reading right now.",
    label: 'now',
  },
  'about': {
    title: 'About',
    description: 'Who Ayomiposi Sotomi is and what this site is for.',
    label: 'about',
  },
  'privacy': {
    title: 'Privacy',
    description: 'What this site collects (almost nothing) and why.',
    label: 'privacy',
  },
  'playground': {
    title: 'Playground',
    description: 'Services self-hosted from the homelab.',
    label: 'the lab',
  },
  'feed': {
    title: 'Subscribe by feed',
    description: 'Full posts over RSS — no algorithm, no email, no tracking.',
    label: 'rss',
  },
  '404': {
    title: "There's nothing planted here.",
    description: 'Page not found — Ayomiposi Sotomi.',
    label: '404',
  },
};

for (const post of posts) {
  pages[`writing/${post.id}`] = {
    title: post.data.title,
    description: post.data.description,
    label: post.data.category.replace('-', ' '),
    coverPath: coverFor(post.id),
  };
}
for (const project of projects) {
  pages[`projects/${project.id}`] = {
    title: project.data.title,
    description: project.data.description,
    label: 'project',
  };
}

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(pages).map((route) => ({
    params: { route: `${route}.png` },
  }));

export const GET: APIRoute = async ({ params }) => {
  const route = (params.route ?? '').replace(/\.png$/, '');
  const input = pages[route];
  if (!input) return new Response('not found', { status: 404 });
  const png = await renderCard(input);
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
