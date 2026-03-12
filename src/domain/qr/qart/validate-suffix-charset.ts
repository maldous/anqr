import { VALID_SUFFIX_CHARS } from './valid-suffix-chars';

/**
 * Validate that a suffix contains only URL-safe printable characters.
 * Non-printable or non-URL-safe bytes indicate corruption.
 *
 * @param suffix The suffix string to validate (without leading #)
 * @returns Validation result with details
 */
export function validateSuffixCharset(suffix: string): {
  valid: boolean;
  invalidCharIndex?: number;
  invalidCharCode?: number;
  invalidChar?: string;
} {
  // Skip the leading '#' if present
  const toValidate = suffix.startsWith('#') ? suffix.slice(1) : suffix;

  for (let i = 0; i < toValidate.length; i++) {
    const char = toValidate[i];
    const charCode = toValidate.codePointAt(i)!;

    // Check if character is in valid set
    if (!VALID_SUFFIX_CHARS.has(char)) {
      return {
        valid: false,
        invalidCharIndex: i,
        invalidCharCode: charCode,
        invalidChar:
          charCode >= 32 && charCode < 127 ? char : `\\x${charCode.toString(16).padStart(2, '0')}`,
      };
    }
  }

  return { valid: true };
}
