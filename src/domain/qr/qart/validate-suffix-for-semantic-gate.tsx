import { type SemanticValidationResult, validateNumericSuffix, validateSuffixCharset } from './validation';
import { semanticFailure } from './semantic-failure';
import { log } from './log';

export function validateSuffixForSemanticGate(
  decoded: string,
  originalDataLength: number,
  expectedSuffix: string | undefined,
  strictSuffix: boolean,
  suffixMode: 'byte' | 'numeric'
): SemanticValidationResult | null {
  if (expectedSuffix === undefined || decoded.length <= originalDataLength) {
    return null;
  }

  const actualSuffix = decoded.slice(originalDataLength);
  const charsetValidation =
    suffixMode === 'numeric'
      ? validateNumericSuffix(actualSuffix)
      : validateSuffixCharset(actualSuffix);

  if (charsetValidation.valid) {
    return null;
  }

  if (strictSuffix) {
    return semanticFailure(
      'SUFFIX_CHARSET_INVALID',
      `Suffix contains invalid character at index ${charsetValidation.invalidCharIndex}: ${charsetValidation.invalidChar} (0x${charsetValidation.invalidCharCode?.toString(16)})`,
      {
        mismatchIndex: originalDataLength + (charsetValidation.invalidCharIndex ?? 0),
        actualByte: charsetValidation.invalidCharCode,
      }
    );
  }

  log.debug('Suffix charset violation (accepted - strictSuffix=false)', {
    invalidCharIndex: charsetValidation.invalidCharIndex,
    invalidChar: charsetValidation.invalidChar,
    invalidCharCode: charsetValidation.invalidCharCode,
    suffixPreview: actualSuffix.slice(0, 30),
  });
  return null;
}
