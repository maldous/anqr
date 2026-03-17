import { type ShareConfig } from "@/modules/share-links/types";
import { buildUrlParams } from "./build-url-params";

/**
 * Update the browser URL without reloading
 */
export function updateBrowserUrl(config: Partial<ShareConfig>): void {
  const params = buildUrlParams(config);
  const newUrl = globalThis.location.pathname + (params ? `?${params}` : "");
  globalThis.history.replaceState({}, "", newUrl);
}
