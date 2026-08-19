// Newsletter subscribe proxy for ayosotomi.com. Reader submits their email
// from the site's own form; this Worker verifies they're human (Turnstile),
// then creates the subscriber in Buttondown via its authenticated API.
// This sidesteps Buttondown's public embed-subscribe endpoint, which can't
// be called with fetch() and always navigates the reader away to complete
// its own CAPTCHA. Buttondown still owns the subscriber list, double
// opt-in email, and sending -- we're only replacing the sign-up UX.
//
//   POST /subscribe   { email, turnstileToken } -> { success, message }

const ALLOWED_ORIGINS = [
  'https://ayosotomi.pages.dev',
  'http://localhost:4321',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
}

async function verifyTurnstile(token, ip, secret) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  body.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await res.json();
  return data.success === true;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/subscribe' || request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        headers,
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'bad request body' }), {
        status: 400,
        headers,
      });
    }

    const email = (payload.email ?? '').trim().toLowerCase();
    const turnstileToken = payload.turnstileToken ?? '';

    if (!EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'That email address doesn\'t look right.' }),
        { status: 400, headers },
      );
    }

    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Verification missing. Please try again.' }),
        { status: 400, headers },
      );
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? '';
    const human = await verifyTurnstile(turnstileToken, ip, env.TURNSTILE_SECRET_KEY);
    if (!human) {
      return new Response(
        JSON.stringify({ success: false, error: 'Verification failed. Please try again.' }),
        { status: 400, headers },
      );
    }

    const bdRes = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email }),
    });

    if (bdRes.status === 201) {
      return new Response(
        JSON.stringify({ success: true, message: 'Almost done -- check your inbox to confirm.' }),
        { status: 200, headers },
      );
    }

    // Buttondown returns 400 for things like malformed addresses or a
    // newsletter-level block; surface a generic message rather than
    // leaking their response shape.
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong. Please try again shortly.' }),
      { status: 502, headers },
    );
  },
};