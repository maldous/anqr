import {DetectedAlignmentPattern, actualCol, actualRow, bestScore, bottom, dc, for, left, matrix, of, patterns, right, score, searchRadius, top, transform} from '../shared';
import { getAlignmentPatternPositions } from '../alignment/getAlignmentPatternPositions';
import { scoreAlignmentPatternAt } from '../alignment/scoreAlignmentPatternAt';

export function detectAlignmentPatterns(
  matrix: boolean[][],
  version: number
): DetectedAlignmentPattern[] {
  if (version < 2) return [];
  
  const moduleCount = matrix.length;
  const positions = getAlignmentPatternPositions(version);
  const detected: DetectedAlignmentPattern[] = [];
  
  for (const expectedRow of positions) {
    for (const expectedCol of positions) {
      // Skip positions that overlap with finder patterns
      if (expectedRow < 8 && expectedCol < 8) continue; // top-left
      if (expectedRow < 8 && expectedCol > moduleCount - 9) continue; // top-right
      if (expectedRow > moduleCount - 9 && expectedCol < 8) continue; // bottom-left
      
      // Search for alignment pattern in a small region around expected position
      // This accounts for perspective/transform errors
      let bestScore = 0;
      let bestRow = expectedRow;
      let bestCol = expectedCol;
      
      const searchRadius = 3; // Search ±3 modules around expected position
      
      for (let dr = -searchRadius; dr <= searchRadius; dr++) {
        for (let dc = -searchRadius; dc <= searchRadius; dc++) {
          const testRow = expectedRow + dr;
          const testCol = expectedCol + dc;
          
          // Bounds check (need 2 modules on each side for 5x5 pattern)
          if (testRow < 2 || testRow >= moduleCount - 2) continue;
          if (testCol < 2 || testCol >= moduleCount - 2) continue;
          
          const score = scoreAlignmentPatternAt(matrix, testRow, testCol);
          
          if (score > bestScore) {
            bestScore = score;
            bestRow = testRow;
            bestCol = testCol;
          }
        }
      }
      
      // Only record if we found a reasonably good match (at least 18/25 = 72%)
      if (bestScore >= 18) {
        detected.push({
          expectedRow,
          expectedCol,
          actualRow: bestRow,
          actualCol: bestCol,
          offsetRow: bestRow - expectedRow,
          offsetCol: bestCol - expectedCol,
          score: bestScore,
        });
      }
    }
  }
  
  return detected;
}

