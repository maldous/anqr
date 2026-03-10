/**
 * Netlify Background Function: QR Code Background Renderer
 *
 * Calls the main qr handler **in-process** to perform full overlay rendering
 * within the background function's 15-minute execution budget.
 *
 * Blob writes use **explicit credentials** (SITE_ID + NETLIFY_API_TOKEN)
 * because the automatic deploy-scoped JWT (`NETLIFY_BLOBS_CONTEXT`) expires
 * before/during background function execution. A long-lived personal access
 * token avoids this entirely.
 *
 * Background function (via `-background` filename suffix): Netlify returns
 * 202 Accepted immediately to callers; the handler's Response is discarded.
 * Gets up to 15 minutes of execution time.
 */

import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import * as Sentry from '@sentry/node';
// @ts-expect-error - JSON import resolved by esbuild at bundle time
import pkg from '../../package.json';
import qrHandler from './qr';

Sentry.init({
  dsn: 'https://6935e811c47169e037e31209f2d46fbd@o4510808522489856.ingest.us.sentry.io/4510808547917824',
  release: `anqr@${pkg.version}`,
  tracesSampleRate: 0.1,
  environment: 'production',
});

const QR_CACHE_STORE = 'qr-cache';
const NON_CACHE_PARAMS = new Set(['_cb', 'lang', '_fullRender']);
const SENTINEL_PREFIX = 'rendering:';

/** Compute cache key identically to qr.ts computeCacheKey */
function computeCacheKey(url: URL): string {
  const entries = [...url.searchParams.entries()]
    .filter(([k]) => !NON_CACHE_PARAMS.has(k))
    .sort(([a], [b]) => a.localeCompare(b));
  return createHash('md5').update(new URLSearchParams(entries).toString()).digest('hex');
}

/**
 * Returns a blob store using explicit credentials (long-lived API token)
 * to avoid the expired deploy-scoped JWT in background functions.
 * Falls back to auto-context for local dev.
 */
function getBlobStore() {
  const siteID = process.env.SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN;
  if (siteID && token) {
    return getStore({ name: QR_CACHE_STORE, siteID, token });
  }
  // Local dev / NETLIFY_DEV — auto-context works fine
  return getStore(QR_CACHE_STORE);
}

async function handler(request: Request) {
  const t0 = Date.now();
  console.log('[BG] handler started', { timestamp: new Date().toISOString() });

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = (await request.json()) as { url?: string };
    const targetUrl = body?.url;

    if (!targetUrl) {
      return new Response('Missing "url" in request body', { status: 400 });
    }

    // SSRF protection: only allow rendering our own QR function URLs
    const allowedOrigins = [
      process.env.URL,
      process.env.DEPLOY_PRIME_URL,
      'https://anqr.link',
      ...(process.env.NETLIFY_DEV ? ['http://localhost:8888'] : []),
    ].filter(Boolean);
    const isAllowed = allowedOrigins.some((origin) => targetUrl.startsWith(origin as string));
    if (!isAllowed) {
      return new Response('Target URL not allowed', { status: 403 });
    }

    const parsed = new URL(targetUrl);
    const cacheKey = computeCacheKey(parsed);
    console.log('[BG] rendering in-process', {
      url: targetUrl.slice(0, 150),
      cacheKey,
      elapsedMs: Date.now() - t0,
    });

    // Call the qr handler directly — runs within the 15-minute BG budget.
    // Skip the handler's internal blob calls (they hang with the expired
    // deploy JWT); this background function handles caching with explicit
    // credentials instead.
    const tRender = Date.now();
    const renderRequest = new Request(targetUrl, {
      method: 'GET',
      headers: { 'X-ANQR-Skip-Cache': '1' },
    });
    const response = await qrHandler(renderRequest);

    console.log('[BG] handler returned', {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      anqrStatus: response.headers.get('X-ANQR-Status'),
      anqrCache: response.headers.get('X-ANQR-Cache'),
      renderMs: Date.now() - tRender,
      totalMs: Date.now() - t0,
    });

    const responseBody = await response.arrayBuffer();
    console.log('[BG] body size:', responseBody.byteLength);

    // Write to blob cache using explicit credentials (long-lived API token).
    // Guard: skip cache if handler returned a degraded response (overlay fetch
    // failed internally) — caching a degraded image would poison the cache.
    const anqrStatus = response.headers.get('X-ANQR-Status');
    if (response.ok && responseBody.byteLength > 100 && anqrStatus !== 'generating') {
      try {
        const ct = response.headers.get('content-type') || 'image/png';
        const store = getBlobStore();
        await store.set(cacheKey, new Blob([new Uint8Array(responseBody)]), {
          metadata: { contentType: ct, generatedAt: new Date().toISOString() },
        });
        // Clean up sentinel so poll requests don't think it's still rendering
        await store.delete(SENTINEL_PREFIX + cacheKey).catch(() => {});
        console.log('[BG] cache write OK', {
          cacheKey,
          size: responseBody.byteLength,
          totalMs: Date.now() - t0,
        });
      } catch (error_) {
        console.error('[BG] cache write FAILED:', error_);
      }
    } else {
      console.warn('[BG] skipping cache write', {
        ok: response.ok,
        bodySize: responseBody.byteLength,
        anqrStatus,
        totalMs: Date.now() - t0,
      });
    }

    return new Response(
      JSON.stringify({
        status: response.ok ? 'complete' : 'error',
        httpStatus: response.status,
        bodySize: responseBody.byteLength,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    await Sentry.flush(2000);
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[BG] handler error:', message, { totalMs: Date.now() - t0 });
    return new Response(JSON.stringify({ status: 'error', message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default handler;
