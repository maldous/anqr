import qrHandler from "../qr";
import * as Sentry from "@sentry/node";
import { computeCacheKey } from "./compute-cache-key";
import { getBlobStore } from "./get-blob-store";
import { SENTINEL_PREFIX } from "./sentinel-prefix.const";

export async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
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
      "https://anqr.link",
      ...(process.env.NETLIFY_DEV ? ["http://localhost:8888"] : []),
    ].filter(Boolean);
    const isAllowed = allowedOrigins.some((origin) => targetUrl.startsWith(origin as string));
    if (!isAllowed) {
      return new Response("Target URL not allowed", { status: 403 });
    }

    const parsed = new URL(targetUrl);
    const cacheKey = computeCacheKey(parsed);
    // Call the qr handler directly — runs within the 15-minute BG budget.
    // Skip the handler's internal blob calls (they hang with the expired
    // deploy JWT); this background function handles caching with explicit
    // credentials instead.
    const renderRequest = new Request(targetUrl, {
      method: "GET",
      headers: { "X-ANQR-Skip-Cache": "1" },
    });
    const response = await qrHandler(renderRequest);

    const responseBody = await response.arrayBuffer();
    // Write to blob cache using explicit credentials (long-lived API token).
    // Guard: skip cache if handler returned a degraded response (overlay fetch
    // failed internally) — caching a degraded image would poison the cache.
    const anqrStatus = response.headers.get("X-ANQR-Status");
    if (response.ok && responseBody.byteLength > 100 && anqrStatus !== "generating") {
      try {
        const ct = response.headers.get("content-type") || "image/png";
        const store = getBlobStore();
        await store.set(cacheKey, new Blob([new Uint8Array(responseBody)]), {
          metadata: { contentType: ct, generatedAt: new Date().toISOString() },
        });
        // Clean up sentinel so poll requests don't think it's still rendering
        await store.delete(SENTINEL_PREFIX + cacheKey).catch(() => {});
      } catch {
        // Cache write failed — intentionally swallowed; degraded image
        // is still returned to the caller.
      }
    }

    return new Response(
      JSON.stringify({
        status: response.ok ? "complete" : "error",
        httpStatus: response.status,
        bodySize: responseBody.byteLength,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    Sentry.captureException(error);
    await Sentry.flush(2000);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ status: "error", message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
