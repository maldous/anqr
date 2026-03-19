import { triggerBackgroundRender, writeBlobCache } from "@/platform/node/server/netlify-qr";
import { qrFnLog } from "@/platform/node";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { buildFinalResponse } from "./build-final-response";

export async function handleCacheAndResponse(
  p: ParsedHandlerParams,
  outputBuffer: Buffer,
  contentType: string,
  cacheKey: string,
  requestUrl: string,
): Promise<Response> {
  const isDegraded = !!(p.overlayUrl && p.overlayMode) && !p.isFullRender;
  qrFnLog("[BLOB] render result", {
    isDegraded,
    isFullRender: p.isFullRender,
    hasOverlay: !!(p.overlayUrl && p.overlayMode),
    bufferSize: outputBuffer.byteLength,
    cacheKey: cacheKey.slice(0, 80),
  });

  if (!(isDegraded || p.skipCache)) {
    await writeBlobCache(cacheKey, outputBuffer, contentType);
  }
  if (isDegraded && !p.skipCache) {
    await triggerBackgroundRender(cacheKey, requestUrl);
  }

  return buildFinalResponse(outputBuffer, contentType, cacheKey, isDegraded);
}
