/**
 * Validate timing patterns are intact (alternating modules on row 6 and col 6)
 */
export function validateTimingPatterns(matrix: boolean[][]): {
  horizontal: boolean;
  vertical: boolean;
  allValid: boolean;
  errors: string[];
} {
  const moduleCount = matrix.length;
  const errors: string[] = [];
  let horizontalOk = true;
  let verticalOk = true;

  // Check horizontal timing (row 6, columns 8 to moduleCount-9)
  for (let col = 8; col < moduleCount - 8; col++) {
    const expected = col % 2 === 0; // Even columns are dark
    const actual = matrix[6]?.[col] ?? false;
    if (actual !== expected) {
      horizontalOk = false;
      errors.push(`Horizontal timing at col ${col}: expected ${expected}, got ${actual}`);
    }
  }

  // Check vertical timing (col 6, rows 8 to moduleCount-9)
  for (let row = 8; row < moduleCount - 8; row++) {
    const expected = row % 2 === 0; // Even rows are dark
    const actual = matrix[row]?.[6] ?? false;
    if (actual !== expected) {
      verticalOk = false;
      errors.push(`Vertical timing at row ${row}: expected ${expected}, got ${actual}`);
    }
  }

  return {
    horizontal: horizontalOk,
    vertical: verticalOk,
    allValid: horizontalOk && verticalOk,
    errors: errors.slice(0, 10),
  };
}
