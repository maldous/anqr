/**
 * Validate URL for vCard compatibility.
 * Android requires URL to be a valid http(s):// URL.
 */
export function isValidUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test(url);
}
