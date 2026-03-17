/**
 * Validate IBAN (alphanumeric, 15-34 characters)
 * Basic format check only - does not validate checksum
 */
export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replaceAll(/\s/g, "").toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned);
}
