/**
 * Validate generic account number (at least 4 digits)
 */
export function isValidAccountNumber(accNum: string): boolean {
  const digits = accNum.replaceAll(/\D/g, '');
  return digits.length >= 4;
}
