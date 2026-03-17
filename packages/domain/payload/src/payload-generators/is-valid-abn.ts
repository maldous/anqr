/**
 * Validate Australian Business Number (ABN - exactly 11 digits)
 */
export function isValidABN(abn: string): boolean {
  const cleaned = abn.replaceAll(/[\s-]/g, "");
  return /^\d{11}$/.test(cleaned);
}
