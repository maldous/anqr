/**
 * Check if a character is alphanumeric (0-9, A-Z, space, $%*+-./:)
 */
export function isAlphanumeric(char: string): boolean {
  return /^[0-9A-Z $%*+\-./:]$/.test(char);
}
