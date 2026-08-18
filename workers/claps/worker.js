// Slow-clap counter for ayosotomi.com — the site's first (and deliberately
// minimal) server-side component. A single Cloudflare Worker + one KV
// namespace, storing nothing but per-post integers and short-lived
// rate-limit markers. No PII: IPs are hashed with a per-deployment salt
// before use and expire within a day.
//
//   GET  /claps?slug=<slug>          -> { count }
//   POST /claps?slug=<slug>          -> { count } (after increment)
//
// One clap per visitor per post (best effort): enforced by an IP-hash
// marker in KV (24h TTL) plus localStorage on the client. Good enough
// for a personal blog; not a fortress, on purpose.

const ALLOWED_ORIGINS = [
  'https://ayosotomi.pages.dev',
  'http://localhost:4321',
];

const SLUG_RE = /^[a-z0-9][a-z0-9/_-]{0,79}$/;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
}

async function ipHash(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/claps') {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        headers,
      });
    }

    const slug = url.searchParams.get('slug') ?? '';
    if (!SLUG_RE.test(slug)) {
      return new Response(JSON.stringify({ error: 'bad slug' }), {
        status: 400,
        headers,
      });
    }

    const countKey = `count:${slug}`;

    if (request.method === 'GET') {
      const count = parseInt((await env.CLAPS.get(countKey)) ?? '0', 10);
      return new Response(JSON.stringify({ count }), { status: 200, headers });
    }

    if (request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const visitor = await ipHash(ip, env.IP_SALT ?? 'ayosotomi');
      const markerKey = `seen:${slug}:${visitor}`;

      const alreadyClapped = await env.CLAPS.get(markerKey);
      const current = parseInt((await env.CLAPS.get(countKey)) ?? '0', 10);

      if (alreadyClapped) {
        // Idempotent: repeat claps don't error, they just don't count.
        return new Response(JSON.stringify({ count: current, repeat: true }), {
          status: 200,
          headers,
        });
      }

      const count = current + 1;
      await env.CLAPS.put(countKey, String(count));
      await env.CLAPS.put(markerKey, '1', { expirationTtl: 86400 });

      return new Response(JSON.stringify({ count }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers,
    });
  },
};
