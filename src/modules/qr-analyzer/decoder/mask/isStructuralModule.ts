import {A, bit, bits, bottom, col, cross, for, idx, left, of, patterns, px, py, right, row, top} from '../shared';
import { getAlignmentPatternPositions } from '../alignment/getAlignmentPatternPositions';
import { getStructuralMask } from '../mask/getStructuralMask';
// ============================================
// PAYLOAD DECODING
// ============================================

/**
 * Check if a position is a structural module (finder, timing, alignment, format, version)
 *
 * This mirrors the logic in QRCore.isStructuralModule so that our decoding
 * uses exactly the same notion of "locked"/structural modules as the
 * generator. This is critical to read data bits in the same positions that
 * mapData() writes them into.
 */
export function isStructuralModule(row: number, col: number, moduleCount: number, version: number): boolean {
  // Fast-path: use cached structural mask for this (version,moduleCount).
  // This removes an O(A^2) alignment-position loop from the hot data-bit scan.
  const mask = getStructuralMask(version, moduleCount);
  const idx = row * moduleCount + col;
  if (idx >= 0 && idx < mask.length) {
    return mask[idx] !== 0;
  }


  // Finder patterns + separators (7x7 finder + 1 module separator around)
  if (row < 8 && col < 8) return true; // top-left
  if (row < 8 && col >= moduleCount - 8) return true; // top-right
  if (row >= moduleCount - 8 && col < 8) return true; // bottom-left

  // Timing patterns
  if (row === 6 || col === 6) return true;

  // Format information (around the timing cross)
  if (row === 8 && col < 9) return true;
  if (col === 8 && row < 9) return true;
  if (row === 8 && col >= moduleCount - 8) return true;
  if (col === 8 && row >= moduleCount - 8) return true;

  // Dark module
  if (row === moduleCount - 8 && col === 8) return true;

  // Version info (version 7+)
  if (version >= 7) {
    if (row >= moduleCount - 11 && row < moduleCount - 8 && col < 6) return true;
    if (col >= moduleCount - 11 && col < moduleCount - 8 && row < 6) return true;
  }

  // Alignment patterns (version 2+)
  if (version >= 2) {
    const positions = getAlignmentPatternPositions(version);
    for (const px of positions) {
      for (const py of positions) {
        // Skip alignment patterns that overlap with finder patterns
        if (px < 8 && py < 8) continue;
        if (px < 8 && py > moduleCount - 9) continue;
        if (px > moduleCount - 9 && py < 8) continue;

        if (Math.abs(row - py) <= 2 && Math.abs(col - px) <= 2) return true;
      }
    }
  }

  return false;

}

