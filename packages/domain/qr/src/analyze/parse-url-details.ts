import type { UrlDetails } from "./analyzer-content.types";

/**
 * Parse URL details
 */
export function parseUrlDetails(url: string): UrlDetails | null {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol.replace(":", ""),
      host: parsed.host,
      pathname: parsed.pathname,
      hasUtmParams:
        parsed.searchParams.has("utm_source") ||
        parsed.searchParams.has("utm_medium") ||
        parsed.searchParams.has("utm_campaign"),
      utmSource: parsed.searchParams.get("utm_source") ?? undefined,
      utmMedium: parsed.searchParams.get("utm_medium") ?? undefined,
      utmCampaign: parsed.searchParams.get("utm_campaign") ?? undefined,
    };
  } catch {
    return null;
  }
}
