import { qrFnLog } from "./qr-fn-log";
import { getBlobStoreOrNull } from "./get-blob-store-or-null";
import { SENTINEL_PREFIX } from "./sentinel-prefix.const";
import { isMissingBlobsEnvironmentError } from "./is-missing-blobs-environment-error";
import { markBlobStoreDisabled } from "./mark-blob-store-disabled";

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
