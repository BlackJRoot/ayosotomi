const WORDS_PER_MINUTE = 200;

// Number of hues defined in global.css as --tag-c0-bg/text through
// --tag-c5-bg/text (and the matching .tag-c0..c5 classes). Keep these
// two in sync -- if you add a hue there, bump this.
const TAG_COLOR_COUNT = 6;

// Deterministically maps a tag/tech string to one of the palette hues
// in global.css, so the same tag always gets the same color everywhere
// it appears (a project's ProjectCard pill and its detail-page pill,
// for instance) without hand-maintaining a tag->color lookup table.
// Different tags CAN land on the same color (6 buckets, unbounded tag
// vocabulary) -- that's an accepted trade-off for "no maintenance"
// over "guaranteed uniqueness."
export function tagColorClass(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % TAG_COLOR_COUNT;
  return `tag-c${index}`;
}

export interface TextSegment {
  text: string;
  href?: string;
}

// Only http(s) links -- deliberately no javascript:/data: etc, since this
// parses plain-text content-collection strings (e.g. the Now page's
// watching/reading items) that aren't otherwise sanitized as HTML.
const INLINE_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

// Parses `[text](https://...)` Markdown-link syntax out of an otherwise
// plain string into renderable segments, for fields that are typed as
// plain strings (not run through a Markdown renderer) but where someone
// still writes a link the way they would in a post body.
export function parseInlineLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_LINK_PATTERN)) {
    const [full, linkText, href] = match;
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start) });
    }
    segments.push({ text: linkText, href });
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text }];
}

export function calculateReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// import.meta.env is Vite-injected -- guard with ?. so this file can also
// be imported by plain Node scripts outside Astro's pipeline (e.g.
// scripts/now-cli.ts), where import.meta.env doesn't exist at all.
if (import.meta.env?.DEV) {
  console.assert(
    calculateReadingTime('') === 1,
    'calculateReadingTime: empty content should still round up to 1 min'
  );
  console.assert(
    calculateReadingTime('word '.repeat(400)) === 2,
    'calculateReadingTime: 400 words at 200wpm should be 2 min'
  );
  console.assert(
    formatDate(new Date('2026-07-23')) === 'July 23, 2026',
    'formatDate: should render as "Month D, YYYY" in UTC, regardless of build-server timezone'
  );
  console.assert(
    parseInlineLinks('plain text, no links').length === 1 &&
      parseInlineLinks('plain text, no links')[0].href === undefined,
    'parseInlineLinks: plain text should come back as a single segment with no href'
  );
  console.assert(
    (() => {
      const segs = parseInlineLinks('[Death Note](https://example.com/dn)');
      return segs.length === 1 && segs[0].text === 'Death Note' && segs[0].href === 'https://example.com/dn';
    })(),
    'parseInlineLinks: a string that is entirely one link should produce one segment with both text and href'
  );
  console.assert(
    (() => {
      const segs = parseInlineLinks('see [this](https://example.com) for more');
      return (
        segs.length === 3 &&
        segs[0].text === 'see ' &&
        segs[1].href === 'https://example.com' &&
        segs[2].text === ' for more'
      );
    })(),
    'parseInlineLinks: a link surrounded by plain text should split into three segments'
  );
  console.assert(
    tagColorClass('Docker') === tagColorClass('Docker'),
    'tagColorClass: the same tag must always get the same color'
  );
  console.assert(
    /^tag-c[0-5]$/.test(tagColorClass('Docker')),
    'tagColorClass: must return one of the 6 defined classes (tag-c0..tag-c5)'
  );
}
