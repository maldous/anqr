import { MAX_SHARE_URL_LENGTH } from "./share-links/types";

/**
 * Check if a share URL exceeds recommended length limits.
 * Returns warning message if too long, null otherwise.
 */
export function checkShareUrlLength(url: string): string | null {
  if (url.length > MAX_SHARE_URL_LENGTH) {
    return (
      `Share URL is ${url.length} characters (recommended max: ${MAX_SHARE_URL_LENGTH}). ` +
      "Very long URLs may fail in SMS, some social apps, and QR scanners. " +
      "Consider using fewer custom settings or a URL shortener."
    );
  }
  return null;
}
