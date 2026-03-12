/**
 * Validate ISO 3166-1 alpha-2 country code (2 uppercase letters)
 */
export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code.toUpperCase());
}
