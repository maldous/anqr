/**
 * Validate Vietnam bank BIN (6-8 digits)
 */
export function isValidBankBin(bin: string): boolean {
  const cleaned = bin.replaceAll(/\s/g, "");
  return /^\d{6,8}$/.test(cleaned);
}
