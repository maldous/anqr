/**
 * Validate that a suffix contains only digits (numeric mode).
 */
export function validateNumericSuffix(suffix: string): {
  valid: boolean;
  invalidCharIndex?: number;
  invalidCharCode?: number;
  invalidChar?: string;
} {
  const toValidate = suffix.startsWith('#') ? suffix.slice(1) : suffix;

  for (let i = 0; i < toValidate.length; i++) {
    const char = toValidate[i];
    const charCode = toValidate.codePointAt(i)!;
    if (char < '0' || char > '9') {
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
