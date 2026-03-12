/**
 * Validate phone number for vCard compatibility.
 * Android requires TEL to look like an actual phone number with digits.
 */
export function isValidPhone(tel: string): boolean {
  // Must have at least 3 digits to be considered a valid phone number
  const digits = tel.replaceAll(/\D/g, '');
  return digits.length >= 3;
}
