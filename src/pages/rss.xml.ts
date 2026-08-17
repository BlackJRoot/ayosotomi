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
  const site = context.site ?? 'https://ayosotomi.pages.dev';

  return rss({
    title: 'Ayomiposi Sotomi',
    description: 'Writer. Builder. Security-minded human.',
    site,
    // No XSL stylesheet on purpose: Chromium removed XSLT support (a
    // styled feed renders as a BLANK page there, verified in a real
    // Chrome 151 against this site). The human-facing explainer lives at
    // /feed instead; this URL is for feed readers.
    // atom:link self-reference (feed validators want it) + channel language.
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      `<atom:link href="${new URL('rss.xml', site).href}" rel="self" type="application/rss+xml"/>`,
      '<language>en</language>',
    ].join(''),
    items: posts
      .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.publishedAt,
        link: `/writing/${post.id}/`,
        // Category + tags as <category> elements so readers that support
        // them can group/filter items.
        categories: [post.data.category, ...post.data.tags],
        // Full body, for feed readers and RSS-to-email automation (e.g.
        // Buttondown) that need actual content, not just the excerpt.
        // Inline images referenced by relative path (co-located next to
        // the post's Markdown, resolved to hashed /_astro/ URLs only by
        // Astro's own page renderer) can't be resolved here, so relative
        // <img> tags are dropped entirely rather than shipped broken --
        // readers show clean text instead of dead image icons. Images
        // with absolute URLs pass through untouched.
        content: sanitizeHtml(parser.render(post.body ?? ''), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          exclusiveFilter: (frame) =>
            frame.tag === 'img' &&
            !/^https?:\/\//.test(String(frame.attribs?.src ?? '')),
        }),
      })),
  });
}
