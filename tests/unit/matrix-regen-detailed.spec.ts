/**
 * Detailed Matrix Regeneration Debug Test
 *
 * This test compares the regenerated matrix with the encoder's output
 * at a very granular level to identify exactly where the divergence occurs.
 */

import { describe, it, expect } from 'vitest';
import { qrcode } from '../../src/modules/qr-encoder';
import { QRErrorCorrectionLevel } from '../../src/modules/qr-encoder/types';
import {
  getPatternPosition,
  getBCHTypeInfo,
  getBCHTypeNumber,
} from '../../src/modules/qr-encoder/utils';
import { getMaskFunction } from '../../src/modules/qr-spec/masks';

// Polyfill ImageData for Node environment
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data;
      this.width = width;
      this.height = height ?? Math.floor(data.length / 4 / width);
    }
  };
}

function eccToNumeric(ecc: 'L' | 'M' | 'Q' | 'H'): number {
  switch (ecc) {
    case 'L':
      return QRErrorCorrectionLevel.L;
    case 'M':
      return QRErrorCorrectionLevel.M;
    case 'Q':
      return QRErrorCorrectionLevel.Q;
    case 'H':
      return QRErrorCorrectionLevel.H;
    default:
      return QRErrorCorrectionLevel.M;
  }
}

/**
 * Get the encoder's interleaved bytes directly from its internal state
 */
function getEncoderInterleavedBytes(
  data: string,
  version: number,
  ecc: 'L' | 'M' | 'Q' | 'H',
  mask: number
): { interleaved: number[]; moduleCount: number } {
  const qr = qrcode(version, ecc);
  qr.addData(data);
  qr.make(mask);

  const interleaved = (qr as any).getDataCache?.();
  if (!interleaved) {
    throw new Error('getDataCache() not available on QR encoder instance');
  }

  return { interleaved, moduleCount: qr.getModuleCount() };
}

/**
 * Our regeneration function - simplified to just return the matrix
 */
function regenerateMatrix(
  interleaved: number[],
  version: number,
  ecc: 'L' | 'M' | 'Q' | 'H',
  maskPattern: number
): boolean[][] {
  const moduleCount = version * 4 + 17;
  const eccLevel = eccToNumeric(ecc);

  // Create module array initialized to null
  const modules: (boolean | null)[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    modules[row] = new Array(moduleCount).fill(null);
  }

  // 1. Draw finder patterns
  const setupFinderPattern = (centerRow: number, centerCol: number) => {
    for (let r = -1; r <= 7; r++) {
      if (centerRow + r < 0 || centerRow + r >= moduleCount) continue;
      for (let c = -1; c <= 7; c++) {
        if (centerCol + c < 0 || centerCol + c >= moduleCount) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          modules[centerRow + r][centerCol + c] = true;
        } else {
          modules[centerRow + r][centerCol + c] = false;
        }
      }
    }
  };

  setupFinderPattern(0, 0);
  setupFinderPattern(moduleCount - 7, 0);
  setupFinderPattern(0, moduleCount - 7);

  // 2. Draw timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    const dark = i % 2 === 0;
    if (modules[6][i] === null) modules[6][i] = dark;
    if (modules[i][6] === null) modules[i][6] = dark;
  }

  // 3. Draw alignment patterns (version >= 2)
  if (version >= 2) {
    const positions = getPatternPosition(version);
    for (const row of positions) {
      for (const col of positions) {
        if (modules[row][col] !== null) continue;

        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              modules[row + r][col + c] = true;
            } else {
              modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  // 4. Draw format info
  const formatData = (eccLevel << 3) | maskPattern;
  const formatBits = getBCHTypeInfo(formatData);

  for (let i = 0; i < 15; i++) {
    const mod = ((formatBits >> i) & 1) === 1;

    // Vertical (left side)
    if (i < 6) {
      modules[i][8] = mod;
    } else if (i < 8) {
      modules[i + 1][8] = mod;
    } else {
      modules[moduleCount - 15 + i][8] = mod;
    }

    // Horizontal (top side)
    if (i < 8) {
      modules[8][moduleCount - i - 1] = mod;
    } else if (i < 9) {
      modules[8][15 - i - 1 + 1] = mod;
    } else {
      modules[8][15 - i - 1] = mod;
    }
  }

  // Fixed dark module
  modules[moduleCount - 8][8] = true;

  // 5. Draw version info (version >= 7)
  if (version >= 7) {
    const versionBits = getBCHTypeNumber(version);

    for (let i = 0; i < 18; i++) {
      const mod = ((versionBits >> i) & 1) === 1;
      modules[Math.floor(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
      modules[(i % 3) + moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  // 6. Place data using zigzag traversal with mask
  const maskFunc = getMaskFunction(maskPattern);
  let inc = -1;
  let row = moduleCount - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = moduleCount - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;

        if (modules[row][currentCol] === null) {
          let dark = false;

          if (byteIndex < interleaved.length) {
            dark = ((interleaved[byteIndex] >>> bitIndex) & 1) === 1;
          }

          if (maskFunc(row, currentCol)) {
            dark = !dark;
          }

          modules[row][currentCol] = dark;
          bitIndex--;

          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }

      row += inc;

      if (row < 0 || row >= moduleCount) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }

  // Convert to boolean[][]
  const result: boolean[][] = [];
  for (let r = 0; r < moduleCount; r++) {
    result[r] = [];
    for (let c = 0; c < moduleCount; c++) {
      result[r][c] = modules[r][c] === true;
    }
  }

  return result;
}

describe('Detailed Matrix Regeneration Debug', () => {
  it('documents the current v7 ECC=H mask=0 mismatch classification', () => {
    const data = 'https://example.com';
    const version = 7;
    const ecc = 'H' as const;
    const mask = 0;

    // Get encoder's matrix
    const qr = qrcode(version, ecc);
    qr.addData(data);
    qr.make(mask);
    const moduleCount = qr.getModuleCount();

    // Get our interleaved bytes (should match encoder's)
    const { interleaved } = getEncoderInterleavedBytes(data, version, ecc, mask);

    // Regenerate using our function
    const regenerated = regenerateMatrix(interleaved, version, ecc, mask);

    // Classify mismatches by region
    const mismatches = {
      finder: [] as Array<{ row: number; col: number; encoder: boolean; regen: boolean }>,
      timing: [] as Array<{ row: number; col: number; encoder: boolean; regen: boolean }>,
      alignment: [] as Array<{ row: number; col: number; encoder: boolean; regen: boolean }>,
      format: [] as Array<{ row: number; col: number; encoder: boolean; regen: boolean }>,
      version: [] as Array<{ row: number; col: number; encoder: boolean; regen: boolean }>,
      data: [] as Array<{ row: number; col: number; encoder: boolean; regen: boolean }>,
    };

    // Get alignment positions for classification
    const alignmentPositions = new Set<string>();
    if (version >= 2) {
      const positions = getPatternPosition(version);
      for (const row of positions) {
        for (const col of positions) {
          for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
              alignmentPositions.add(`${row + r},${col + c}`);
            }
          }
        }
      }
    }

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const encoderVal = qr.isDark(row, col);
        const regenVal = regenerated[row][col];

        if (encoderVal !== regenVal) {
          const key = `${row},${col}`;
          const mismatch = { row, col, encoder: encoderVal, regen: regenVal };

          // Classify the mismatch
          // Finder patterns (7x7 at three corners)
          if (
            (row < 8 && col < 8) ||
            (row < 8 && col >= moduleCount - 8) ||
            (row >= moduleCount - 8 && col < 8)
          ) {
            mismatches.finder.push(mismatch);
          }
          // Timing patterns (row 6 and col 6)
          else if (row === 6 || col === 6) {
            mismatches.timing.push(mismatch);
          }
          // Alignment patterns
          else if (alignmentPositions.has(key)) {
            mismatches.alignment.push(mismatch);
          }
          // Format info (around top-left finder)
          else if (
            (row === 8 && col <= 8) ||
            (row <= 8 && col === 8) ||
            (row === 8 && col >= moduleCount - 8) ||
            (row >= moduleCount - 7 && col === 8)
          ) {
            mismatches.format.push(mismatch);
          }
          // Version info (version >= 7)
          else if (
            version >= 7 &&
            ((row < 6 && col >= moduleCount - 11 && col < moduleCount - 8) ||
              (col < 6 && row >= moduleCount - 11 && row < moduleCount - 8))
          ) {
            mismatches.version.push(mismatch);
          }
          // Data modules
          else {
            mismatches.data.push(mismatch);
          }
        }
      }
    }

    console.log('\n=== Mismatch Classification ===');
    console.log('Finder patterns:', mismatches.finder.length);
    console.log('Timing patterns:', mismatches.timing.length);
    console.log('Alignment patterns:', mismatches.alignment.length);
    console.log('Format info:', mismatches.format.length);
    console.log('Version info:', mismatches.version.length);
    console.log('Data modules:', mismatches.data.length);

    // Show sample mismatches from each category
    if (mismatches.finder.length > 0) {
      console.log('\nSample finder mismatches:', mismatches.finder.slice(0, 3));
    }
    if (mismatches.alignment.length > 0) {
      console.log('\nSample alignment mismatches:', mismatches.alignment.slice(0, 3));
    }
    if (mismatches.data.length > 0) {
      console.log('\nSample data mismatches:', mismatches.data.slice(0, 5));
    }

    const totalMismatches =
      mismatches.finder.length +
      mismatches.timing.length +
      mismatches.alignment.length +
      mismatches.format.length +
      mismatches.version.length +
      mismatches.data.length;

    console.log(`\nTotal mismatches: ${totalMismatches} / ${moduleCount * moduleCount}`);

    expect(mismatches.finder.length).toBe(0);
    expect(mismatches.timing.length).toBe(0);
    expect(mismatches.alignment.length).toBe(21);
    expect(mismatches.format.length).toBe(0);
    expect(mismatches.version.length).toBe(0);
    expect(mismatches.data.length).toBe(365);
    expect(totalMismatches).toBe(386);
  });

  it('traces data placement step by step', () => {
    // Use a smaller version for easier debugging
    const data = 'TEST';
    const version = 2;
    const ecc = 'M' as const;
    const mask = 0;

    const qr = qrcode(version, ecc);
    qr.addData(data);
    qr.make(mask);
    const moduleCount = qr.getModuleCount();

    const { interleaved } = getEncoderInterleavedBytes(data, version, ecc, mask);
    const regenerated = regenerateMatrix(interleaved, version, ecc, mask);

    // Count null modules in encoder vs regenerated
    // (null means structural/reserved, shouldn't be placed)
    let mismatchCount = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col) !== regenerated[row][col]) {
          mismatchCount++;
        }
      }
    }

    console.log(`\nv2 ECC=M: ${mismatchCount} mismatches`);
    expect(mismatchCount).toBe(0);
  });
});
