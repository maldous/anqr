/**
 * Valid characters for URL fragment suffix in HYBRID mode.
 * This is a strict subset of URL-safe characters that should be
 * preserved through QR encoding/decoding without corruption.
 *
 * Includes: A-Z, a-z, 0-9, and limited special chars: - _ . ~
 * The '#' character is NOT included as it's added as the prefix.
 */
export const VALID_SUFFIX_CHARS = new Set(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~'.split('')
);
