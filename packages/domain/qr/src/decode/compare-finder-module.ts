/**
 * Compare a single module in the matrix against the expected finder pattern value
 * and record the result.
 *
 * @returns true if the module matched, false otherwise
 */
export function compareFinderModule(
  matrix: boolean[][],
  finderPattern: number[][],
  row: number,
  col: number,
  rowOffset: number,
  colOffset: number,
  errors: string[],
): boolean {
  const expected = finderPattern[row][col] === 1;
  const actual = matrix[rowOffset + row]?.[colOffset + col] ?? false;
  if (expected === actual) {
    return true;
  }
  if (errors.length < 5) {
    errors.push(
      `(${rowOffset + row},${colOffset + col}): expected ${expected ? "dark" : "light"}, got ${actual ? "dark" : "light"}`,
    );
  }
  return false;
}
