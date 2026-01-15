import {center, dark, for, i, matrix, of, row} from '../shared';
/**
 * Check if a finder pattern exists at the given position
 */
export function checkFinderPattern(matrix: boolean[][], startRow: number, startCol: number): boolean {
  // Simplified check - just verify the corners of the pattern
  const size = 7;
  if (startRow + size > matrix.length || startCol + size > (matrix[0]?.length ?? 0)) {
    return false;
  }

  // Check that outer ring is dark
  for (let i = 0; i < size; i++) {
    if (!matrix[startRow]?.[startCol + i]) return false; // Top row
    if (!matrix[startRow + size - 1]?.[startCol + i]) return false; // Bottom row
    if (!matrix[startRow + i]?.[startCol]) return false; // Left column
    if (!matrix[startRow + i]?.[startCol + size - 1]) return false; // Right column
  }

  // Check center is dark
  if (!matrix[startRow + 3]?.[startCol + 3]) return false;

  return true;
}

