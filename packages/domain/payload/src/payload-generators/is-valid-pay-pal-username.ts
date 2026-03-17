/**
 * Validate PayPal.Me username (alphanumeric, 4-20 chars)
 */
export function isValidPayPalUsername(username: string): boolean {
  return /^[a-zA-Z0-9]{4,20}$/.test(username);
}
