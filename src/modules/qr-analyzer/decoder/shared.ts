import { estimateImageContrast } from '../telemetry/contrast';
import { debugLog, qrLogLazy } from '../telemetry/logging';
import { StatsCollector, emitSummaryLine } from '../telemetry/stats';
import { detectContentType, extractDominantColors } from '../content/content';
import type { ContentTypeDetails, DetectedColors } from '../content/content';

export type ECCLevel = 'L' | 'M' | 'Q' | 'H';
export type EncodingMode = 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown';
export type MaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Content types that can be detected from QR payload

export interface QRLocation {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}



export interface QRAnalysisResult {
  success: boolean;
  error?: string;
  errorType?: AnalysisErrorType;
  
  // Decoded content
  payload: string | null;
  payloadBytes: Uint8Array | null;
  
  // QR structure
  version: number | null;
  moduleCount: number | null;
  eccLevel: ECCLevel | null;
  maskPattern: MaskPattern | null;
  encodingMode: EncodingMode | null;
  
  // Spatial info
  quietZone: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    adequate: boolean;
  } | null;
  
  // Raw data
  moduleMatrix: boolean[][] | null;
  location: QRLocation | null;
  
  // Confidence
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  
  // Reed-Solomon error correction
  errorsCorrected: number | null;
  
  // Enhanced analysis (new fields)
  contentType: ContentTypeDetails | null;
  detectedColors: DetectedColors | null;
  estimatedModulePx: number | null;
  dataCapacity: {
    used: number; // characters/bytes used
    total: number; // total capacity for this version/ECC
    percentage: number; // capped at 100 for display
    overflow: boolean; // true if payload exceeds detected capacity
  } | null;
  
  // Image properties for analysis display
  imageProperties: {
    width: number;
    height: number;
    aspectRatio: number;
    estimatedQrSizePx: number;
  } | null;
  
  // Debug information
  debugLog: string | null;
  
  structuralAnalysis: {
    hasFinderPatterns: boolean;
    hasTimingPatterns: boolean;
    hasAlignmentPatterns: boolean;
    alignmentPatternCount: number;
  } | null;
}

// ============================================
// FINDER PATTERN DETECTION TYPES
// ============================================

interface FinderPattern {
  centerX: number;
  centerY: number;
  moduleSize: number;
}

interface FinderPatternGroup {
  topLeft: FinderPattern;
  topRight: FinderPattern;
  bottomLeft: FinderPattern;
}

interface FormatInfo {
  eccLevel: ECCLevel;
  maskPattern: MaskPattern;
}

interface DecodedFormatInfo extends FormatInfo {
  // BCH correction distance (0..3). Lower is better.
  dist: number;
  // Raw ECC code (0..3) as encoded in format info
  eccCode: number;
  // Raw 15-bit masked format bits as read from matrix
  rawBits: number;
}

interface FormatInfoDetailed {
  format1Bits: number | null;
  format2Bits: number | null;
  decoded1: DecodedFormatInfo | null;
  decoded2: DecodedFormatInfo | null;
  best: DecodedFormatInfo | null;
  agree: boolean;
  bestDist: number;
  totalDist: number;
}

// ============================================
// CONSTANTS
// ============================================

// Format info mask per QR spec
const FORMAT_INFO_MASK = 0x5412;
// BCH(15,5) generator polynomial for format information
const FORMAT_INFO_GEN = 0x537;

// Popcount LUT for 16-bit values (fast, deterministic across platforms).
const POPCNT16 = (() => {
  const t = new Uint8Array(1 << 16);
  for (let i = 0; i < t.length; i++) {
    // SWAR popcount for 16-bit
    let x = i;
    x = x - ((x >>> 1) & 0x5555);
    x = (x & 0x3333) + ((x >>> 2) & 0x3333);
    x = (x + (x >>> 4)) & 0x0F0F;
    t[i] = (x * 0x0101) >>> 8;
  }
  return t;
})();

// Precompute the 32 valid masked format codewords (BCH(15,5)) for fast decode.
const FORMAT_CODEWORDS_MASKED = new Uint16Array(32);
const FORMAT_DATA_ECC = new Uint8Array(32);
const FORMAT_DATA_MASK = new Uint8Array(32);

(() => {
  for (let data5 = 0; data5 < 32; data5++) {
    FORMAT_CODEWORDS_MASKED[data5] = (bchEncodeFormat(data5) ^ FORMAT_INFO_MASK) & 0x7fff;
    FORMAT_DATA_ECC[data5] = (data5 >>> 3) & 0x3;
    FORMAT_DATA_MASK[data5] = data5 & 0x7;
  }
})();


// QR Mode indicators (4 bits)
const QR_MODE = {
  TERMINATOR: 0b0000,
  NUMERIC: 0b0001,
  ALPHANUMERIC: 0b0010,
  BYTE: 0b0100,
  KANJI: 0b1000,
  ECI: 0b0111,
};

// Alphanumeric character set for decoding
const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

// ECC level encoding in format info (bits 3-4 after XOR)
const ECC_LEVEL_MAP: Record<number, ECCLevel> = {
  1: 'L',
  0: 'M',
  3: 'Q',
  2: 'H',
};

// Reverse map for importing
export const ECC_LEVEL_TO_CODE: Record<ECCLevel, number> = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

// ============================================
// GF(2^8) GALOIS FIELD ARITHMETIC
// ============================================

// Galois Field tables for RS error correction
// Uses primitive polynomial 0x11D (same as qrcode.mjs)
const GF_EXP = new Array<number>(512);
const GF_LOG = new Array<number>(256);

// Initialize GF tables (same as QRMath in qrcode.mjs)
(() => {
  for (let i = 0; i < 8; i++) {
    GF_EXP[i] = 1 << i;
  }
  for (let i = 8; i < 256; i++) {
    GF_EXP[i] = GF_EXP[i - 4] ^ GF_EXP[i - 5] ^ GF_EXP[i - 6] ^ GF_EXP[i - 8];
  }
  for (let i = 0; i < 255; i++) {
    GF_LOG[GF_EXP[i]] = i;
  }
  // Extend EXP table for easier modular arithmetic
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

/** Multiply two numbers in GF(2^8) */


/** Divide two numbers in GF(2^8) */


/** Raise x to power in GF(2^8) */


/** Multiplicative inverse in GF(2^8) */


/** Multiply polynomial by scalar */


/** Add two polynomials (XOR in GF(2^8)) */


/** Multiply two polynomials */


/** Evaluate polynomial at x */


// ============================================
// REED-SOLOMON DECODER
// ============================================

/** Calculate syndromes for received message */


/** Find error locator polynomial using Berlekamp-Massey algorithm */


/** Find error positions using Chien search */


/** Calculate error magnitudes using Forney algorithm */


/** Correct errors in a codeword. Returns corrected data or null if uncorrectable. */
 | null {
  // Calculate syndromes
  const syndromes = rsCalcSyndromes(msg, nsym);
  
  // Check if there are any errors
  if (syndromes.every(s => s === 0)) {
    // No errors
    return { corrected: msg.slice(0, msg.length - nsym), errorCount: 0 };
  }
  
  // Find error locator polynomial
  const errLoc = rsBerlekampMassey(syndromes, nsym);
  
  // Too many errors to correct?
  if (errLoc.length - 1 > nsym / 2) {
    return null;
  }
  
  // Find error positions
  const errPos = rsChienSearch(errLoc, msg.length);
  if (!errPos) {
    return null;
  }
  
  // Calculate error magnitudes
  const magnitude = rsForney(syndromes, errLoc, errPos, msg.length);
  
  // Correct errors
  const corrected = [...msg];
  for (let i = 0; i < errPos.length; i++) {
    corrected[errPos[i]] ^= magnitude[i];
  }
  
  // Verify correction by recalculating syndromes
  const verifySynd = rsCalcSyndromes(corrected, nsym);
  if (!verifySynd.every(s => s === 0)) {
    return null; // Correction failed
  }
  
  return {
    corrected: corrected.slice(0, corrected.length - nsym),
    errorCount: errPos.length,
  };
}

// ============================================
// RS BLOCK STRUCTURE
// ============================================

interface RSBlock {
  totalCount: number;
  dataCount: number;
}

// RS Block table from qrcode.mjs
// Format: [count, totalCount, dataCount, ...] for each version/ECC
const RS_BLOCK_TABLE: number[][] = [
  // Version 1
  [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
  // Version 2
  [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
  // Version 3
  [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
  // Version 4
  [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
  // Version 5
  [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
  // Version 6
  [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
  // Version 7
  [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
  // Version 8
  [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
  // Version 9
  [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
  // Version 10
  [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],
  // Version 11
  [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13],
  // Version 12
  [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15],
  // Version 13
  [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12],
  // Version 14
  [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13],
  // Version 15
  [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13],
  // Version 16
  [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16],
  // Version 17
  [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15],
  // Version 18
  [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15],
  // Version 19
  [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14],
  // Version 20
  [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16],
  // Version 21
  [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17],
  // Version 22
  [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13],
  // Version 23
  [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16],
  // Version 24
  [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17],
  // Version 25
  [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16],
  // Version 26
  [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17],
  // Version 27
  [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16],
  // Version 28
  [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16],
  // Version 29
  [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16],
  // Version 30
  [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16],
  // Version 31
  [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16],
  // Version 32
  [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16],
  // Version 33
  [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16],
  // Version 34
  [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17],
  // Version 35
  [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16],
  // Version 36
  [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16],
  // Version 37
  [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16],
  // Version 38
  [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16],
  // Version 39
  [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16],
  // Version 40
  [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16],
];

/** Get RS blocks for a given version and ECC level */

// Cached RS block expansions to avoid re-parsing RS_BLOCK_TABLE for every decode attempt.
// Key: (version<<2) | eccIndex
const RS_BLOCKS_CACHE: Map<number, RSBlock[]> = new Map();

// Cached structural-module mask (function patterns) per (version,moduleCount).
// Key: (version<<8) | moduleCount
const STRUCTURAL_MASK_CACHE: Map<number, Uint8Array> = new Map();



/** De-interleave received codewords into RS blocks */
> {
  const blockCount = rsBlocks.length;

  // Precompute per-block sizes and allocate fixed-length arrays (avoids push + resizes).
  const dataCounts = new Array<number>(blockCount);
  const ecCounts = new Array<number>(blockCount);

  let maxDataCount = 0;
  let maxEcCount = 0;

  const blocks: Array<{ data: number[]; ec: number[] }> = new Array(blockCount);
  for (let b = 0; b < blockCount; b++) {
    const dc = rsBlocks[b].dataCount | 0;
    const ec = (rsBlocks[b].totalCount - rsBlocks[b].dataCount) | 0;

    dataCounts[b] = dc;
    ecCounts[b] = ec;

    if (dc > maxDataCount) maxDataCount = dc;
    if (ec > maxEcCount) maxEcCount = ec;

    blocks[b] = {
      data: new Array(dc),
      ec: new Array(ec),
    };
  }

  let idx = 0;

  // De-interleave data codewords
  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < blockCount; b++) {
      if (i < dataCounts[b]) {
        blocks[b].data[i] = codewords[idx++] ?? 0;
      }
    }
  }

  // De-interleave EC codewords
  for (let i = 0; i < maxEcCount; i++) {
    for (let b = 0; b < blockCount; b++) {
      if (i < ecCounts[b]) {
        blocks[b].ec[i] = codewords[idx++] ?? 0;
      }
    }
  }

  return blocks;
}

/** Apply RS error correction to all blocks and reassemble data */
 | null {
  qrLogLazy('debug', () => `applyRSCorrection: START version=${version}, ECC=${eccLevel}, codewords=${codewords.length}`);
  const rsBlocks = getRSBlocks(version, eccLevel);
  if (rsBlocks.length === 0) {
    qrLogLazy('debug', () => `applyRSCorrection: FAILED - no RS blocks for version ${version}`);
    return null;
  }
  qrLogLazy('debug', () => `applyRSCorrection: ${rsBlocks.length} RS blocks`);
  
  const blocks = deinterleaveBlocks(codewords, rsBlocks);
  const correctedBlocks: number[][] = [];
  let totalErrors = 0;
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const codeword = new Array(block.data.length + block.ec.length);
    let cwk = 0;
    for (let j = 0; j < block.data.length; j++) codeword[cwk++] = block.data[j];
    for (let j = 0; j < block.ec.length; j++) codeword[cwk++] = block.ec[j];
    const nsym = rsBlocks[i].totalCount - rsBlocks[i].dataCount;
    
    const result = rsCorrectErrors(codeword, nsym);
    if (!result) {
      qrLogLazy('debug', () => `applyRSCorrection: FAILED - block ${i} uncorrectable`);
      return null; // Uncorrectable errors
    }
    
    correctedBlocks.push(result.corrected);
    totalErrors += result.errorCount;
  }
  qrLogLazy('debug', () => `applyRSCorrection: all ${blocks.length} blocks corrected, totalErrors=${totalErrors}`);
  
  // CONCATENATE corrected data blocks (NOT re-interleave!)
  // The encoder interleaves for physical distribution, but the logical data
  // is simply block0_data + block1_data + ... concatenated sequentially.
  let totalDataCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
  const correctedData: number[] = new Array(totalDataCount);
  let w = 0;
  for (let i = 0; i < correctedBlocks.length; i++) {
    const block = correctedBlocks[i];
    for (let j = 0; j < block.length; j++) correctedData[w++] = block[j];
  }
  
  qrLogLazy('debug', () => `applyRSCorrection: concatenated ${correctedBlocks.length} blocks -> ${correctedData.length} data bytes`);
  
  return { data: correctedData, errorsCorrected: totalErrors };
}

// QR Code data capacity tables
// Format: [version][eccLevel] = capacity

// Numeric mode capacity (digits)
const DATA_CAPACITY_NUMERIC: Record<number, Record<ECCLevel, number>> = {
  1: { L: 41, M: 34, Q: 27, H: 17 },
  2: { L: 77, M: 63, Q: 48, H: 34 },
  3: { L: 127, M: 101, Q: 77, H: 58 },
  4: { L: 187, M: 149, Q: 111, H: 82 },
  5: { L: 255, M: 202, Q: 144, H: 106 },
  6: { L: 322, M: 255, Q: 178, H: 139 },
  7: { L: 370, M: 293, Q: 207, H: 154 },
  8: { L: 461, M: 365, Q: 259, H: 202 },
  9: { L: 552, M: 432, Q: 312, H: 235 },
  10: { L: 652, M: 513, Q: 364, H: 288 },
  11: { L: 772, M: 604, Q: 427, H: 331 },
  12: { L: 883, M: 691, Q: 489, H: 374 },
  13: { L: 1022, M: 796, Q: 580, H: 427 },
  14: { L: 1101, M: 871, Q: 621, H: 468 },
  15: { L: 1250, M: 991, Q: 703, H: 530 },
  16: { L: 1408, M: 1082, Q: 775, H: 602 },
  17: { L: 1548, M: 1212, Q: 876, H: 674 },
  18: { L: 1725, M: 1346, Q: 948, H: 746 },
  19: { L: 1903, M: 1500, Q: 1063, H: 813 },
  20: { L: 2061, M: 1600, Q: 1159, H: 919 },
  21: { L: 2232, M: 1708, Q: 1224, H: 969 },
  22: { L: 2409, M: 1872, Q: 1358, H: 1056 },
  23: { L: 2620, M: 2059, Q: 1468, H: 1108 },
  24: { L: 2812, M: 2188, Q: 1588, H: 1228 },
  25: { L: 3057, M: 2395, Q: 1718, H: 1286 },
  26: { L: 3283, M: 2544, Q: 1804, H: 1425 },
  27: { L: 3517, M: 2701, Q: 1933, H: 1501 },
  28: { L: 3669, M: 2857, Q: 2085, H: 1581 },
  29: { L: 3909, M: 3035, Q: 2181, H: 1677 },
  30: { L: 4158, M: 3289, Q: 2358, H: 1782 },
  31: { L: 4417, M: 3486, Q: 2473, H: 1897 },
  32: { L: 4686, M: 3693, Q: 2670, H: 2022 },
  33: { L: 4965, M: 3909, Q: 2805, H: 2157 },
  34: { L: 5253, M: 4134, Q: 2949, H: 2301 },
  35: { L: 5529, M: 4343, Q: 3081, H: 2361 },
  36: { L: 5836, M: 4588, Q: 3244, H: 2524 },
  37: { L: 6153, M: 4775, Q: 3417, H: 2625 },
  38: { L: 6479, M: 5039, Q: 3599, H: 2735 },
  39: { L: 6743, M: 5313, Q: 3791, H: 2927 },
  40: { L: 7089, M: 5596, Q: 3993, H: 3057 },
};

// Alphanumeric mode capacity (characters)
const DATA_CAPACITY_ALPHANUMERIC: Record<number, Record<ECCLevel, number>> = {
  1: { L: 25, M: 20, Q: 16, H: 10 },
  2: { L: 47, M: 38, Q: 29, H: 20 },
  3: { L: 77, M: 61, Q: 47, H: 35 },
  4: { L: 114, M: 90, Q: 67, H: 50 },
  5: { L: 154, M: 122, Q: 87, H: 64 },
  6: { L: 195, M: 154, Q: 108, H: 84 },
  7: { L: 224, M: 178, Q: 125, H: 93 },
  8: { L: 279, M: 221, Q: 157, H: 122 },
  9: { L: 335, M: 262, Q: 189, H: 143 },
  10: { L: 395, M: 311, Q: 221, H: 174 },
  11: { L: 468, M: 366, Q: 259, H: 200 },
  12: { L: 535, M: 419, Q: 296, H: 227 },
  13: { L: 619, M: 483, Q: 352, H: 259 },
  14: { L: 667, M: 528, Q: 376, H: 283 },
  15: { L: 758, M: 600, Q: 426, H: 321 },
  16: { L: 854, M: 656, Q: 470, H: 365 },
  17: { L: 938, M: 734, Q: 531, H: 408 },
  18: { L: 1046, M: 816, Q: 574, H: 452 },
  19: { L: 1153, M: 909, Q: 644, H: 493 },
  20: { L: 1249, M: 970, Q: 702, H: 557 },
  21: { L: 1352, M: 1035, Q: 742, H: 587 },
  22: { L: 1460, M: 1134, Q: 823, H: 640 },
  23: { L: 1588, M: 1248, Q: 890, H: 672 },
  24: { L: 1704, M: 1326, Q: 963, H: 744 },
  25: { L: 1853, M: 1451, Q: 1041, H: 779 },
  26: { L: 1990, M: 1542, Q: 1094, H: 864 },
  27: { L: 2132, M: 1637, Q: 1172, H: 910 },
  28: { L: 2223, M: 1732, Q: 1263, H: 958 },
  29: { L: 2369, M: 1839, Q: 1322, H: 1016 },
  30: { L: 2520, M: 1994, Q: 1429, H: 1080 },
  31: { L: 2677, M: 2113, Q: 1499, H: 1150 },
  32: { L: 2840, M: 2238, Q: 1618, H: 1226 },
  33: { L: 3009, M: 2369, Q: 1700, H: 1307 },
  34: { L: 3183, M: 2506, Q: 1787, H: 1394 },
  35: { L: 3351, M: 2632, Q: 1867, H: 1431 },
  36: { L: 3537, M: 2780, Q: 1966, H: 1530 },
  37: { L: 3729, M: 2894, Q: 2071, H: 1591 },
  38: { L: 3927, M: 3054, Q: 2181, H: 1658 },
  39: { L: 4087, M: 3220, Q: 2298, H: 1774 },
  40: { L: 4296, M: 3391, Q: 2420, H: 1852 },
};

// Byte mode capacity (characters/bytes)
const DATA_CAPACITY_BYTE: Record<number, Record<ECCLevel, number>> = {
  1: { L: 17, M: 14, Q: 11, H: 7 },
  2: { L: 32, M: 26, Q: 20, H: 14 },
  3: { L: 53, M: 42, Q: 32, H: 24 },
  4: { L: 78, M: 62, Q: 46, H: 34 },
  5: { L: 106, M: 84, Q: 60, H: 44 },
  6: { L: 134, M: 106, Q: 74, H: 58 },
  7: { L: 154, M: 122, Q: 86, H: 64 },
  8: { L: 192, M: 152, Q: 108, H: 84 },
  9: { L: 230, M: 180, Q: 130, H: 98 },
  10: { L: 271, M: 213, Q: 151, H: 119 },
  11: { L: 321, M: 251, Q: 177, H: 137 },
  12: { L: 367, M: 287, Q: 203, H: 155 },
  13: { L: 425, M: 331, Q: 241, H: 177 },
  14: { L: 458, M: 362, Q: 258, H: 194 },
  15: { L: 520, M: 412, Q: 292, H: 220 },
  16: { L: 586, M: 450, Q: 322, H: 250 },
  17: { L: 644, M: 504, Q: 364, H: 280 },
  18: { L: 718, M: 560, Q: 394, H: 310 },
  19: { L: 792, M: 624, Q: 442, H: 338 },
  20: { L: 858, M: 666, Q: 482, H: 382 },
  21: { L: 929, M: 711, Q: 509, H: 403 },
  22: { L: 1003, M: 779, Q: 565, H: 439 },
  23: { L: 1091, M: 857, Q: 611, H: 461 },
  24: { L: 1171, M: 911, Q: 661, H: 511 },
  25: { L: 1273, M: 997, Q: 715, H: 535 },
  26: { L: 1367, M: 1059, Q: 751, H: 593 },
  27: { L: 1465, M: 1125, Q: 805, H: 625 },
  28: { L: 1528, M: 1190, Q: 868, H: 658 },
  29: { L: 1628, M: 1264, Q: 908, H: 698 },
  30: { L: 1732, M: 1370, Q: 982, H: 742 },
  31: { L: 1840, M: 1452, Q: 1030, H: 790 },
  32: { L: 1952, M: 1538, Q: 1112, H: 842 },
  33: { L: 2068, M: 1628, Q: 1168, H: 898 },
  34: { L: 2188, M: 1722, Q: 1228, H: 958 },
  35: { L: 2303, M: 1809, Q: 1283, H: 983 },
  36: { L: 2431, M: 1911, Q: 1351, H: 1051 },
  37: { L: 2563, M: 1989, Q: 1423, H: 1093 },
  38: { L: 2699, M: 2099, Q: 1499, H: 1139 },
  39: { L: 2809, M: 2213, Q: 1579, H: 1219 },
  40: { L: 2953, M: 2331, Q: 1663, H: 1273 },
};

// ============================================
// CONTENT TYPE DETECTION
// ============================================

/**
 * Detect the content type of a QR code payload
 */



// ============================================
// STRUCTURAL ANALYSIS
// ============================================

/**
 * Analyze structural patterns in the QR code
 */


/**
 * Check if a finder pattern exists at the given position
 */


/**
 * Check if timing patterns exist
 */


/**
 * Get alignment pattern center positions for a given version
 */


/**
 * Calculate data capacity information
 */


// ============================================
// FINDER PATTERN DETECTION
// ============================================

/**
 * Get mask function for a given mask pattern
 */



// ============================================
// IMAGE LUMINANCE & THRESHOLDING UTILITIES
// ============================================

/**
 * Convert an RGBA pixel to perceptual luminance (0–255), composited onto white.
 * QR images often come from canvas or PNGs with transparency; compositing avoids
 * transparent pixels being treated as "black".
 *
 * Uses integer weights (BT.601-ish) for speed:
 *   Y ≈ 0.299R + 0.587G + 0.114B
 */
const LUMA_R = 299;
const LUMA_G = 587;
const LUMA_B = 114;






/**
 * Proper Otsu threshold implementation.
 * - Uses normalized between-class variance.
 * - Averages all thresholds that achieve the maximum variance (important for
 *   perfectly bimodal distributions).
 * - Adds low-contrast + edge-case fallbacks that are common in QR imagery.
 */




/**
 * Adaptive threshold (Bradley-Roth) using an integral image.
 * Useful when the QR is under shadow/gradient lighting.
 *
 * Returns null when the image is too large (memory guard).
 */


/**
 * Calculate average brightness of an image for adaptive thresholding
 */


/**
 * Otsu's thresholding method for optimal binarization
 * Automatically finds the threshold that minimizes intra-class variance
 * 
 * For bimodal images (e.g., pure black and white QR codes), Otsu might return
 * extreme values like 0 or 255. In these cases, we fall back to finding the
 * midpoint between the two peaks.
 */


/**
 * Create a binary image from ImageData using a threshold
 * Returns array where true = dark pixel
 */


/**
 * Check if a run ratio matches the 1:1:3:1:1 finder pattern ratio
 * Allows some tolerance for image distortion
 */
 {
  const totalSize = r0 + r1 + r2 + r3 + r4;
  if (totalSize < 7) return { valid: false, moduleSize: 0 };

  const moduleSize = totalSize / 7;

  // Chi-square goodness-of-fit to 1:1:3:1:1 (dark:light:dark:light:dark).
  // More stable than per-run tolerances when moduleSize is small or quantized.
  const e0 = moduleSize;
  const e1 = moduleSize;
  const e2 = moduleSize * 3;
  const e3 = moduleSize;
  const e4 = moduleSize;

  const eps = 1e-6;
  const d0 = r0 - e0;
  const d1 = r1 - e1;
  const d2 = r2 - e2;
  const d3 = r3 - e3;
  const d4 = r4 - e4;

  const chi2 =
    (d0 * d0) / (e0 + eps) +
    (d1 * d1) / (e1 + eps) +
    (d2 * d2) / (e2 + eps) +
    (d3 * d3) / (e3 + eps) +
    (d4 * d4) / (e4 + eps);

  // Slightly looser at very small module sizes.
  const chi2Max = moduleSize < 2.5 ? 16.0 : 12.0;
  const valid = chi2 <= chi2Max;

  if (valid) {
    debugLog(
      `checkFinderPatternRatio: VALID runs=[${r0},${r1},${r2},${r3},${r4}] total=${totalSize} moduleSize=${moduleSize.toFixed(2)} chi2=${chi2.toFixed(2)}`
    );
  }

  return { valid, moduleSize: valid ? moduleSize : 0 };
}

/**
 * Scan a single row or column for finder pattern candidates using binary image
 * 
 * FINDER PATTERN: 1:1:3:1:1 ratio of dark:light:dark:light:dark modules
 * We track runs of consecutive same-colored pixels and check for this ratio.
 */
> {
  const candidates: Array<{ center: number; moduleSize: number }> = [];

  // Store completed run lengths and colors; we only need the last few, but keeping arrays is fine.
  const runs: number[] = [];
  const runColors: boolean[] = [];

  let currentRunLength = 1;

  const getPixel = (pos: number): boolean => {
    const idx = isHorizontal ? lineIndex * width + pos : pos * width + lineIndex;
    return binary[idx] ?? false;
  };

  let currentRunIsDark = getPixel(0);

  // Helper to check the last 5 runs without allocating slices.
  const checkPattern = (endPos: number) => {
    const n = runs.length;
    if (n < 5) return;

    const r0 = runs[n - 5], r1 = runs[n - 4], r2 = runs[n - 3], r3 = runs[n - 2], r4 = runs[n - 1];
    const c0 = runColors[n - 5]; // first-of-five color (must be dark)

    const { valid, moduleSize } = checkFinderPatternRatioRuns(r0, r1, r2, r3, r4);
    if (!valid || moduleSize <= 0) return;

    // Finder pattern must be: dark(1) - light(1) - dark(3) - light(1) - dark(1)
    if (!c0) {
      debugLog(`scanLine: Valid ratio but firstOfFive is LIGHT at ${isHorizontal ? 'H' : 'V'} line=${lineIndex} endPos=${endPos}`);
      return;
    }

    const total = r0 + r1 + r2 + r3 + r4;
    const center = endPos - total / 2;
    candidates.push({ center, moduleSize });

    debugLog(`scanLine: Candidate at ${isHorizontal ? 'H' : 'V'} line=${lineIndex} center=${center.toFixed(1)} moduleSize=${moduleSize.toFixed(2)}`);
  };

  for (let pos = 1; pos < length; pos++) {
    const isDark = getPixel(pos);

    if (isDark === currentRunIsDark) {
      currentRunLength++;
    } else {
      runs.push(currentRunLength);
      runColors.push(currentRunIsDark);

      checkPattern(pos);

      // Shift window occasionally to bound memory on long lines (keeps last ~20 runs, enough for detection)
      if (runs.length > 32) {
        runs.splice(0, runs.length - 20);
        runColors.splice(0, runColors.length - 20);
      }

      currentRunIsDark = isDark;
      currentRunLength = 1;
    }
  }

  // Handle final run at end of scan line
  runs.push(currentRunLength);
  runColors.push(currentRunIsDark);
  checkPattern(length);

  return candidates;
}

/**
 * Score a finder pattern candidate by checking the actual 7x7 structure
 * Returns a numerical score 0-100 based on how well the pattern matches
 * 
 * A finder pattern is 7x7 modules:
 * XXXXXXX (dark)
 * X.....X
 * X.XXX.X
 * X.XXX.X
 * X.XXX.X
 * X.....X
 * XXXXXXX
 * Where X=dark, .=light
 */


/**
 * Find the optimal center position for a finder pattern within a search region
 * Searches a grid of positions around the initial estimate and returns the best one
 */
 {
  let bestX = initialX;
  let bestY = initialY;
  let bestScore = scoreFinderPatternAt(binary, width, height, initialX, initialY, moduleSize);
  
  // Search radius: half a module size in each direction
  const searchRadius = moduleSize * 0.6;
  const step = moduleSize * 0.15; // Fine-grained search
  
  for (let dy = -searchRadius; dy <= searchRadius; dy += step) {
    for (let dx = -searchRadius; dx <= searchRadius; dx += step) {
      const testX = initialX + dx;
      const testY = initialY + dy;
      const testScore = scoreFinderPatternAt(binary, width, height, testX, testY, moduleSize);
      
      if (testScore > bestScore) {
        bestScore = testScore;
        bestX = testX;
        bestY = testY;
      }
    }
  }
  
  return { x: bestX, y: bestY, score: bestScore };
}

/**
 * Merge/cluster nearby finder pattern candidates to reduce duplicates.
 * Sorts by proximity and merges candidates within 0.75*moduleSize distance.
 */
>
): Array<{ x: number; y: number; moduleSize: number }> {
  if (cands.length === 0) return [];
  
  // Sort by x then y for deterministic processing
  const sorted = [...cands].sort((a, b) => {
    if (Math.abs(a.x - b.x) > 0.1) return a.x - b.x;
    return a.y - b.y;
  });
  
  const merged: Array<{ x: number; y: number; moduleSize: number; weight: number }> = [];
  
  for (const c of sorted) {
    // Find if there's an existing merged candidate close enough
    const threshold = Math.max(c.moduleSize, 1) * 0.75;
    let foundMatch = false;
    
    for (const m of merged) {
      const dist = Math.hypot(m.x - c.x, m.y - c.y);
      const sizeRatio = Math.abs(m.moduleSize - c.moduleSize) / Math.max(m.moduleSize, c.moduleSize, 1);
      
      // Merge if within distance threshold AND moduleSize within 50%
      if (dist <= threshold && sizeRatio <= 0.5) {
        // Weighted average of positions
        const totalWeight = m.weight + 1;
        m.x = (m.x * m.weight + c.x) / totalWeight;
        m.y = (m.y * m.weight + c.y) / totalWeight;
        m.moduleSize = (m.moduleSize * m.weight + c.moduleSize) / totalWeight;
        m.weight = totalWeight;
        foundMatch = true;
        break;
      }
    }
    
    if (!foundMatch) {
      merged.push({ x: c.x, y: c.y, moduleSize: c.moduleSize, weight: 1 });
    }
  }
  
  // Return without the weight field
  return merged.map(m => ({ x: m.x, y: m.y, moduleSize: m.moduleSize }));
}

/**
 * Find finder patterns using a binary image
 */


/**
 * FALLBACK: Template-based finder pattern detection
 * Uses correlation with a simple finder pattern template to find candidates
 * This is more robust than run-length encoding for noisy/distorted images
 */


/**
 * Find all finder patterns in an image
 * Tries multiple thresholding strategies for robustness
 */


/**
 * Locate the QR code from 3 finder patterns
 * Returns the corner locations or null if patterns can't be identified
 */
 | null {
  debugLog(`locateQRCode: input ${patterns.length} patterns`);
  if (patterns.length < 3) {
    debugLog(`locateQRCode: FAILED - need at least 3 patterns`);
    return null;
  }
  
  // If more than 3 patterns, find the best 3
  // (the ones that form a right triangle)
  let bestGroup: FinderPatternGroup | null = null;
  let bestScore = Infinity;
  
  for (let i = 0; i < patterns.length; i++) {
    for (let j = i + 1; j < patterns.length; j++) {
      for (let k = j + 1; k < patterns.length; k++) {
        const [p1, p2, p3] = [patterns[i], patterns[j], patterns[k]];
        
        // Calculate distances between all pairs
        const d12 = Math.sqrt(Math.pow(p2.centerX - p1.centerX, 2) + Math.pow(p2.centerY - p1.centerY, 2));
        const d13 = Math.sqrt(Math.pow(p3.centerX - p1.centerX, 2) + Math.pow(p3.centerY - p1.centerY, 2));
        const d23 = Math.sqrt(Math.pow(p3.centerX - p2.centerX, 2) + Math.pow(p3.centerY - p2.centerY, 2));
        
        // Find the longest distance (diagonal) - that's between top-right and bottom-left
        // The pattern NOT on the diagonal is top-left
        let topLeft: FinderPattern;
        let other1: FinderPattern;
        let other2: FinderPattern;
        let sideLen: number;
        
        if (d23 >= d12 && d23 >= d13) {
          topLeft = p1; other1 = p2; other2 = p3; sideLen = (d12 + d13) / 2;
        } else if (d13 >= d12 && d13 >= d23) {
          topLeft = p2; other1 = p1; other2 = p3; sideLen = (d12 + d23) / 2;
        } else {
          topLeft = p3; other1 = p1; other2 = p2; sideLen = (d13 + d23) / 2;
        }
        
        // Check if this forms a reasonable right angle
        // The diagonal should be approximately sqrt(2) times the sides
        const diagonal = Math.max(d12, d13, d23);
        const expectedDiagonal = sideLen * Math.sqrt(2);
        const score = Math.abs(diagonal - expectedDiagonal) / sideLen;
        
        if (score < bestScore && score < 0.3) { // Within 30% of expected
          // Determine which is top-right vs bottom-left using cross product
          const v1 = { x: other1.centerX - topLeft.centerX, y: other1.centerY - topLeft.centerY };
          const v2 = { x: other2.centerX - topLeft.centerX, y: other2.centerY - topLeft.centerY };
          const cross = v1.x * v2.y - v1.y * v2.x;
          
          // Positive cross product means other1 is to the right, other2 is below
          // (assuming y increases downward)
          let topRight: FinderPattern;
          let bottomLeft: FinderPattern;
          if (cross > 0) {
            topRight = other1;
            bottomLeft = other2;
          } else {
            topRight = other2;
            bottomLeft = other1;
          }
          
          bestGroup = { topLeft, topRight, bottomLeft };
          bestScore = score;
        }
      }
    }
  }
  
  if (!bestGroup) {
    debugLog(`locateQRCode: FAILED - no valid right triangle found`);
    return null;
  }
  
  debugLog(`locateQRCode: bestScore=${bestScore.toFixed(4)}`);
  debugLog(`locateQRCode: topLeft=(${bestGroup.topLeft.centerX.toFixed(1)}, ${bestGroup.topLeft.centerY.toFixed(1)})`);
  debugLog(`locateQRCode: topRight=(${bestGroup.topRight.centerX.toFixed(1)}, ${bestGroup.topRight.centerY.toFixed(1)})`);
  debugLog(`locateQRCode: bottomLeft=(${bestGroup.bottomLeft.centerX.toFixed(1)}, ${bestGroup.bottomLeft.centerY.toFixed(1)})`);
  
  // Calculate bottom-right corner position
  // bottomRight = topRight + bottomLeft - topLeft
  const bottomRightX = bestGroup.topRight.centerX + bestGroup.bottomLeft.centerX - bestGroup.topLeft.centerX;
  const bottomRightY = bestGroup.topRight.centerY + bestGroup.bottomLeft.centerY - bestGroup.topLeft.centerY;
  
  debugLog(`locateQRCode: bottomRight=(${bottomRightX.toFixed(1)}, ${bottomRightY.toFixed(1)}) [calculated]`);
  
  const location: QRLocation = {
    topLeft: { x: bestGroup.topLeft.centerX, y: bestGroup.topLeft.centerY },
    topRight: { x: bestGroup.topRight.centerX, y: bestGroup.topRight.centerY },
    bottomLeft: { x: bestGroup.bottomLeft.centerX, y: bestGroup.bottomLeft.centerY },
    bottomRight: { x: bottomRightX, y: bottomRightY },
  };
  
  return { location, patterns: bestGroup };
}

/**
 * Calculate version from finder pattern distances
 */
 {
  // Distance between finder pattern centers = moduleCount - 7 modules
  // (since finder patterns are 7x7 and centers are 3.5 modules from edge)
  const dx = patterns.topRight.centerX - patterns.topLeft.centerX;
  const dy = patterns.topRight.centerY - patterns.topLeft.centerY;
  const distTopLeftToTopRight = Math.sqrt(dx * dx + dy * dy);
  
  const dx2 = patterns.bottomLeft.centerX - patterns.topLeft.centerX;
  const dy2 = patterns.bottomLeft.centerY - patterns.topLeft.centerY;
  const distTopLeftToBottomLeft = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  
  const avgDistance = (distTopLeftToTopRight + distTopLeftToBottomLeft) / 2;
  const avgModuleSize = (patterns.topLeft.moduleSize + patterns.topRight.moduleSize + patterns.bottomLeft.moduleSize) / 3;
  
  // Distance between centers is (moduleCount - 7) modules
  const moduleCountEstimate = (avgDistance / avgModuleSize) + 7;
  
  // Find closest valid module count (4*v + 17 for v = 1-40)
  let bestVersion = 1;
  let bestDiff = Infinity;
  
  for (let v = 1; v <= 40; v++) {
    const mc = 4 * v + 17;
    const diff = Math.abs(mc - moduleCountEstimate);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestVersion = v;
    }
  }
  
  return {
    version: bestVersion,
    moduleCount: 4 * bestVersion + 17,
  };
}

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


/**
 * Get character count bit length based on mode and version
 */


/**
 * Decode payload from module matrix using reverse of mapData algorithm.
 *
 * This walks the matrix in the same zig-zag order as qrcode.mjs:mapData,
 * skipping structural modules and un-applying the mask. It then parses
 * the resulting bit stream into segments according to the QR spec.
 */
 | null {
  qrLogLazy('debug', () => `decodePayload: START moduleCount=${moduleCount}, maskPattern=${maskPattern}, version=${version}, eccLevel=${eccLevel}`);
  const maskFunc = getMaskFunction(maskPattern);

  // Read data bits in zigzag pattern (reverse of mapData in qrcode.mjs)
  const bytes: number[] = [];
  let bitLen = 0;
  let curByte = 0;
  let curBitCount = 0;
  let col = moduleCount - 1;
  let upward = true;

  while (col > 0) {
    // Skip timing pattern column
    if (col === 6) col--;

    // Read two columns at a time
    for (let i = 0; i < moduleCount; i++) {
      const actualRow = upward ? moduleCount - 1 - i : i;

      for (let dc = 0; dc < 2; dc++) {
        const actualCol = col - dc;
        if (actualCol < 0) continue;

        // Skip structural modules
        if (!isStructuralModule(actualRow, actualCol, moduleCount, version)) {
          let bit = matrix[actualRow]?.[actualCol] ?? false;
          if (maskFunc(actualRow, actualCol)) {
            bit = !bit;
          }
          curByte = (curByte << 1) | (bit ? 1 : 0);
          curBitCount++;
          bitLen++;
          if (curBitCount === 8) {
            bytes.push(curByte);
            curByte = 0;
            curBitCount = 0;
          }
        }
      }
    }

    col -= 2;
    upward = !upward;
  }

  
  qrLogLazy('debug', () => `decodePayload: extracted ${bitLen} data bits -> ${bytes.length} bytes`);
  qrLogLazy('debug', () => `decodePayload: first 20 bytes: [${bytes.slice(0, 20).join(', ')}]`);

  if (bytes.length === 0) {
    qrLogLazy('debug', () => `decodePayload: FAILED - no bytes extracted`);
    return null;
  }

  // Apply Reed-Solomon error correction if ECC level is known
  // FIX: Hard-fail when RS correction fails - don't parse garbage bytes
  let correctedBytes: number[];
  let errorsCorrected: number | null = null;
  
  if (eccLevel) {
    qrLogLazy('debug', () => `decodePayload: applying RS correction for ECC=${eccLevel}`);
    const rsResult = applyRSCorrection(bytes, version, eccLevel);
    if (rsResult) {
      correctedBytes = rsResult.data;
      errorsCorrected = rsResult.errorsCorrected;
      qrLogLazy('debug', () => `decodePayload: RS correction SUCCESS, errors corrected=${errorsCorrected}, data bytes=${correctedBytes.length}`);
    } else {
      // FIX: RS correction failed - the codewords are corrupt, don't try to parse them
      qrLogLazy('debug', () => `decodePayload: RS correction FAILED - returning null (corrupt codewords)`);
      return null;
    }
  } else {
    // No ECC level means we can't verify the data - still try to parse but this is risky
    qrLogLazy('debug', () => `decodePayload: no ECC level, using raw bytes (unverified)`);
    correctedBytes = bytes;
  }

  // Convert corrected bytes back to bits for segment parsing
  const correctedBits: boolean[] = [];
  for (const byte of correctedBytes) {
    for (let b = 7; b >= 0; b--) {
      correctedBits.push(((byte >> b) & 1) === 1);
    }
  }

  // Decode the data segments from corrected bits
  let bitIndex = 0;
  let result = '';
  const payloadBytes: number[] = [];

  const readBits = (count: number): number => {
    let value = 0;
    for (let i = 0; i < count; i++) {
      if (correctedBits[bitIndex + i]) {
        value |= 1 << (count - 1 - i);
      }
    }
    bitIndex += count;
    return value;
  };

  // Process data segments
  let segmentIndex = 0;
  qrLogLazy('debug', () => `decodePayload: starting segment parsing, correctedBits.length=${correctedBits.length}`);
  
  while (bitIndex + 4 <= correctedBits.length) {
    const mode = readBits(4);
    qrLogLazy('debug', () => `decodePayload: segment ${segmentIndex}, mode=${mode} (${mode === 1 ? 'NUMERIC' : mode === 2 ? 'ALPHANUMERIC' : mode === 4 ? 'BYTE' : mode === 8 ? 'KANJI' : mode === 0 ? 'TERMINATOR' : 'UNKNOWN'}), bitIndex=${bitIndex}`);

    if (mode === QR_MODE.TERMINATOR) {
      qrLogLazy('debug', () => `decodePayload: hit TERMINATOR, stopping`);
      break;
    }

    const charCountBits = getCharCountBits(mode, version);
    if (bitIndex + charCountBits > correctedBits.length) {
      qrLogLazy('debug', () => `decodePayload: not enough bits for charCount (need ${charCountBits}, have ${correctedBits.length - bitIndex})`);
      break;
    }

    const charCount = readBits(charCountBits);
    qrLogLazy('debug', () => `decodePayload: charCount=${charCount} (${charCountBits} bits)`);
    segmentIndex++;

    switch (mode) {
      case QR_MODE.NUMERIC: {
        // STRICT CAPACITY CHECK: charCount must not exceed version/ECC capacity
        if (eccLevel) {
          const maxCapacity = DATA_CAPACITY_NUMERIC[version]?.[eccLevel] ?? 0;
          qrLogLazy('debug', () => `decodePayload: NUMERIC mode charCount=${charCount}, maxCapacity=${maxCapacity}`);
          if (charCount > maxCapacity) {
            qrLogLazy('debug', () => `decodePayload: REJECTED - numeric mode charCount ${charCount} exceeds capacity ${maxCapacity}`);
            debugLog(`decodePayload: REJECTED - numeric mode charCount ${charCount} exceeds capacity ${maxCapacity}`);
            return null;
          }
        } else if (charCount > 7100) {
          // Fallback check if no ECC level (largest QR can hold ~7089 numeric)
          qrLogLazy('debug', () => `decodePayload: REJECTED - numeric mode charCount ${charCount} is unreasonably large`);
          debugLog(`decodePayload: REJECTED - numeric mode charCount ${charCount} is unreasonably large`);
          return null;
        }
        
        // Numeric mode: 3 digits = 10 bits, 2 digits = 7 bits, 1 digit = 4 bits
        const numericStart = result.length;
        let remaining = charCount;
        while (remaining >= 3) {
          const val = readBits(10);
          if (val > 999) {
            qrLogLazy('debug', () => `decodePayload: REJECTED - invalid numeric triplet ${val}`);
            debugLog(`decodePayload: REJECTED - invalid numeric triplet ${val}`);
            return null;
          }
          result += String(Math.floor(val / 100));
          result += String(Math.floor((val % 100) / 10));
          result += String(val % 10);
          remaining -= 3;
        }
        if (remaining === 2) {
          const val = readBits(7);
          if (val > 99) {
            qrLogLazy('debug', () => `decodePayload: REJECTED - invalid numeric pair ${val}`);
            debugLog(`decodePayload: REJECTED - invalid numeric pair ${val}`);
            return null;
          }
          result += String(Math.floor(val / 10));
          result += String(val % 10);
        } else if (remaining === 1) {
          const val = readBits(4);
          if (val > 9) {
            qrLogLazy('debug', () => `decodePayload: REJECTED - invalid numeric digit ${val}`);
            debugLog(`decodePayload: REJECTED - invalid numeric digit ${val}`);
            return null;
          }
          result += String(val);
        }
        
        // STRICT VALIDATION: Numeric mode MUST produce only digits 0-9
        // If result contains non-digits, this is a garbage decode from wrong mask/alignment
        const numericSegment = result.substring(numericStart);
        if (numericSegment.length > 0 && !/^[0-9]+$/.test(numericSegment)) {
          qrLogLazy('debug', () => `decodePayload: REJECTED - numeric mode produced non-digit chars: "${numericSegment.substring(0, 30)}..."`);
          debugLog(`decodePayload: REJECTED - numeric mode produced non-digit chars`);
          return null;
        }
        qrLogLazy('debug', () => `decodePayload: NUMERIC segment OK, ${numericSegment.length} digits`);
        break;
      }

      case QR_MODE.ALPHANUMERIC: {
        // STRICT CAPACITY CHECK: charCount must not exceed version/ECC capacity
        if (eccLevel) {
          const maxCapacity = DATA_CAPACITY_ALPHANUMERIC[version]?.[eccLevel] ?? 0;
          qrLogLazy('debug', () => `decodePayload: ALPHANUMERIC mode charCount=${charCount}, maxCapacity=${maxCapacity}`);
          if (charCount > maxCapacity) {
            qrLogLazy('debug', () => `decodePayload: REJECTED - alphanumeric mode charCount ${charCount} exceeds capacity ${maxCapacity}`);
            debugLog(`decodePayload: REJECTED - alphanumeric mode charCount ${charCount} exceeds capacity ${maxCapacity}`);
            return null;
          }
        } else if (charCount > 4300) {
          // Fallback check if no ECC level
          debugLog(`decodePayload: REJECTED - alphanumeric mode charCount ${charCount} is unreasonably large`);
          return null;
        }
        
        // Alphanumeric: 2 chars = 11 bits, 1 char = 6 bits
        let remaining = charCount;
        while (remaining >= 2) {
          const val = readBits(11);
          if (val >= 45 * 45) {
            debugLog(`decodePayload: REJECTED - invalid alphanumeric pair ${val}`);
            return null;
          }
          const char1 = ALPHANUMERIC_CHARS[Math.floor(val / 45)];
          const char2 = ALPHANUMERIC_CHARS[val % 45];
          if (!char1 || !char2) {
            debugLog(`decodePayload: REJECTED - alphanumeric char out of range`);
            return null;
          }
          result += char1;
          result += char2;
          remaining -= 2;
        }
        if (remaining === 1) {
          const val = readBits(6);
          if (val >= 45) {
            debugLog(`decodePayload: REJECTED - invalid alphanumeric single ${val}`);
            return null;
          }
          const char = ALPHANUMERIC_CHARS[val];
          if (!char) {
            debugLog(`decodePayload: REJECTED - alphanumeric char out of range`);
            return null;
          }
          result += char;
        }
        break;
      }

      case QR_MODE.BYTE: {
        // SANITY CHECK: charCount must not exceed version/ECC capacity
        // If it does, this is a garbage decode from a misaligned matrix
        if (eccLevel) {
          const maxCapacity = DATA_CAPACITY_BYTE[version]?.[eccLevel] ?? 0;
          qrLogLazy('debug', () => `decodePayload: BYTE mode charCount=${charCount}, maxCapacity=${maxCapacity}`);
          if (charCount > maxCapacity) {
            qrLogLazy('debug', () => `decodePayload: REJECTED - byte mode charCount ${charCount} exceeds capacity ${maxCapacity}`);
            debugLog(`decodePayload: REJECTED - byte mode charCount ${charCount} exceeds capacity ${maxCapacity}`);
            return null;
          }
        }
        
        // Additional sanity: charCount should not exceed remaining bits / 8
        const remainingBits = correctedBits.length - bitIndex;
        if (charCount * 8 > remainingBits + 8) { // +8 for some tolerance
          debugLog(`decodePayload: REJECTED - byte mode charCount ${charCount} exceeds available bits`);
          return null;
        }
        
        // Byte mode: 8 bits per byte; decode this segment as UTF-8 (or Latin-1 fallback)
        const segment: number[] = [];
        for (let i = 0; i < charCount; i++) {
          const byte = readBits(8);
          segment.push(byte);
        }
        payloadBytes.push(...segment);

        let decodedSegment = '';
        try {
          const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;
          if (decoder) {
            decodedSegment = decoder.decode(new Uint8Array(segment));
          } else {
            for (const byte of segment) {
              decodedSegment += String.fromCharCode(byte);
            }
          }
        } catch {
          // Fallback to Latin-1 if UTF-8 decoding fails
          for (const byte of segment) {
            decodedSegment += String.fromCharCode(byte);
          }
        }
        
        // SANITY CHECK: Reject garbage binary data that doesn't look like text
        // Count printable characters (ASCII 32-126, plus common whitespace 9-13)
        let printableCount = 0;
        for (let i = 0; i < decodedSegment.length; i++) {
          const code = decodedSegment.charCodeAt(i);
          // Printable ASCII (space to tilde) or common whitespace (tab, newline, etc.)
          if ((code >= 32 && code <= 126) || (code >= 9 && code <= 13)) {
            printableCount++;
          }
        }
        const printableRatio = decodedSegment.length > 0 ? printableCount / decodedSegment.length : 0;
        qrLogLazy('debug', () => `decodePayload: BYTE segment decoded, length=${decodedSegment.length}, printableRatio=${(printableRatio * 100).toFixed(1)}%`);
        qrLogLazy('debug', () => `decodePayload: BYTE segment preview: "${decodedSegment.substring(0, 50)}${decodedSegment.length > 50 ? '...' : ''}"`);
        
        // If less than 30% printable, this is likely garbage from a misaligned matrix
        if (decodedSegment.length > 5 && printableRatio < 0.3) {
          qrLogLazy('debug', () => `decodePayload: REJECTED - byte mode segment has only ${(printableRatio * 100).toFixed(1)}% printable chars (threshold 30%)`);
          debugLog(`decodePayload: REJECTED - byte mode segment has only ${(printableRatio * 100).toFixed(1)}% printable chars (threshold 30%)`);
          return null;
        }
        
        result += decodedSegment;
        break;
      }

      case QR_MODE.KANJI: {
        // Kanji mode: 13 bits per character (Shift-JIS) – we provide a best-effort mapping
        for (let i = 0; i < charCount; i++) {
          let val = readBits(13);
          // Convert from compressed to Shift-JIS
          const hi = Math.floor(val / 0xC0);
          const lo = val % 0xC0;
          val = (hi << 8) | lo;
          if (val < 0x1F00) {
            val += 0x8140;
          } else {
            val += 0xC140;
          }
          result += String.fromCharCode(val);
        }
        break;
      }

      default: {
        // FIX: Unknown mode indicator means the bitstream is corrupt
        // Mode must be 0 (terminator), 1 (numeric), 2 (alphanumeric), 4 (byte), or 8 (kanji)
        // Anything else (like 11, 14, etc.) indicates wrong mask/alignment
        qrLogLazy('debug', () => `decodePayload: REJECTED - unknown mode ${mode} (invalid mode indicator)`);
        return null;
      }
    }
  }

  const finalBytes = payloadBytes.length > 0 ? payloadBytes : bytes;

  qrLogLazy('debug', () => `decodePayload: SUCCESS payload="${result.substring(0, 100)}${result.length > 100 ? '...' : ''}" (${result.length} chars)`);
  return {
    payload: result,
    payloadBytes: new Uint8Array(finalBytes),
    errorsCorrected,
  };
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Analyze a QR code image and extract all metadata
 */

): QRAnalysisResult {
  const __qrStartedMs = nowMs();
  const __qrStats = new StatsCollector();
  ACTIVE_STATS = __qrStats;
  let __qrStage: QRStage = 'input_preprocess';
  let __qrFailReason: QRFailureReason | null = null;
  let __qrScale = 1;
  const __setStage = (s: QRStage): void => { __qrStage = s; __qrStats.gauge('stage.current', s); };
  const __fail = (stage: QRStage, reason: QRFailureReason): void => { __qrStage = stage; __qrFailReason = reason; };
  const __finish = (result: QRAnalysisResult, ok: boolean): QRAnalysisResult => {
    if (_qrLogLevelRank(QR_LOG_LEVEL) >= _qrLogLevelRank('debug')) {
      result.debugLog = getDebugLog();
    } else {
      result.debugLog = null;
    }
    emitSummaryLine({
      ok,
      stage: ok ? 'payload_decode' : __qrStage,
      reason: ok ? null : (__qrFailReason ?? 'unknown'),
      startedMs: __qrStartedMs,
      width: __qrStats.getGaugeNumber('input.width') ?? (result.imageAnalysis?.width ?? 0),
      height: __qrStats.getGaugeNumber('input.height') ?? (result.imageAnalysis?.height ?? 0),
      scale: __qrScale,
      stats: __qrStats,
    });
    ACTIVE_STATS = null;
    return result;
  };

  // Clear debug log at start of analysis
  clearDebugLog();
  __setStage('input_preprocess');
  
  const warnings: string[] = [];
  
  // Get ImageData from source
  let imageData: ImageData;
  if (source instanceof HTMLCanvasElement) {
    const ctx = source.getContext('2d');
    if (!ctx) {
      const result = createErrorResult('canvas_error', 'Could not get canvas context');
      __fail('input_preprocess', 'canvas_context_unavailable');
      return __finish(result, false);
    }
    imageData = ctx.getImageData(0, 0, source.width, source.height);
    debugLog(`analyzeQRCode: Got ImageData from canvas ${source.width}x${source.height}`);
  } else {
    imageData = source as ImageData;
    debugLog(`analyzeQRCode: Using provided ImageData ${imageData.width}x${imageData.height}`);
  }
  
  // Heuristic: for small inputs, nearest-neighbor upscale improves module sampling stability.
  const upscale = maybeUpscaleForQR(imageData);
  if (upscale.scale > 1) {
    debugLog(`analyzeQRCode: Upscaling input ${imageData.width}x${imageData.height} -> ${upscale.imageData.width}x${upscale.imageData.height} (x${upscale.scale})`);
    warnings.push(`input_upscaled_x${upscale.scale}`);
    __qrScale = upscale.scale;
    imageData = upscale.imageData;
  }

  __qrStats.gauge('input.width', imageData.width);
  __qrStats.gauge('input.height', imageData.height);
  const __imgContrast = estimateImageContrast(imageData);
  __qrStats.gauge('input.contrast', __imgContrast.contrast);
  __qrStats.gauge('input.luma.mean', __imgContrast.mean);
  __qrStats.gauge('input.luma.std', __imgContrast.std);
  __qrStats.gauge('input.luma.p10', __imgContrast.p10);
  __qrStats.gauge('input.luma.p90', __imgContrast.p90);

  // Find finder patterns using custom detection
  debugLog(`analyzeQRCode: Finding finder patterns...`);
  const finderPatterns = findFinderPatterns(imageData);
  
  debugLog(`analyzeQRCode: Found ${finderPatterns.length} finder patterns`);
  __qrStats.gauge('finders.count', finderPatterns.length);
  
  if (finderPatterns.length < 3) {
    debugLog(`analyzeQRCode: FAILED - not enough finder patterns`);
    const result = createErrorResult('no_qr_detected', 'No QR code detected. Could not find enough finder patterns. Make sure the image contains a clear, well-lit QR code.');
    __fail('finder_scan_merge', 'not_enough_finders');
    return __finish(result, false);
  }
  
  // Locate the QR code from finder patterns
  __setStage('finder_scan_merge');
  debugLog(`analyzeQRCode: Locating QR code...`);
  const qrLocation = locateQRCode(finderPatterns);
  
  if (!qrLocation) {
    debugLog(`analyzeQRCode: FAILED - could not locate QR code`);
    const result = createErrorResult('no_qr_detected', 'Could not locate QR code. The finder patterns do not form a valid QR code configuration.');
    __fail('finder_scan_merge', 'unable_to_locate');
    return __finish(result, false);
  }
  
  const { location, patterns } = qrLocation;
  
  // Calculate version from finder pattern distances
  const { version, moduleCount } = calculateVersionFromPatterns(patterns);
  debugLog(`analyzeQRCode: Calculated version=${version}, moduleCount=${moduleCount}`);
  
  if (!moduleCount || !version) {
    warnings.push('Could not determine QR version from image');
  }
  
  // Extract module matrix candidates (sorted by score)
  __setStage('transform_sampling');
  debugLog(`analyzeQRCode: Extracting module matrix candidates...`);
  const candidates = extractModuleCandidates(imageData, location, moduleCount);
  __qrStats.gauge('candidates.count', candidates.length);
  if (candidates.length > 0) __qrStats.gauge('candidates.bestScore', candidates[0].score);
  debugLog(`analyzeQRCode: Generated ${candidates.length} candidates`);
  
  if (candidates.length === 0) {
    debugLog(`analyzeQRCode: FAILED - no matrix candidates`);
    const result = createErrorResult('no_qr_detected', 'Could not extract a QR code matrix. The finder patterns may not be aligned correctly.');
    __fail('transform_sampling', 'no_matrix_candidates');
    return __finish(result, false);
  }
  
  // Try candidates and collect all successful decodes, then pick the best one
  let moduleMatrix: boolean[][] | null = null;
  let eccLevel: ECCLevel | null = null;
  let maskPattern: MaskPattern | null = null;
  let payload: string | null = null;
  let payloadBytes: Uint8Array | null = null;
  let errorsCorrected: number | null = null;
  let successfulCandidate: MatrixCandidate | null = null;
  
  // All possible masks and ECC levels to try
  const ALL_MASKS: MaskPattern[] = [0, 1, 2, 3, 4, 5, 6, 7];
  const ALL_ECC_LEVELS: ECCLevel[] = ['L', 'M', 'Q', 'H'];
  
  // Structure to track successful decodes
  interface SuccessfulDecode {
    candidate: MatrixCandidate;
    candidateIndex: number;
    mask: MaskPattern;
    ecc: ECCLevel;
    payload: string;
    payloadBytes: Uint8Array;
    errorsCorrected: number | null;
  }
  const successfulDecodes: SuccessfulDecode[] = [];
  // Rank candidates using BCH format consistency (strong signal for correct sampling).
  // Try more candidates when the QR is low-res (few pixels per module).
  const estimatedModuleSizePx = estimateModuleSizePx(location, moduleCount);
  const isLowRes = estimatedModuleSizePx > 0 && estimatedModuleSizePx < 6;

  const formatDetailsByCandidate = new WeakMap<MatrixCandidate, FormatInfoDetailed>();

  const ranked = candidates.map((candidate, idx) => {
    const fmt = readFormatInfoDetailed(candidate.matrix);
    formatDetailsByCandidate.set(candidate, fmt);
    return { candidate, idx, fmt };
  });

  const formatGood = ranked.filter(r => r.fmt.best !== null);

  const rankList = (formatGood.length > 0 ? formatGood : ranked).sort((a, b) => {
    // Prefer agreement first
    if (a.fmt.agree !== b.fmt.agree) return a.fmt.agree ? -1 : 1;

    // Then prefer lower BCH distance (both reads when available)
    if (a.fmt.totalDist !== b.fmt.totalDist) return a.fmt.totalDist - b.fmt.totalDist;
    if (a.fmt.bestDist !== b.fmt.bestDist) return a.fmt.bestDist - b.fmt.bestDist;

    // Then prefer structural score
    return b.candidate.score - a.candidate.score;
  });

  const maxCandidatesToTry = Math.min(candidates.length, isLowRes ? 120 : 40);
  const candidatesToTry = rankList.slice(0, maxCandidatesToTry).map(r => r.candidate);

  qrLogLazy('debug', () => `[QR-DEBUG] analyzeQRCode: candidate filter=${formatGood.length}/${candidates.length} have BCH-decodable format; trying ${candidatesToTry.length} candidates (moduleSize≈${estimatedModuleSizePx.toFixed(2)}px, lowRes=${isLowRes})`);
debugLog(
    `analyzeQRCode: candidate filter=${formatGood.length}/${candidates.length} have BCH-decodable format; trying ${candidatesToTry.length} candidates (moduleSize≈${estimatedModuleSizePx.toFixed(2)}px, lowRes=${isLowRes})`
  );

  // Track total attempts for logging
  let totalAttempts = 0;
  
  for (let i = 0; i < candidatesToTry.length; i++) {
    const candidate = candidatesToTry[i];
    qrLogLazy('debug', () => `analyzeQRCode: trying candidate #${i + 1} (score=${candidate.score.toFixed(1)}, threshold=${candidate.threshold}, offset=(${candidate.dx},${candidate.dy}), inverted=${candidate.inverted})`);
    // Use BCH-corrected format info to prioritize masks/ECC. This is also a strong indicator of sampling quality.
    const fmt = formatDetailsByCandidate.get(candidate) ?? readFormatInfoDetailed(candidate.matrix);
    formatDetailsByCandidate.set(candidate, fmt);

    const formatInfo: FormatInfo | null = fmt.best ? { eccLevel: fmt.best.eccLevel, maskPattern: fmt.best.maskPattern } : null;
    const formatReliable = !!fmt.best && fmt.agree && fmt.totalDist <= 1;

    // Build ordered list of masks to try: decoded mask first (if available), then others
    let masksToTry: MaskPattern[];
    if (formatInfo) {
      masksToTry = [formatInfo.maskPattern, ...ALL_MASKS.filter(m => m !== formatInfo.maskPattern)];
      qrLogLazy('debug', () => `[QR-DEBUG] analyzeQRCode: candidate #${i + 1} format(BCH) mask=${formatInfo.maskPattern}, ECC=${formatInfo.eccLevel}, agree=${fmt.agree}, bestDist=${fmt.bestDist}, totalDist=${fmt.totalDist}, reliable=${formatReliable}`);
} else {
      masksToTry = [...ALL_MASKS];
      qrLogLazy('debug', () => `analyzeQRCode: candidate #${i + 1} format(BCH) decode failed, trying all masks`);
    }

    // Build ordered list of ECC levels: decoded ECC first (if available), then others
    let eccLevelsToTry: ECCLevel[];
    if (formatInfo) {
      eccLevelsToTry = [formatInfo.eccLevel, ...ALL_ECC_LEVELS.filter(e => e !== formatInfo.eccLevel)];
    } else {
      eccLevelsToTry = [...ALL_ECC_LEVELS];
    }

    // Try all mask × ECC combinations
    for (const tryMask of masksToTry) {
      for (const tryEcc of eccLevelsToTry) {
        totalAttempts++;
        
        // Try to decode payload with this mask and ECC
        const decoded = decodePayload(
          candidate.matrix,
          moduleCount,
          tryMask,
          version,
          tryEcc
        );
        
        // Check if decode succeeded AND produced non-empty payload
        if (decoded && decoded.payload && decoded.payload.length > 0) {
          qrLogLazy('debug', () => `analyzeQRCode: DECODE SUCCESS candidate #${i + 1}, mask=${tryMask}, ECC=${tryEcc}, errors=${decoded.errorsCorrected ?? 'unknown'}`);
          qrLogLazy('debug', () => `analyzeQRCode: payload="${decoded.payload.substring(0, 80)}${decoded.payload.length > 80 ? '...' : ''}"`);
          debugLog(`analyzeQRCode: DECODE SUCCESS candidate #${i + 1} mask=${tryMask} ECC=${tryEcc} errors=${decoded.errorsCorrected ?? 'unknown'}`);
          
          successfulDecodes.push({
            candidate,
            candidateIndex: i + 1,
            mask: tryMask,
            ecc: tryEcc,
            payload: decoded.payload,
            payloadBytes: decoded.payloadBytes,
            errorsCorrected: decoded.errorsCorrected,
          });
        }
      }
    }
    
    if (successfulDecodes.length === 0) {
      qrLogLazy('debug', () => `analyzeQRCode: candidate #${i + 1} FAILED all ${masksToTry.length * eccLevelsToTry.length} mask/ECC combinations`);
    }
  }
  
  qrLogLazy('debug', () => `analyzeQRCode: tried ${totalAttempts} total decode attempts, found ${successfulDecodes.length} successful decodes`);
  
  // Pick the best decode: sort by errorsCorrected ascending (fewest corrections = best)
  // Decodes with null errorsCorrected go last (we prefer verified RS correction)
  if (successfulDecodes.length > 0) {
    successfulDecodes.sort((a, b) => {
      // Prefer decodes with known error counts
      if (a.errorsCorrected === null && b.errorsCorrected === null) return 0;
      if (a.errorsCorrected === null) return 1; // a goes after b
      if (b.errorsCorrected === null) return -1; // b goes after a
      return a.errorsCorrected - b.errorsCorrected; // ascending (fewer errors = better)
    });
    
    const best = successfulDecodes[0];
    qrLogLazy('debug', () => `analyzeQRCode: BEST DECODE: candidate #${best.candidateIndex}, mask=${best.mask}, ECC=${best.ecc}, errors=${best.errorsCorrected ?? 'unknown'}`);
    debugLog(`analyzeQRCode: BEST DECODE: candidate #${best.candidateIndex} mask=${best.mask} ECC=${best.ecc} errors=${best.errorsCorrected ?? 'unknown'}`);
    
    moduleMatrix = best.candidate.matrix;
    eccLevel = best.ecc;
    maskPattern = best.mask;
    payload = best.payload;
    payloadBytes = best.payloadBytes;
    errorsCorrected = best.errorsCorrected;
    successfulCandidate = best.candidate;
  }
  
  // If no candidate decoded successfully, use the best-scored one for partial results
  if (!successfulCandidate) {
    qrLogLazy('debug', () => `analyzeQRCode: NO candidate decoded successfully after trying ${candidatesToTry.length} candidates`);
    debugLog(`analyzeQRCode: No candidate decoded successfully, using best-scored candidate`);
    const bestCandidate = candidates[0];
    moduleMatrix = bestCandidate.matrix;
    
    // Try to at least get format info from best candidate
    const formatInfo = readFormatInfo(bestCandidate.matrix);
    if (formatInfo) {
      eccLevel = formatInfo.eccLevel;
      maskPattern = formatInfo.maskPattern;
      qrLogLazy('debug', () => `analyzeQRCode: Format info from best candidate: ECC=${eccLevel}, mask=${maskPattern}`);
      debugLog(`analyzeQRCode: Format info from best candidate: ECC=${eccLevel}, mask=${maskPattern}`);
    } else {
      qrLogLazy('debug', () => `analyzeQRCode: Could not decode format info from best candidate either`);
      debugLog(`analyzeQRCode: Could not decode format info from best candidate`);
      warnings.push('Could not decode format information');
    }
    
    warnings.push('Could not decode QR payload - matrix extraction may be misaligned');
  }
  
  // Detect encoding mode from payload
  const encodingMode = payload ? detectEncodingMode(payload) : 'unknown';
  
  // Estimate quiet zone
  const quietZone = estimateQuietZone(imageData, location, moduleCount);
  
  // Enhanced analysis
  const contentType = payload ? detectContentType(payload) : null;
  const detectedColors = extractDominantColors(imageData, moduleMatrix, location, moduleCount);
  const estimatedModuleSize = location && moduleCount ? estimateModulePx(location, moduleCount) : null;
  const dataCapacity = calculateDataCapacity(payload, version, eccLevel);
  const structuralAnalysis = analyzeStructure(moduleMatrix, version);
  const imageProperties = calculateImageProperties(imageData, location, moduleCount);
  
  // Calculate confidence
  const confidence = calculateConfidence(
    !!eccLevel,
    !!maskPattern,
    !!moduleMatrix,
    quietZone?.adequate ?? false
  );
  
  // Final summary
  const hasValidMatrix = moduleMatrix !== null;
  const hasValidPayload = payload !== null && payload.length > 0;

  // If we made it this far but still have no payload, classify the failure explicitly.
  if (!hasValidPayload && !__qrFailReason) {
    __fail('payload_decode', hasValidMatrix ? 'payload_decode_failed' : 'no_matrix_candidates');
  }
  debugLog(`analyzeQRCode: ============================================`);
  debugLog(`analyzeQRCode: COMPLETE`);
  debugLog(`analyzeQRCode:   success=${hasValidPayload}`);
  debugLog(`analyzeQRCode:   hasValidMatrix=${hasValidMatrix}`);
  debugLog(`analyzeQRCode:   hasValidPayload=${hasValidPayload}`);
  debugLog(`analyzeQRCode:   payload=${payload ? `"${payload.substring(0, 50)}${payload.length > 50 ? '...' : ''}"` : 'null'}`);
  debugLog(`analyzeQRCode:   confidence=${confidence}`);
  debugLog(`analyzeQRCode: ============================================`);
  
  const debugLogStr = getDebugLog();
  
  const __result: QRAnalysisResult = {
    success: hasValidPayload,
    error: !hasValidPayload ? 'Could not decode QR code payload' : undefined,
    payload,
    payloadBytes,
    version,
    moduleCount,
    eccLevel,
    maskPattern,
    encodingMode,
    quietZone,
    moduleMatrix,
    location,
    confidence,
    warnings,
    errorsCorrected,
    // Enhanced analysis fields
    contentType,
    detectedColors,
    estimatedModulePx: estimatedModuleSize,
    dataCapacity,
    structuralAnalysis,
    imageProperties,
    debugLog: debugLogStr,
  };

  return __finish(__result, __result.success);
}


/**
 * Analyze QR from a File
 */
export async function analyzeQRFromFile(file: File): Promise<QRAnalysisResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(createErrorResult('canvas_error', 'Could not create canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(analyzeQRCode(canvas));
      };
      
      img.onerror = () => {
        resolve(createErrorResult('invalid_image', 'Failed to load image. The file may be corrupted or not a valid image.'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      resolve(createErrorResult('unknown', 'Failed to read file. Please try again with a different file.'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze QR from a URL
 */
export async function analyzeQRFromUrl(url: string): Promise<QRAnalysisResult> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return createErrorResult(
          'cors_blocked',
          'This image cannot be accessed due to server restrictions. ' +
          'Try: Right-click the image → "Save image as..." → Upload the saved file here.'
        );
      }
      return createErrorResult('fetch_failed', `Server returned error ${response.status}. Please check the URL and try again.`);
    }
    
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      return createErrorResult('invalid_image', 'The URL does not point to a valid image file.');
    }
    const file = new File([blob], 'qr-image', { type: blob.type });
    return analyzeQRFromFile(file);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // CORS errors typically show as "Failed to fetch" in browsers
    if (message.includes('Failed to fetch') || message.includes('CORS') || message.includes('NetworkError')) {
      return createErrorResult(
        'cors_blocked',
        'Unable to load image from this URL. The server blocks requests from other websites (CORS policy).\n\n' +
        'Solution: Right-click the image on the source website, select "Save image as...", ' +
        'then upload the saved file here instead.'
      );
    }
    if (message.includes('Invalid URL') || message.includes('URL')) {
      return createErrorResult('invalid_url', 'Please enter a valid image URL starting with http:// or https://');
    }
    return createErrorResult('unknown', `Failed to load image: ${message}`);
  }
}

// ============================================
// PERSPECTIVE TRANSFORM
// ============================================

// ============================================
// MODULE MATRIX EXTRACTION
// ============================================

/**
 * Calculate Otsu threshold for pixels within the QR region
 * Includes bimodal image handling like the global otsuThreshold function
 */
,
  moduleCount: number,
  luma?: Uint8Array
): number {
  const { width, height, data } = imageData;

  // Sample points within the QR region to build a histogram.
  // This avoids the global background dominating the threshold.
  const hist = new Uint32Array(256);
  let sampleCount = 0;

  const l = luma ?? buildLumaBuffer(imageData);

  const step = Math.max(1, Math.floor(moduleCount / 10));

  const tAny: any = transform as any;
  const H: [number, number, number, number, number, number, number, number] | undefined = tAny && tAny._H;
  const baseDx = H ? (typeof tAny._dx === "number" ? tAny._dx : 0.0) : 0.0;
  const baseDy = H ? (typeof tAny._dy === "number" ? tAny._dy : 0.0) : 0.0;

  for (let row = 0; row < moduleCount; row += step) {
    for (let col = 0; col < moduleCount; col += step) {
      let x: number;
      let y: number;

      if (H) {
        const u = col + baseDx + 0.5;
        const v = row + baseDy + 0.5;
        const denom = H[6] * u + H[7] * v + 1.0;
        if (!Number.isFinite(denom) || denom === 0) continue;
        x = (H[0] * u + H[1] * v + H[2]) / denom;
        y = (H[3] * u + H[4] * v + H[5]) / denom;
      } else {
        const pt = transform(col, row);
        x = pt.x;
        y = pt.y;
      }

      const px = Math.round(x);
      const py = Math.round(y);

      if (px < 0 || px >= width || py < 0 || py >= height) continue;

      const gray = l[py * width + px];
      hist[gray]++;
      sampleCount++;
    }
  }

  // If sampling failed (tiny/invalid transform), fall back to global.
  if (sampleCount < 16) {
    debugLog(`calculateRegionOtsuThreshold: insufficient samples (${sampleCount}), falling back to global Otsu`);
    return otsuThreshold(imageData);
  }

  // otsuThresholdFromHistogram expects a number[], so convert minimally.
  // (Histogram size is fixed 256; conversion cost is tiny compared to image scanning.)
  const histArray: number[] = Array.from(hist);
  const threshold = otsuThresholdFromHistogram(histArray, sampleCount);
  debugLog(`calculateRegionOtsuThreshold: threshold=${threshold} (samples=${sampleCount})`);

  return threshold;
}


/**
 * Sample a single pixel and return grayscale value
 */
/**
 * Bilinear sampling from a precomputed luma buffer.
 * Avoids repeated RGBA->luma work in hot loops.
 */



/**
 * Nearest-neighbor upscale for small QR inputs.
 * This improves effective module resolution without introducing blur.
 */



/**
 * Decide whether to upscale the input prior to detection/sampling.
 * Upscaling is applied only for small inputs to keep performance sane.
 */
 {
  const minSide = Math.min(imageData.width, imageData.height);

  // Heuristic: below ~400px on the short edge, many QR images end up <~6 px/module.
  // Upscale to make the short edge at least ~512px.
  if (minSide >= 400) return { imageData, scale: 1 };

  const targetMinSide = 512;
  const scale = Math.max(1, Math.ceil(targetMinSide / minSide));

  if (scale <= 1) return { imageData, scale: 1 };
  return { imageData: upscaleImageDataNearest(imageData, scale), scale };
}


/**
 * Sample multiple points within a module and use majority voting
 * Returns true if module is dark, false if light
 * 
 * Note: The transform function expects integer module indices and internally
 * adds 0.5 to sample at module centers. To sample at offset positions within
 * a module, we pass fractional offsets (e.g., col-0.3 samples at the left side
 * of the module, col+0.3 samples at the right side).
 */
// Offsets used for per-module majority voting. Kept at module scope to avoid allocations in hot loops.
const MODULE_VOTE_OFFSETS_DC = [0.0, -0.3, 0.3, -0.3, 0.3];
const MODULE_VOTE_OFFSETS_DR = [0.0, -0.3, -0.3, 0.3, 0.3];
,
  col: number,
  row: number,
  threshold: number
): boolean {
  // Sample 5 points within the module:
  // - Center
  // - 4 offsets at ~20%/80% (±0.3)
  // Avoid per-call allocations inside hot loops.
  const OFF_DC = MODULE_VOTE_OFFSETS_DC;
  const OFF_DR = MODULE_VOTE_OFFSETS_DR;

  let darkCount = 0;
  let lightCount = 0;

  const tAny: any = transform as any;
  const H: [number, number, number, number, number, number, number, number] | undefined = tAny && tAny._H;
  const baseDx = H ? (typeof tAny._dx === "number" ? tAny._dx : 0.0) : 0.0;
  const baseDy = H ? (typeof tAny._dy === "number" ? tAny._dy : 0.0) : 0.0;

  for (let i = 0; i < 5; i++) {
    let x: number;
    let y: number;

    if (H) {
      const u = col + baseDx + OFF_DC[i] + 0.5;
      const v = row + baseDy + OFF_DR[i] + 0.5;
      const denom = H[6] * u + H[7] * v + 1.0;
      if (!Number.isFinite(denom) || denom === 0) continue;

      x = (H[0] * u + H[1] * v + H[2]) / denom;
      y = (H[3] * u + H[4] * v + H[5]) / denom;
    } else {
      const pt = transform(col + OFF_DC[i], row + OFF_DR[i]);
      x = pt.x;
      y = pt.y;
    }

    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    const gray = luma
      ? sampleLumaBilinear(luma, width, height, x, y)
      : samplePixelGray(data, width, height, x, y);

    if (gray === null) continue;

    if (gray < threshold) darkCount++;
    else lightCount++;
  }

  // If no valid samples, default to light
  if (darkCount + lightCount === 0) return false;

  // Majority voting: dark wins if strictly more dark samples
  return darkCount > lightCount;
}


// ============================================
// MATRIX CANDIDATE TYPES AND SCORING
// ============================================

/**
 * Represents a candidate matrix extraction with metadata for scoring
 */
interface MatrixCandidate {
  matrix: boolean[][];
  score: number;
  threshold: number;
  dx: number;  // grid offset X in modules
  dy: number;  // grid offset Y in modules
  inverted: boolean;
}

/**
 * Expected finder pattern: 7x7 with dark border, light ring, dark center
 * Returns the expected value (true=dark, false=light) for each position
 */


/**
 * Score how well a 7x7 region matches the expected finder pattern
 * Returns a value 0-49 (number of matching modules)
 */


/**
 * Expected alignment pattern: 5x5 with dark border, light ring, dark center
 * Returns the expected value (true=dark, false=light) for each position
 */


/**
 * Score how well a 5x5 region matches the expected alignment pattern
 * Returns a value 0-25 (number of matching modules)
 */


/**
 * Detect alignment patterns in a candidate matrix
 * Returns array of detected alignment pattern centers with their scores
 * and offset from expected position
 */
interface DetectedAlignmentPattern {
  expectedRow: number;
  expectedCol: number;
  actualRow: number;
  actualCol: number;
  offsetRow: number;
  offsetCol: number;
  score: number;
}


/**
 * Calculate a grid offset correction based on detected alignment patterns
 * Returns the average offset that should be applied to better align the grid
 */
 | null {
  if (alignments.length === 0) return null;
  
  // Weight by score (higher score = more reliable)
  let totalWeight = 0;
  let weightedDx = 0;
  let weightedDy = 0;
  
  for (const align of alignments) {
    const weight = align.score;
    weightedDx += align.offsetCol * weight;
    weightedDy += align.offsetRow * weight;
    totalWeight += weight;
  }
  
  if (totalWeight === 0) return null;
  
  const dx = weightedDx / totalWeight;
  const dy = weightedDy / totalWeight;
  
  // Only return if the offset is non-trivial
  if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return null;
  
  return { dx, dy };
}

/**
 * Estimate average module size in pixels from finder pattern centers.
 * Used for search window sizing when refining with alignment patterns.
 */



/**
 * Estimate a threshold from the three finder patterns, which tends to be more reliable than a global threshold
 * on gradients / shadows. Returns null if insufficient samples.
 */


/**
 * Scores an alignment pattern centered at (cx, cy) in image space using an approximate moduleSizePx.
 * Returns best score across both polarities (normal/inverted).
 */


/**
 * Try to find the bottom-right-most alignment pattern in image space, then recompute the homography
 * using TL/TR/BL finder centers plus the found alignment center. This avoids relying on a synthetic bottomRight.
 */


/**
 * Score timing pattern alternation (row 6 and column 6)
 * Returns ratio 0.0-1.0 of correctly alternating modules
 */


/**
 * Comprehensive scoring function for matrix candidates
 * Higher score = better candidate
 * 
 * Components:
 * - Full finder pattern match (3 patterns × 49 modules = 147 max)
 * - Timing pattern ratio (scaled to 0-50)
 * - Format info decodability bonus (0 or 50)
 */


/**
 * Validate that extracted matrix has proper finder patterns
 * Returns true if the matrix looks like a valid QR code
 * 
 * STRICT VALIDATION: Requires 4/4 finder corners and 80%+ timing
 */


/**
 * Create an offset transform that shifts the sampling grid by (dx, dy) modules
 */
,
  dx: number,
  dy: number
): (col: number, row: number) => { x: number; y: number } {
  const bt: any = baseTransform as any;

  // If the base transform carries homography coefficients, preserve them and just update offsets.
  if (bt && bt._H) {
    const H: [number, number, number, number, number, number, number, number] = bt._H;
    const baseDx = (typeof bt._dx === "number" ? bt._dx : 0.0);
    const baseDy = (typeof bt._dy === "number" ? bt._dy : 0.0);
    const ndx = baseDx + dx;
    const ndy = baseDy + dy;

    const transform = (col: number, row: number) => {
      const u = col + ndx + 0.5;
      const v = row + ndy + 0.5;
      const denom = H[6] * u + H[7] * v + 1.0;
      return {
        x: (H[0] * u + H[1] * v + H[2]) / denom,
        y: (H[3] * u + H[4] * v + H[5]) / denom
      };
    };

    (transform as any)._H = H;
    (transform as any)._dx = ndx;
    (transform as any)._dy = ndy;

    return transform;
  }

  // Fallback for non-homography transforms.
  return (col: number, row: number) => baseTransform(col + dx, row + dy);
}


/**
 * Invert a boolean matrix (swap true/false)
 */


/**
 * Build a matrix from image data using given transform and threshold
 */
,
  moduleCount: number,
  threshold: number
): boolean[][] {
  const matrix: boolean[][] = new Array(moduleCount);
  for (let row = 0; row < moduleCount; row++) {
    const rowArr = new Array<boolean>(moduleCount);
    for (let col = 0; col < moduleCount; col++) {
      rowArr[col] = sampleModuleWithVoting(
        data, luma, width, height, transform, col, row, threshold
      );
    }
    matrix[row] = rowArr;
  }
  return matrix;
}


/**
 * Extract module matrix candidates from the image
 * Returns an array of candidates sorted by score (best first)
 * 
 * This replaces the old "return first valid" approach with a comprehensive
 * candidate search that tries multiple thresholds and grid offsets.
 */


/**
 * Calculate perspective transform from QR quadrilateral to module coordinates
 * 
 * Our finder pattern detection returns centers of finder patterns.
 * The finder centers are at module coordinates (3.5, 3.5), (moduleCount-3.5, 3.5), etc.
 * 
 * KEY INSIGHT: Instead of extending corners outward (which amplifies detection errors),
 * we use the finder centers directly as anchor points and interpolate/extrapolate from there.
 * This keeps the most accurately detected positions as anchors.
 * 
 * The u,v coordinates map so that:
 * - (u=0, v=0) corresponds to the topLeft finder center (module 3.5, 3.5)
 * - (u=1, v=0) corresponds to the topRight finder center (module moduleCount-3.5, 3.5)
 * - (u=1, v=1) corresponds to the bottomRight finder center
 * - (u=0, v=1) corresponds to the bottomLeft finder center
 * 
 * Edge modules (like 0,0) will have negative u,v and use extrapolation.
 */
 {
  // Projective transform (homography) from QR module space to image space.
  // More stable than bilinear interpolation under perspective skew.
  const finderOffset = 3.5;

  type P = { x: number; y: number };

  const srcPts: [P, P, P, P] = [
    { x: finderOffset, y: finderOffset },
    { x: moduleCount - finderOffset, y: finderOffset },
    { x: finderOffset, y: moduleCount - finderOffset },
    { x: moduleCount - finderOffset, y: moduleCount - finderOffset }
  ];

  const dstPts: [P, P, P, P] = [
    location.topLeft,
    location.topRight,
    location.bottomLeft,
    location.bottomRight
  ];

  const H = solveHomography(srcPts, dstPts);

  const transform = (col: number, row: number): P => {
    const u = col + 0.5;
    const v = row + 0.5;
    const denom = H[6] * u + H[7] * v + 1.0;
    return {
      x: (H[0] * u + H[1] * v + H[2]) / denom,
      y: (H[3] * u + H[4] * v + H[5]) / denom
    };
  };

  // Attach coefficients for allocation-free fast paths in hot loops.
  (transform as any)._H = H;
  (transform as any)._dx = 0.0;
  (transform as any)._dy = 0.0;

  return transform;
}
, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
  dst: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }]
): [number, number, number, number, number, number, number, number] {
  // Normalized DLT (Hartley normalization) on 4 point correspondences.
  // Greatly improves conditioning when points are small/near-collinear or when working at low px/module.
  type P = { x: number; y: number };

  const normalize4 = (pts: [P, P, P, P]) => {
    let cx = 0, cy = 0;
    for (let i = 0; i < 4; i++) { cx += pts[i].x; cy += pts[i].y; }
    cx *= 0.25; cy *= 0.25;

    let meanDist = 0;
    for (let i = 0; i < 4; i++) {
      const dx = pts[i].x - cx;
      const dy = pts[i].y - cy;
      meanDist += Math.sqrt(dx * dx + dy * dy);
    }
    meanDist *= 0.25;

    const s = meanDist > 1e-9 ? (Math.SQRT2 / meanDist) : 1.0;

    const npts: [P, P, P, P] = [
      { x: s * (pts[0].x - cx), y: s * (pts[0].y - cy) },
      { x: s * (pts[1].x - cx), y: s * (pts[1].y - cy) },
      { x: s * (pts[2].x - cx), y: s * (pts[2].y - cy) },
      { x: s * (pts[3].x - cx), y: s * (pts[3].y - cy) },
    ];

    // Row-major 3x3
    const T = [
      s, 0, -s * cx,
      0, s, -s * cy,
      0, 0, 1
    ];

    const invS = s !== 0 ? (1 / s) : 1.0;
    const invT = [
      invS, 0, cx,
      0, invS, cy,
      0, 0, 1
    ];

    return { npts, T, invT };
  };

  const mul3x3 = (A: number[], B: number[]): number[] => {
    // Row-major multiplication C = A * B
    return [
      A[0] * B[0] + A[1] * B[3] + A[2] * B[6],
      A[0] * B[1] + A[1] * B[4] + A[2] * B[7],
      A[0] * B[2] + A[1] * B[5] + A[2] * B[8],

      A[3] * B[0] + A[4] * B[3] + A[5] * B[6],
      A[3] * B[1] + A[4] * B[4] + A[5] * B[7],
      A[3] * B[2] + A[4] * B[5] + A[5] * B[8],

      A[6] * B[0] + A[7] * B[3] + A[8] * B[6],
      A[6] * B[1] + A[7] * B[4] + A[8] * B[7],
      A[6] * B[2] + A[7] * B[5] + A[8] * B[8],
    ];
  };

  const ns = normalize4(src);
  const nd = normalize4(dst);

  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const x = ns.npts[i].x;
    const y = ns.npts[i].y;
    const X = nd.npts[i].x;
    const Y = nd.npts[i].y;

    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
    b.push(X);

    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
    b.push(Y);
  }

  const p = solveLinearSystem8(A, b);

  // Normalized homography matrix (Hn)
  const Hn = [
    p[0], p[1], p[2],
    p[3], p[4], p[5],
    p[6], p[7], 1
  ];

  // Denormalize: H = inv(Tdst) * Hn * Tsrc
  const tmp = mul3x3(Hn, ns.T);
  const H = mul3x3(nd.invT, tmp);

  const h22 = H[8];
  const sH = Math.abs(h22) > 1e-12 ? (1 / h22) : 1.0;

  return [
    H[0] * sH, H[1] * sH, H[2] * sH,
    H[3] * sH, H[4] * sH, H[5] * sH,
    H[6] * sH, H[7] * sH
  ];
}




/**
 * Read 15-bit format info from around top-left finder pattern
 */


/**
 * Read 15-bit format info from secondary location (near bottom-left and top-right finders)
 */


/**
 * Read 15-bit format info directly from the *image* using the current transform.
 * This is used for sub-module refinement without building a full matrix.
 * If `inverted` is true, sampled dark/light is flipped (handles polarity inversions).
 */
,
  threshold: number,
  inverted: boolean
): number {
  let bits = 0;

  const sampleBit = (col: number, row: number): boolean => {
    const dark = sampleModuleWithVoting(data, luma, width, height, transform, col, row, threshold);
    return inverted ? !dark : dark;
  };

  // Read from column 8, rows 0-5 (bits 0-5)
  for (let i = 0; i < 6; i++) {
    if (sampleBit(8, i)) bits |= (1 << i);
  }

  // Skip row 6 (timing pattern), read rows 7-8 (bits 6-7)
  if (sampleBit(8, 7)) bits |= (1 << 6);
  if (sampleBit(8, 8)) bits |= (1 << 7);

  // Bit 8 at row 8, col 7
  if (sampleBit(7, 8)) bits |= (1 << 8);

  // Bits 9-14 at row 8, cols 5..0
  for (let i = 0; i < 6; i++) {
    if (sampleBit(5 - i, 8)) bits |= (1 << (9 + i));
  }

  return bits;
}

/**
 * Read 15-bit format info from the secondary location directly from the image.
 */
,
  moduleCount: number,
  threshold: number,
  inverted: boolean
): number {
  let bits = 0;

  const sampleBit = (col: number, row: number): boolean => {
    const dark = sampleModuleWithVoting(data, luma, width, height, transform, col, row, threshold);
    return inverted ? !dark : dark;
  };

  // Bits 0-7 from row 8, columns (moduleCount-1) down to (moduleCount-8)
  for (let i = 0; i < 8; i++) {
    const col = moduleCount - 1 - i;
    if (sampleBit(col, 8)) bits |= (1 << i);
  }

  // Bits 8-14 from column 8, rows (moduleCount-7) up to (moduleCount-1)
  for (let i = 0; i < 7; i++) {
    const row = moduleCount - 7 + i;
    if (sampleBit(8, row)) bits |= (1 << (8 + i));
  }

  return bits;
}

type FormatScore = {
  score: number; // lower is better
  agree: boolean;
  decoded1: DecodedFormatInfo | null;
  decoded2: DecodedFormatInfo | null;
  best: DecodedFormatInfo | null;
};
,
  moduleCount: number,
  threshold: number,
  inverted: boolean
): FormatScore {
  const bits1 = readFormatInfoFromTopLeftImage(data, luma, width, height, transform, threshold, inverted);
  const bits2 = readFormatInfoFromSecondaryImage(data, luma, width, height, transform, moduleCount, threshold, inverted);

  const decoded1 = decodeFormatInfoBCH(bits1);
  const decoded2 = decodeFormatInfoBCH(bits2);

  const agree =
    !!decoded1 &&
    !!decoded2 &&
    decoded1.eccLevel === decoded2.eccLevel &&
    decoded1.maskPattern === decoded2.maskPattern;

  let best: DecodedFormatInfo | null = null;
  if (decoded1 && decoded2) best = decoded1.dist <= decoded2.dist ? decoded1 : decoded2;
  else best = decoded1 || decoded2 || null;

  // Score favors:
  // - both decodable
  // - agreement between the two reads (strong signal of correct sampling)
  // - low BCH distance (0 is perfect, <=3 is spec-correctable)
  let score = 0;
  if (decoded1) score += decoded1.dist; else score += 50;
  if (decoded2) score += decoded2.dist; else score += 50;
  if (!decoded1 && !decoded2) score = 999;

  if (decoded1 && decoded2 && !agree) score += 4;

  return { score, agree, decoded1, decoded2, best };
}

// Deterministic, near-to-far search offsets for sub-module refinement.
// Values are in *module units* (e.g., 0.1 ≈ 10% of a module).
const FORMAT_REFINE_OFFSETS: ReadonlyArray<{ dx: number; dy: number }> = [
  { dx: 0.0, dy: 0.0 },

  { dx: 0.1, dy: 0.0 }, { dx: -0.1, dy: 0.0 }, { dx: 0.0, dy: 0.1 }, { dx: 0.0, dy: -0.1 },
  { dx: 0.1, dy: 0.1 }, { dx: 0.1, dy: -0.1 }, { dx: -0.1, dy: 0.1 }, { dx: -0.1, dy: -0.1 },

  { dx: 0.2, dy: 0.0 }, { dx: -0.2, dy: 0.0 }, { dx: 0.0, dy: 0.2 }, { dx: 0.0, dy: -0.2 },
  { dx: 0.2, dy: 0.1 }, { dx: 0.2, dy: -0.1 }, { dx: -0.2, dy: 0.1 }, { dx: -0.2, dy: -0.1 },
  { dx: 0.1, dy: 0.2 }, { dx: 0.1, dy: -0.2 }, { dx: -0.1, dy: 0.2 }, { dx: -0.1, dy: -0.2 },
  { dx: 0.2, dy: 0.2 }, { dx: 0.2, dy: -0.2 }, { dx: -0.2, dy: 0.2 }, { dx: -0.2, dy: -0.2 },

  { dx: 0.3, dy: 0.0 }, { dx: -0.3, dy: 0.0 }, { dx: 0.0, dy: 0.3 }, { dx: 0.0, dy: -0.3 },
  { dx: 0.3, dy: 0.1 }, { dx: 0.3, dy: -0.1 }, { dx: -0.3, dy: 0.1 }, { dx: -0.3, dy: -0.1 },
  { dx: 0.1, dy: 0.3 }, { dx: 0.1, dy: -0.3 }, { dx: -0.1, dy: 0.3 }, { dx: -0.1, dy: -0.3 },
];

/**
 * Refine a transform by locally searching for the (dx,dy) offset that minimizes BCH distance
 * and maximizes agreement between the two format info reads.
 *
 * This is cheap (≈30 module reads per test) and tends to fix "almost correct" sampling where
 * RS fails due to systematic bit flips at low px/module.
 */
,
  moduleCount: number,
  threshold: number,
  inverted: boolean,
  maxRadius: number
): { transform: (col: number, row: number) => { x: number; y: number }; fmt: FormatScore } {
  let bestTransform = baseTransform;
  let bestFmt = scoreTransformByFormatInfo(data, luma, width, height, baseTransform, moduleCount, threshold, inverted);

  // Fast exit if already perfect.
  if (bestFmt.agree && bestFmt.score === 0) return { transform: bestTransform, fmt: bestFmt };

  for (let i = 0; i < FORMAT_REFINE_OFFSETS.length; i++) {
    const off = FORMAT_REFINE_OFFSETS[i];
    if (Math.abs(off.dx) > maxRadius || Math.abs(off.dy) > maxRadius) continue;

    if (off.dx === 0 && off.dy === 0) continue;

    const t = createOffsetTransform(baseTransform, off.dx, off.dy);
    const fmt = scoreTransformByFormatInfo(data, luma, width, height, t, moduleCount, threshold, inverted);

    if (fmt.score < bestFmt.score || (fmt.score === bestFmt.score && fmt.agree && !bestFmt.agree)) {
      bestFmt = fmt;
      bestTransform = t;

      // If we hit a perfect decode + agreement, stop early.
      if (bestFmt.agree && bestFmt.score === 0) break;
    }
  }

  return { transform: bestTransform, fmt: bestFmt };
}



/**
 * Decode format info bits to extract ECC level and mask pattern
 */
/**
 * Popcount for 32-bit integers (used for BCH distance)
 */



/**
 * Encode 5-bit format data using BCH(15,5).
 * Returns 15-bit code (unmasked).
 */


/**
 * BCH-correct and decode the 15-bit *masked* format info.
 * Returns null if distance > 3 (uncorrectable per spec).
 */



/**
 * Decode format info bits to extract ECC level and mask pattern.
 * This returns the decoded values (without distance metadata).
 */


// ============================================
// ENCODING MODE DETECTION
// ============================================

/**
 * Detect encoding mode from the decoded payload
 */


// ============================================
// QUIET ZONE ESTIMATION
// ============================================

/**
 * Estimate the quiet zone (white border) around the QR code
 */
 | null {
  const { width, height, data } = imageData;
  
  // Estimate module size
  const qrWidth = Math.sqrt(
    Math.pow(location.topRight.x - location.topLeft.x, 2) +
    Math.pow(location.topRight.y - location.topLeft.y, 2)
  );
  const moduleSize = qrWidth / moduleCount;
  
  if (moduleSize <= 0) return null;
  
  // Sample outward from each edge to find quiet zone extent
  const top = measureQuietZoneEdge(imageData, location.topLeft, location.topRight, 'up', moduleSize);
  const bottom = measureQuietZoneEdge(imageData, location.bottomLeft, location.bottomRight, 'down', moduleSize);
  const left = measureQuietZoneEdge(imageData, location.topLeft, location.bottomLeft, 'left', moduleSize);
  const right = measureQuietZoneEdge(imageData, location.topRight, location.bottomRight, 'right', moduleSize);
  
  // QR spec requires 4 modules of quiet zone
  const adequate = top >= 4 && right >= 4 && bottom >= 4 && left >= 4;
  
  return {
    top: Math.round(top),
    right: Math.round(right),
    bottom: Math.round(bottom),
    left: Math.round(left),
    adequate,
  };
}

/**
 * Measure quiet zone in modules from an edge
 */
,
  corner2: { x: number; y: number },
  direction: 'up' | 'down' | 'left' | 'right',
  moduleSize: number
): number {
  const { width, height, data } = imageData;
  
  // Direction vectors
  const directionVectors: Record<string, { dx: number; dy: number }> = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  };
  
  const { dx, dy } = directionVectors[direction];
  
  // Sample at multiple points along the edge
  const samplePoints = 5;
  let minQuietZone = Number.POSITIVE_INFINITY;
  
  for (let i = 0; i < samplePoints; i++) {
    const t = (i + 0.5) / samplePoints;
    const startX = corner1.x + t * (corner2.x - corner1.x);
    const startY = corner1.y + t * (corner2.y - corner1.y);
    
    // Walk outward until we hit a dark pixel or image boundary
    let distance = 0;
    for (let step = 1; step < 50; step++) {
      const px = Math.round(startX + step * moduleSize * 0.5 * dx);
      const py = Math.round(startY + step * moduleSize * 0.5 * dy);
      
      // Check bounds
      if (px < 0 || px >= width || py < 0 || py >= height) {
        distance = step * 0.5;
        break;
      }
      
      // Check if pixel is dark
      const idx = (py * width + px) * 4;
      const gray = lumaAt(data, idx);
      
      if (gray < 180) {
        // Hit a dark pixel
        distance = (step - 1) * 0.5;
        break;
      }
      
      distance = step * 0.5;
    }
    
    minQuietZone = Math.min(minQuietZone, distance);
  }
  
  return minQuietZone;
}

// ============================================
// HELPERS
// ============================================

// Error types for better UI handling
export type AnalysisErrorType = 
  | 'cors_blocked' 
  | 'fetch_failed' 
  | 'invalid_url' 
  | 'invalid_image' 
  | 'no_qr_detected' 
  | 'canvas_error'
  | 'unknown';



// ============================================
// EXPORT
// ============================================

export const QRAnalyzer = {
  analyzeQRCode,
  analyzeQRFromFile,
  analyzeQRFromUrl,
  detectEncodingMode,
  detectContentType,
  extractDominantColors,
  estimateModulePx,
};

export default QRAnalyzer;
