/**
 * QR Data Decoding
 * Extracts and decodes data from the unmasked matrix
 */

import { createLogger } from '../../lib/logger';

const qrDecoderLog = createLogger('DECODER');

// Import from canonical source (qr-spec)
import {
  getVersionFromModuleCount,
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isStructuralModule,
  isTimingPattern,
  isVersionInfo,
} from '../qr-spec';
import {
  ALPHANUMERIC_CHARS,
  type DecodedSegmentInfo,
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_ECI,
  MODE_KANJI,
  MODE_NUMERIC,
  MODE_TERMINATOR,
} from './types';

// RS block configuration per version and ECC level
// Format: [[numBlocks, totalCodewords, dataCodewords], ...]
export const RS_BLOCKS: Record<string, number[][][]> = {
  L: [
    [[1, 26, 19]],
    [[1, 44, 34]],
    [[1, 70, 55]],
    [[1, 100, 80]],
    [[1, 134, 108]],
    [[2, 86, 68]],
    [[2, 98, 78]],
    [[2, 121, 97]],
    [[2, 146, 116]],
    [
      [2, 86, 68],
      [2, 87, 69],
    ],
    [[4, 101, 81]],
    [
      [2, 116, 92],
      [2, 117, 93],
    ],
    [[4, 133, 107]],
    [
      [3, 145, 115],
      [1, 146, 116],
    ],
    [
      [5, 109, 87],
      [1, 110, 88],
    ],
    [
      [5, 122, 98],
      [1, 123, 99],
    ],
    [
      [1, 135, 107],
      [5, 136, 108],
    ],
    [
      [5, 150, 120],
      [1, 151, 121],
    ],
    [
      [3, 141, 113],
      [4, 142, 114],
    ],
    [
      [3, 135, 107],
      [5, 136, 108],
    ],
    [
      [4, 144, 116],
      [4, 145, 117],
    ],
    [
      [2, 139, 111],
      [7, 140, 112],
    ],
    [
      [4, 151, 121],
      [5, 152, 122],
    ],
    [
      [6, 147, 117],
      [4, 148, 118],
    ],
    [
      [8, 132, 106],
      [4, 133, 107],
    ],
    [
      [10, 142, 114],
      [2, 143, 115],
    ],
    [
      [8, 152, 122],
      [4, 153, 123],
    ],
    [
      [3, 147, 117],
      [10, 148, 118],
    ],
    [
      [7, 146, 116],
      [7, 147, 117],
    ],
    [
      [5, 145, 115],
      [10, 146, 116],
    ],
    [
      [13, 145, 115],
      [3, 146, 116],
    ],
    [[17, 145, 115]],
    [
      [17, 145, 115],
      [1, 146, 116],
    ],
    [
      [13, 145, 115],
      [6, 146, 116],
    ],
    [
      [12, 151, 121],
      [7, 152, 122],
    ],
    [
      [6, 151, 121],
      [14, 152, 122],
    ],
    [
      [17, 152, 122],
      [4, 153, 123],
    ],
    [
      [4, 152, 122],
      [18, 153, 123],
    ],
    [
      [20, 147, 117],
      [4, 148, 118],
    ],
    [
      [19, 148, 118],
      [6, 149, 119],
    ],
  ],
  M: [
    [[1, 26, 16]],
    [[1, 44, 28]],
    [[1, 70, 44]],
    [[2, 50, 32]],
    [[2, 67, 43]],
    [[4, 43, 27]],
    [[4, 49, 31]],
    [
      [2, 60, 38],
      [2, 61, 39],
    ],
    [
      [3, 58, 36],
      [2, 59, 37],
    ],
    [
      [4, 69, 43],
      [1, 70, 44],
    ],
    [
      [1, 80, 50],
      [4, 81, 51],
    ],
    [
      [6, 58, 36],
      [2, 59, 37],
    ],
    [
      [8, 59, 37],
      [1, 60, 38],
    ],
    [
      [4, 64, 40],
      [5, 65, 41],
    ],
    [
      [5, 65, 41],
      [5, 66, 42],
    ],
    [
      [7, 73, 45],
      [3, 74, 46],
    ],
    [
      [10, 74, 46],
      [1, 75, 47],
    ],
    [
      [9, 69, 43],
      [4, 70, 44],
    ],
    [
      [3, 70, 44],
      [11, 71, 45],
    ],
    [
      [3, 67, 41],
      [13, 68, 42],
    ],
    [[17, 68, 42]],
    [[17, 74, 46]],
    [
      [4, 75, 47],
      [14, 76, 48],
    ],
    [
      [6, 73, 45],
      [14, 74, 46],
    ],
    [
      [8, 75, 47],
      [13, 76, 48],
    ],
    [
      [19, 74, 46],
      [4, 75, 47],
    ],
    [
      [22, 73, 45],
      [3, 74, 46],
    ],
    [
      [3, 73, 45],
      [23, 74, 46],
    ],
    [
      [21, 73, 45],
      [7, 74, 46],
    ],
    [
      [19, 75, 47],
      [10, 76, 48],
    ],
    [
      [2, 74, 46],
      [29, 75, 47],
    ],
    [
      [10, 74, 46],
      [23, 75, 47],
    ],
    [
      [14, 74, 46],
      [21, 75, 47],
    ],
    [
      [14, 74, 46],
      [23, 75, 47],
    ],
    [
      [12, 75, 47],
      [26, 76, 48],
    ],
    [
      [6, 75, 47],
      [34, 76, 48],
    ],
    [
      [29, 74, 46],
      [14, 75, 47],
    ],
    [
      [13, 74, 46],
      [32, 75, 47],
    ],
    [
      [40, 75, 47],
      [7, 76, 48],
    ],
    [
      [18, 75, 47],
      [31, 76, 48],
    ],
  ],
  Q: [
    [[1, 26, 13]],
    [[1, 44, 22]],
    [[2, 35, 17]],
    [[2, 50, 24]],
    [
      [2, 33, 15],
      [2, 34, 16],
    ],
    [[4, 43, 19]],
    [
      [2, 32, 14],
      [4, 33, 15],
    ],
    [
      [4, 40, 18],
      [2, 41, 19],
    ],
    [
      [4, 36, 16],
      [4, 37, 17],
    ],
    [
      [6, 43, 19],
      [2, 44, 20],
    ],
    [
      [4, 50, 22],
      [4, 51, 23],
    ],
    [
      [4, 46, 20],
      [6, 47, 21],
    ],
    [
      [8, 44, 20],
      [4, 45, 21],
    ],
    [
      [11, 36, 16],
      [5, 37, 17],
    ],
    [
      [5, 54, 24],
      [7, 55, 25],
    ],
    [
      [15, 43, 19],
      [2, 44, 20],
    ],
    [
      [1, 50, 22],
      [15, 51, 23],
    ],
    [
      [17, 50, 22],
      [1, 51, 23],
    ],
    [
      [17, 47, 21],
      [4, 48, 22],
    ],
    [
      [15, 54, 24],
      [5, 55, 25],
    ],
    [
      [17, 50, 22],
      [6, 51, 23],
    ],
    [
      [7, 54, 24],
      [16, 55, 25],
    ],
    [
      [11, 54, 24],
      [14, 55, 25],
    ],
    [
      [11, 54, 24],
      [16, 55, 25],
    ],
    [
      [7, 54, 24],
      [22, 55, 25],
    ],
    [
      [28, 50, 22],
      [6, 51, 23],
    ],
    [
      [8, 53, 23],
      [26, 54, 24],
    ],
    [
      [4, 54, 24],
      [31, 55, 25],
    ],
    [
      [1, 53, 23],
      [37, 54, 24],
    ],
    [
      [15, 54, 24],
      [25, 55, 25],
    ],
    [
      [42, 54, 24],
      [1, 55, 25],
    ],
    [
      [10, 54, 24],
      [35, 55, 25],
    ],
    [
      [29, 54, 24],
      [19, 55, 25],
    ],
    [
      [44, 54, 24],
      [7, 55, 25],
    ],
    [
      [39, 54, 24],
      [14, 55, 25],
    ],
    [
      [46, 54, 24],
      [10, 55, 25],
    ],
    [
      [49, 54, 24],
      [10, 55, 25],
    ],
    [
      [48, 54, 24],
      [14, 55, 25],
    ],
    [
      [43, 54, 24],
      [22, 55, 25],
    ],
    [
      [34, 54, 24],
      [34, 55, 25],
    ],
  ],
  H: [
    [[1, 26, 9]],
    [[1, 44, 16]],
    [[2, 35, 13]],
    [[4, 25, 9]],
    [
      [2, 33, 11],
      [2, 34, 12],
    ],
    [[4, 43, 15]],
    [
      [4, 39, 13],
      [1, 40, 14],
    ],
    [
      [4, 40, 14],
      [2, 41, 15],
    ],
    [
      [4, 36, 12],
      [4, 37, 13],
    ],
    [
      [6, 43, 15],
      [2, 44, 16],
    ],
    [
      [3, 36, 12],
      [8, 37, 13],
    ],
    [
      [7, 42, 14],
      [4, 43, 15],
    ],
    [
      [12, 33, 11],
      [4, 34, 12],
    ],
    [
      [11, 36, 12],
      [5, 37, 13],
    ],
    [
      [11, 36, 12],
      [7, 37, 13],
    ],
    [
      [3, 45, 15],
      [13, 46, 16],
    ],
    [
      [2, 42, 14],
      [17, 43, 15],
    ],
    [
      [2, 42, 14],
      [19, 43, 15],
    ],
    [
      [9, 39, 13],
      [16, 40, 14],
    ],
    [
      [15, 43, 15],
      [10, 44, 16],
    ],
    [
      [19, 46, 16],
      [6, 47, 17],
    ],
    [[34, 37, 13]],
    [
      [16, 45, 15],
      [14, 46, 16],
    ],
    [
      [30, 46, 16],
      [2, 47, 17],
    ],
    [
      [22, 45, 15],
      [13, 46, 16],
    ],
    [
      [33, 46, 16],
      [4, 47, 17],
    ],
    [
      [12, 45, 15],
      [28, 46, 16],
    ],
    [
      [11, 45, 15],
      [31, 46, 16],
    ],
    [
      [19, 45, 15],
      [26, 46, 16],
    ],
    [
      [23, 45, 15],
      [25, 46, 16],
    ],
    [
      [23, 45, 15],
      [28, 46, 16],
    ],
    [
      [19, 45, 15],
      [35, 46, 16],
    ],
    [
      [11, 45, 15],
      [46, 46, 16],
    ],
    [
      [59, 46, 16],
      [1, 47, 17],
    ],
    [
      [22, 45, 15],
      [41, 46, 16],
    ],
    [
      [2, 45, 15],
      [64, 46, 16],
    ],
    [
      [24, 45, 15],
      [46, 46, 16],
    ],
    [
      [42, 45, 15],
      [32, 46, 16],
    ],
    [
      [10, 45, 15],
      [67, 46, 16],
    ],
    [
      [20, 45, 15],
      [61, 46, 16],
    ],
  ],
};

interface CodewordBuildState {
  currentByte: number;
  bitsRead: number;
  visitedModules: number;
  skippedAsFunction: number;
}

function processCodewordModule(
  matrix: boolean[][],
  row: number,
  currentCol: number,
  moduleCount: number,
  version: number,
  state: CodewordBuildState,
  codewords: number[],
  skipCounts: {
    finder: number;
    separator: number;
    timing: number;
    format: number;
    version: number;
    alignment: number;
    darkModule: number;
    other: number;
  }
): void {
  state.visitedModules++;

  if (isStructuralModule(row, currentCol, moduleCount, version)) {
    state.skippedAsFunction++;
    categorizeSkippedModule(row, currentCol, moduleCount, version, skipCounts);
    return;
  }

  state.currentByte = (state.currentByte << 1) | (matrix[row]?.[currentCol] ? 1 : 0);
  state.bitsRead++;

  if (state.bitsRead === 8) {
    codewords.push(state.currentByte);
    state.currentByte = 0;
    state.bitsRead = 0;
  }
}

/**
 * Read codewords from the matrix in the QR-specified zigzag order
 */
export function readCodewords(matrix: boolean[][], moduleCount: number): number[] {
  const codewords: number[] = [];

  // Diagnostics: verify function-module skipping is correct.
  // If this is wrong, the bitstream shifts and RS will never succeed.
  const version = getVersionFromModuleCount(moduleCount);
  const skipCounts = {
    finder: 0,
    separator: 0,
    timing: 0,
    format: 0,
    version: 0,
    alignment: 0,
    darkModule: 0,
    other: 0,
  };
  const state: CodewordBuildState = {
    currentByte: 0,
    bitsRead: 0,
    visitedModules: 0,
    skippedAsFunction: 0,
  };

  qrDecoderLog.trace('codewords: Starting codeword extraction', {
    moduleCount,
    matrixRows: matrix.length,
  });

  // Start from bottom-right, move up in two-column pairs
  let up = true;
  let col = moduleCount - 1;
  while (col >= 1) {
    // Skip the timing pattern column
    if (col === 6) col = 5;

    for (
      let row = up ? moduleCount - 1 : 0;
      up ? row >= 0 : row < moduleCount;
      row += up ? -1 : 1
    ) {
      for (let c = 0; c < 2; c++) {
        processCodewordModule(
          matrix,
          row,
          col - c,
          moduleCount,
          version,
          state,
          codewords,
          skipCounts
        );
      }
    }
    up = !up;
    col -= 2;
  }

  qrDecoderLog.trace('codewords: Extracted codewords', {
    count: codewords.length,
    first10: codewords
      .slice(0, 10)
      .map((c) => c.toString(16).padStart(2, '0'))
      .join(' '),
    traversal: {
      visitedModules: state.visitedModules,
      skippedAsFunction: state.skippedAsFunction,
      skipCounts,
    },
  });

  return codewords;
}

function isSeparatorModule(row: number, col: number, moduleCount: number): boolean {
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;
  return false;
}

function categorizeSkippedModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  skipCounts: {
    finder: number;
    separator: number;
    timing: number;
    format: number;
    version: number;
    alignment: number;
    darkModule: number;
    other: number;
  }
): void {
  if (isFinderPattern(row, col, moduleCount)) skipCounts.finder++;
  else if (isSeparatorModule(row, col, moduleCount)) skipCounts.separator++;
  else if (isTimingPattern(row, col, moduleCount)) skipCounts.timing++;
  else if (isFormatInfo(row, col, moduleCount)) skipCounts.format++;
  else if (isVersionInfo(row, col, moduleCount, version)) skipCounts.version++;
  else if (isAlignmentPattern(row, col, moduleCount, version)) skipCounts.alignment++;
  else if (row === moduleCount - 8 && col === 8) skipCounts.darkModule++;
  else skipCounts.other++;
}

// ALIGNMENT_POSITIONS and getAlignmentPositions imported from qr-spec

/**
 * De-interleave data codewords from multi-block QR codes.
 *
 * QR codes with multiple RS blocks interleave codewords for transmission:
 * For blocks B1, B2, ..., Bn with data [D1], [D2], ..., [Dn], the transmitted order is:
 * D1[0], D2[0], ..., Dn[0], D1[1], D2[1], ..., Dn[1], ...
 *
 * Blocks may have different sizes (some have 1 more byte than others).
 * This function reverses the interleaving to get sequential block data.
 */
function deinterleaveDataCodewords(codewords: number[], rsBlocks: number[][]): number[] {
  // Build list of blocks with their data sizes
  const blockSizes: number[] = [];
  for (const blockGroup of rsBlocks) {
    const numBlocks = blockGroup[0];
    const dataCodewords = blockGroup[2];
    for (let i = 0; i < numBlocks; i++) {
      blockSizes.push(dataCodewords);
    }
  }

  const numBlocks = blockSizes.length;

  // If only 1 block, no de-interleaving needed
  if (numBlocks <= 1) {
    return codewords;
  }

  // Find max data size (for iteration)
  const maxDataSize = Math.max(...blockSizes);

  // De-interleave: the transmitted stream has bytes interleaved round-robin
  // For each codeword position, one byte from each block (if that block has that position)
  const blockData: number[][] = blockSizes.map(() => []);
  let idx = 0;

  for (let pos = 0; pos < maxDataSize; pos++) {
    for (let b = 0; b < numBlocks; b++) {
      // Only read if this block has a byte at this position
      if (pos < blockSizes[b] && idx < codewords.length) {
        blockData[b].push(codewords[idx++]);
      }
    }
  }

  // Concatenate blocks to get sequential data
  const result = blockData.flat();

  qrDecoderLog.trace('deinterleave: De-interleaved data codewords', {
    numBlocks,
    blockSizes: blockSizes.join(','),
    inputLength: codewords.length,
    outputLength: result.length,
  });

  return result;
}

/**
 * Separate data and error correction codewords
 */
export function separateCodewords(
  codewords: number[],
  version: number,
  eccLevel: number
): { dataCodewords: number[]; ecCodewords: number[] } {
  const eccLevelChar = ['M', 'L', 'H', 'Q'][eccLevel] as keyof typeof RS_BLOCKS;
  const rsBlocks = RS_BLOCKS[eccLevelChar]?.[version - 1];

  qrDecoderLog.trace('separate: Separating codewords', {
    version,
    eccLevel,
    eccLevelChar,
    hasRsBlocks: !!rsBlocks,
  });

  if (!rsBlocks) {
    qrDecoderLog.warn('separate: No RS blocks found for version/ECC, returning all as data');
    return { dataCodewords: codewords, ecCodewords: [] };
  }

  // Calculate total data codewords
  let totalDataCodewords = 0;
  for (const blockGroup of rsBlocks) {
    const numBlocks = blockGroup[0];
    const dataCodewords = blockGroup[2];
    totalDataCodewords += numBlocks * dataCodewords;
  }

  // Extract interleaved data codewords
  const interleavedData = codewords.slice(0, totalDataCodewords);

  // De-interleave for multi-block QR codes
  const dataCodewords = deinterleaveDataCodewords(interleavedData, rsBlocks);

  qrDecoderLog.trace('separate: Separated codewords', {
    totalCodewords: codewords.length,
    dataCodewords: totalDataCodewords,
    ecCodewords: codewords.length - totalDataCodewords,
  });

  return {
    dataCodewords,
    ecCodewords: codewords.slice(totalDataCodewords),
  };
}

/**
 * Decode the data codewords into text plus raw bytes.
 *
 * Why:
 * - QR byte segments are just bytes. Without ECI, the spec default is ISO-8859-1.
 * - Our generator can also emit raw byte payloads (low-byte stringToBytes).
 * - For analyzer reproduction, we must preserve the exact bytes, not a re-encoded UTF-8 string.
 */
export type DecodedEncodingMode =
  | 'numeric'
  | 'alphanumeric'
  | 'byte'
  | 'kanji'
  | 'mixed'
  | 'unknown';

export interface DecodedDataResult {
  text: string;
  bytes: Uint8Array;
  encodingMode: DecodedEncodingMode;
  /** Whether the decode completed successfully without truncation */
  valid: boolean;
  /** Whether the decode was structurally valid (no extra non-terminator segments after primary) */
  structurallyValid: boolean;
  /** Number of segments decoded (including terminator if found) */
  segmentCount: number;
  /** Detailed info for each decoded segment */
  segments: DecodedSegmentInfo[];
}

/**
 * Helper to convert mode indicator to mode name
 */
function modeToName(mode: number): DecodedSegmentInfo['modeName'] {
  switch (mode) {
    case MODE_NUMERIC:
      return 'numeric';
    case MODE_ALPHANUMERIC:
      return 'alphanumeric';
    case MODE_BYTE:
      return 'byte';
    case MODE_KANJI:
      return 'kanji';
    case MODE_ECI:
      return 'eci';
    case MODE_TERMINATOR:
      return 'terminator';
    default:
      return 'unknown';
  }
}

interface SegmentDecodeResult {
  text: string;
  rawBytes: number[];
  outBytes: number[];
  modeTag: DecodedEncodingMode;
  valid: boolean;
}

function decodeSegmentData(bits: BitStream, mode: number, charCount: number): SegmentDecodeResult {
  switch (mode) {
    case MODE_NUMERIC: {
      const text = decodeNumeric(bits, charCount);
      if (text.length !== charCount) {
        qrDecoderLog.debug('decode: Numeric segment truncated - decode invalid', {
          expected: charCount,
          got: text.length,
        });
      }
      const outBytes: number[] = [];
      for (let i = 0; i < text.length; i++) outBytes.push(text.codePointAt(i)! & 0xff);
      return { text, rawBytes: [], outBytes, modeTag: 'numeric', valid: text.length === charCount };
    }
    case MODE_ALPHANUMERIC: {
      const text = decodeAlphanumeric(bits, charCount);
      if (text.length !== charCount) {
        qrDecoderLog.debug('decode: Alphanumeric segment truncated - decode invalid', {
          expected: charCount,
          got: text.length,
        });
      }
      const outBytes: number[] = [];
      for (let i = 0; i < text.length; i++) outBytes.push(text.codePointAt(i)! & 0xff);
      return {
        text,
        rawBytes: [],
        outBytes,
        modeTag: 'alphanumeric',
        valid: text.length === charCount,
      };
    }
    case MODE_BYTE: {
      const r = decodeByteDetailed(bits, charCount);
      if (r.bytes.length !== charCount) {
        qrDecoderLog.debug('decode: Byte segment truncated - decode invalid', {
          expected: charCount,
          got: r.bytes.length,
        });
      }
      return {
        text: r.text,
        rawBytes: r.bytes,
        outBytes: [...r.bytes],
        modeTag: 'byte',
        valid: r.bytes.length === charCount,
      };
    }
    case MODE_KANJI: {
      const r = decodeKanjiDetailed(bits, charCount);
      if (r.bytes.length !== charCount * 2) {
        qrDecoderLog.debug('decode: Kanji segment truncated - decode invalid', {
          expected: charCount * 2,
          got: r.bytes.length,
        });
      }
      return {
        text: r.text,
        rawBytes: r.bytes,
        outBytes: [...r.bytes],
        modeTag: 'kanji',
        valid: r.bytes.length === charCount * 2,
      };
    }
    default: {
      qrDecoderLog.debug('decode: Unknown mode indicator - decode invalid', { mode });
      return { text: '', rawBytes: [], outBytes: [], modeTag: 'unknown', valid: false };
    }
  }
}

interface DecodeLoopState {
  text: string;
  outBytes: number[];
  modesSeen: Set<DecodedEncodingMode>;
  segments: DecodedSegmentInfo[];
  segmentIndex: number;
  valid: boolean;
  foundTerminator: boolean;
  primarySegmentEnded: boolean;
  hasExtraSegmentsAfterPrimary: boolean;
}

function pushInvalidSegment(
  state: DecodeLoopState,
  mode: number,
  charCount: number,
  bitOffset: number
): void {
  state.segments.push({
    index: state.segmentIndex,
    mode,
    modeName: modeToName(mode),
    charCount,
    decodedLength: 0,
    valid: false,
    bitOffset,
  });
  state.segmentIndex++;
  state.valid = false;
  if (state.primarySegmentEnded) {
    state.hasExtraSegmentsAfterPrimary = true;
  }
}

function processDecodedSegment(
  state: DecodeLoopState,
  seg: SegmentDecodeResult,
  mode: number,
  charCount: number,
  bitOffset: number
): void {
  for (const b of seg.outBytes) state.outBytes.push(b);

  const decodedLength =
    seg.modeTag === 'kanji'
      ? seg.rawBytes.length / 2
      : seg.modeTag === 'byte'
        ? seg.rawBytes.length
        : seg.text.length;
  state.segments.push({
    index: state.segmentIndex,
    mode,
    modeName: modeToName(mode),
    charCount,
    decodedLength,
    valid: seg.valid,
    bitOffset,
  });
  state.segmentIndex++;

  if (seg.valid) {
    if (seg.modeTag !== 'unknown') {
      state.primarySegmentEnded = true;
    }
  } else {
    state.valid = false;
    if (state.primarySegmentEnded) {
      state.hasExtraSegmentsAfterPrimary = true;
    }
  }

  if (seg.modeTag !== 'unknown') state.modesSeen.add(seg.modeTag);
  state.text += seg.text;

  qrDecoderLog.trace(`decode: Decoded segment ${state.segmentIndex}`, {
    mode: seg.modeTag,
    charCount,
    textLen: seg.text.length,
    bytesLen: seg.rawBytes.length,
    segmentValid: seg.valid,
    preview: seg.text.slice(0, 50),
  });
}

function resolveEncodingMode(modesSeen: Set<DecodedEncodingMode>): DecodedEncodingMode {
  if (modesSeen.size === 1) return modesSeen.values().next().value!;
  if (modesSeen.size > 1) return 'mixed';
  return 'unknown';
}

export function decodeDataCodewordsDetailed(
  dataCodewords: number[],
  version: number
): DecodedDataResult {
  const bits = new BitStream(dataCodewords);
  const state: DecodeLoopState = {
    text: '',
    outBytes: [],
    modesSeen: new Set(),
    segments: [],
    segmentIndex: 0,
    valid: true,
    foundTerminator: false,
    primarySegmentEnded: false,
    hasExtraSegmentsAfterPrimary: false,
  };

  qrDecoderLog.trace('decode: Starting data decode (detailed)', {
    dataCodewords: dataCodewords.length,
    version,
  });

  while (bits.available() >= 4) {
    const bitOffset = dataCodewords.length * 8 - bits.available();
    const mode = bits.read(4);

    if (mode === MODE_TERMINATOR) {
      qrDecoderLog.trace('decode: Found terminator', { segmentIndex: state.segmentIndex + 1 });
      state.segments.push({
        index: state.segmentIndex,
        mode,
        modeName: 'terminator',
        charCount: 0,
        decodedLength: 0,
        valid: true,
        bitOffset,
      });
      state.segmentIndex++;
      state.foundTerminator = true;
      break;
    }

    const charCountBits = getCharCountBits(mode, version);
    if (bits.available() < charCountBits) {
      qrDecoderLog.debug('decode: Not enough bits for char count - decode invalid', {
        mode,
        charCountBits,
        available: bits.available(),
      });
      pushInvalidSegment(state, mode, -1, bitOffset);
      break;
    }

    const charCount = bits.read(charCountBits);

    if (charCount > 7000) {
      qrDecoderLog.debug('decode: Unreasonable char count, aborting - decode invalid', {
        charCount,
        mode,
      });
      pushInvalidSegment(state, mode, charCount, bitOffset);
      break;
    }

    const seg = decodeSegmentData(bits, mode, charCount);
    processDecodedSegment(state, seg, mode, charCount, bitOffset);

    if (!seg.valid) break;
  }

  const encodingMode = resolveEncodingMode(state.modesSeen);
  const structurallyValid = state.valid && !state.hasExtraSegmentsAfterPrimary;

  qrDecoderLog.trace('decode: Data decode complete', {
    valid: state.valid,
    structurallyValid,
    foundTerminator: state.foundTerminator,
    hasExtraSegmentsAfterPrimary: state.hasExtraSegmentsAfterPrimary,
    segmentCount: state.segments.length,
    segmentModes: state.segments.map((s) => s.modeName),
    textLength: state.text.length,
    bytesLength: state.outBytes.length,
    encodingMode,
  });

  return {
    text: state.text,
    bytes: new Uint8Array(state.outBytes),
    encodingMode,
    valid: state.valid,
    structurallyValid,
    segmentCount: state.segments.length,
    segments: state.segments,
  };
}

/**
 * Decode the data codewords into a string
 */
export function decodeDataCodewords(dataCodewords: number[], version: number): string {
  return decodeDataCodewordsDetailed(dataCodewords, version).text;
}

/**
 * Get the number of bits for character count indicator
 */
function getCharCountBits(mode: number, version: number): number {
  if (version <= 9) {
    switch (mode) {
      case MODE_NUMERIC:
        return 10;
      case MODE_ALPHANUMERIC:
        return 9;
      case MODE_BYTE:
        return 8;
      case MODE_KANJI:
        return 8;
    }
  } else if (version <= 26) {
    switch (mode) {
      case MODE_NUMERIC:
        return 12;
      case MODE_ALPHANUMERIC:
        return 11;
      case MODE_BYTE:
        return 16;
      case MODE_KANJI:
        return 10;
    }
  } else {
    switch (mode) {
      case MODE_NUMERIC:
        return 14;
      case MODE_ALPHANUMERIC:
        return 13;
      case MODE_BYTE:
        return 16;
      case MODE_KANJI:
        return 12;
    }
  }
  return 8;
}

/**
 * Decode numeric mode data
 */
function decodeNumeric(bits: BitStream, count: number): string {
  let result = '';

  // Read groups of 3 digits (10 bits each)
  let remaining = count;
  while (remaining >= 3) {
    if (bits.available() < 10) break;
    const value = bits.read(10);
    // Validate numeric value (should be 0-999)
    if (value > 999) {
      qrDecoderLog.debug('numeric: Invalid 3-digit value', { value });
      result += '???';
    } else {
      result += value.toString().padStart(3, '0');
    }
    remaining -= 3;
  }

  result += decodeNumericRemainder(bits, remaining);

  return result;
}

function decodeNumericRemainder(bits: BitStream, remaining: number): string {
  if (remaining === 2 && bits.available() >= 7) {
    const value = bits.read(7);
    if (value > 99) {
      qrDecoderLog.debug('numeric: Invalid 2-digit value', { value });
      return '??';
    }
    return value.toString().padStart(2, '0');
  }
  if (remaining === 1 && bits.available() >= 4) {
    const value = bits.read(4);
    if (value > 9) {
      qrDecoderLog.debug('numeric: Invalid 1-digit value', { value });
      return '?';
    }
    return value.toString();
  }
  return '';
}

/**
 * Decode alphanumeric mode data
 */
function decodeAlphanumeric(bits: BitStream, count: number): string {
  let result = '';

  // Read pairs of characters (11 bits each)
  let remaining = count;
  while (remaining >= 2) {
    if (bits.available() < 11) break;
    const value = bits.read(11);
    const c1 = Math.floor(value / 45);
    const c2 = value % 45;

    // Bounds checking to prevent 'undefined' in output
    if (c1 >= 0 && c1 < ALPHANUMERIC_CHARS.length && c2 >= 0 && c2 < ALPHANUMERIC_CHARS.length) {
      result += ALPHANUMERIC_CHARS[c1] + ALPHANUMERIC_CHARS[c2];
    } else {
      qrDecoderLog.debug('alphanumeric: Invalid character index', { value, c1, c2 });
      result += '??'; // Placeholder for invalid characters
    }
    remaining -= 2;
  }

  // Read remaining character (6 bits)
  if (remaining === 1 && bits.available() >= 6) {
    const value = bits.read(6);
    if (value >= 0 && value < ALPHANUMERIC_CHARS.length) {
      result += ALPHANUMERIC_CHARS[value];
    } else {
      qrDecoderLog.debug('alphanumeric: Invalid single character index', { value });
      result += '?';
    }
  }

  return result;
}

/**
 * Decode byte mode and preserve raw bytes.
 *
 * Text decoding strategy:
 * - Try UTF-8.
 * - If decoding yields replacement characters (�), fall back to ISO-8859-1 (latin1).
 * This matches how many QR generators treat byte mode when no ECI is present.
 */
function decodeByteDetailed(bits: BitStream, count: number): { text: string; bytes: number[] } {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 8) break;
    bytes.push(bits.read(8));
  }

  // UTF-8 best effort
  let utf8Text = '';
  try {
    utf8Text = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch {
    utf8Text = '';
  }

  // If decoder had to replace invalid sequences, prefer a raw latin1 view.
  if (utf8Text.includes('�')) {
    const latin1 = String.fromCodePoint(...bytes);
    return { text: latin1, bytes };
  }

  if (utf8Text.length > 0) return { text: utf8Text, bytes };

  // Fall back to ISO-8859-1
  return { text: String.fromCodePoint(...bytes), bytes };
}

/**
 * Decode Kanji mode and preserve raw bytes (Shift-JIS).
 */
function decodeKanjiDetailed(bits: BitStream, count: number): { text: string; bytes: number[] } {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 13) break;
    let value = bits.read(13);

    // Convert to Shift-JIS
    const byte1 = Math.floor(value / 0xc0);
    const byte2 = value % 0xc0;
    value = (byte1 << 8) | byte2;

    if (value < 0x01f00) {
      value += 0x8140;
    } else {
      value += 0xc140;
    }

    bytes.push((value >> 8) & 0xff);
    bytes.push(value & 0xff);
  }

  let text = '';
  try {
    text = new TextDecoder('shift-jis').decode(new Uint8Array(bytes));
  } catch {
    text = '';
  }

  return { text, bytes };
}

/**
 * Decode byte mode data
 */
function _decodeByte(bits: BitStream, count: number): string {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 8) break;
    bytes.push(bits.read(8));
  }

  // Try to decode as UTF-8
  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch {
    // Fall back to ISO-8859-1
    return String.fromCodePoint(...bytes);
  }
}

/**
 * Decode Kanji mode data
 */
function _decodeKanji(bits: BitStream, count: number): string {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 13) break;
    let value = bits.read(13);

    // Convert to Shift-JIS
    const byte1 = Math.floor(value / 0xc0);
    const byte2 = value % 0xc0;
    value = (byte1 << 8) | byte2;

    if (value < 0x01f00) {
      value += 0x8140;
    } else {
      value += 0xc140;
    }

    bytes.push((value >> 8) & 0xff);
    bytes.push(value & 0xff);
  }

  // Try to decode as Shift-JIS
  try {
    return new TextDecoder('shift-jis').decode(new Uint8Array(bytes));
  } catch {
    return '';
  }
}

/**
 * Simple bit stream reader
 */
class BitStream {
  private readonly bytes: number[];
  private byteIndex: number = 0;
  private bitIndex: number = 0;

  constructor(bytes: number[]) {
    this.bytes = bytes;
  }

  available(): number {
    return (this.bytes.length - this.byteIndex) * 8 - this.bitIndex;
  }

  read(numBits: number): number {
    let result = 0;

    for (let i = 0; i < numBits; i++) {
      if (this.byteIndex >= this.bytes.length) return result;

      const bit = (this.bytes[this.byteIndex] >> (7 - this.bitIndex)) & 1;
      result = (result << 1) | bit;

      this.bitIndex++;
      if (this.bitIndex === 8) {
        this.bitIndex = 0;
        this.byteIndex++;
      }
    }

    return result;
  }
}
