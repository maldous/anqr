/**
 * Validate generic merchant ID (at least 1 non-empty character)
 */
export function isValidMerchantId(id: string): boolean {
  return id.trim().length >= 1;
}
