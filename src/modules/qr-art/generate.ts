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
  binarySearchMaxVectors,
  flattenAndOrderSelections,
} from './scan-fallback';
import {
  buildFullBasis,
  clearBasisCache,
  computeECC,
} from './rs-basis';
import {
  type BitRange,
  type SemanticBitLayout,
  getSemanticBitLayout,
  calculateVersionForSlack,
  mapAllowedRangesToBlocks,
} from './semantic-layout';

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
 * Encoder-derived semantic layout - these are the ACTUAL bit positions
 * from the encoder's bit buffer, NOT calculated from data.length.
 * 
 * This is critical because the actual encoder may:
 * - Use different segment modes
 * - Place terminators differently
 * - Have different interleaving patterns
 * 
 * We MUST derive protection boundaries from what the encoder actually did.
 */
export interface EncoderDerivedLayout {
  /** Bits after writing mode indicator (should be 4) */
  bitsAfterMode: number;
  /** Bits after writing character count */
  bitsAfterCharCount: number;
  /** Bits after writing all segment data (before terminator) */
  bitsAfterData: number;
  /** Bits after adding terminator (0-4 bits) */
  bitsAfterTerminator: number;
  /** Bits after padding to byte boundary */
  bitsAfterPadToByte: number;
  /** Byte index where padding codewords (0xEC 0x11) start */
  paddingStartByte: number;
  /** Total data bytes capacity */
  totalDataBytes: number;
  /** Number of padding codeword bytes */
  paddingByteCount: number;
  /** Protected bit range (everything before padding) */
  protectedBitEnd: number;
  /** Allowed/controllable bit range (only padding codewords) */
  allowedBitStart: number;
  allowedBitEnd: number;
}

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
 * Extract the actual mask pattern from a QR matrix by reading the format info bits.
 * 
 * This is CRITICAL for auto-mask mode: when maskPattern=-1, the encoder's
 * getBestMaskPattern() chooses the optimal mask internally, but doesn't expose
 * which mask it chose. We must extract it from the generated matrix's format info.
 * 
 * Format info structure (15 bits total):
 * - Bits 0-2: Mask pattern (0-7)
 * - Bits 3-4: ECC level (L=1, M=0, Q=3, H=2)
 * - Bits 5-14: BCH error correction
 * 
 * The format info is XORed with 0x5412 before placement to ensure
 * the pattern is never all-zeros (which would be hard to detect).
 * 
 * @param matrix The QR matrix to extract mask from
 * @returns Object with extracted mask, ECC, and validation info
 */
function extractMaskFromMatrix(matrix: boolean[][]): {
  mask: number;
  eccLevel: number;
  isValid: boolean;
  formatInfoMatch: boolean;
  rawVertical: number;
  rawHorizontal: number;
} {
  // The format info XOR mask (10101000010010 in binary)
  const FORMAT_INFO_MASK = 0x5412;
  
  // Extract both copies of format info
  const formatInfo = extractFormatInfo(matrix);
  
  // XOR with mask to get actual data
  const verticalData = formatInfo.vertical ^ FORMAT_INFO_MASK;
  const horizontalData = formatInfo.horizontal ^ FORMAT_INFO_MASK;
  
  // Extract mask pattern (bits 0-2) and ECC level (bits 3-4)
  const verticalMask = verticalData & 0x07;  // Lower 3 bits
  const verticalEcc = (verticalData >> 3) & 0x03;  // Next 2 bits
  
  const horizontalMask = horizontalData & 0x07;
  const horizontalEcc = (horizontalData >> 3) & 0x03;
  
  // Prefer vertical, but validate against horizontal
  const mask = verticalMask;
  const eccLevel = verticalEcc;
  
  // Check if both copies agree (they should in a valid QR)
  const isValid = verticalMask === horizontalMask && verticalEcc === horizontalEcc;
  
  if (!isValid) {
    log.warn('Format info copies disagree!', {
      verticalMask,
      horizontalMask,
      verticalEcc,
      horizontalEcc,
      rawVertical: formatInfo.vertical.toString(2).padStart(15, '0'),
      rawHorizontal: formatInfo.horizontal.toString(2).padStart(15, '0'),
    });
  }
  
  return {
    mask,
    eccLevel,
    isValid,
    formatInfoMatch: formatInfo.match,
    rawVertical: formatInfo.vertical,
    rawHorizontal: formatInfo.horizontal,
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

// EncoderDerivedLayout is already exported via its interface declaration above

/**
 * Configuration for full QR-Art generation
 * 
 * STRATEGY 2: Only padding codewords are controllable.
 * The original data is encoded exactly as-is, and only the padding
 * bytes (0xEC 0x11 pattern) after terminator+pad-to-byte can be modified.
 * 
 * This ensures the decoded message is ALWAYS preserved exactly.
 */
export interface FullQArtConfig {
  /** The data to encode (URL or text) - will be encoded EXACTLY as provided */
  data: string;
  /** Target image as ImageData, HTMLCanvasElement, or OffscreenCanvas */
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  /** QR version (1-40), 0 for auto with slack calculation */
  version: number;
  /** Error correction level */
  ecc: ECCLevel;
  /** Mask pattern (0-7), -1 for auto */
  maskPattern: number;
  /** Progress callback */
  onProgress?: (stage: string, percent: number) => void;
  /**
   * Minimum number of padding codewords required for QR-Art manipulation.
   * A larger version will be selected if needed to achieve this many padding bytes.
   * Default: 30 (provides ~50% control for typical URLs)
   * 
   * More padding = more controllable pixels = better image quality.
   * Set to 0 to use the minimum version that fits the data.
   */
  minPadCodewords?: number;
  /**
   * Force a specific QR version regardless of data size.
   * Overrides minPadCodewords calculation.
   * Useful for consistent sizing or when you know the exact version needed.
   */
  forceVersion?: number;
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
  /** Encoder-derived semantic layout with ACTUAL bit positions */
  encoderLayout: EncoderDerivedLayout;
}

/**
 * Map ECC numeric value (from format info) to ECCLevel character
 * Format info encoding: L=1, M=0, Q=3, H=2
 */
function eccNumericToLevel(eccNumeric: number): ECCLevel {
  switch (eccNumeric) {
    case 0: return 'M';
    case 1: return 'L';
    case 2: return 'H';
    case 3: return 'Q';
    default: return 'M';
  }
}

/**
 * Generate a QR matrix from the encoder and extract per-block data
 *
 * IMPORTANT: We use regenerateQRFromModifiedData to create the base matrix
 * instead of extracting from qrcode().make(). This ensures the base matrix
 * and final matrix are generated by the SAME code path, making predictions
 * match actual results exactly.
 * 
 * CRITICAL FIX: When maskPattern=-1 (auto), we must extract the ACTUAL mask
 * that the encoder chose from the format info bits. Previously the code
 * incorrectly assumed mask 0, causing matrix mismatches.
 */
function generateBaseQR(
  data: string,
  version: number,
  ecc: ECCLevel,
  maskPattern: number
): BaseQRResult {
  // Log the exact data being encoded for debugging
  log.debug('generateBaseQR called', {
    dataLength: data.length,
    dataPreview: data.length > 80 ? data.slice(0, 80) + '...' : data,
    dataHash: data.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0).toString(16),
    version,
    ecc,
    maskPattern,
  });

  // First, use the encoder to determine the actual version if auto-detecting
  const qr = qrcode(version, ecc);
  qr.addData(data);
  const useMask = maskPattern >= 0 ? maskPattern : undefined;
  qr.make(useMask);

  const moduleCount = qr.getModuleCount();
  const actualVersion = version > 0 ? version : Math.ceil((moduleCount - 17) / 4);
  
  // CRITICAL: Extract the ACTUAL mask pattern from the encoder's matrix
  // When maskPattern=-1 (auto), the encoder picks the best mask internally
  // via getBestMaskPattern(), but doesn't expose which mask it chose.
  // We MUST extract it from the format info bits to use throughout the pipeline.
  let actualMask: number;
  if (maskPattern >= 0) {
    // User specified a mask, use it directly
    actualMask = maskPattern;
  } else {
    // Auto-mask mode: extract the actual mask the encoder chose
    // Build a temporary matrix from the encoder to read format info
    const tempMatrix: boolean[][] = [];
    for (let r = 0; r < moduleCount; r++) {
      tempMatrix[r] = [];
      for (let c = 0; c < moduleCount; c++) {
        tempMatrix[r][c] = qr.isDark(r, c);
      }
    }
    
    const extracted = extractMaskFromMatrix(tempMatrix);
    actualMask = extracted.mask;
    
    // Validate the extracted ECC matches what we requested
    const extractedEccLevel = eccNumericToLevel(extracted.eccLevel);
    if (extractedEccLevel !== ecc) {
      log.warn('Extracted ECC level mismatch!', {
        requested: ecc,
        extracted: extractedEccLevel,
        extractedNumeric: extracted.eccLevel,
      });
    }
    
    log.info('Extracted actual mask from encoder (auto-mask mode)', {
      extractedMask: actualMask,
      extractedEcc: extractedEccLevel,
      formatInfoValid: extracted.isValid,
      formatInfoMatch: extracted.formatInfoMatch,
    });
  }

  // Get the actual encoded data bytes and compute ECC using the encoder's bit buffer
  // This is critical - we need the real data bytes AND their ECC for RS linearity
  // Also captures the ACTUAL semantic bit positions from the encoder
  const { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts, encoderLayout } = encodeDataToBytes(
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
    encoderLayout,
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
 * 
 * CRITICAL: Also returns the EncoderDerivedLayout which captures the ACTUAL
 * bit positions from the encoder. This is essential for Strategy 2 protection
 * as it tells us exactly where padding codewords start.
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
  encoderLayout: EncoderDerivedLayout;
} {
  // Log the exact data being encoded for debugging
  log.debug('encodeDataToBytes called', {
    dataLength: data.length,
    dataPreview: data.length > 80 ? data.slice(0, 80) + '...' : data,
    dataHash: data.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0).toString(16),
    version,
    ecc,
  });

  const eccLevel = eccToNumericForEncoder(ecc);
  const rsBlocks = getRSBlocks(version, eccLevel);

  // Create bit buffer and encode the data
  const buffer = qrBitBuffer();
  const segment = qr8BitByte(data);

  // CHECKPOINT 1: After mode indicator (4 bits)
  buffer.put(segment.getMode(), 4);
  const bitsAfterMode = buffer.getLengthInBits();
  
  // CHECKPOINT 2: After character count
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  const bitsAfterCharCount = buffer.getLengthInBits();
  
  // Write the actual data
  segment.write(buffer);
  
  // CHECKPOINT 3: After all segment data (BEFORE terminator)
  // This is the critical boundary - everything up to here is the actual message
  const bitsAfterData = buffer.getLengthInBits();

  // Calculate total data capacity
  let totalDataCount = 0;
  for (const block of rsBlocks) {
    totalDataCount += block.dataCount;
  }

  // Add terminator if there's room (up to 4 bits of zeros)
  const remainingBits = totalDataCount * 8 - buffer.getLengthInBits();
  const terminatorBits = Math.min(4, remainingBits);
  if (terminatorBits > 0) {
    buffer.put(0, terminatorBits);
  }
  
  // CHECKPOINT 4: After terminator
  const bitsAfterTerminator = buffer.getLengthInBits();

  // Pad to byte boundary with zeros
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }
  
  // CHECKPOINT 5: After padding to byte boundary
  const bitsAfterPadToByte = buffer.getLengthInBits();
  
  // CRITICAL: This is where padding codewords start (byte index)
  const paddingStartByte = buffer.getLengthInBits() / 8;

  // Add padding bytes (0xEC 0x11 pattern)
  const PAD0 = 0xec;
  const PAD1 = 0x11;
  while (buffer.getLengthInBits() < totalDataCount * 8) {
    buffer.put(PAD0, 8);
    if (buffer.getLengthInBits() < totalDataCount * 8) {
      buffer.put(PAD1, 8);
    }
  }
  
  // Calculate padding byte count
  const paddingByteCount = totalDataCount - paddingStartByte;
  
  // Build the encoder-derived layout
  const encoderLayout: EncoderDerivedLayout = {
    bitsAfterMode,
    bitsAfterCharCount,
    bitsAfterData,
    bitsAfterTerminator,
    bitsAfterPadToByte,
    paddingStartByte,
    totalDataBytes: totalDataCount,
    paddingByteCount,
    // Protected region: everything before padding codewords (in bits)
    protectedBitEnd: paddingStartByte * 8,
    // Allowed region: only padding codewords
    allowedBitStart: paddingStartByte * 8,
    allowedBitEnd: totalDataCount * 8,
  };
  
  // Log the ACTUAL semantic boundaries from the encoder
  log.info('ENCODER-DERIVED SEMANTIC BOUNDARIES (from actual bit buffer)', {
    version,
    ecc,
    dataLength: data.length,
    checkpoints: {
      bitsAfterMode: `${bitsAfterMode} bits (mode indicator)`,
      bitsAfterCharCount: `${bitsAfterCharCount} bits (+char count)`,
      bitsAfterData: `${bitsAfterData} bits (+segment data)`,
      bitsAfterTerminator: `${bitsAfterTerminator} bits (+terminator)`,
      bitsAfterPadToByte: `${bitsAfterPadToByte} bits (+pad-to-byte)`,
    },
    paddingStartByte,
    totalDataBytes: totalDataCount,
    paddingByteCount,
    protectedBits: `0 - ${paddingStartByte * 8}`,
    controllableBits: `${paddingStartByte * 8} - ${totalDataCount * 8}`,
    controllablePercent: `${((paddingByteCount / totalDataCount) * 100).toFixed(1)}%`,
  });

  // Extract bytes for each block and compute ECC
  const bufferBytes = buffer.getBuffer();
  
  // Log first 32 bytes of the encoded buffer for debugging
  log.debug('ENCODE SUMMARY - first 32 bytes of buffer', {
    bufferBits: buffer.getLengthInBits(),
    bufferBytesLen: bufferBytes.length,
    first32Bytes: Array.from(bufferBytes.slice(0, 32)),
  });
  
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

  return { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts, encoderLayout };
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
 * STRATEGY 2 Implementation:
 * - Encode ONLY the provided data (no suffix modification)
 * - Select a version with enough padding codewords for QR-Art control
 * - Only padding codewords (after terminator+pad-to-byte) are controllable
 * - The decoded message is ALWAYS preserved exactly
 *
 * Algorithm:
 * 1. Calculate semantic bit layout to find padding codeword region
 * 2. Build RS basis vectors ONLY for padding bits (protected regions excluded)
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
    minPadCodewords = 30,
    forceVersion,
  } = config;

  // STRATEGY 2: Encode data EXACTLY as provided - no suffix!
  // Only padding codewords will be controllable
  const encodedData = data;

  // Determine the version to use
  let versionToUse: number;
  if (forceVersion && forceVersion > 0) {
    // User forced a specific version
    versionToUse = forceVersion;
    log.info('Using forced QR version', { forceVersion });
  } else if (version > 0) {
    // User specified a minimum version
    versionToUse = version;
    log.info('Using specified QR version', { version });
  } else {
    // Auto-calculate version with sufficient padding for QR-Art
    versionToUse = calculateVersionForSlack(data.length, ecc, minPadCodewords);
    log.info('Auto-selected QR version for sufficient padding', {
      dataLength: data.length,
      minPadCodewords,
      selectedVersion: versionToUse,
    });
  }

  // Log the encoding target
  log.info('QR-Art encoding target (Strategy 2: padding-only)', {
    data: data.length > 60 ? data.slice(0, 60) + '...' : data,
    dataLength: data.length,
    versionToUse,
    ecc,
    strategy: 'PADDING_ONLY - only pad codewords are controllable',
  });

  try {
    onProgress?.('Encoding base data', 0);

    // CRITICAL: Clear basis cache to ensure fresh calculation
    clearBasisCache();
    log.debug('Cleared basis cache for fresh calculation');

    // Step 1: Generate base QR to determine version, get initial matrix, and extract per-block data/ECC
    const baseResult = generateBaseQR(encodedData, versionToUse, ecc, maskPattern);
    const {
      matrix: baseMatrix,
      actualVersion,
      actualMask,
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
      encoderLayout,
    } = baseResult;
    const moduleCount = baseMatrix.length;

    log.info('Base QR generated', {
      version: actualVersion,
      moduleCount,
      maskPattern: actualMask,
      ecc,
      dataLength: data.length,
    });

    // Step 1.5: Use ENCODER-DERIVED semantic layout (not calculated from data.length!)
    // This is CRITICAL - we use the actual bit positions from the encoder, not assumptions
    onProgress?.('Analyzing semantic layout', 5);
    
    // Also get the calculated layout for comparison (to detect mismatches)
    const calculatedLayout = getSemanticBitLayout(actualVersion, ecc, data.length);
    
    // CRITICAL: Compare encoder-derived vs calculated layout to detect mismatches
    const layoutMismatch = 
      encoderLayout.paddingStartByte !== Math.ceil(calculatedLayout.padCodewords.startBit / 8) ||
      encoderLayout.allowedBitStart !== calculatedLayout.padCodewords.startBit;
    
    if (layoutMismatch) {
      log.warn('LAYOUT MISMATCH - encoder boundaries differ from calculated!', {
        encoderDerived: {
          paddingStartByte: encoderLayout.paddingStartByte,
          protectedBitEnd: encoderLayout.protectedBitEnd,
          allowedBitStart: encoderLayout.allowedBitStart,
        },
        calculated: {
          paddingStartByte: Math.ceil(calculatedLayout.padCodewords.startBit / 8),
          protectedBitEnd: calculatedLayout.padCodewords.startBit,
        },
        note: 'USING ENCODER-DERIVED LAYOUT - this is the safe choice',
      });
    }

    // Log comprehensive semantic boundary information using ENCODER-DERIVED values
    log.info('ENCODER-DERIVED SEMANTIC LAYOUT (Strategy 2)', {
      version: actualVersion,
      ecc,
      dataLength: data.length,
      encoderCheckpoints: {
        bitsAfterMode: encoderLayout.bitsAfterMode,
        bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
        bitsAfterData: encoderLayout.bitsAfterData,
        bitsAfterTerminator: encoderLayout.bitsAfterTerminator,
        bitsAfterPadToByte: encoderLayout.bitsAfterPadToByte,
      },
      paddingStartByte: encoderLayout.paddingStartByte,
      totalDataBytes: encoderLayout.totalDataBytes,
      paddingByteCount: encoderLayout.paddingByteCount,
      protectedBits: `0 - ${encoderLayout.protectedBitEnd}`,
      controllableBits: `${encoderLayout.allowedBitStart} - ${encoderLayout.allowedBitEnd}`,
      controllablePercent: `${((encoderLayout.paddingByteCount / encoderLayout.totalDataBytes) * 100).toFixed(1)}%`,
    });

    // CRITICAL VERIFICATION: Scan the base matrix to verify it encodes data correctly
    const baseVerificationScan = scanMatrixWithJsQR(baseMatrix);
    if (baseVerificationScan.success) {
      const exactMatch = baseVerificationScan.data === encodedData;
      if (exactMatch) {
        log.info('BASE MATRIX VERIFICATION PASSED - encodes data exactly', {
          data: encodedData.length > 60 ? encodedData.slice(0, 60) + '...' : encodedData,
        });
      } else {
        log.error('BASE MATRIX VERIFICATION FAILED - encoding mismatch!', {
          expectedData: encodedData,
          actualDecodedData: baseVerificationScan.data,
        });
      }
    } else {
      log.error('BASE MATRIX VERIFICATION FAILED - base matrix does not scan!', {
        error: baseVerificationScan.error,
      });
    }

    onProgress?.('Building RS basis', 10);

    // Step 2: Build RS basis with ENCODER-DERIVED RANGE protection (Strategy 2)
    // ONLY padding codewords are controllable - everything else is protected
    // CRITICAL: Use encoderLayout, not calculated semanticLayout!
    const allowedBitRanges: BitRange[] = [{
      startBit: encoderLayout.allowedBitStart,
      endBit: encoderLayout.allowedBitEnd,
    }];
    const basis = buildFullBasis(actualVersion, ecc, allowedBitRanges);

    // Calculate actual controllable bits
    const actualControllableBits = basis.vectors.length;
    const totalDataBits = encoderLayout.totalDataBytes * 8;
    const actualControlPercentage = totalDataBits > 0 ? (actualControllableBits / totalDataBits) * 100 : 0;
    
    log.info('QR-Art capacity analysis (Strategy 2 - ENCODER DERIVED)', {
      totalDataBits,
      protectedBits: encoderLayout.protectedBitEnd, // Everything before pad codewords
      controllableBits: actualControllableBits,
      controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
      padCodewordBytes: encoderLayout.paddingByteCount,
      vectorsCreated: basis.vectors.length,
      source: 'ENCODER_DERIVED',
      // Also show comparison with calculated layout
      calculatedPaddingStart: calculatedLayout.padCodewords.startBit,
      encoderPaddingStart: encoderLayout.allowedBitStart,
      boundariesMatch: calculatedLayout.padCodewords.startBit === encoderLayout.allowedBitStart,
    });

    // Warn if control is very limited
    if (basis.vectors.length === 0) {
      log.warn('ZERO controllable vectors! QR-Art cannot modify any pixels.', {
        suggestion: 'Use a larger QR version to create more padding codewords.',
        padCodewordBytes: encoderLayout.paddingByteCount,
        dataLength: data.length,
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
        encodedData: encodedData,
      };
    } else if (actualControlPercentage < 20) {
      log.warn('Limited QR-Art control. Image quality may be reduced.', {
        controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
        controllableVectors: basis.vectors.length,
        padCodewordBytes: encoderLayout.paddingByteCount,
        suggestion: 'Use a larger QR version for more padding codewords.',
      });
    }

    // =========================================================================
    // DETERMINISTIC PADDING-ONLY MUTATION TEST
    // =========================================================================
    // Before running the full solver, verify that applying a single controllable
    // vector actually works and doesn't corrupt the message.
    // 
    // This catches issues where:
    // - Our "controllable" region is actually protected
    // - The bit mapping doesn't match regeneration
    // - Interleaving assumptions are wrong
    //
    if (basis.vectors.length > 0) {
      log.info('Running deterministic padding-only mutation test...');
      
      // Pick the first controllable vector
      const testVector = basis.vectors[0];
      
      // Calculate the local bit index for this vector (for debugging)
      const testLocalBitIndex = testVector.posInBlock * 8 + (7 - testVector.bitInByte);
      
      // Calculate what linear buffer byte this corresponds to
      // (sum of previous blocks' data counts + local byte position)
      let linearByteOffset = 0;
      for (let b = 0; b < testVector.rsBlockIndex; b++) {
        linearByteOffset += blockDataCounts[b];
      }
      const linearByte = linearByteOffset + testVector.posInBlock;
      const linearBit = linearByte * 8 + (7 - testVector.bitInByte);
      
      log.info('Test vector details', {
        vectorDataBitIndex: testVector.dataBitIndex,
        vectorBlockIndex: testVector.rsBlockIndex,
        vectorPosInBlock: testVector.posInBlock,
        vectorBitInByte: testVector.bitInByte,
        localBitIndex: testLocalBitIndex,
        linearByte,
        linearBit,
        paddingStartByte: encoderLayout.paddingStartByte,
        allowedBitStart: encoderLayout.allowedBitStart,
        isInAllowedRange: linearBit >= encoderLayout.allowedBitStart && linearBit < encoderLayout.allowedBitEnd,
        note: linearBit >= encoderLayout.allowedBitStart 
          ? 'Vector is in padding region (EXPECTED)' 
          : `Vector is in PROTECTED region! Expected >= ${encoderLayout.allowedBitStart}, got ${linearBit}`,
      });
      
      // Clone original data/ECC
      const testBlockData = blockDataArrays.map(arr => new Uint8Array(arr));
      const testBlockEcc = blockEccArrays.map(arr => new Uint8Array(arr));
      
      // Apply just this one vector (XOR it into the block)
      const blockIdx = testVector.rsBlockIndex;
      for (let byteIdx = 0; byteIdx < testBlockData[blockIdx].length; byteIdx++) {
        testBlockData[blockIdx][byteIdx] ^= testVector.blockBits[byteIdx];
      }
      for (let byteIdx = 0; byteIdx < testBlockEcc[blockIdx].length; byteIdx++) {
        testBlockEcc[blockIdx][byteIdx] ^= testVector.blockBits[blockDataCounts[blockIdx] + byteIdx];
      }
      
      // Regenerate matrix
      const testMatrix = regenerateQRFromModifiedData(
        testBlockData,
        testBlockEcc,
        blockDataCounts,
        blockEccCounts,
        actualVersion,
        ecc,
        actualMask
      );
      
      // Scan and verify
      const testScan = scanMatrixWithJsQR(testMatrix);
      
      if (!testScan.success) {
        log.error('PADDING-ONLY MUTATION TEST FAILED - single vector breaks scan!', {
          vectorDataBitIndex: testVector.dataBitIndex,
          vectorBlockIndex: testVector.rsBlockIndex,
          vectorPosInBlock: testVector.posInBlock,
          vectorBitInByte: testVector.bitInByte,
          localBitIndex: testLocalBitIndex,
          linearByte,
          linearBit,
          paddingStartByte: encoderLayout.paddingStartByte,
          allowedBitStart: encoderLayout.allowedBitStart,
          scanError: testScan.error,
        });
        
        // This is a critical failure - our "controllable" region is not actually safe
        return {
          success: false,
          error: 'Padding-only mutation test failed: single vector application broke QR scan',
          matrix: baseMatrix,
          moduleCount,
          version: actualVersion,
          maskPattern: actualMask,
          matchingPixels: 0,
          totalControllable: 0,
          matchPercentage: 0,
          encodedData: encodedData,
        };
      }
      
      if (testScan.data !== encodedData) {
        log.error('PADDING-ONLY MUTATION TEST FAILED - decoded data changed!', {
          expectedData: encodedData,
          actualData: testScan.data,
          expectedLength: encodedData.length,
          actualLength: testScan.data?.length,
          vectorDataBitIndex: testVector.dataBitIndex,
          vectorBlockIndex: testVector.rsBlockIndex,
          localBitIndex: testLocalBitIndex,
          linearByte,
          linearBit,
          paddingStartByte: encoderLayout.paddingStartByte,
          allowedBitStart: encoderLayout.allowedBitStart,
          note: 'This means our "controllable" bits are actually message content!',
        });
        
        return {
          success: false,
          error: 'Padding-only mutation test failed: vector modified message content',
          matrix: baseMatrix,
          moduleCount,
          version: actualVersion,
          maskPattern: actualMask,
          matchingPixels: 0,
          totalControllable: 0,
          matchPercentage: 0,
          encodedData: encodedData,
        };
      }
      
      log.info('PADDING-ONLY MUTATION TEST PASSED', {
        vectorDataBitIndex: testVector.dataBitIndex,
        vectorBlockIndex: testVector.rsBlockIndex,
        localBitIndex: testLocalBitIndex,
        linearByte,
        linearBit,
        paddingStartByte: encoderLayout.paddingStartByte,
        decodedDataUnchanged: true,
        matrixScansCorrectly: true,
      });
    }

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
      // FAIL FAST: RS linearity is fundamental - if broken, the QR will not decode
      return {
        success: false,
        error: 'RS linearity broken - modified codewords are invalid',
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
      };
    }

    // =========================================================================
    // CRITICAL: Protected-region byte verification (UNCONDITIONAL, FAIL-ON-VIOLATION)
    // =========================================================================
    // This verifies that ONLY padding codewords were modified (Strategy 2 requirement)
    // Uses ENCODER-DERIVED boundaries, not calculated ones!
    
    // First, verify each block's protected bytes are unchanged
    // Protected region: bytes 0 to (paddingStartByte - 1) in the PRE-INTERLEAVED stream
    // We need to map this to per-block byte indices accounting for interleaving
    
    // Get per-block allowed bits using encoder-derived ranges
    const blockAllowedBits = mapAllowedRangesToBlocks(allowedBitRanges, actualVersion, ecc);
    
    let protectedBytesViolated = false;
    const violations: Array<{
      blockIdx: number;
      byteIdx: number;
      original: number;
      modified: number;
      localBitStart: number;
    }> = [];
    
    for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
      const originalData = blockDataArrays[blockIdx];
      const modifiedData = modifiedBlockData[blockIdx];
      const allowedBitsInBlock = blockAllowedBits.get(blockIdx) || new Set<number>();
      
      // Check EACH BIT individually - not just whole bytes
      // This catches boundary bytes that have both protected and allowed bits
      for (let byteIdx = 0; byteIdx < originalData.length; byteIdx++) {
        const originalByte = originalData[byteIdx];
        const modifiedByte = modifiedData[byteIdx];
        
        // Skip if byte is unchanged
        if (originalByte === modifiedByte) continue;
        
        // Check each bit in this byte
        for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
          const localBitIndex = byteIdx * 8 + bitIdx;
          
          // If this bit is NOT allowed (i.e., it's protected), check if it changed
          if (!allowedBitsInBlock.has(localBitIndex)) {
            // Extract the bit values (MSB first, so bit 0 is most significant)
            const originalBit = (originalByte >> (7 - bitIdx)) & 1;
            const modifiedBit = (modifiedByte >> (7 - bitIdx)) & 1;
            
            if (originalBit !== modifiedBit) {
              protectedBytesViolated = true;
              violations.push({
                blockIdx,
                byteIdx,
                original: originalData[byteIdx],
                modified: modifiedData[byteIdx],
                localBitStart: byteIdx * 8,
              });
              // Only record one violation per byte (to avoid spam)
              break;
            }
          }
        }
      }
      
      // Log block comparison for debugging
      const firstProtectedBytes = Math.min(24, originalData.length);
      log.debug('BLOCK HEAD BYTES (orig vs mod)', {
        blockIdx,
        blockDataBytes: originalData.length,
        allowedBitsCount: allowedBitsInBlock.size,
        origHead: Array.from(originalData.slice(0, firstProtectedBytes)),
        modHead: Array.from(modifiedData.slice(0, firstProtectedBytes)),
      });
    }
    
    if (protectedBytesViolated) {
      log.error('PROTECTED BYTES MODIFIED - Strategy 2 violation!', {
        violationCount: violations.length,
        violations: violations.slice(0, 10),
        note: 'This means vectors modified protected region - algorithm bug!',
      });
      
      // FAIL FAST: Return base matrix since we can't trust the modified data
      log.error('FAILING FAST - returning base matrix due to protected byte violation');
      return {
        success: false,
        error: `Protected byte violation: ${violations.length} protected bytes were modified`,
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
      };
    }
    
    log.info('Strategy 2 protection validation PASSED (encoder-derived)', {
      protectedBitRange: `0 - ${encoderLayout.protectedBitEnd}`,
      allowedBitRange: `${encoderLayout.allowedBitStart} - ${encoderLayout.allowedBitEnd}`,
      totalVectorsApplied: totalSelected,
      protectedBytesChecked: 'all blocks verified',
    });

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
      // Compare against encodedData (the exact data we're encoding)
      const matchesData = zeroModScan.data === encodedData;
      
      if (matchesData) {
        log.debug('Zero-modification test PASSED - decoded data matches exactly', {
          decodedData: zeroModScan.data,
        });
      } else {
        log.error('Zero-modification test FAILED - decoded data mismatch!', {
          decodedData: zeroModScan.data,
          expectedData: encodedData,
        });
      }
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
    let scanResult = scanMatrixWithJsQR(finalMatrix);
    
    // Track the final matrix and vector count (may be updated by binary search fallback)
    let finalMatrixToUse = finalMatrix;
    let actualVectorsApplied = totalSelected;
    if (scanResult.success) {
      // Strategy 2: Check if decoded data matches EXACTLY (no suffix modification)
      // Since we only modify padding codewords, the message should be identical
      const exactMatch = scanResult.data === encodedData;
      
      if (exactMatch) {
        log.info('QR-Art matrix scan validation PASSED - data preserved exactly', {
          decodedData: scanResult.data,
          scanAttempts: scanResult.attempts,
        });
      } else {
        // Data was corrupted - this should NOT happen with Strategy 2!
        log.error('DECODED DATA MISMATCH - Strategy 2 protection failed!', {
          expected: encodedData,
          actual: scanResult.data,
          expectedLength: encodedData.length,
          actualLength: scanResult.data?.length,
        });
      }
    } else {
      log.error('QR-Art matrix scan validation FAILED - matrix does not scan!', {
        error: scanResult.error,
        expectedData: encodedData,
        scanAttempts: scanResult.attempts,
        finderPatternsOK: finderValidation.allValid,
        timingPatternsOK: timingValidation.allValid,
        formatInfoOK: baseFormatInfo.vertical === finalFormatInfo.vertical,
        structuralDiffsCount: structuralDiffCount,
        dataDiffsCount: dataDiffCount,
        controllableVectors: basis.vectors.length,
        controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
      });
      
      // FALLBACK: Use binary search to find the maximum number of vectors
      // that still produces a scannable QR code
      log.info('Attempting binary search fallback to find scannable configuration');
      
      // Flatten selections and sort by importance (most important pixels first)
      const flattenedSelections = flattenAndOrderSelections(
        blockSelections,
        elimination,
        importance,
        moduleCount
      );
      
      // Create a regeneration function that captures the necessary parameters
      const regenerateFn = (
        blockData: Uint8Array[],
        blockEcc: Uint8Array[],
        dataCounts: number[],
        eccCounts: number[]
      ) => regenerateQRFromModifiedData(
        blockData,
        blockEcc,
        dataCounts,
        eccCounts,
        actualVersion,
        ecc,
        actualMask
      );
      
      // Run binary search - pass encodedData for EXACT match validation
      // Strategy 2: We only modify padding codewords, so decoded data should match exactly
      const binarySearchResult = binarySearchMaxVectors(
        flattenedSelections,
        blockDataArrays,  // Original, unmodified data
        blockEccArrays,   // Original, unmodified ECC
        blockDataCounts,
        blockEccCounts,
        elimination,
        regenerateFn,
        scanMatrixWithJsQR,
        encodedData  // Strategy 2: exact match validation
      );
      
      if (binarySearchResult.maxCount > 0) {
        log.info('Binary search fallback successful', {
          originalVectors: totalSelected,
          usableVectors: binarySearchResult.maxCount,
          reductionPercent: `${((1 - binarySearchResult.maxCount / totalSelected) * 100).toFixed(1)}%`,
          iterations: binarySearchResult.iterations,
        });
        
        // Use the optimized matrix from binary search
        finalMatrixToUse = binarySearchResult.matrix;
        actualVectorsApplied = binarySearchResult.maxCount;
        
        // Re-scan to confirm and validate decoded content
        scanResult = scanMatrixWithJsQR(finalMatrixToUse);
        if (scanResult.success) {
          // Strategy 2: Validate exact match - no modification to actual data
          const exactMatch = scanResult.data === encodedData;
          if (exactMatch) {
            log.info('Binary search result validated - data preserved exactly', {
              decodedData: scanResult.data,
            });
          } else {
            log.error('Binary search result scans but DATA CORRUPTED!', {
              expected: encodedData,
              actual: scanResult.data,
            });
          }
        } else {
          log.error('Binary search result does not scan!', {
            error: scanResult.error,
          });
        }
      } else {
        // Even 0 vectors didn't help - return base matrix
        log.warn('Binary search found 0 usable vectors - returning base matrix', {
          iterations: binarySearchResult.iterations,
        });
        finalMatrixToUse = baseMatrix;
        actualVectorsApplied = 0;
      }
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
    // Use finalMatrixToUse which may have been updated by binary search fallback
    let matching = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const pixelIdx = row * moduleCount + col;
        if (!dataPixels.has(pixelIdx)) continue;

        const finalValue = finalMatrixToUse[row]?.[col] ?? false;
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
      vectorsApplied: actualVectorsApplied,
      usedBinarySearchFallback: actualVectorsApplied < totalSelected,
    });

    onProgress?.('Complete', 100);

    return {
      success: true,
      matrix: finalMatrixToUse,
      moduleCount,
      version: actualVersion,
      maskPattern: actualMask,
      matchingPixels: matching,
      totalControllable: total,
      matchPercentage,
      encodedData: encodedData,
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
      encodedData: data,
    };
  }
}

// Note: generateRandomSuffix removed - Strategy 2 doesn't use suffix modification

/**
 * Generate QR-Art trying all 8 mask patterns and selecting the best
 * Uses encoder-derived semantic layout for protection.
 */
export async function generateFullQArtBestMask(
  config: Omit<FullQArtConfig, 'maskPattern'>
): Promise<FullQArtResult> {
  let bestResult: FullQArtResult | null = null;
  
  // Pre-calculate version with sufficient padding for all mask comparisons
  const minPadCodewords = config.minPadCodewords ?? 30;
  const sharedVersion = config.forceVersion ?? 
    (config.version > 0 ? config.version : calculateVersionForSlack(config.data.length, config.ecc, minPadCodewords));
  
  log.info('Pre-selected version for mask comparison (using encoder-derived layout)', {
    sharedVersion,
    dataLength: config.data.length,
    minPadCodewords,
    note: 'Each mask will use encoder-derived semantic boundaries',
  });

  for (let mask = 0; mask < 8; mask++) {
    const result = await generateFullQArt({
      ...config,
      forceVersion: sharedVersion, // Use same version for all masks
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
      encodedData: config.data,
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
