import { getStore } from "@netlify/blobs";
import { IS_TEST_RUNTIME } from "./is-test-runtime.const";
import { blobStoreDisabled } from "./blob-store-disabled.const";
import { DEFAULT_NETLIFY_SITE_ID } from "./default-netlify-site-id.const";
import { QR_CACHE_STORE } from "./qr-cache-store.const";
import { isMissingBlobsEnvironmentError } from "./is-missing-blobs-environment-error";
import { markBlobStoreDisabled } from "./mark-blob-store-disabled";

export function getBlobStoreOrNull() {
  if (IS_TEST_RUNTIME) return null;
  if (blobStoreDisabled.get()) return null;
  try {
    const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
    const siteID =
      process.env.SITE_ID ||
      process.env.NETLIFY_SITE_ID ||
      (token ? DEFAULT_NETLIFY_SITE_ID : undefined);
    if (siteID && token) {
      // Explicit credentials avoid expired context tokens in some runtimes.
      return getStore({ name: QR_CACHE_STORE, siteID, token });
    }
    return getStore(QR_CACHE_STORE);
  } catch (error) {
    if (isMissingBlobsEnvironmentError(error)) {
      markBlobStoreDisabled("missing_blob_env");
      return null;
    }
    throw error;
  }
}
