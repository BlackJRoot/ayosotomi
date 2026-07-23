const WORDS_PER_MINUTE = 200;

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

if (import.meta.env.DEV) {
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
}
