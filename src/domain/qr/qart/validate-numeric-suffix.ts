import { validateSuffixCharacters } from './validate-suffix-characters';

/**
 * Validate that a suffix contains only digits (numeric mode).
 */
export function validateNumericSuffix(suffix: string): {
  valid: boolean;
  invalidCharIndex?: number;
  invalidCharCode?: number;
  invalidChar?: string;
} {
  return validateSuffixCharacters(suffix, (char) => char >= '0' && char <= '9');
}
