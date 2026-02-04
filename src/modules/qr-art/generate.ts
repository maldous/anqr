/**
 * QR-Art Full Generation
 *
 * This module ties together all the components to generate QR codes
 * with embedded artwork using the full RS basis manipulation algorithm.
 *
 * The process:
 * 1. Encode the base URL/data to get initial QR matrix
 * 2. Build RS basis for the version/ECC combination
 * 3. Map bits to pixels using the zigzag traversal
 * 4. Perform Gauss-Jordan elimination prioritizing important pixels
 * 5. Select which basis vectors to apply to match target image
 * 6. Generate final QR code with modified data
 */

import { createLogger } from '../../lib/logger';
import { decodeQR } from '../qr-decoder';
import { qrcode } from '../qr-encoder';
import { qrBitBuffer } from '../qr-encoder/bit-buffer';
import { qr8BitByte } from '../qr-encoder/data-modes';
import { getRSBlocks } from '../qr-encoder/rs-blocks';
import { QRErrorCorrectionLevel } from '../qr-encoder/types';
import {
  getBCHTypeInfo,
  getBCHTypeNumber,
  getLengthInBits,
  getPatternPosition,
} from '../qr-encoder/utils';
import { getMaskFunction } from '../qr-spec/masks';
import {
  buildBitPixelMap,
  type ECCLevel,
  getDataPixelIndices,
  getRSBlockInfo,
} from './bit-mapping';
import {
  applyAllSelectedVectors,
  countMatchingPixels,
  gaussJordanEliminate,
  rankPixelsByImportance,
  selectBasisVectorsForTarget,
} from './elimination';
import { mapImageToTargetsSupersampled } from './image-utils';
import {
  analyzeQRArtCapacity,
  buildFullBasis,
  calculateOptimalVersionAndSuffix,
  calculateProtectedBitsPerBlock,
  clearBasisCache,
  computeECC,
  getContentBitCount,
  getHeaderBitCount,
  getMaxSuffixLength,
} from './rs-basis';

/**
 * Helper to compare two Uint8Arrays
 */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const log = createLogger('QART');

/**
 * Extract format info bits from a QR matrix
 * Format info is stored in two places for redundancy
 */
function extractFormatInfo(matrix: boolean[][]): {
  vertical: number;
  horizontal: number;
  match: boolean;
} {
  const moduleCount = matrix.length;
  let vertical = 0;
  let horizontal = 0;

  // Extract vertical format info (left side of top-left finder)
  for (let i = 0; i < 15; i++) {
    let row: number;
    if (i < 6) {
      row = i;
    } else if (i < 8) {
      row = i + 1;
    } else {
      row = moduleCount - 15 + i;
    }
    if (matrix[row]?.[8]) {
      vertical |= 1 << i;
    }
  }

  // Extract horizontal format info (top of top-left finder)
  for (let i = 0; i < 15; i++) {
    let col: number;
    if (i < 8) {
      col = moduleCount - i - 1;
    } else if (i < 9) {
      col = 15 - i - 1 + 1;
    } else {
      col = 15 - i - 1;
    }
    if (matrix[8]?.[col]) {
      horizontal |= 1 << i;
    }
  }

  return {
    vertical,
    horizontal,
    match: vertical === horizontal,
  };
}

/**
 * Validate timing patterns are intact (alternating modules on row 6 and col 6)
 */
function validateTimingPatterns(matrix: boolean[][]): {
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

/**
 * Validate finder patterns are intact
 */
function validateFinderPatterns(matrix: boolean[][]): {
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  allValid: boolean;
  errors: string[];
} {
  const moduleCount = matrix.length;
  const errors: string[] = [];

  // Expected finder pattern (7x7)
  const expected = [
    [true, true, true, true, true, true, true],
    [true, false, false, false, false, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, false, false, false, false, true],
    [true, true, true, true, true, true, true],
  ];

  const checkFinder = (startRow: number, startCol: number, name: string): boolean => {
    let valid = true;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const actual = matrix[startRow + r]?.[startCol + c] ?? false;
        if (actual !== expected[r][c]) {
          valid = false;
          errors.push(`${name} mismatch at (${r},${c}): expected ${expected[r][c]}, got ${actual}`);
        }
      }
    }
    return valid;
  };

  const topLeft = checkFinder(0, 0, 'TopLeft');
  const topRight = checkFinder(0, moduleCount - 7, 'TopRight');
  const bottomLeft = checkFinder(moduleCount - 7, 0, 'BottomLeft');

  return {
    topLeft,
    topRight,
    bottomLeft,
    allValid: topLeft && topRight && bottomLeft,
    errors: errors.slice(0, 10), // Limit to first 10 errors
  };
}

/**
 * Scan a boolean matrix using jsQR to verify it's a valid, scannable QR code.
 * Returns the decoded data if successful, or an error message if not.
 * Tries multiple scale factors and decoder settings for robustness.
 */
function scanMatrixWithJsQR(matrix: boolean[][]): {
  success: boolean;
  data?: string;
  error?: string;
  attempts?: number;
} {
  const moduleCount = matrix.length;
  if (moduleCount === 0) {
    return { success: false, error: 'Empty matrix' };
  }

  // Try multiple configurations for robustness
  const configs = [
    { scale: 4, quietZone: 4, invert: false },
    { scale: 8, quietZone: 8, invert: false },
    { scale: 2, quietZone: 4, invert: false },
    { scale: 4, quietZone: 4, invert: true },
  ];

  let lastError = '';
  let attempts = 0;

  for (const config of configs) {
    attempts++;
    const { scale, quietZone, invert } = config;
    const size = (moduleCount + quietZone * 2) * scale;

    // Create ImageData manually (white background)
    const data = new Uint8ClampedArray(size * size * 4);

    // Fill with white (or black if inverted)
    const bgColor = invert ? 0 : 255;
    const fgColor = invert ? 255 : 0;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = bgColor;
      data[i + 1] = bgColor;
      data[i + 2] = bgColor;
      data[i + 3] = 255;
    }

    // Draw the QR modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const isDark = matrix[row]?.[col] ?? false;
        if (isDark) {
          const startX = (col + quietZone) * scale;
          const startY = (row + quietZone) * scale;

          for (let py = 0; py < scale; py++) {
            for (let px = 0; px < scale; px++) {
              const idx = ((startY + py) * size + (startX + px)) * 4;
              data[idx] = fgColor;
              data[idx + 1] = fgColor;
              data[idx + 2] = fgColor;
            }
          }
        }
      }
    }

    try {
      const imageData = new ImageData(data, size, size);
      const result = decodeQR(imageData, {
        inversionAttempts: 'attemptBoth',
      });

      if (result) {
        return { success: true, data: result.data, attempts };
      }
      lastError = `Config ${attempts}: Decoder returned null`;
    } catch (err) {
      lastError = `Config ${attempts}: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return {
    success: false,
    error: `All ${attempts} scan attempts failed. Last: ${lastError}`,
    attempts,
  };
}

/**
 * Configuration for full QR-Art generation
 */
export interface FullQArtConfig {
  /** The data to encode (URL or text) */
  data: string;
  /** Target image as ImageData, HTMLCanvasElement, or OffscreenCanvas */
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  /** QR version (1-40), 0 for auto */
  version: number;
  /** Error correction level */
  ecc: ECCLevel;
  /** Mask pattern (0-7), -1 for auto */
  maskPattern: number;
  /** Progress callback */
  onProgress?: (stage: string, percent: number) => void;
  /**
   * Optional suffix to append to the data.
   * This suffix can be freely modified by QR-Art without affecting
   * the main content. 
   * 
   * If not provided and autoSuffix is true (default), a `#xxx...` fragment
   * identifier suffix will be auto-generated to fill QR capacity.
   * Fragment identifiers are client-side only, so URLs still work correctly.
   * 
   * The suffix bits become controllable for image embedding.
   * Longer suffixes = more controllable pixels = better image quality.
   */
  suffix?: string;
  /**
   * Whether to auto-generate a suffix when none is provided (default: true).
   * 
   * When true: Automatically adds `#xxx...` fragment suffix to fill QR capacity.
   * When false: Only padding bits are controllable (very limited).
   * 
   * The auto-generated suffix uses URL fragment identifier (`#`) which:
   * - Never gets sent to the server (client-side only)
   * - Doesn't affect URL redirects or destination
   * - Maximizes controllable bits for better image quality
   */
  autoSuffix?: boolean;
  /**
   * Whether to protect all content bits (default: true).
   * 
   * When true: Only suffix and padding bits can be modified. Original message is preserved.
   * When false: Legacy mode - all data bits can be modified, corrupting message.
   * 
   * Set to false only if you want maximum image control and don't care
   * about the decoded message (e.g., the QR is just for visual effect).
   */
  protectContent?: boolean;
}

/**
 * Result of full QR-Art generation
 */
export interface FullQArtResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** The final QR matrix (true = dark) */
  matrix: boolean[][];
  /** Module count (size of matrix) */
  moduleCount: number;
  /** Actual version used */
  version: number;
  /** Actual mask pattern used */
  maskPattern: number;
  /** Number of pixels matching target */
  matchingPixels: number;
  /** Total controllable pixels */
  totalControllable: number;
  /** Match percentage */
  matchPercentage: number;
  /** The data that was encoded */
  encodedData: string;
}

/**
 * Convert a boolean matrix to a QR-like object with isDark method
 */
export function matrixToQRLike(matrix: boolean[][]): {
  isDark: (row: number, col: number) => boolean;
  getModuleCount: () => number;
} {
  const moduleCount = matrix.length;
  return {
    isDark: (row: number, col: number) => {
      if (row < 0 || row >= moduleCount || col < 0 || col >= moduleCount) {
        return false;
      }
      return matrix[row]?.[col] ?? false;
    },
    getModuleCount: () => moduleCount,
  };
}

/**
 * Result of base QR generation with data extraction
 */
interface BaseQRResult {
  matrix: boolean[][];
  actualVersion: number;
  actualMask: number;
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
}

/**
 * Generate a QR matrix from the encoder and extract per-block data
 *
 * IMPORTANT: We use regenerateQRFromModifiedData to create the base matrix
 * instead of extracting from qrcode().make(). This ensures the base matrix
 * and final matrix are generated by the SAME code path, making predictions
 * match actual results exactly.
 */
function generateBaseQR(
  data: string,
  version: number,
  ecc: ECCLevel,
  maskPattern: number
): BaseQRResult {
  // First, use the encoder to determine the actual version if auto-detecting
  const qr = qrcode(version, ecc);
  qr.addData(data);
  const useMask = maskPattern >= 0 ? maskPattern : undefined;
  qr.make(useMask);

  const moduleCount = qr.getModuleCount();
  const actualVersion = version > 0 ? version : Math.ceil((moduleCount - 17) / 4);
  const actualMask = maskPattern >= 0 ? maskPattern : 0;

  // Get the actual encoded data bytes and compute ECC using the encoder's bit buffer
  // This is critical - we need the real data bytes AND their ECC for RS linearity
  const { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts } = encodeDataToBytes(
    data,
    actualVersion,
    ecc
  );

  // DEBUG: Verify that computeECC produces the same ECC as the encoder
  for (let i = 0; i < blockDataArrays.length; i++) {
    const testEcc = computeECC(blockDataArrays[i], blockEccCounts[i]);
    const encoderEcc = blockEccArrays[i];
    if (!arraysEqual(testEcc, encoderEcc)) {
      log.error('ECC MISMATCH - computeECC differs from encoder!', {
        blockIndex: i,
        dataCount: blockDataCounts[i],
        eccCount: blockEccCounts[i],
        computeEccFirst5: Array.from(testEcc.slice(0, 5)),
        encoderEccFirst5: Array.from(encoderEcc.slice(0, 5)),
      });
    } else {
      log.debug('ECC verification passed for block', { blockIndex: i });
    }
  }

  // CRITICAL: Generate the base matrix using the SAME function that generates
  // the final matrix. This ensures prediction and actual match exactly.
  // Previously we extracted from qr.isDark() which uses a different code path.
  const matrix = regenerateQRFromModifiedData(
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask
  );

  // DEBUG: Compare regenerated matrix with encoder's matrix to find discrepancies
  const debugQr = qrcode(actualVersion, ecc);
  debugQr.addData(data);
  debugQr.make(actualMask);

  let mismatchCount = 0;
  const maxMismatches = 10;
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      const regenValue = matrix[r][c];
      const encoderValue = debugQr.isDark(r, c);
      if (regenValue !== encoderValue) {
        if (mismatchCount < maxMismatches) {
          log.warn('Matrix mismatch detected', {
            row: r,
            col: c,
            regenerated: regenValue,
            encoder: encoderValue,
          });
        }
        mismatchCount++;
      }
    }
  }

  if (mismatchCount > 0) {
    log.error('Total matrix mismatches', {
      mismatchCount,
      moduleCount,
      totalModules: moduleCount * moduleCount,
      mismatchPercent: `${((mismatchCount / (moduleCount * moduleCount)) * 100).toFixed(2)}%`,
    });
  } else {
    log.info('Matrix validation passed - regenerated matrix matches encoder exactly');
  }

  return {
    matrix,
    actualVersion,
    actualMask,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
  };
}

/**
 * Convert ECC level character to numeric value for encoder functions
 */
function eccToNumericForEncoder(ecc: ECCLevel): number {
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
 * Encode a string to data bytes using the QR encoder's bit buffer
 * This gives us the actual encoded bytes that would go into the QR code
 * Also computes and returns the ECC bytes for each block (needed for RS linearity)
 */
function encodeDataToBytes(
  data: string,
  version: number,
  ecc: ECCLevel
): {
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
} {
  const eccLevel = eccToNumericForEncoder(ecc);
  const rsBlocks = getRSBlocks(version, eccLevel);

  // Create bit buffer and encode the data
  const buffer = qrBitBuffer();
  const segment = qr8BitByte(data);

  // Write mode indicator (4 bits) + character count + data
  buffer.put(segment.getMode(), 4);
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  segment.write(buffer);

  // Calculate total data capacity
  let totalDataCount = 0;
  for (const block of rsBlocks) {
    totalDataCount += block.dataCount;
  }

  // Add terminator if there's room
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
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

  // Extract bytes for each block and compute ECC
  const bufferBytes = buffer.getBuffer();
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

    // Compute ECC for this block's data (needed for RS linearity preservation)
    const eccBytes = computeECC(blockData, eccCount);
    blockEccArrays.push(eccBytes);

    offset += block.dataCount;
  }

  return { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts };
}

/**
 * Regenerate a QR code from modified per-block data and ECC
 * This directly constructs a valid QR matrix with all structural patterns
 * and the modified data codewords placed via zigzag traversal.
 *
 * IMPORTANT: The ECC arrays must be pre-computed to preserve RS linearity.
 * When XORing basis vectors, we XOR both data AND ECC, so the combined
 * result remains a valid RS codeword. We must NOT recompute ECC here.
 */
function regenerateQRFromModifiedData(
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
    modules[row] = new Array(moduleCount).fill(null);
  }

  // 1. Draw finder patterns (7x7 at three corners)
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

  setupFinderPattern(0, 0); // Top-left
  setupFinderPattern(moduleCount - 7, 0); // Bottom-left
  setupFinderPattern(0, moduleCount - 7); // Top-right

  // 2. Draw timing patterns (alternating dark/light at row 6 and col 6)
  for (let i = 8; i < moduleCount - 8; i++) {
    const dark = i % 2 === 0;
    if (modules[6][i] === null) modules[6][i] = dark; // Horizontal
    if (modules[i][6] === null) modules[i][6] = dark; // Vertical
  }

  // 3. Draw alignment patterns (5x5, version >= 2)
  if (version >= 2) {
    const positions = getPatternPosition(version);
    for (const row of positions) {
      for (const col of positions) {
        // Skip if overlapping with finder patterns
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

  // 4. Reserve format information areas (will be filled later)
  // These are around the top-left finder and extend to other finders
  const eccLevel = eccToNumericForEncoder(ecc);
  const formatData = (eccLevel << 3) | maskPattern;
  const formatBits = getBCHTypeInfo(formatData);

  // Draw format info (vertical part near top-left finder)
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

  // 5. Draw version information (version >= 7)
  if (version >= 7) {
    const versionBits = getBCHTypeNumber(version);

    for (let i = 0; i < 18; i++) {
      const mod = ((versionBits >> i) & 1) === 1;
      // Bottom-left of top-right finder
      modules[Math.floor(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
      // Right of bottom-left finder
      modules[(i % 3) + moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  // 6. Combine data and pre-computed ECC for each block (DO NOT recompute ECC!)
  // RS codes are linear: XOR of valid codewords is valid. Since we XORed both
  // data and ECC portions of basis vectors, the result is already valid.
  const blockCodewords: Uint8Array[] = [];
  for (let i = 0; i < blockDataArrays.length; i++) {
    const data = blockDataArrays[i];
    const eccBytes = blockEccArrays[i]; // Use pre-computed/XORed ECC

    const codeword = new Uint8Array(data.length + eccBytes.length);
    codeword.set(data, 0);
    codeword.set(eccBytes, data.length);
    blockCodewords.push(codeword);
  }

  // Interleave codewords (data first, then ECC)
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

  // 7. Place data using zigzag traversal with mask
  const maskFunc = getMaskFunction(maskPattern);
  let inc = -1;
  let row = moduleCount - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = moduleCount - 1; col > 0; col -= 2) {
    // Skip timing column
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;

        // Only place data in empty modules
        if (modules[row][currentCol] === null) {
          let dark = false;

          if (byteIndex < interleaved.length) {
            dark = ((interleaved[byteIndex] >>> bitIndex) & 1) === 1;
          }

          // Apply mask
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

/**
 * Generate a full QR-Art code using RS basis manipulation
 *
 * This implements the complete Russ Cox QArt algorithm:
 * 1. Encode base data to get initial QR
 * 2. Build RS basis vectors for all data bits
 * 3. Map bits to pixels via zigzag traversal
 * 4. Gauss-Jordan elimination to assign pixel control
 * 5. Select vectors to flip pixels toward target
 * 6. Regenerate QR with modified data
 */
export async function generateFullQArt(config: FullQArtConfig): Promise<FullQArtResult> {
  const { 
    data, 
    targetImage, 
    version, 
    ecc, 
    maskPattern, 
    onProgress,
    suffix: providedSuffix,
    autoSuffix = true,
    protectContent = true,
  } = config;

  // Determine the suffix to use
  // If no suffix provided and autoSuffix is enabled, generate a `#xxx...` fragment suffix
  let suffix = providedSuffix ?? '';
  let autoGeneratedSuffix = false;
  let recommendedVersion = version; // May be upgraded for better QR-Art control
  
  if (!suffix && autoSuffix) {
    // Calculate optimal version and suffix length to achieve good QR-Art control
    // This will upgrade the version to a larger one if needed to achieve minimum control threshold
    // IMPORTANT: The function uses FULL suffix capacity of selected version for maximum control
    const optimalConfig = calculateOptimalVersionAndSuffix(
      version, // minVersion (0 = auto, or user-specified)
      ecc,
      data.length,
      50 // Minimum 50% control threshold - version will be upgraded if below this
    );
    
    if (optimalConfig.suffixLength > 1) {
      // Generate a fragment suffix: #xxxx...
      // Use alphanumeric characters for maximum compatibility
      // IMPORTANT: Use the FULL suffix length calculated - this fills the QR capacity
      const suffixChars = optimalConfig.suffixLength - 1; // -1 for the '#' character
      suffix = '#' + generateRandomSuffix(suffixChars);
      autoGeneratedSuffix = true;
      recommendedVersion = optimalConfig.version;
      
      log.info('Auto-generated fragment suffix for QR-Art (FULL capacity)', {
        originalDataLength: data.length,
        suffixLength: suffix.length,
        totalDataLength: data.length + suffix.length,
        originalVersion: optimalConfig.originalVersion,
        selectedVersion: optimalConfig.version,
        versionUpgraded: optimalConfig.versionUpgraded,
        expectedControlPercent: `${optimalConfig.expectedControlPercent.toFixed(1)}%`,
        totalCapacity: optimalConfig.totalCapacity,
        capacityUsed: `${data.length + suffix.length + 3} / ${optimalConfig.totalCapacity} bytes`,
        reason: 'Using FULL suffix capacity for maximum controllable bits',
      });
      
      if (optimalConfig.versionUpgraded) {
        log.info('QR version upgraded for better QR-Art quality', {
          from: optimalConfig.originalVersion,
          to: optimalConfig.version,
          reason: 'Previous version did not meet minimum control threshold with full capacity',
          newCapacity: `${optimalConfig.totalCapacity} bytes`,
        });
      }
    } else {
      log.warn('Cannot auto-generate suffix - QR capacity too limited', {
        dataLength: data.length,
        version: optimalConfig.originalVersion,
        maxSuffixLen: optimalConfig.suffixLength,
        suggestion: 'Use a larger QR version or shorter data',
      });
    }
  }

  // Combine data with suffix
  // The suffix becomes the controllable region for QR-Art manipulation
  const fullData = suffix ? data + suffix : data;
  
  // Use recommended version if auto-suffix upgraded it, otherwise use user-specified version
  const versionToUse = autoGeneratedSuffix ? recommendedVersion : version;

  try {
    onProgress?.('Encoding base data', 0);

    // CRITICAL: Clear basis cache to ensure we're using the latest code with content protection
    clearBasisCache();
    log.debug('Cleared basis cache for fresh content-protected vectors');

    // Step 1: Generate base QR to determine version, get initial matrix, and extract per-block data/ECC
    // Use the recommended version (which may have been upgraded for better QR-Art control)
    const baseResult = generateBaseQR(fullData, versionToUse, ecc, maskPattern);
    const {
      matrix: baseMatrix,
      actualVersion,
      actualMask,
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
    } = baseResult;
    const moduleCount = baseMatrix.length;

    log.info('Base QR generated', {
      version: actualVersion,
      moduleCount,
      maskPattern: actualMask,
      ecc,
      originalDataLength: data.length,
      fullDataLength: fullData.length,
      hasSuffix: suffix.length > 0,
      suffixLength: suffix.length,
      autoGeneratedSuffix,
      suffix: suffix.length > 20 ? suffix.slice(0, 20) + '...' : suffix,
    });

    onProgress?.('Building RS basis', 10);

    // Step 2: Build RS basis with content protection
    // IMPORTANT: We protect only the ORIGINAL data, not the suffix!
    // This makes suffix bits controllable for QR-Art manipulation.
    // When protectContent is true: protect original data only (suffix is controllable)
    // When false (legacy mode): only protect header bits (all data is controllable but corrupted)
    const dataLengthForProtection = protectContent ? data.length : undefined;
    const basis = buildFullBasis(actualVersion, ecc, dataLengthForProtection);
    
    if (autoGeneratedSuffix) {
      log.info('Content protection configured', {
        originalDataLength: data.length,
        suffixLength: suffix.length,
        fullDataLength: fullData.length,
        protectedBits: dataLengthForProtection ? getContentBitCount(actualVersion, dataLengthForProtection) : getHeaderBitCount(actualVersion),
        protectionMode: protectContent ? 'original-data-only' : 'header-only',
        suffixControllable: true,
      });
    }

    // Analyze capacity and log comprehensive information
    // Note: Use original data.length for protection analysis (suffix is controllable)
    const capacityInfo = analyzeQRArtCapacity(actualVersion, ecc, data.length);
    
    // Calculate actual controllable bits including suffix
    const actualControllableBits = basis.vectors.length;
    const actualControlPercentage = (actualControllableBits / capacityInfo.totalDataBits) * 100;
    
    log.info('QR-Art capacity analysis', {
      totalDataBits: capacityInfo.totalDataBits,
      protectedBits: capacityInfo.protectedBits,
      controllableBits: actualControllableBits,
      controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
      protectionMode: protectContent ? 'original-data-only' : 'header-only',
      breakdown: {
        ...capacityInfo.breakdown,
        suffixBits: suffix.length * 8,
      },
      vectorsCreated: basis.vectors.length,
      autoGeneratedSuffix,
    });

    // Warn if control is very limited
    if (basis.vectors.length === 0) {
      log.warn('ZERO controllable vectors! QR-Art cannot modify any pixels.', {
        suggestion: 'Enable autoSuffix (default) or add a manual suffix.',
        example: `suffix: "#${generateRandomSuffix(20)}"`,
        originalDataLength: data.length,
        fullDataLength: fullData.length,
        autoSuffixEnabled: autoSuffix,
      });
      
      // Return the base matrix unchanged - it's a valid QR but without art
      return {
        success: true,
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: fullData,
      };
    } else if (actualControlPercentage < 20) {
      log.warn('Limited QR-Art control. Image quality may be reduced.', {
        controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
        controllableVectors: basis.vectors.length,
        suggestion: 'Use a larger QR version for better results.',
      });
    }

    // For logging compatibility, keep some of the old variable names
    const headerBitCount = getHeaderBitCount(actualVersion);

    onProgress?.('Mapping bits to pixels', 20);

    // Step 3: Build bit-to-pixel mapping
    const mappings = buildBitPixelMap(actualVersion, ecc, actualMask);

    log.debug('Bit-pixel mapping built', {
      totalMappings: mappings.length,
    });

    onProgress?.('Processing target image', 30);

    // Step 4: Map target image to module targets
    const { targets, importance } = mapImageToTargetsSupersampled(targetImage, moduleCount);

    // Get set of data pixels
    const dataPixelIndices = getDataPixelIndices(actualVersion);
    const dataPixels = new Set(dataPixelIndices);

    onProgress?.('Ranking pixels by importance', 40);

    // Step 5: Rank pixels by importance
    const pixelOrder = rankPixelsByImportance(targets, importance, moduleCount, dataPixels);

    log.debug('Pixels ranked', {
      totalDataPixels: pixelOrder.length,
    });

    onProgress?.('Performing Gauss-Jordan elimination', 50);

    // Step 6: Gauss-Jordan elimination
    const elimination = gaussJordanEliminate(
      basis.vectors,
      mappings,
      moduleCount,
      actualMask,
      pixelOrder
    );

    log.info('Gauss-Jordan elimination complete', {
      controllablePixels: elimination.controllablePixels,
      totalDataPixels: pixelOrder.length,
      controlPercentage: `${((elimination.controllablePixels / pixelOrder.length) * 100).toFixed(1)}%`,
    });

    onProgress?.('Selecting basis vectors', 70);

    // Step 7: Select which vectors to apply (per-block)
    const blockSelections = selectBasisVectorsForTarget(
      elimination,
      targets,
      baseMatrix,
      moduleCount
    );

    const totalSelected = blockSelections.reduce(
      (sum, s) => sum + s.selectedVectorIndices.length,
      0
    );
    log.debug('Vectors selected', {
      selectedCount: totalSelected,
      controllable: elimination.controllablePixels,
      blocksWithSelections: blockSelections.filter((s) => s.selectedVectorIndices.length > 0)
        .length,
    });

    onProgress?.('Counting predicted matches', 75);

    // Step 8: Count predicted matching pixels (before re-encoding)
    // Pass mappings so we can accurately track ALL pixels affected by selected vectors
    const { matching: predictedMatching, total } = countMatchingPixels(
      baseMatrix,
      elimination,
      blockSelections,
      targets,
      moduleCount,
      dataPixels,
      mappings
    );

    const predictedMatchPercentage = total > 0 ? (predictedMatching / total) * 100 : 0;

    log.info('Predicted QR-Art result', {
      predictedMatchingPixels: predictedMatching,
      totalControllable: total,
      predictedMatchPercentage: `${predictedMatchPercentage.toFixed(1)}%`,
    });

    onProgress?.('Modifying data bytes', 80);

    // Step 9: Clone and modify the per-block data AND ECC arrays
    // We must XOR both data and ECC to preserve RS linearity
    const modifiedBlockData = blockDataArrays.map((arr) => new Uint8Array(arr));
    const modifiedBlockEcc = blockEccArrays.map((arr) => new Uint8Array(arr));
    applyAllSelectedVectors(
      modifiedBlockData,
      modifiedBlockEcc,
      elimination,
      blockSelections,
      blockDataCounts
    );

    // DEBUG: Verify RS linearity is preserved - modified data+ECC should still be valid codewords
    // If computeECC(modifiedData) !== modifiedEcc, then RS linearity is broken
    let rsLinearityOk = true;
    for (let i = 0; i < modifiedBlockData.length; i++) {
      const expectedEcc = computeECC(modifiedBlockData[i], blockEccCounts[i]);
      const actualEcc = modifiedBlockEcc[i];
      if (!arraysEqual(expectedEcc, actualEcc)) {
        rsLinearityOk = false;
        log.error('RS LINEARITY BROKEN - modified codeword is invalid!', {
          blockIndex: i,
          dataCount: blockDataCounts[i],
          eccCount: blockEccCounts[i],
          expectedEccFirst5: Array.from(expectedEcc.slice(0, 5)),
          actualEccFirst5: Array.from(actualEcc.slice(0, 5)),
          modifiedDataFirst5: Array.from(modifiedBlockData[i].slice(0, 5)),
        });
      } else {
        log.debug('RS linearity verified for modified block', { blockIndex: i });
      }
    }

    if (rsLinearityOk) {
      log.info('RS linearity preserved - all modified codewords are valid');
    } else {
      log.error('RS LINEARITY CHECK FAILED - QR code will likely not scan!');
    }

    // DEBUG: Verify protected bits are unchanged in ALL blocks
    // When protectContent is true, we protect header + ORIGINAL data + terminator (not suffix!)
    // When false (legacy mode), we only verify header bits
    // 
    // IMPORTANT: Protection is calculated based on INTERLEAVED byte positions!
    // The interleaved stream is what gets placed in the QR matrix:
    //   Interleaved[0] = Block0[0], Interleaved[1] = Block1[0], etc.
    // So protecting the first N bytes means protecting bytes across ALL blocks.
    const rsBlockInfo = getRSBlockInfo(actualVersion, ecc);
    const protectedBitCount = protectContent 
      ? Math.ceil(getContentBitCount(actualVersion, data.length) / 8) * 8  // data.length, NOT fullData.length!
      : headerBitCount;
    const protectedBitsPerBlock = calculateProtectedBitsPerBlock(rsBlockInfo, protectedBitCount);

    let allProtectedBitsUnchanged = true;
    let modifiedProtectedBitCount = 0;
    
    for (let blockIdx = 0; blockIdx < blockDataArrays.length; blockIdx++) {
      const protectedBitsInBlock = protectedBitsPerBlock[blockIdx];
      if (protectedBitsInBlock === 0) continue;

      // Check each protected bit individually
      const originalData = blockDataArrays[blockIdx];
      const modifiedData = modifiedBlockData[blockIdx];

      for (let bitIdx = 0; bitIdx < protectedBitsInBlock; bitIdx++) {
        const byteIdx = Math.floor(bitIdx / 8);
        const bitInByte = 7 - (bitIdx % 8); // MSB first

        const originalBit = (originalData[byteIdx] >> bitInByte) & 1;
        const modifiedBit = (modifiedData[byteIdx] >> bitInByte) & 1;

        if (originalBit !== modifiedBit) {
          allProtectedBitsUnchanged = false;
          modifiedProtectedBitCount++;
          if (modifiedProtectedBitCount <= 5) { // Limit error spam
            log.error('PROTECTED BIT MODIFIED - content may be corrupted!', {
              blockIndex: blockIdx,
              localBitIndex: bitIdx,
              byteIndex: byteIdx,
              bitInByte,
              originalBit,
              modifiedBit,
              isHeaderBit: bitIdx < (blockIdx === 0 ? headerBitCount : 0),
            });
          }
        }
      }
    }

    log.info('Protected bits verification', {
      protectionMode: protectContent ? 'original-data-only' : 'header-only',
      protectedBitCount,
      protectedBitsPerBlock,
      allProtectedBitsUnchanged,
      modifiedProtectedBitCount,
      originalDataProtected: data.length,
      suffixControllable: suffix.length,
    });

    if (!allProtectedBitsUnchanged) {
      log.error('PROTECTED BITS MODIFIED - original content may be corrupted!', {
        modifiedCount: modifiedProtectedBitCount,
        protectedBitCount,
        protectionMode: protectContent ? 'original-data-only' : 'header-only',
      });
    }

    onProgress?.('Re-encoding QR code', 85);

    // DEBUG: Zero-modification test - verify that regenerating with UNMODIFIED data still scans
    const zeroModMatrix = regenerateQRFromModifiedData(
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
      actualVersion,
      ecc,
      actualMask
    );
    const zeroModScan = scanMatrixWithJsQR(zeroModMatrix);
    if (!zeroModScan.success) {
      log.error('ZERO-MODIFICATION TEST FAILED - regeneration itself is broken!', {
        error: zeroModScan.error,
      });
    } else {
      log.debug('Zero-modification test PASSED', {
        decodedData: zeroModScan.data,
        dataMatches: zeroModScan.data === data,
      });
    }

    // Log modification summary per block
    for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
      let bytesChanged = 0;
      let bitsChanged = 0;
      const origData = blockDataArrays[blockIdx];
      const modData = modifiedBlockData[blockIdx];
      const origEcc = blockEccArrays[blockIdx];
      const modEcc = modifiedBlockEcc[blockIdx];
      
      for (let i = 0; i < origData.length; i++) {
        if (origData[i] !== modData[i]) {
          bytesChanged++;
          // Count bits changed
          let diff = origData[i] ^ modData[i];
          while (diff) {
            bitsChanged += diff & 1;
            diff >>>= 1;
          }
        }
      }
      
      let eccBytesChanged = 0;
      for (let i = 0; i < origEcc.length; i++) {
        if (origEcc[i] !== modEcc[i]) {
          eccBytesChanged++;
        }
      }
      
      if (bytesChanged > 0 || eccBytesChanged > 0) {
        log.debug('Block modification summary', {
          blockIndex: blockIdx,
          dataBytesChanged: bytesChanged,
          dataBitsChanged: bitsChanged,
          eccBytesChanged,
          totalDataBytes: origData.length,
          totalEccBytes: origEcc.length,
        });
      }
    }

    // Step 10: Regenerate QR with modified data AND ECC to get a valid, scannable code
    // We pass the pre-XORed ECC - do NOT recompute it (that would break RS linearity)
    const finalMatrix = regenerateQRFromModifiedData(
      modifiedBlockData,
      modifiedBlockEcc,
      blockDataCounts,
      blockEccCounts,
      actualVersion,
      ecc,
      actualMask
    );

    // DEBUG: Log differences between base matrix and final matrix
    let diffCount = 0;
    let structuralDiffCount = 0;
    let dataDiffCount = 0;
    const sampleDiffs: Array<{ row: number; col: number; base: boolean; final: boolean; isStructural: boolean }> = [];
    
    // Build set of structural positions for quick lookup
    const structuralPositions = new Set<string>();
    // Finder patterns (7x7 at three corners + separators)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        structuralPositions.add(`${r},${c}`); // Top-left
        structuralPositions.add(`${r},${moduleCount - 8 + c}`); // Top-right
        structuralPositions.add(`${moduleCount - 8 + r},${c}`); // Bottom-left
      }
    }
    // Timing patterns
    for (let i = 0; i < moduleCount; i++) {
      structuralPositions.add(`6,${i}`);
      structuralPositions.add(`${i},6`);
    }
    // Format info
    for (let i = 0; i < 9; i++) {
      structuralPositions.add(`${i},8`);
      structuralPositions.add(`8,${i}`);
      structuralPositions.add(`${moduleCount - 8 + i},8`);
      structuralPositions.add(`8,${moduleCount - 8 + i}`);
    }
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const baseVal = baseMatrix[row]?.[col] ?? false;
        const finalVal = finalMatrix[row]?.[col] ?? false;
        if (baseVal !== finalVal) {
          diffCount++;
          const isStructural = structuralPositions.has(`${row},${col}`);
          if (isStructural) {
            structuralDiffCount++;
          } else {
            dataDiffCount++;
          }
          if (sampleDiffs.length < 10) {
            sampleDiffs.push({ row, col, base: baseVal, final: finalVal, isStructural });
          }
        }
      }
    }

    log.info('Matrix diff between base and final', {
      diffCount,
      structuralDiffCount,
      dataDiffCount,
      moduleCount,
      totalModules: moduleCount * moduleCount,
      diffPercent: `${((diffCount / (moduleCount * moduleCount)) * 100).toFixed(2)}%`,
      sampleDiffs: sampleDiffs.slice(0, 5),
    });

    // CRITICAL: If structural modules differ, that's a major bug
    if (structuralDiffCount > 0) {
      log.error('CRITICAL: Structural patterns modified!', {
        structuralDiffCount,
        structuralDiffs: sampleDiffs.filter(d => d.isStructural),
      });
    }

    // Comprehensive finder pattern validation
    const finderValidation = validateFinderPatterns(finalMatrix);
    if (!finderValidation.allValid) {
      log.error('FINDER PATTERNS CORRUPTED', {
        topLeft: finderValidation.topLeft,
        topRight: finderValidation.topRight,
        bottomLeft: finderValidation.bottomLeft,
        errors: finderValidation.errors,
      });
    } else {
      log.debug('Finder patterns validated OK');
    }

    // Timing pattern validation
    const timingValidation = validateTimingPatterns(finalMatrix);
    if (!timingValidation.allValid) {
      log.error('TIMING PATTERNS CORRUPTED', {
        horizontal: timingValidation.horizontal,
        vertical: timingValidation.vertical,
        errors: timingValidation.errors,
      });
    } else {
      log.debug('Timing patterns validated OK');
    }

    // Compare format info between base and final
    const baseFormatInfo = extractFormatInfo(baseMatrix);
    const finalFormatInfo = extractFormatInfo(finalMatrix);
    
    log.info('Format info comparison', {
      base: {
        vertical: baseFormatInfo.vertical.toString(2).padStart(15, '0'),
        horizontal: baseFormatInfo.horizontal.toString(2).padStart(15, '0'),
        match: baseFormatInfo.match,
      },
      final: {
        vertical: finalFormatInfo.vertical.toString(2).padStart(15, '0'),
        horizontal: finalFormatInfo.horizontal.toString(2).padStart(15, '0'),
        match: finalFormatInfo.match,
      },
      formatInfoUnchanged: baseFormatInfo.vertical === finalFormatInfo.vertical && 
                           baseFormatInfo.horizontal === finalFormatInfo.horizontal,
    });

    if (baseFormatInfo.vertical !== finalFormatInfo.vertical || 
        baseFormatInfo.horizontal !== finalFormatInfo.horizontal) {
      log.error('FORMAT INFO CHANGED - This will break scanning!');
    }

    // DEBUG: Scan the final matrix to verify it's actually scannable
    const scanResult = scanMatrixWithJsQR(finalMatrix);
    if (scanResult.success) {
      // Check if decoded data matches - with suffix, the suffix portion may change
      const decodedStartsWithOriginal = scanResult.data?.startsWith(data);
      const fullMatch = scanResult.data === fullData;
      
      if (fullMatch) {
        log.info('QR-Art matrix scan validation PASSED - exact match', {
          decodedData: scanResult.data,
          expectedData: fullData,
          scanAttempts: scanResult.attempts,
        });
      } else if (decodedStartsWithOriginal) {
        // Suffix was modified (expected behavior!) - original content preserved
        log.info('QR-Art matrix scan validation PASSED - original content preserved', {
          originalData: data,
          decodedPrefix: scanResult.data?.slice(0, data.length),
          originalPreserved: true,
          suffixModified: true,
          originalSuffix: suffix,
          decodedSuffix: scanResult.data?.slice(data.length),
          scanAttempts: scanResult.attempts,
        });
      } else {
        // Original content was corrupted - this is a bug!
        log.error('DECODED DATA MISMATCH - original content corrupted!', {
          expected: data,
          actual: scanResult.data?.slice(0, data.length),
          expectedFull: fullData,
          actualFull: scanResult.data,
          expectedLength: fullData.length,
          actualLength: scanResult.data?.length,
        });
      }
    } else {
      log.error('QR-Art matrix scan validation FAILED - matrix does not scan!', {
        error: scanResult.error,
        expectedData: fullData,
        scanAttempts: scanResult.attempts,
        finderPatternsOK: finderValidation.allValid,
        timingPatternsOK: timingValidation.allValid,
        formatInfoOK: baseFormatInfo.vertical === finalFormatInfo.vertical,
        structuralDiffsCount: structuralDiffCount,
        dataDiffsCount: dataDiffCount,
        controllableVectors: basis.vectors.length,
        controlPercentage: `${capacityInfo.controlPercentage.toFixed(1)}%`,
      });
    }

    // Also scan the base matrix to confirm it was valid
    const baseScanResult = scanMatrixWithJsQR(baseMatrix);
    log.debug('Base matrix scan check', {
      success: baseScanResult.success,
      data: baseScanResult.data,
      error: baseScanResult.error,
      scanAttempts: baseScanResult.attempts,
    });

    onProgress?.('Validating result', 95);

    // Step 11: Count actual matching pixels in the final matrix
    let matching = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const pixelIdx = row * moduleCount + col;
        if (!dataPixels.has(pixelIdx)) continue;

        const finalValue = finalMatrix[row]?.[col] ?? false;
        const targetValue = targets[row]?.[col] ?? false;
        if (finalValue === targetValue) {
          matching++;
        }
      }
    }

    const matchPercentage = total > 0 ? (matching / total) * 100 : 0;

    log.info('QR-Art generation complete', {
      matchingPixels: matching,
      totalControllable: total,
      matchPercentage: `${matchPercentage.toFixed(1)}%`,
    });

    onProgress?.('Complete', 100);

    return {
      success: true,
      matrix: finalMatrix,
      moduleCount,
      version: actualVersion,
      maskPattern: actualMask,
      matchingPixels: matching,
      totalControllable: total,
      matchPercentage,
      encodedData: fullData,
    };
  } catch (error) {
    log.error('QR-Art generation failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      matrix: [],
      moduleCount: 0,
      version: 0,
      maskPattern: 0,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: fullData,
    };
  }
}

/**
 * Generate a random URL-safe suffix for QR-Art optimization
 * Use this when you want maximum control but don't care about the exact suffix value
 * 
 * @param length Number of characters (default: 8)
 * @returns Random suffix string (URL-safe characters)
 */
export function generateRandomSuffix(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate QR-Art trying all 8 mask patterns and selecting the best
 */
export async function generateFullQArtBestMask(
  config: Omit<FullQArtConfig, 'maskPattern'>
): Promise<FullQArtResult> {
  let bestResult: FullQArtResult | null = null;
  
  // Pre-generate suffix if autoSuffix is enabled and no suffix provided
  // This ensures all mask patterns use the SAME suffix for fair comparison
  let sharedSuffix = config.suffix;
  let sharedVersion = config.version;
  
  if (!sharedSuffix && (config.autoSuffix ?? true)) {
    // Calculate optimal version and suffix for this data
    // This may upgrade the version to a larger one for better QR-Art quality
    // The function will use FULL capacity of the selected version for maximum control
    const optimalConfig = calculateOptimalVersionAndSuffix(
      config.version,
      config.ecc,
      config.data.length,
      50 // Minimum 50% control threshold for version selection
    );
    
    if (optimalConfig.suffixLength > 1) {
      const suffixChars = optimalConfig.suffixLength - 1;
      sharedSuffix = '#' + generateRandomSuffix(suffixChars);
      sharedVersion = optimalConfig.version;
      
      log.info('Pre-generated shared suffix for mask comparison', {
        suffixLength: sharedSuffix.length,
        originalVersion: optimalConfig.originalVersion,
        recommendedVersion: optimalConfig.version,
        versionUpgraded: optimalConfig.versionUpgraded,
        expectedControlPercent: `${optimalConfig.expectedControlPercent.toFixed(1)}%`,
      });
    }
  }

  for (let mask = 0; mask < 8; mask++) {
    const result = await generateFullQArt({
      ...config,
      version: sharedVersion, // Use the recommended version (may be upgraded)
      suffix: sharedSuffix,
      autoSuffix: false, // Disable auto-generation since we pre-generated
      maskPattern: mask,
      onProgress: (stage, percent) => {
        config.onProgress?.(`Mask ${mask}: ${stage}`, (mask * 100 + percent) / 8);
      },
    });

    if (result.success) {
      if (!bestResult || result.matchPercentage > bestResult.matchPercentage) {
        bestResult = result;
      }
    }
  }

  if (!bestResult) {
    return {
      success: false,
      error: 'All mask patterns failed',
      matrix: [],
      moduleCount: 0,
      version: 0,
      maskPattern: 0,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: config.data + (sharedSuffix ?? ''),
    };
  }

  log.info('Best mask pattern selected', {
    maskPattern: bestResult.maskPattern,
    matchPercentage: `${bestResult.matchPercentage.toFixed(1)}%`,
  });

  return bestResult;
}

/**
 * Generate QR-Art trying multiple rotations of the target image
 */
export async function generateFullQArtBestRotation(
  config: FullQArtConfig
): Promise<FullQArtResult> {
  // For now, just use the base implementation
  // TODO: Implement image rotation and try 0, 90, 180, 270 degrees
  return generateFullQArt(config);
}

/**
 * Generate QR-Art with optimal settings (best mask, rotation, etc.)
 */
export async function generateFullQArtOptimal(
  config: Omit<FullQArtConfig, 'maskPattern'>
): Promise<FullQArtResult> {
  // Use best mask selection
  return generateFullQArtBestMask(config);
}
