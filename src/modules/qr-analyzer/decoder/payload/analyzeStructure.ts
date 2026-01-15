import {QRAnalysisResult, code, for, moduleMatrix, patterns, row, structuralAnalysis} from '../shared';
import { checkFinderPattern } from '../finder/checkFinderPattern';
import { checkTimingPattern } from '../timing/checkTimingPattern';
import { getAlignmentPatternPositions } from '../alignment/getAlignmentPatternPositions';
// ============================================
// STRUCTURAL ANALYSIS
// ============================================

/**
 * Analyze structural patterns in the QR code
 */
export function analyzeStructure(
  moduleMatrix: boolean[][] | null,
  version: number | null
): QRAnalysisResult['structuralAnalysis'] {
  if (!moduleMatrix || !version) {
    return null;
  }

  const moduleCount = moduleMatrix.length;

  // Check for finder patterns (7x7 at corners)
  const hasFinderPatterns =
    checkFinderPattern(moduleMatrix, 0, 0) &&
    checkFinderPattern(moduleMatrix, 0, moduleCount - 7) &&
    checkFinderPattern(moduleMatrix, moduleCount - 7, 0);

  // Check for timing patterns (row 6 and column 6)
  const hasTimingPatterns = checkTimingPattern(moduleMatrix);

  // Calculate expected alignment patterns based on version
  const alignmentPositions = getAlignmentPatternPositions(version);
  const expectedAlignmentCount = alignmentPositions.length > 0 
    ? alignmentPositions.length * alignmentPositions.length - 3 // Subtract 3 corners that overlap with finders
    : 0;

  // Check for alignment patterns
  const hasAlignmentPatterns = version >= 2 && expectedAlignmentCount > 0;

  return {
    hasFinderPatterns,
    hasTimingPatterns,
    hasAlignmentPatterns,
    alignmentPatternCount: expectedAlignmentCount,
  };
}

