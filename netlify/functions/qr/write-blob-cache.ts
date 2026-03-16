import { qrFnLog } from "./qr-fn-log.ts";
import { getBlobStoreOrNull } from "./get-blob-store-or-null.ts";
import { SENTINEL_PREFIX } from "./sentinel-prefix.const.ts";
import { isMissingBlobsEnvironmentError } from "./is-missing-blobs-environment-error.ts";
import { markBlobStoreDisabled } from "./mark-blob-store-disabled.ts";

export async function writeBlobCache(
  cacheKey: string,
  outputBuffer: Buffer,
  contentType: string,
): Promise<void> {
  try {
    qrFnLog("[BLOB] writing cache...", {
      cacheKey: cacheKey.slice(0, 80),
      size: outputBuffer.byteLength,
      contentType,
    });
    const store = getBlobStoreOrNull();
    if (store) {
      await store.set(cacheKey, new Blob([outputBuffer]), {
        metadata: { contentType, generatedAt: new Date().toISOString() },
      });
      await store.delete(SENTINEL_PREFIX + cacheKey).catch(() => {});
      qrFnLog("[BLOB] cache write OK");
    }
  } catch (error_) {
    if (isMissingBlobsEnvironmentError(error_)) {
      markBlobStoreDisabled("missing_blob_env");
    } else {
      // console.error('[BLOB] cache write FAILED:', error_);
    }
  }
}
