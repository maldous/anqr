/**
 * Validate ISO 4217 currency code (3 digits)
 */
export function isValidCurrencyCode(code: string): boolean {
  return /^\d{3}$/.test(code);
}
