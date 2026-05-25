import { renderConfiguredServerQROutput } from "@/application/generator/server";
import { nodeCanvasFactory } from "@/platform/node/server";
import {
  computeCacheKey,
  lookupBlobCache,
  triggerBackgroundRender,
} from "@/platform/node/server/netlify-qr";
import { qrFnLog } from "@/platform/node";
import { CORS_HEADERS } from "./cors-headers.const";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { handleCacheAndResponse } from "./handle-cache-and-response";
import { PLACEHOLDER_CONTENT_TYPE, PLACEHOLDER_PNG } from "./placeholder-png.const";

export async function processQRRequest(
  p: ParsedHandlerParams,
  params: URLSearchParams,
  requestUrl: string,
  serializeAnimatedRender: boolean,
): Promise<Response> {
  const cacheKey = computeCacheKey(params);
  qrFnLog("[BLOB] cache lookup", { cacheKey: cacheKey.slice(0, 80), skipCache: p.skipCache });
  const cachedResponse = await lookupBlobCache(cacheKey, p.skipCache);
  if (cachedResponse) return cachedResponse;

  // C-F5: animated/GIF renders on the foreground function regularly time
  // out under Netlify's 10s budget. When this is a foreground request
  // (i.e. NOT the background function calling us with _fullRender=1) and
  // the params would force a slow animated render, skip the render and
  // return a 72-byte placeholder PNG immediately. The background function
  // takes over the real render and serves it from blob cache on the next
  // fetch. Eliminates the 504 class for animated QR endpoints.
  if (serializeAnimatedRender && !p.isFullRender && !p.skipCache) {
    qrFnLog("[BG:SHORTCIRCUIT] animated render queued, returning placeholder", {
      cacheKey: cacheKey.slice(0, 80),
    });
    await triggerBackgroundRender(cacheKey, requestUrl);
    return new Response(new Uint8Array(PLACEHOLDER_PNG), {
      status: 202,
      headers: {
        "Content-Type": PLACEHOLDER_CONTENT_TYPE,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-ANQR-Status": "generating",
        ...CORS_HEADERS,
      },
    });
  }

  const { outputBuffer, contentType } = await renderConfiguredServerQROutput(
    p,
    nodeCanvasFactory as unknown as Parameters<typeof renderConfiguredServerQROutput>[1],
  );

  return handleCacheAndResponse(p, outputBuffer, contentType, cacheKey, requestUrl);
}
