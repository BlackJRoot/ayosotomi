import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

// html:true so real HTML in a post's Markdown (e.g. an editorial
// <!-- comment --> like the migration notes on the Substack-migrated
// essays) is parsed as actual HTML, not escaped into visible text --
// sanitize-html below then strips comments and any disallowed tags.
const parser = new MarkdownIt({ html: true });

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: 'Ayomiposi Sotomi',
    description: 'Writer. Builder. Security-minded human.',
    site: context.site ?? 'https://ayosotomi.pages.dev',
    items: posts
      .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.publishedAt,
        link: `/writing/${post.id}/`,
        // Full body, for feed readers and RSS-to-email automation (e.g.
        // Buttondown) that need actual content, not just the excerpt.
        // Caveat: cover images co-located next to a post's Markdown file
        // (src/content/blog/**/*.jpeg etc.) are referenced by relative
        // path in the source -- Astro's own page renderer resolves and
        // optimizes those into hashed /_astro/ URLs, but this raw
        // markdown-it render has no access to that pipeline, so any
        // inline images in a post body will come through as broken
        // relative <img> tags here. Text, headings, links, and code
        // blocks all render correctly; only inline images are affected.
        content: sanitizeHtml(parser.render(post.body ?? ''), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        }),
      })),
  });
}
