/**
 * Check if a character is numeric (0-9)
 */
export function isNumeric(char: string): boolean {
  return /^\d$/.test(char);
}
