import { renderConfiguredServerQROutput } from "@/application/generator/server";
import { nodeCanvasFactory } from "@/platform/node/server";
import { computeCacheKey, lookupBlobCache } from "@/platform/node/server/netlify-qr";
import { qrFnLog } from "@/platform/node";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { handleCacheAndResponse } from "./handle-cache-and-response";

export async function processQRRequest(
  p: ParsedHandlerParams,
  params: URLSearchParams,
  requestUrl: string,
): Promise<Response> {
  const cacheKey = computeCacheKey(params);
  qrFnLog("[BLOB] cache lookup", { cacheKey: cacheKey.slice(0, 80), skipCache: p.skipCache });
  const cachedResponse = await lookupBlobCache(cacheKey, p.skipCache);
  if (cachedResponse) return cachedResponse;

  const { outputBuffer, contentType } = await renderConfiguredServerQROutput(p, nodeCanvasFactory);

  return handleCacheAndResponse(p, outputBuffer, contentType, cacheKey, requestUrl);
}
