import type { GeoHelper } from "./types";

/** Generate Geo URI (RFC 5870 compliant - only lat,lon without search query) */
export function generateGeo(params: GeoHelper): string {
  // RFC 5870 geo URI format: geo:lat,lon
  // Note: The ?q= parameter is NOT part of the standard and causes issues with many apps
  return `geo:${params.lat},${params.lon}`;
}
