import { FetchedImage } from "./fetched-image.types.ts";
import { validateAndFetchOverlay } from "./validate-and-fetch-overlay.ts";
import { streamResponseBody } from "./stream-response-body.ts";
import { MAX_OVERLAY_BYTES } from "./max-overlay-bytes.const.ts";
import { decodeOverlayBuffer } from "./decode-overlay-buffer.ts";

export async function fetchImageWithBuffer(url: string): Promise<FetchedImage | null> {
  try {
    const fetchResult = await validateAndFetchOverlay(url);
    if (!fetchResult) return null;
    if ("localResult" in fetchResult) return fetchResult.localResult;

    const reader = fetchResult.response.body?.getReader();
    if (!reader) return null;

    const buffer = await streamResponseBody(reader, MAX_OVERLAY_BYTES);
    if (!buffer) return null;

    return decodeOverlayBuffer(buffer);
  } catch {
    return null;
  }
}
