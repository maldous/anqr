/**
 * Generate a random URL-safe suffix
 *
 * @deprecated Use generateDeterministicSuffix for stable baselines
 * @param length Number of characters
 * @returns Random alphanumeric string
 */
export function generateRandomSuffix(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
