// Runs after `astro build` (see the `postbuild` script in package.json).
//
// Cloudflare Pages reads security headers from dist/_headers. The CSP's
// script-src needs a 'sha256-<hash>' entry for every inline <script> the
// build emits (Astro inlines small hoisted scripts like the dark-mode
// bootstrap and the Writing-page category filter directly into the HTML
// rather than as external files) -- hardcoding those hashes would go stale
// the moment one of those scripts changes. Instead this scans the actual
// build output on every build and computes them fresh, so the header always
// matches what's really being served.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

function findHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...findHtmlFiles(full));
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

const scriptHashes = new Set();
const inlineScriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

for (const file of findHtmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(inlineScriptRe)) {
    // CSP hashes the exact text-node content between the tags -- do not
    // trim, or the computed hash won't match what the browser checks.
    const body = match[1];
    if (!body.trim()) continue;
    const hash = createHash('sha256').update(body).digest('base64');
    scriptHashes.add(`'sha256-${hash}'`);
  }
}

const scriptSrc = ["'self'", ...scriptHashes].join(' ');

const csp = [
  "default-src 'self'",
  // static.cloudflareinsights.com: Cloudflare Web Analytics beacon,
  // auto-injected by Pages (enabled 2026-08-17; disclosed on /privacy).
  `script-src ${scriptSrc} https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  // data: -- Vite inlines font-subset files under 4KB into the CSS as
  // data URIs; blocking them broke real fonts (Lighthouse 2026-08-17).
  "font-src 'self' data:",
  // cloudflareinsights.com receives the analytics beacon's POSTs.
  "connect-src 'self' https://cloudflareinsights.com",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

// Cache-Control: without an explicit policy, Cloudflare's edge cached
// HTML with s-maxage=604800 (7 days) -- a deleted post's URL kept
// serving stale content for up to a week after the deploy that removed
// it (found 2026-08-17 via the Pages CMS hello-world test). But pure
// must-revalidate disabled edge caching entirely, costing ~1.7s TTFB
// (Lighthouse, same day). Balance: s-maxage=300 lets the edge serve
// HTML for up to 5 minutes (deletions/edits stale for at most that),
// while browsers still revalidate every request -- max-age=0 alone
// forces that (must-revalidate dropped as redundant). Caveat, measured
// live 2026-08-17: pages.dev does NOT edge-cache any response whose
// Cache-Control is overridden via _headers (no cf-cache-status on HTML
// or even immutable assets), so s-maxage currently only advises other
// shared caches; requests are origin-served. Absolute TTFB fears that
// prompted this were network-local (cloudflare.com itself measured
// 1.6s from the same connection). Do not revert to Pages' default
// caching without remembering why it left: 7-day stale deleted pages.
// /_astro/* assets are
// content-hashed, so a changed file gets a new URL and the old one can
// cache forever.
const headers = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Cache-Control: public, max-age=0, s-maxage=300
  Content-Security-Policy: ${csp}

/_astro/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
`;

writeFileSync(join(DIST, '_headers'), headers);
console.log(`[generate-headers] wrote dist/_headers with ${scriptHashes.size} script hash(es)`);
