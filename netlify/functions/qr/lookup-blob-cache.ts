import { getBlobStoreOrNull } from "./get-blob-store-or-null";
import { qrFnLog } from "./qr-fn-log";
import { CORS_HEADERS } from "./cors-headers.const";
import { isMissingBlobsEnvironmentError } from "./is-missing-blobs-environment-error";
import { markBlobStoreDisabled } from "./mark-blob-store-disabled";

export async function lookupBlobCache(
  cacheKey: string,
  skipCache: boolean,
): Promise<Response | null> {
  if (skipCache) return null;
  try {
    const store = getBlobStoreOrNull();
    if (store) {
      const cached = await store.getWithMetadata(cacheKey, { type: "arrayBuffer" });
      if (cached?.data) {
        const cachedMeta = cached.metadata as Record<string, string> | undefined;
        qrFnLog("[BLOB] cache HIT", {
          size: (cached.data as ArrayBuffer).byteLength,
          contentType: cachedMeta?.contentType,
        });
        return new Response(new Uint8Array(cached.data as ArrayBuffer), {
          status: 200,
          headers: {
            "Content-Type": cachedMeta?.contentType || "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-ANQR-Cache": "hit",
            ...CORS_HEADERS,
          },
        });
      }
      qrFnLog("[BLOB] cache MISS");
    }
  } catch (error_) {
    if (isMissingBlobsEnvironmentError(error_)) {
      markBlobStoreDisabled("missing_blob_env");
    }
  }
  return null;
}
