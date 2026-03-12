/**
 * Validate Australian BSB (6 digits, often formatted as XXX-XXX)
 */
export function isValidBSB(bsb: string): boolean {
  const cleaned = bsb.replaceAll(/[-\s]/g, '');
  return /^\d{6}$/.test(cleaned);
}
