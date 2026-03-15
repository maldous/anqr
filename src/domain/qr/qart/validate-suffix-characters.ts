export function validateSuffixCharacters(
  suffix: string,
  isValidCharacter: (char: string) => boolean
): {
  valid: boolean;
  invalidCharIndex?: number;
  invalidCharCode?: number;
  invalidChar?: string;
} {
  const toValidate = suffix.startsWith('#') ? suffix.slice(1) : suffix;

  for (let index = 0; index < toValidate.length; index++) {
    const char = toValidate[index];
    const charCode = toValidate.codePointAt(index)!;
    if (!isValidCharacter(char)) {
      return {
        valid: false,
        invalidCharIndex: index,
        invalidCharCode: charCode,
        invalidChar:
          charCode >= 32 && charCode < 127 ? char : `\\x${charCode.toString(16).padStart(2, '0')}`,
      };
    }
  }

  return { valid: true };
}
