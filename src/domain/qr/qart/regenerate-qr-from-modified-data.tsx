import type { ECCLevel } from './bit-mapping';
import { drawFinderPattern } from './draw-finder-pattern';
import { drawAlignmentPatterns } from './draw-alignment-patterns';
import { drawTimingPatterns } from './draw-timing-patterns';
import { writeFormatInfo } from './write-format-info';
import { writeVersionInfo } from './write-version-info';
import { interleaveBlockCodewords } from './interleave-block-codewords';
import { placeDataWithZigzag } from './place-data-with-zigzag';

/**
 * Regenerate a QR code from modified per-block data and ECC.
 * Uses extracted helpers for structural pattern drawing, interleaving,
 * and zigzag data placement.
 */
export function regenerateQRFromModifiedData(
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  version: number,
  ecc: ECCLevel,
  maskPattern: number
): boolean[][] {
  const moduleCount = version * 4 + 17;

  // Create module array initialized to null (will be filled in)
  const modules: (boolean | null)[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    modules[row] = Array.from({ length: moduleCount }, () => null as boolean | null);
  }

  // 1. Draw finder patterns (7x7 at three corners)
  drawFinderPattern(modules, moduleCount, 0, 0);
  drawFinderPattern(modules, moduleCount, moduleCount - 7, 0);
  drawFinderPattern(modules, moduleCount, 0, moduleCount - 7);

  // 2. Draw alignment patterns (must be BEFORE timing to match encoder order)
  drawAlignmentPatterns(modules, version, moduleCount);

  // 3. Draw timing patterns (must be AFTER alignment to match encoder order)
  drawTimingPatterns(modules, moduleCount);

  // 4. Write format information
  writeFormatInfo(modules, ecc, maskPattern, moduleCount);

  // 5. Write version information
  writeVersionInfo(modules, version, moduleCount);

  // 6. Combine data and pre-computed ECC for each block (DO NOT recompute ECC!)
  const blockCodewords: Uint8Array[] = [];
  for (let i = 0; i < blockDataArrays.length; i++) {
    const data = blockDataArrays[i];
    const eccBytes = blockEccArrays[i];
    const codeword = new Uint8Array(data.length + eccBytes.length);
    codeword.set(data, 0);
    codeword.set(eccBytes, data.length);
    blockCodewords.push(codeword);
  }

  // 7. Interleave and place data using zigzag traversal
  const interleaved = interleaveBlockCodewords(blockCodewords, blockDataCounts, blockEccCounts);
  placeDataWithZigzag(modules, interleaved, maskPattern, moduleCount);

  // Convert to boolean[][] (null -> false)
  const result: boolean[][] = [];
  for (let r = 0; r < moduleCount; r++) {
    result[r] = [];
    for (let c = 0; c < moduleCount; c++) {
      result[r][c] = modules[r][c] === true;
    }
  }

  return result;
}
