/**
 * Validate UPI VPA format (user@provider)
 */
export function isValidUpiVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa);
}
