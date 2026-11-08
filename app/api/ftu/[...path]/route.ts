import type { NextRequest } from 'next/server'

/**
 * Server-side proxy for the Free To Use API (https://api.freetouse.com/v3).
 *
 * The upstream API only sends `Access-Control-Allow-Origin` for its own
 * origin (verified: localhost gets no CORS header), so the browser cannot
 * call it directly. Server-side fetch has no CORS restrictions — this
 * handler forwards the request and relays status + JSON body untouched,
 * including the documented `{ ok: false, error }` error shape.
 */

const UPSTREAM = 'https://api.freetouse.com/v3'

/** Only allow path segments that match the spec's endpoint shape. */
const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/

/** Max retries for rate limiting / transient failures — never a tight loop. */
const MAX_RETRIES = 2

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Exponential backoff, capped, honoring Retry-After when present. */
function backoffDelay(attempt: number, retryAfter: string | null): number {
  const retryAfterMs = retryAfter ? Number.parseFloat(retryAfter) * 1000 : NaN
  if (Number.isFinite(retryAfterMs) && retryAfterMs >= 0) {
    return Math.min(retryAfterMs, 5_000)
  }
  return Math.min(400 * 2 ** attempt, 4_000)
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params

  if (!path || path.length === 0 || !path.every((seg) => SAFE_SEGMENT.test(seg))) {
    return Response.json({ ok: false, error: 'Invalid request path.' }, { status: 400 })
  }

  const search = request.nextUrl.search
  const target = `${UPSTREAM}/${path.join('/')}${search}`

  let lastStatus = 502
  let lastBody: unknown = { ok: false, error: 'Free To Use API is unreachable.' }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const upstream = await fetch(target, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })

      // Documented codes: 400 / 500 return `{ ok: false, error }`.
      // 429 (rate limit): back off and retry, honoring Retry-After.
      // 5xx: transient — retry with exponential backoff.
      const retryable = upstream.status === 429 || upstream.status >= 500
      if (retryable && attempt < MAX_RETRIES) {
        lastStatus = upstream.status
        lastBody = await upstream.json().catch(() => ({ ok: false, error: `HTTP ${upstream.status}` }))
        await sleep(backoffDelay(attempt, upstream.headers.get('retry-after')))
        continue
      }

      const body = await upstream.arrayBuffer()
      return new Response(body, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8' },
      })
    } catch (err) {
      lastStatus = 502
      lastBody = {
        ok: false,
        error: err instanceof Error ? err.message : 'Free To Use API is unreachable.',
      }
      if (attempt < MAX_RETRIES) await sleep(backoffDelay(attempt, null))
    }
  }

  return Response.json(lastBody, { status: lastStatus })
}
