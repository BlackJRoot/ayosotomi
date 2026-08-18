// Endpoint of the ayosotomi-claps Cloudflare Worker (workers/claps/).
// Leave empty until the Worker is deployed -- the SlowClap component
// renders nothing when this is unset, so the site is safe to ship in
// the meantime. After deploying: paste the workers.dev URL here AND add
// it to connect-src in scripts/generate-headers.mjs (CSP), or claps
// will be blocked by our own policy.
export const CLAPS_ENDPOINT =
  'https://ayosotomi-claps.blackjesus-root.workers.dev';
