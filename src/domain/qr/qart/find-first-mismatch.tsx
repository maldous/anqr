/**
 * Find the first byte index where two strings differ (in the protected region)
 */
export function _findFirstMismatch(
  expected: string,
  actual: string,
  protectedLength: number
): { index: number; expected: number; actual: number } | null {
  const len = Math.min(protectedLength, expected.length, actual.length);
  for (let i = 0; i < len; i++) {
    if (expected.codePointAt(i) !== actual.codePointAt(i)!) {
      return {
        index: i,
        expected: expected.codePointAt(i)!,
        actual: actual.codePointAt(i)!,
      };
    }
  }
  // Check if lengths differ in protected region
  if (actual.length < protectedLength) {
    return {
      index: actual.length,
      expected: expected.codePointAt(actual.length)! || 0,
      actual: -1, // Missing byte
    };
  }
  return null;
}
