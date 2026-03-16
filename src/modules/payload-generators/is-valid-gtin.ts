/**
 * Validate GTIN (8, 12, 13, or 14 digits)
 */
export function isValidGTIN(gtin: string): boolean {
  const cleaned = gtin.replaceAll(/\s/g, "");
  return /^\d{8}$|^\d{12,14}$/.test(cleaned);
}
