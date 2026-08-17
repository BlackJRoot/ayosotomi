// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ayosotomi.pages.dev',
  integrations: [
    sitemap({
      // /playground is unlisted until the lab has public services:
      // no nav link, noindex meta, and excluded from the sitemap here.
      filter: (page) => !page.includes('/playground') && !page.includes('/og/'),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});