import { ParsedHandlerParams } from "./parsed-handler-params.types.ts";
import { qrFnLog } from "./qr-fn-log.ts";
import { writeBlobCache } from "./write-blob-cache.ts";
import { triggerBackgroundRender } from "./trigger-background-render.ts";
import { buildFinalResponse } from "./build-final-response.ts";

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
