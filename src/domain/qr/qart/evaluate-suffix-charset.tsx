import { validateSuffixCharset } from './validation';
import { countInvalidSuffixChars } from './count-invalid-suffix-chars';
import type { BinarySearchValidationResult } from './binary-search-validation-result';

export function evaluateSuffixCharset(
  decoded: string,
  originalData: string,
  strictSuffix: boolean
): BinarySearchValidationResult {
  let suffixCharsetPenalty = 0;
  if (decoded.length > originalData.length) {
    const suffix = decoded.slice(originalData.length);
    const charsetValidation = validateSuffixCharset(suffix);

    if (!charsetValidation.valid) {
      suffixCharsetPenalty = countInvalidSuffixChars(suffix) / suffix.length;

      if (strictSuffix) {
        return {
          valid: false,
          reason: 'SUFFIX_CHARSET_INVALID',
          description: `Suffix contains invalid character at index ${charsetValidation.invalidCharIndex}: ${charsetValidation.invalidChar} (0x${charsetValidation.invalidCharCode?.toString(16)})`,
          mismatchIndex: originalData.length + (charsetValidation.invalidCharIndex ?? 0),
          actualByte: charsetValidation.invalidCharCode,
          suffixCharsetPenalty,
          hardGateFailed: true,
        };
      }
    }
  }

  return {
    valid: true,
    suffixCharsetPenalty,
    hardGateFailed: false,
  };
}
