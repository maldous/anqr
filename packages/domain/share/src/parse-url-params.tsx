import type { ShareConfig } from "./share-links/types";
import { parseUrlParamsFromSearchParams } from "./parse-url-params-from-search-params";

/**
 * Parse URL parameters into a config object (browser-only)
 * Wraps parseUrlParamsFromSearchParams for browser convenience
 */
export function parseUrlParams(): Partial<ShareConfig> {
  return parseUrlParamsFromSearchParams(new URLSearchParams(globalThis.location.search));
}
