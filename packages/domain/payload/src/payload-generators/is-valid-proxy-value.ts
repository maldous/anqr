import { isValidPhone } from "./is-valid-phone";

/**
 * Validate DuitNow proxy value based on proxy type
 * - MOBILE: valid phone number
 * - NRIC: 12 digits (Malaysian IC)
 * - PASSPORT: non-empty
 * - ARMY: non-empty
 * - BUSINESS: non-empty
 * - OTHERS: non-empty
 */
export function isValidProxyValue(value: string, proxyType: string): boolean {
  if (!value || value.trim().length === 0) return false;

  switch (proxyType) {
    case "MOBILE":
      // Valid phone number with at least 3 digits
      return isValidPhone(value);
    case "NRIC":
      // Malaysian NRIC is 12 digits (without dashes)
      return /^\d{12}$/.test(value.replaceAll(/[-\s]/g, ""));
    default:
      // Just needs to be non-empty
      return value.trim().length >= 1;
  }
}
