import { getBlobStoreOrNull } from "./get-blob-store-or-null";
import { SENTINEL_PREFIX } from "./sentinel-prefix.const";
import { SENTINEL_TTL_MS } from "./sentinel-ttl-ms.const";
import { qrFnLog } from "./qr-fn-log";
import { isMissingBlobsEnvironmentError } from "./is-missing-blobs-environment-error";
import { markBlobStoreDisabled } from "./mark-blob-store-disabled";

export async function triggerBackgroundRender(cacheKey: string, requestUrl: string): Promise<void> {
  let shouldTrigger = true;
  try {
    const store = getBlobStoreOrNull();
    if (store) {
      const sentinelKey = SENTINEL_PREFIX + cacheKey;
      const existing = await store.get(sentinelKey, { type: "text" });
      if (existing && Date.now() - Number(existing) < SENTINEL_TTL_MS) {
        shouldTrigger = false;
        qrFnLog("[BLOB] sentinel: already rendering (age:", Date.now() - Number(existing), "ms)");
      } else {
        await store.set(sentinelKey, String(Date.now()));
        qrFnLog("[BLOB] sentinel: set new sentinel");
      }
    }
  } catch (error_) {
    if (isMissingBlobsEnvironmentError(error_)) {
      markBlobStoreDisabled("missing_blob_env");
    }
  }
  if (shouldTrigger) {
    try {
      const bgUrl = new URL(requestUrl);
      bgUrl.searchParams.set("_fullRender", "1");
      const siteUrl = bgUrl.origin || process.env.URL || "https://anqr.link";
      qrFnLog("[BG:TRIGGER] posting to background function", {
        url: bgUrl.toString().slice(0, 120),
      });
      fetch(`${siteUrl}/.netlify/functions/qr-render-background`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: bgUrl.toString() }),
      }).then((r) => qrFnLog("[BG:TRIGGER]", r.status));
    } catch {
      // Background trigger failure is non-fatal
    }
  }
}
