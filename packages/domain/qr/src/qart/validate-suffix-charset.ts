import { VALID_SUFFIX_CHARS } from "./valid-suffix-chars";
import { validateSuffixCharacters } from "./validate-suffix-characters";

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
  return validateSuffixCharacters(suffix, (char) => VALID_SUFFIX_CHARS.has(char));
}
