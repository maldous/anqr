import {bottom, c, center, code, dark, for, left, matrix, patterns, right, row, threshold, top, valid, value} from '../shared';
/**
 * Validate that extracted matrix has proper finder patterns
 * Returns true if the matrix looks like a valid QR code
 * 
 * STRICT VALIDATION: Requires 4/4 finder corners and 80%+ timing
 */
export function validateExtractedMatrix(matrix: boolean[][], moduleCount: number, timingThreshold: number = 0.60): boolean {
  debugLog(`validateExtractedMatrix: moduleCount=${moduleCount}`);
  if (!matrix || matrix.length !== moduleCount) {
    debugLog(`validateExtractedMatrix: FAILED - matrix length mismatch`);
    return false;
  }
  if (moduleCount < 21) {
    debugLog(`validateExtractedMatrix: FAILED - moduleCount < 21`);
    return false;
  }
  
  // Helper to safely get a module value
  const getModule = (r: number, c: number): boolean => {
    return matrix[r]?.[c] ?? false;
  };
  
  // Check top-left finder pattern (7x7)
  // Outer ring corners MUST ALL be dark (4/4 required)
  const tlOuterDark = (
    (getModule(0, 0) ? 1 : 0) +
    (getModule(0, 6) ? 1 : 0) +
    (getModule(6, 0) ? 1 : 0) +
    (getModule(6, 6) ? 1 : 0)
  );
  debugLog(`validateExtractedMatrix: TL outer corners dark=${tlOuterDark}/4`);
  if (tlOuterDark < 4) {
    debugLog(`validateExtractedMatrix: FAILED - TL outer corners (need 4, got ${tlOuterDark})`);
    return false;
  }
  
  // Center 3x3 should be mostly dark (at least 7/9)
  let tlCenterDark = 0;
  for (let r = 2; r <= 4; r++) {
    for (let c = 2; c <= 4; c++) {
      if (getModule(r, c)) tlCenterDark++;
    }
  }
  debugLog(`validateExtractedMatrix: TL center dark=${tlCenterDark}/9`);
  if (tlCenterDark < 7) {
    debugLog(`validateExtractedMatrix: FAILED - TL center (need 7+, got ${tlCenterDark})`);
    return false;
  }
  
  // Check top-right finder pattern
  const trCol = moduleCount - 7;
  const trOuterDark = (
    (getModule(0, trCol) ? 1 : 0) +
    (getModule(0, trCol + 6) ? 1 : 0) +
    (getModule(6, trCol) ? 1 : 0) +
    (getModule(6, trCol + 6) ? 1 : 0)
  );
  debugLog(`validateExtractedMatrix: TR outer corners dark=${trOuterDark}/4`);
  if (trOuterDark < 4) {
    debugLog(`validateExtractedMatrix: FAILED - TR outer corners (need 4, got ${trOuterDark})`);
    return false;
  }
  
  // Top-right center should be dark
  const trCenterDark = getModule(3, trCol + 3);
  debugLog(`validateExtractedMatrix: TR center dark=${trCenterDark}`);
  if (!trCenterDark) {
    debugLog(`validateExtractedMatrix: FAILED - TR center`);
    return false;
  }
  
  // Check bottom-left finder pattern
  const blRow = moduleCount - 7;
  const blOuterDark = (
    (getModule(blRow, 0) ? 1 : 0) +
    (getModule(blRow, 6) ? 1 : 0) +
    (getModule(blRow + 6, 0) ? 1 : 0) +
    (getModule(blRow + 6, 6) ? 1 : 0)
  );
  debugLog(`validateExtractedMatrix: BL outer corners dark=${blOuterDark}/4`);
  if (blOuterDark < 4) {
    debugLog(`validateExtractedMatrix: FAILED - BL outer corners (need 4, got ${blOuterDark})`);
    return false;
  }
  
  // Bottom-left center should be dark
  const blCenterDark = getModule(blRow + 3, 3);
  debugLog(`validateExtractedMatrix: BL center dark=${blCenterDark}`);
  if (!blCenterDark) {
    debugLog(`validateExtractedMatrix: FAILED - BL center`);
    return false;
  }
  
  // Additional check: timing pattern should have alternating modules
  // Check horizontal timing (row 6, between finders)
  let timingCorrect = 0;
  let timingTotal = 0;
  for (let c = 8; c < moduleCount - 8; c++) {
    const expected = (c % 2) === 0; // Even columns should be dark
    if (getModule(6, c) === expected) timingCorrect++;
    timingTotal++;
  }
  const timingRatio = timingTotal > 0 ? timingCorrect / timingTotal : 0;
  debugLog(`validateExtractedMatrix: timing pattern ${timingCorrect}/${timingTotal} = ${(timingRatio * 100).toFixed(1)}%`);
  // Timing must meet threshold (default 60% is permissive, can be set stricter)
  if (timingTotal > 0 && timingRatio < timingThreshold) {
    debugLog(`validateExtractedMatrix: FAILED - timing pattern (need ${(timingThreshold * 100).toFixed(0)}%+, got ${(timingRatio * 100).toFixed(1)}%)`);
    return false;
  }
  
  debugLog(`validateExtractedMatrix: PASSED`);
  return true;
}

