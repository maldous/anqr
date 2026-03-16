/**
 * Validate Cash App $cashtag (alphanumeric, 1-20 chars)
 */
export function isValidCashtag(cashtag: string): boolean {
  const cleaned = cashtag.replace(/^\$/, "");
  return /^[a-zA-Z][a-zA-Z0-9]{0,19}$/.test(cleaned);
}
