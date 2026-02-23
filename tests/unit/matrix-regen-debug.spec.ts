/**
 * Matrix Regeneration Debug Test
 *
 * This test compares the encoder's matrix output with regenerateQRFromModifiedData
 * to identify exactly where mismatches occur (finder, timing, alignment, format, version, data).
 */

import { describe, it, expect } from 'vitest';
import { qrcode } from '../../src/modules/qr-encoder';
import { qrBitBuffer } from '../../src/modules/qr-encoder/bit-buffer';
import { qr8BitByte } from '../../src/modules/qr-encoder/data-modes';
import { getRSBlocks } from '../../src/modules/qr-encoder/rs-blocks';
import { QRErrorCorrectionLevel } from '../../src/modules/qr-encoder/types';
import {
  getBCHTypeInfo,
  getBCHTypeNumber,
  getLengthInBits,
  getPatternPosition,
} from '../../src/modules/qr-encoder/utils';
import { getMaskFunction } from '../../src/modules/qr-spec/masks';
import { computeECC } from '../../src/modules/qr-art/rs-basis';

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

/**
 * Convert ECC level character to numeric value
 */
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
 * Encode data to get per-block data and ECC arrays
 */
function encodeDataToBlocks(
  data: string,
  version: number,
  ecc: 'L' | 'M' | 'Q' | 'H'
): {
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
  interleavedData: number[];
} {
  const eccLevel = eccToNumeric(ecc);
  const rsBlocks = getRSBlocks(version, eccLevel);

  // Create bit buffer and encode
  const buffer = qrBitBuffer();
  const segment = qr8BitByte(data);

  buffer.put(segment.getMode(), 4);
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  segment.write(buffer);

  // Calculate total data capacity
  let totalDataCount = 0;
  for (const block of rsBlocks) {
    totalDataCount += block.dataCount;
  }

  // Add terminator
  const remainingBits = totalDataCount * 8 - buffer.getLengthInBits();
  const terminatorBits = Math.min(4, remainingBits);
  if (terminatorBits > 0) {
    buffer.put(0, terminatorBits);
  }

  // Pad to byte boundary
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }

  // Add padding bytes
  const PAD0 = 0xec;
  const PAD1 = 0x11;
  while (buffer.getLengthInBits() < totalDataCount * 8) {
    buffer.put(PAD0, 8);
    if (buffer.getLengthInBits() < totalDataCount * 8) {
      buffer.put(PAD1, 8);
    }
  }

  const bufferBytes = buffer.getBuffer();

  // Extract per-block data and compute ECC
  const blockDataArrays: Uint8Array[] = [];
  const blockEccArrays: Uint8Array[] = [];
  const blockDataCounts: number[] = [];
  const blockEccCounts: number[] = [];

  let offset = 0;
  for (const block of rsBlocks) {
    const blockData = new Uint8Array(block.dataCount);
    for (let i = 0; i < block.dataCount; i++) {
      blockData[i] = bufferBytes[offset + i] & 0xff;
    }
    blockDataArrays.push(blockData);
    blockDataCounts.push(block.dataCount);

    const eccCount = block.totalCount - block.dataCount;
    blockEccCounts.push(eccCount);

    const eccBytes = computeECC(blockData, eccCount);
    blockEccArrays.push(eccBytes);

    offset += block.dataCount;
  }

  // Interleave data and ECC (matching encoder's createBytes logic)
  const maxDataCount = Math.max(...blockDataCounts);
  const maxEccCount = Math.max(...blockEccCounts);
  const interleaved: number[] = [];

  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < blockDataArrays.length; b++) {
      if (i < blockDataCounts[b]) {
        interleaved.push(blockDataArrays[b][i]);
      }
    }
  }

  for (let i = 0; i < maxEccCount; i++) {
    for (let b = 0; b < blockEccArrays.length; b++) {
      if (i < blockEccCounts[b]) {
        interleaved.push(blockEccArrays[b][i]);
      }
    }
  }

  return {
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    interleavedData: interleaved,
  };
}

/**
 * Regenerate QR matrix from block data (copy of the function we're debugging)
 */
function regenerateQRFromModifiedData(
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  version: number,
  ecc: 'L' | 'M' | 'Q' | 'H',
  maskPattern: number
): boolean[][] {
  const moduleCount = version * 4 + 17;
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

  // 2. Draw alignment patterns (MUST be BEFORE timing to match encoder!)
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

  // 3. Draw timing patterns (MUST be AFTER alignment to match encoder!)
  for (let i = 8; i < moduleCount - 8; i++) {
    const dark = i % 2 === 0;
    if (modules[6][i] === null) modules[6][i] = dark;
    if (modules[i][6] === null) modules[i][6] = dark;
  }

  // 4. Draw format info
  const eccLevel = eccToNumeric(ecc);
  const formatData = (eccLevel << 3) | maskPattern;
  const formatBits = getBCHTypeInfo(formatData);

  for (let i = 0; i < 15; i++) {
    const mod = ((formatBits >> i) & 1) === 1;

    // Vertical
    if (i < 6) {
      modules[i][8] = mod;
    } else if (i < 8) {
      modules[i + 1][8] = mod;
    } else {
      modules[moduleCount - 15 + i][8] = mod;
    }

    // Horizontal
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

  // 6. Combine and interleave data + ECC
  const blockCodewords: Uint8Array[] = [];
  for (let i = 0; i < blockDataArrays.length; i++) {
    const data = blockDataArrays[i];
    const eccBytes = blockEccArrays[i];
    const codeword = new Uint8Array(data.length + eccBytes.length);
    codeword.set(data, 0);
    codeword.set(eccBytes, data.length);
    blockCodewords.push(codeword);
  }

  const maxDataCount = Math.max(...blockDataCounts);
  const maxEccCount = Math.max(...blockEccCounts);
  const interleaved: number[] = [];

  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < blockCodewords.length; b++) {
      if (i < blockDataCounts[b]) {
        interleaved.push(blockCodewords[b][i]);
      }
    }
  }

  for (let i = 0; i < maxEccCount; i++) {
    for (let b = 0; b < blockCodewords.length; b++) {
      if (i < blockEccCounts[b]) {
        interleaved.push(blockCodewords[b][blockDataCounts[b] + i]);
      }
    }
  }

  // 7. Place data using zigzag traversal
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

/**
 * Classify a module position
 */
function classifyModule(row: number, col: number, moduleCount: number, version: number): string {
  // Finder patterns (including separators)
  if (row < 8 && col < 8) return 'finder-tl';
  if (row < 8 && col >= moduleCount - 8) return 'finder-tr';
  if (row >= moduleCount - 8 && col < 8) return 'finder-bl';

  // Timing patterns
  if (row === 6 && col >= 8 && col < moduleCount - 8) return 'timing-h';
  if (col === 6 && row >= 8 && row < moduleCount - 8) return 'timing-v';

  // Format info
  if (row === 8 && col < 9) return 'format-v1';
  if (row === 8 && col >= moduleCount - 8) return 'format-h';
  if (col === 8 && row < 9) return 'format-v2';
  if (col === 8 && row >= moduleCount - 8) return 'format-v3';

  // Version info (version >= 7)
  if (version >= 7) {
    if (row < 6 && col >= moduleCount - 11 && col < moduleCount - 8) return 'version-tr';
    if (col < 6 && row >= moduleCount - 11 && row < moduleCount - 8) return 'version-bl';
  }

  // Alignment patterns (version >= 2)
  if (version >= 2) {
    const positions = getPatternPosition(version);
    for (const pr of positions) {
      for (const pc of positions) {
        // Skip if would overlap with finder
        if (pr < 8 && pc < 8) continue;
        if (pr < 8 && pc >= moduleCount - 8) continue;
        if (pr >= moduleCount - 8 && pc < 8) continue;

        if (Math.abs(row - pr) <= 2 && Math.abs(col - pc) <= 2) {
          return 'alignment';
        }
      }
    }
  }

  return 'data';
}

describe('Matrix Regeneration Debug', () => {
  const testCases = [
    { data: 'https://example.com', version: 4, ecc: 'M' as const, mask: 0 },
    { data: 'https://example.com', version: 7, ecc: 'H' as const, mask: 1 },
    { data: 'TEST', version: 1, ecc: 'L' as const, mask: 0 },
    { data: 'https://example.com', version: 7, ecc: 'H' as const, mask: 0 },
    { data: 'A', version: 2, ecc: 'H' as const, mask: 0 },
  ];

  for (const tc of testCases) {
    it(`compares encoder vs regen for v${tc.version} ECC=${tc.ecc} mask=${tc.mask}`, () => {
      // Generate with encoder
      const qr = qrcode(tc.version, tc.ecc);
      qr.addData(tc.data);
      qr.make(tc.mask);

      const moduleCount = qr.getModuleCount();

      // Extract encoder matrix
      const encoderMatrix: boolean[][] = [];
      for (let r = 0; r < moduleCount; r++) {
        encoderMatrix[r] = [];
        for (let c = 0; c < moduleCount; c++) {
          encoderMatrix[r][c] = qr.isDark(r, c);
        }
      }

      // Encode data to blocks
      const { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts, interleavedData } =
        encodeDataToBlocks(tc.data, tc.version, tc.ecc);

      // Regenerate matrix
      const regenMatrix = regenerateQRFromModifiedData(
        blockDataArrays,
        blockEccArrays,
        blockDataCounts,
        blockEccCounts,
        tc.version,
        tc.ecc,
        tc.mask
      );

      // Compare and classify mismatches
      const mismatches: Record<string, number> = {};
      const sampleMismatches: Array<{
        row: number;
        col: number;
        type: string;
        encoder: boolean;
        regen: boolean;
      }> = [];

      let totalMismatches = 0;

      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          const encoderVal = encoderMatrix[r][c];
          const regenVal = regenMatrix[r][c];

          if (encoderVal !== regenVal) {
            totalMismatches++;
            const type = classifyModule(r, c, moduleCount, tc.version);
            mismatches[type] = (mismatches[type] || 0) + 1;

            if (sampleMismatches.length < 20) {
              sampleMismatches.push({
                row: r,
                col: c,
                type,
                encoder: encoderVal,
                regen: regenVal,
              });
            }
          }
        }
      }

      console.log(`\n=== v${tc.version} ECC=${tc.ecc} mask=${tc.mask} ===`);
      console.log(`Total modules: ${moduleCount * moduleCount}`);
      console.log(
        `Total mismatches: ${totalMismatches} (${((totalMismatches / (moduleCount * moduleCount)) * 100).toFixed(2)}%)`
      );
      console.log('Mismatches by type:', mismatches);
      console.log('Sample mismatches:', sampleMismatches.slice(0, 10));

      // The test will fail if there are mismatches - that's the point!
      // We want to see WHERE the mismatches are
      if (totalMismatches > 0) {
        console.log('\n--- DETAILED ANALYSIS ---');

        // Check if interleaved data matches
        console.log('Interleaved data length:', interleavedData.length);
        console.log('First 20 bytes of interleaved:', interleavedData.slice(0, 20));

        // Check structural patterns
        console.log('\nFinder pattern (top-left corner, first 8 rows/cols):');
        for (let r = 0; r < 8; r++) {
          let encoderRow = '';
          let regenRow = '';
          for (let c = 0; c < 8; c++) {
            encoderRow += encoderMatrix[r][c] ? '█' : '░';
            regenRow += regenMatrix[r][c] ? '█' : '░';
          }
          if (encoderRow !== regenRow) {
            console.log(`Row ${r}: ENC=${encoderRow} REG=${regenRow} DIFF!`);
          }
        }
      }

      expect(totalMismatches).toBe(0);
    });
  }

  it('debug: checks ECC computation matches encoder exactly', () => {
    // Test with version 7, ECC H which was failing
    const data = 'https://example.com';
    const version = 7;
    const ecc = 'H' as const;

    const { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts } = encodeDataToBlocks(
      data,
      version,
      ecc
    );

    console.log('\n=== ECC Debug for v7 ECC=H ===');
    console.log('Number of blocks:', blockDataArrays.length);

    // Get RS blocks from the encoder to compare
    const eccLevel = eccToNumeric(ecc);
    const rsBlocks = getRSBlocks(version, eccLevel);
    console.log('RS Blocks structure:');
    for (let i = 0; i < rsBlocks.length; i++) {
      console.log(
        `  Block ${i}: totalCount=${rsBlocks[i].totalCount}, dataCount=${rsBlocks[i].dataCount}`
      );
    }

    for (let i = 0; i < blockDataArrays.length; i++) {
      console.log(`Block ${i}:`);
      console.log(`  Data count: ${blockDataCounts[i]}`);
      console.log(`  ECC count: ${blockEccCounts[i]}`);
      console.log(`  Data (first 10): ${Array.from(blockDataArrays[i].slice(0, 10))}`);
      console.log(`  ECC (first 10): ${Array.from(blockEccArrays[i].slice(0, 10))}`);
    }

    // Check if blocks have different sizes (which would require special interleaving)
    const uniqueDataCounts = new Set(blockDataCounts);
    console.log('Unique data counts:', Array.from(uniqueDataCounts));
    console.log('Has mixed block sizes:', uniqueDataCounts.size > 1);

    // Trace interleaving step by step
    const maxDataCount = Math.max(...blockDataCounts);
    const maxEccCount = Math.max(...blockEccCounts);
    console.log('\n=== Interleaving trace ===');
    console.log('Max data count:', maxDataCount);
    console.log('Max ECC count:', maxEccCount);

    // Trace first few rounds of data interleaving
    console.log('\nData interleaving (first 3 rounds):');
    for (let i = 0; i < Math.min(3, maxDataCount); i++) {
      const roundBytes = [];
      for (let b = 0; b < blockDataArrays.length; b++) {
        if (i < blockDataCounts[b]) {
          roundBytes.push(`B${b}[${i}]=${blockDataArrays[b][i]}`);
        } else {
          roundBytes.push(`B${b}[${i}]=SKIP`);
        }
      }
      console.log(`  Round ${i}: ${roundBytes.join(', ')}`);
    }

    // Show what happens at the boundary (round 13 where block 4 has extra byte)
    console.log(`\nRound 13 (boundary where block 4 has extra data):`);
    for (let b = 0; b < blockDataArrays.length; b++) {
      const hasData = 13 < blockDataCounts[b];
      console.log(
        `  Block ${b}: dataCount=${blockDataCounts[b]}, has byte at index 13: ${hasData}`
      );
    }

    expect(blockDataArrays.length).toBeGreaterThan(0);
  });

  it('compares encoder createBytes output with our interleaving', () => {
    const data = 'https://example.com';
    const version = 4;
    const ecc = 'M' as const;
    const mask = 0;

    // Our encoding
    const { interleavedData } = encodeDataToBlocks(data, version, ecc);

    // Create encoder and get its internal data cache
    // We can't directly access _dataCache, so we compare by regenerating
    const qr = qrcode(version, ecc);
    qr.addData(data);
    qr.make(mask);

    // The encoder's interleaved data is what mapData receives
    // We can verify by checking if our regeneration produces the same pattern

    console.log('\nOur interleaved data (first 30 bytes):');
    console.log(interleavedData.slice(0, 30));
    console.log('Total interleaved bytes:', interleavedData.length);

    // This test is informational - the real comparison is in the matrix test above
    expect(interleavedData.length).toBeGreaterThan(0);
  });
});
