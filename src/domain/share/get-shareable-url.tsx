import { type ShareConfig } from "../../modules/share-links/types";
import { buildUrlParams } from "./build-url-params";

/**
 * Get the full shareable URL
 */
export function getShareableUrl(config: Partial<ShareConfig>, baseUrl?: string): string {
  if (baseUrl) {
    const params = buildUrlParams(config);
    return params ? `${baseUrl}?${params}` : baseUrl;
  }

  const { hostname, origin, pathname, protocol } = globalThis.location;
  const lowerHost = hostname.toLowerCase();

  const isLocalhost =
    lowerHost === "localhost" ||
    lowerHost === "127.0.0.1" ||
    lowerHost === "::1" ||
    lowerHost.endsWith(".localhost");

  const base =
    isLocalhost || protocol === "capacitor:" ? `https://anqr.link${pathname}` : origin + pathname;

  const params = buildUrlParams(config);
  return params ? `${base}?${params}` : base;
}
