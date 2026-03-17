/**
 * Validate finder patterns are intact
 */
export function validateFinderPatterns(matrix: boolean[][]): {
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  allValid: boolean;
  errors: string[];
} {
  const moduleCount = matrix.length;
  const errors: string[] = [];

  // Expected finder pattern (7x7)
  const expected = [
    [true, true, true, true, true, true, true],
    [true, false, false, false, false, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, false, false, false, false, true],
    [true, true, true, true, true, true, true],
  ];

  const checkFinder = (startRow: number, startCol: number, name: string): boolean => {
    let valid = true;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const actual = matrix[startRow + r]?.[startCol + c] ?? false;
        if (actual !== expected[r][c]) {
          valid = false;
          errors.push(`${name} mismatch at (${r},${c}): expected ${expected[r][c]}, got ${actual}`);
        }
      }
    }
    return valid;
  };

  const topLeft = checkFinder(0, 0, "TopLeft");
  const topRight = checkFinder(0, moduleCount - 7, "TopRight");
  const bottomLeft = checkFinder(moduleCount - 7, 0, "BottomLeft");

  return {
    topLeft,
    topRight,
    bottomLeft,
    allValid: topLeft && topRight && bottomLeft,
    errors: errors.slice(0, 10), // Limit to first 10 errors
  };
}
