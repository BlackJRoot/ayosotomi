import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

// Build-time generated social-share (OG) images for every page that
// doesn't already have a real cover image. BaseLayout falls back to
// /og/<path>.png when no `image` prop is passed, so posts with covers
// keep their cover and everything else gets a branded card. Colors are
// the Dawn Light light-theme tokens from src/styles/global.css.

const posts = await getCollection('blog', ({ data }) => !data.draft);
const projects = await getCollection('projects');

type PageMeta = { title: string; description: string };

const pages: Record<string, PageMeta> = {
  index: {
    title: 'Ayomiposi Sotomi',
    description: 'Writer. Builder. Security-minded human.',
  },
  writing: {
    title: 'Writing',
    description: 'Essays, tutorials, and project logs by Ayomiposi Sotomi.',
  },
  projects: {
    title: 'Projects',
    description: 'Homelab, Docker, and cybersecurity project write-ups.',
  },
  now: {
    title: 'Now',
    description: "What Ayomiposi is working on, learning, and reading right now.",
  },
  about: {
    title: 'About',
    description: 'Who Ayomiposi Sotomi is and what this site is for.',
  },
  privacy: {
    title: 'Privacy',
    description: 'What this site collects (almost nothing) and why.',
  },
  playground: {
    title: 'Playground',
    description: 'Services self-hosted from the homelab.',
  },
  feed: {
    title: 'Subscribe by feed',
    description: 'Full posts over RSS — no algorithm, no email, no tracking.',
  },
  '404': {
    title: "There's nothing planted here.",
    description: 'Page not found — Ayomiposi Sotomi.',
  },
};

for (const post of posts) {
  pages[`writing/${post.id}`] = {
    title: post.data.title,
    description: post.data.description,
  };
}
for (const project of projects) {
  pages[`projects/${project.id}`] = {
    title: project.data.title,
    description: project.data.description,
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page: PageMeta) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[250, 246, 241]], // --color-bg #FAF6F1
    border: {
      color: [196, 149, 106], // --color-accent #C4956A
      width: 16,
      side: 'inline-start',
    },
    padding: 72,
    font: {
      title: {
        families: ['Newsreader'],
        color: [61, 54, 50], // --color-text #3D3632
        size: 64,
        weight: 'Medium',
        lineHeight: 1.15,
      },
      description: {
        families: ['Inter'],
        color: [154, 145, 138], // --color-text-secondary #9A918A
        size: 30,
        lineHeight: 1.4,
      },
    },
    fonts: [
      './node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff',
      './node_modules/@fontsource/inter/files/inter-latin-400-normal.woff',
    ],
  }),
});
