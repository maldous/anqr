/**
 * Validate SSID (1-32 characters, non-empty)
 */
export function isValidSSID(ssid: string): boolean {
  const len = ssid.length;
  return len >= 1 && len <= 32;
}
