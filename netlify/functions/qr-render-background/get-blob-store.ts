import { getStore } from "@netlify/blobs";
import { QR_CACHE_STORE } from "./qr-cache-store.const";

export function getBlobStore() {
  const siteID = process.env.SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN;
  if (siteID && token) {
    return getStore({ name: QR_CACHE_STORE, siteID, token });
  }
  // Local dev / NETLIFY_DEV — auto-context works fine
  return getStore(QR_CACHE_STORE);
}
