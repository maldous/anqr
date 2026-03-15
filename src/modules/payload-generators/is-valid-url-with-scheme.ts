/**
 * Validate URL with custom scheme (for webcal://, myapp://, etc.)
 */
export function isValidUrlWithScheme(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\/.+/i.test(url);
}
