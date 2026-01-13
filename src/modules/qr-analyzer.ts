/**
 * QR Analyzer Module
 * Extracts metadata from QR code images: version, ECC level, mask pattern, encoding mode, quiet zone
 * Uses custom finder pattern detection and payload decoding (no external dependencies)
 */

// ============================================
// DEBUG LOGGING
// ============================================

let DEBUG_LOG: string[] = [];

function debugLog(msg: string): void {
  DEBUG_LOG.push(`[${Date.now() % 100000}] ${msg}`);
}

export function getDebugLog(): string {
  return DEBUG_LOG.join('\n');
}

export function clearDebugLog(): void {
  DEBUG_LOG = [];
}

// ============================================
// TYPES
// ============================================

export type ECCLevel = 'L' | 'M' | 'Q' | 'H';
export type EncodingMode = 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown';
export type MaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Content types that can be detected from QR payload
export type ContentType =
  | 'url'
  | 'wifi'
  | 'vcard'
  | 'mecard'
  | 'email'
  | 'tel'
  | 'sms'
  | 'geo'
  | 'crypto_bitcoin'
  | 'crypto_ethereum'
  | 'crypto_other'
  | 'epc_sepa'
  | 'upi'
  | 'emv_qr'
  | 'swiss_qr_bill'
  | 'calendar_event'
  | 'otp_auth'
  | 'plain_text'
  | 'unknown';

export interface QRLocation {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export interface DetectedColors {
  foreground: string; // hex color
  background: string; // hex color
  foregroundRgb: { r: number; g: number; b: number };
  backgroundRgb: { r: number; g: number; b: number };
  contrastRatio: number;
}

export interface ContentTypeDetails {
  type: ContentType;
  label: string; // Human-readable label
  // Parsed details based on content type
  url?: string;
  protocol?: string;
  wifiSsid?: string;
  wifiAuth?: string;
  contactName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  cryptoAddress?: string;
  cryptoCurrency?: string;
  amount?: string;
  // UTM parameters if present
  hasUtmParams?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
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

// ============================================
// CONSTANTS
// ============================================

// Format info mask per QR spec
const FORMAT_INFO_MASK = 0x5412;

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
function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/** Divide two numbers in GF(2^8) */
function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero in GF');
  if (a === 0) return 0;
  return GF_EXP[(GF_LOG[a] + 255 - GF_LOG[b]) % 255];
}

/** Raise x to power in GF(2^8) */
function gfPow(x: number, power: number): number {
  return GF_EXP[(GF_LOG[x] * power) % 255];
}

/** Multiplicative inverse in GF(2^8) */
function gfInverse(x: number): number {
  return GF_EXP[255 - GF_LOG[x]];
}

/** Multiply polynomial by scalar */
function gfPolyScale(p: number[], x: number): number[] {
  return p.map(coef => gfMul(coef, x));
}

/** Add two polynomials (XOR in GF(2^8)) */
function gfPolyAdd(p: number[], q: number[]): number[] {
  const result = new Array(Math.max(p.length, q.length)).fill(0);
  for (let i = 0; i < p.length; i++) {
    result[i + result.length - p.length] ^= p[i];
  }
  for (let i = 0; i < q.length; i++) {
    result[i + result.length - q.length] ^= q[i];
  }
  return result;
}

/** Multiply two polynomials */
function gfPolyMul(p: number[], q: number[]): number[] {
  const result = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      result[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return result;
}

/** Evaluate polynomial at x */
function gfPolyEval(p: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < p.length; i++) {
    result = gfMul(result, x) ^ p[i];
  }
  return result;
}

// ============================================
// REED-SOLOMON DECODER
// ============================================

/** Calculate syndromes for received message */
function rsCalcSyndromes(msg: number[], nsym: number): number[] {
  const synd = new Array(nsym).fill(0);
  for (let i = 0; i < nsym; i++) {
    synd[i] = gfPolyEval(msg, GF_EXP[i]);
  }
  return synd;
}

/** Find error locator polynomial using Berlekamp-Massey algorithm */
function rsBerlekampMassey(syndromes: number[], nsym: number): number[] {
  // Initialize error locator polynomial
  let errLoc = [1];
  let oldLoc = [1];
  
  for (let i = 0; i < nsym; i++) {
    let delta = syndromes[i];
    // Only use available syndromes; guard against negative indices
    for (let j = 1; j < errLoc.length; j++) {
      const sIndex = i - j;
      if (sIndex < 0) break;
      delta ^= gfMul(errLoc[errLoc.length - 1 - j], syndromes[sIndex]);
    }
    
    oldLoc.push(0);
    
    if (delta !== 0) {
      if (oldLoc.length > errLoc.length) {
        const newLoc = gfPolyScale(oldLoc, delta);
        oldLoc = gfPolyScale(errLoc, gfInverse(delta));
        errLoc = newLoc;
      }
      errLoc = gfPolyAdd(errLoc, gfPolyScale(oldLoc, delta));
    }
  }
  
  // Remove leading zeros
  while (errLoc.length > 0 && errLoc[0] === 0) {
    errLoc.shift();
  }
  
  return errLoc;
}

/** Find error positions using Chien search */
function rsChienSearch(errLoc: number[], msgLen: number): number[] | null {
  const numErrors = errLoc.length - 1;
  const errPos: number[] = [];
  
  for (let i = 0; i < msgLen; i++) {
    if (gfPolyEval(errLoc, GF_EXP[i]) === 0) {
      errPos.push(msgLen - 1 - i);
    }
  }
  
  // If we didn't find all error positions, the code is uncorrectable
  if (errPos.length !== numErrors) {
    return null;
  }
  
  return errPos;
}

/** Calculate error magnitudes using Forney algorithm */
function rsForney(
  syndromes: number[],
  errLoc: number[],
  errPos: number[],
  msgLen: number
): number[] {
  // Compute error evaluator polynomial
  // Omega(x) = S(x) * Lambda(x) mod x^nsym
  const nsym = syndromes.length;
  let omega = gfPolyMul([1, ...syndromes], errLoc);
  omega = omega.slice(omega.length - nsym);
  
  // Compute formal derivative of error locator
  const errLocPrime: number[] = [];
  for (let i = errLoc.length - 1; i >= 0; i -= 2) {
    if (i > 0) {
      errLocPrime.unshift(errLoc[errLoc.length - 1 - i]);
    }
  }
  
  // Calculate error magnitudes
  const magnitude: number[] = [];
  for (const pos of errPos) {
    const xi = GF_EXP[msgLen - 1 - pos];
    const xiInv = gfInverse(xi);
    
    // Evaluate omega at xi^-1
    const omegaVal = gfPolyEval(omega, xiInv);
    
    // Evaluate derivative at xi^-1
    const primeVal = gfPolyEval(errLocPrime, xiInv);
    
    if (primeVal === 0) {
      magnitude.push(0);
    } else {
      // Error magnitude = omega(xi^-1) / (xi * lambda'(xi^-1))
      magnitude.push(gfMul(xi, gfDiv(omegaVal, primeVal)));
    }
  }
  
  return magnitude;
}

/** Correct errors in a codeword. Returns corrected data or null if uncorrectable. */
function rsCorrectErrors(
  msg: number[],
  nsym: number
): { corrected: number[]; errorCount: number } | null {
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
function getRSBlocks(version: number, eccLevel: ECCLevel): RSBlock[] {
  const eccIndex = { L: 0, M: 1, Q: 2, H: 3 }[eccLevel];
  const tableIndex = (version - 1) * 4 + eccIndex;
  const rsBlock = RS_BLOCK_TABLE[tableIndex];
  
  if (!rsBlock) return [];
  
  const blocks: RSBlock[] = [];
  const length = rsBlock.length / 3;
  
  for (let i = 0; i < length; i++) {
    const count = rsBlock[i * 3 + 0];
    const totalCount = rsBlock[i * 3 + 1];
    const dataCount = rsBlock[i * 3 + 2];
    
    for (let j = 0; j < count; j++) {
      blocks.push({ totalCount, dataCount });
    }
  }
  
  return blocks;
}

/** De-interleave received codewords into RS blocks */
function deinterleaveBlocks(
  codewords: number[],
  rsBlocks: RSBlock[]
): Array<{ data: number[]; ec: number[] }> {
  const blocks: Array<{ data: number[]; ec: number[] }> = [];
  
  // Initialize blocks
  for (const block of rsBlocks) {
    blocks.push({
      data: [],
      ec: [],
    });
  }
  
  // Calculate max data and EC counts
  let maxDataCount = 0;
  let maxEcCount = 0;
  for (const block of rsBlocks) {
    maxDataCount = Math.max(maxDataCount, block.dataCount);
    maxEcCount = Math.max(maxEcCount, block.totalCount - block.dataCount);
  }
  
  // De-interleave data codewords
  let idx = 0;
  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < rsBlocks.length; b++) {
      if (i < rsBlocks[b].dataCount) {
        blocks[b].data.push(codewords[idx++] ?? 0);
      }
    }
  }
  
  // De-interleave EC codewords
  for (let i = 0; i < maxEcCount; i++) {
    for (let b = 0; b < rsBlocks.length; b++) {
      const ecCount = rsBlocks[b].totalCount - rsBlocks[b].dataCount;
      if (i < ecCount) {
        blocks[b].ec.push(codewords[idx++] ?? 0);
      }
    }
  }
  
  return blocks;
}

/** Apply RS error correction to all blocks and reassemble data */
function applyRSCorrection(
  codewords: number[],
  version: number,
  eccLevel: ECCLevel
): { data: number[]; errorsCorrected: number } | null {
  const rsBlocks = getRSBlocks(version, eccLevel);
  if (rsBlocks.length === 0) return null;
  
  const blocks = deinterleaveBlocks(codewords, rsBlocks);
  const correctedBlocks: number[][] = [];
  let totalErrors = 0;
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const codeword = [...block.data, ...block.ec];
    const nsym = rsBlocks[i].totalCount - rsBlocks[i].dataCount;
    
    const result = rsCorrectErrors(codeword, nsym);
    if (!result) {
      return null; // Uncorrectable errors
    }
    
    correctedBlocks.push(result.corrected);
    totalErrors += result.errorCount;
  }
  
  // Re-interleave corrected data
  const correctedData: number[] = [];
  const maxDataCount = Math.max(...rsBlocks.map(b => b.dataCount));
  
  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < correctedBlocks.length; b++) {
      if (i < correctedBlocks[b].length) {
        correctedData.push(correctedBlocks[b][i]);
      }
    }
  }
  
  return { data: correctedData, errorsCorrected: totalErrors };
}

// QR Code data capacity table (characters for byte mode)
// Format: [version][eccLevel] = capacity
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
export function detectContentType(payload: string): ContentTypeDetails {
  if (!payload || payload.length === 0) {
    return { type: 'unknown', label: 'Unknown' };
  }

  const trimmed = payload.trim();
  const upper = trimmed.toUpperCase();

  // WiFi configuration: WIFI:T:WPA;S:ssid;P:password;;
  if (upper.startsWith('WIFI:')) {
    const ssidMatch = trimmed.match(/S:([^;]*)/i);
    const authMatch = trimmed.match(/T:([^;]*)/i);
    return {
      type: 'wifi',
      label: 'WiFi Network',
      wifiSsid: ssidMatch?.[1] || undefined,
      wifiAuth: authMatch?.[1] || undefined,
    };
  }

  // vCard: BEGIN:VCARD
  if (upper.startsWith('BEGIN:VCARD')) {
    const fnMatch = trimmed.match(/FN:([^\r\n]*)/i);
    return {
      type: 'vcard',
      label: 'vCard Contact',
      contactName: fnMatch?.[1] || undefined,
    };
  }

  // MeCard: MECARD:
  if (upper.startsWith('MECARD:')) {
    const nameMatch = trimmed.match(/N:([^;]*)/i);
    return {
      type: 'mecard',
      label: 'MeCard Contact',
      contactName: nameMatch?.[1] || undefined,
    };
  }

  // Calendar event: BEGIN:VEVENT or BEGIN:VCALENDAR
  if (upper.startsWith('BEGIN:VEVENT') || upper.startsWith('BEGIN:VCALENDAR')) {
    return {
      type: 'calendar_event',
      label: 'Calendar Event',
    };
  }

  // Swiss QR-bill: SPC (Swiss Payment Code)
  if (upper.startsWith('SPC\n') || upper.startsWith('SPC\r\n')) {
    return {
      type: 'swiss_qr_bill',
      label: 'Swiss QR-bill',
    };
  }

  // EPC/SEPA: BCD format
  if (upper.startsWith('BCD\n') || upper.startsWith('BCD\r\n')) {
    return {
      type: 'epc_sepa',
      label: 'SEPA Bank Transfer',
    };
  }

  // EMV QR code: starts with payload format indicator 000201
  if (trimmed.startsWith('00020101')) {
    return {
      type: 'emv_qr',
      label: 'EMV Payment QR',
    };
  }

  // OTP Auth: otpauth://
  if (trimmed.startsWith('otpauth://')) {
    return {
      type: 'otp_auth',
      label: 'Authenticator Code',
      protocol: 'otpauth',
    };
  }

  // UPI: upi://pay
  if (trimmed.startsWith('upi://')) {
    const paMatch = trimmed.match(/pa=([^&]*)/i);
    const amMatch = trimmed.match(/am=([^&]*)/i);
    return {
      type: 'upi',
      label: 'UPI Payment',
      protocol: 'upi',
      cryptoAddress: paMatch?.[1] || undefined,
      amount: amMatch?.[1] || undefined,
    };
  }

  // Bitcoin: bitcoin:
  if (trimmed.startsWith('bitcoin:')) {
    const addressMatch = trimmed.match(/bitcoin:([^?]*)/i);
    const amountMatch = trimmed.match(/amount=([^&]*)/i);
    return {
      type: 'crypto_bitcoin',
      label: 'Bitcoin Payment',
      cryptoCurrency: 'Bitcoin',
      cryptoAddress: addressMatch?.[1] || undefined,
      amount: amountMatch?.[1] || undefined,
    };
  }

  // Ethereum: ethereum:
  if (trimmed.startsWith('ethereum:')) {
    const addressMatch = trimmed.match(/ethereum:([^?@/]*)/i);
    return {
      type: 'crypto_ethereum',
      label: 'Ethereum Payment',
      cryptoCurrency: 'Ethereum',
      cryptoAddress: addressMatch?.[1] || undefined,
    };
  }

  // Lightning: lightning:
  if (trimmed.startsWith('lightning:') || upper.startsWith('LNBC') || upper.startsWith('LNTB')) {
    return {
      type: 'crypto_other',
      label: 'Lightning Network',
      cryptoCurrency: 'Lightning',
    };
  }

  // Other crypto (litecoin, dogecoin, etc.)
  const cryptoMatch = trimmed.match(/^(litecoin|dogecoin|dash|monero|ripple|xrp):/i);
  if (cryptoMatch) {
    const currency = cryptoMatch[1];
    return {
      type: 'crypto_other',
      label: `${currency.charAt(0).toUpperCase() + currency.slice(1)} Payment`,
      cryptoCurrency: currency,
    };
  }

  // Email: mailto:
  if (trimmed.startsWith('mailto:')) {
    const emailMatch = trimmed.match(/mailto:([^?]*)/i);
    return {
      type: 'email',
      label: 'Email Address',
      emailAddress: emailMatch?.[1] || undefined,
    };
  }

  // Telephone: tel:
  if (trimmed.startsWith('tel:')) {
    const phoneMatch = trimmed.match(/tel:([^?]*)/i);
    return {
      type: 'tel',
      label: 'Phone Number',
      phoneNumber: phoneMatch?.[1] || undefined,
    };
  }

  // SMS: sms: or smsto:
  if (trimmed.startsWith('sms:') || trimmed.startsWith('smsto:')) {
    const phoneMatch = trimmed.match(/sms(?:to)?:([^?]*)/i);
    return {
      type: 'sms',
      label: 'SMS Message',
      phoneNumber: phoneMatch?.[1] || undefined,
    };
  }

  // Geo location: geo:
  if (trimmed.startsWith('geo:')) {
    return {
      type: 'geo',
      label: 'Geographic Location',
      protocol: 'geo',
    };
  }

  // URL: http:// or https://
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const urlObj = parseUrlDetails(trimmed);
    return {
      type: 'url',
      label: 'Website URL',
      url: trimmed,
      protocol: trimmed.startsWith('https://') ? 'https' : 'http',
      ...urlObj,
    };
  }

  // Fallback: check if it looks like a URL without protocol
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/.test(trimmed)) {
    return {
      type: 'url',
      label: 'Website URL (no protocol)',
      url: trimmed,
    };
  }

  // Default to plain text
  return {
    type: 'plain_text',
    label: 'Plain Text',
  };
}

/**
 * Parse URL details including UTM parameters
 */
function parseUrlDetails(url: string): Partial<ContentTypeDetails> {
  try {
    const urlObj = new URL(url);
    const result: Partial<ContentTypeDetails> = {};

    // Check for UTM parameters
    const utmSource = urlObj.searchParams.get('utm_source');
    const utmMedium = urlObj.searchParams.get('utm_medium');
    const utmCampaign = urlObj.searchParams.get('utm_campaign');

    if (utmSource || utmMedium || utmCampaign) {
      result.hasUtmParams = true;
      result.utmSource = utmSource || undefined;
      result.utmMedium = utmMedium || undefined;
      result.utmCampaign = utmCampaign || undefined;
    }

    return result;
  } catch {
    return {};
  }
}

// ============================================
// COLOR EXTRACTION
// ============================================

/**
 * Extract dominant foreground and background colors from QR code image
 */
export function extractDominantColors(
  imageData: ImageData,
  moduleMatrix: boolean[][] | null,
  location: QRLocation | null,
  moduleCount: number
): DetectedColors | null {
  if (!moduleMatrix || !location) {
    return null;
  }

  const { width, height, data } = imageData;
  const transform = createColorSampleTransform(location, moduleCount);

  const darkPixels: Array<{ r: number; g: number; b: number }> = [];
  const lightPixels: Array<{ r: number; g: number; b: number }> = [];

  // Sample pixels at module centers
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const { x, y } = transform(col + 0.5, row + 0.5);
      const px = Math.round(x);
      const py = Math.round(y);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = (py * width + px) * 4;
        const pixel = {
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
        };

        if (moduleMatrix[row]?.[col]) {
          darkPixels.push(pixel);
        } else {
          lightPixels.push(pixel);
        }
      }
    }
  }

  if (darkPixels.length === 0 || lightPixels.length === 0) {
    return null;
  }

  // Calculate average colors
  const foregroundRgb = averageColor(darkPixels);
  const backgroundRgb = averageColor(lightPixels);

  // Calculate contrast ratio
  const contrastRatio = calculateContrastRatio(foregroundRgb, backgroundRgb);

  return {
    foreground: rgbToHex(foregroundRgb),
    background: rgbToHex(backgroundRgb),
    foregroundRgb,
    backgroundRgb,
    contrastRatio,
  };
}

/**
 * Create a transform for color sampling
 * Accounts for corner positions being at finder pattern centers (3.5 modules from edge)
 */
function createColorSampleTransform(
  location: QRLocation,
  moduleCount: number
): (col: number, row: number) => { x: number; y: number } {
  const finderOffset = 3.5;
  const effectiveModuleSpan = moduleCount - 2 * finderOffset;
  
  return (col: number, row: number) => {
    const u = (col - finderOffset) / effectiveModuleSpan;
    const v = (row - finderOffset) / effectiveModuleSpan;

    const x =
      (1 - u) * (1 - v) * location.topLeft.x +
      u * (1 - v) * location.topRight.x +
      u * v * location.bottomRight.x +
      (1 - u) * v * location.bottomLeft.x;

    const y =
      (1 - u) * (1 - v) * location.topLeft.y +
      u * (1 - v) * location.topRight.y +
      u * v * location.bottomRight.y +
      (1 - u) * v * location.bottomLeft.y;

    return { x, y };
  };
}

/**
 * Calculate average color from array of pixels
 */
function averageColor(
  pixels: Array<{ r: number; g: number; b: number }>
): { r: number; g: number; b: number } {
  if (pixels.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  for (const pixel of pixels) {
    totalR += pixel.r;
    totalG += pixel.g;
    totalB += pixel.b;
  }

  return {
    r: Math.round(totalR / pixels.length),
    g: Math.round(totalG / pixels.length),
    b: Math.round(totalB / pixels.length),
  };
}

/**
 * Convert RGB to hex color string
 */
function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
function calculateContrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const luminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      const srgb = c / 255;
      return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

// ============================================
// MODULE SIZE ESTIMATION
// ============================================

/**
 * Calculate image properties for analysis display
 */
function calculateImageProperties(
  imageData: ImageData,
  location: QRLocation | null,
  moduleCount: number | null
): QRAnalysisResult['imageProperties'] {
  const { width, height } = imageData;
  const aspectRatio = Math.round((width / height) * 100) / 100;
  
  // Estimate QR code size in pixels
  let estimatedQrSizePx = 0;
  if (location && moduleCount) {
    const topWidth = Math.sqrt(
      Math.pow(location.topRight.x - location.topLeft.x, 2) +
      Math.pow(location.topRight.y - location.topLeft.y, 2)
    );
    const leftHeight = Math.sqrt(
      Math.pow(location.bottomLeft.x - location.topLeft.x, 2) +
      Math.pow(location.bottomLeft.y - location.topLeft.y, 2)
    );
    estimatedQrSizePx = Math.round((topWidth + leftHeight) / 2);
  }
  
  return {
    width,
    height,
    aspectRatio,
    estimatedQrSizePx,
  };
}

/**
 * Estimate the pixel size of each module in the QR code
 */
export function estimateModulePx(location: QRLocation, moduleCount: number): number {
  // Calculate the width and height of the QR code in pixels
  const topWidth = Math.sqrt(
    Math.pow(location.topRight.x - location.topLeft.x, 2) +
    Math.pow(location.topRight.y - location.topLeft.y, 2)
  );
  const bottomWidth = Math.sqrt(
    Math.pow(location.bottomRight.x - location.bottomLeft.x, 2) +
    Math.pow(location.bottomRight.y - location.bottomLeft.y, 2)
  );
  const leftHeight = Math.sqrt(
    Math.pow(location.bottomLeft.x - location.topLeft.x, 2) +
    Math.pow(location.bottomLeft.y - location.topLeft.y, 2)
  );
  const rightHeight = Math.sqrt(
    Math.pow(location.bottomRight.x - location.topRight.x, 2) +
    Math.pow(location.bottomRight.y - location.topRight.y, 2)
  );

  const avgWidth = (topWidth + bottomWidth) / 2;
  const avgHeight = (leftHeight + rightHeight) / 2;
  const avgSize = (avgWidth + avgHeight) / 2;

  return Math.round((avgSize / moduleCount) * 100) / 100;
}

// ============================================
// STRUCTURAL ANALYSIS
// ============================================

/**
 * Analyze structural patterns in the QR code
 */
function analyzeStructure(
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

/**
 * Check if a finder pattern exists at the given position
 */
function checkFinderPattern(matrix: boolean[][], startRow: number, startCol: number): boolean {
  // Simplified check - just verify the corners of the pattern
  const size = 7;
  if (startRow + size > matrix.length || startCol + size > (matrix[0]?.length ?? 0)) {
    return false;
  }

  // Check that outer ring is dark
  for (let i = 0; i < size; i++) {
    if (!matrix[startRow]?.[startCol + i]) return false; // Top row
    if (!matrix[startRow + size - 1]?.[startCol + i]) return false; // Bottom row
    if (!matrix[startRow + i]?.[startCol]) return false; // Left column
    if (!matrix[startRow + i]?.[startCol + size - 1]) return false; // Right column
  }

  // Check center is dark
  if (!matrix[startRow + 3]?.[startCol + 3]) return false;

  return true;
}

/**
 * Check if timing patterns exist
 */
function checkTimingPattern(matrix: boolean[][]): boolean {
  const moduleCount = matrix.length;
  if (moduleCount < 21) return false;

  // Timing pattern is at row 6 and column 6, alternating dark/light
  let matches = 0;
  let total = 0;

  for (let i = 8; i < moduleCount - 8; i++) {
    // Horizontal timing (row 6)
    const expectedH = (i % 2) === 0;
    if (matrix[6]?.[i] === expectedH) matches++;
    total++;

    // Vertical timing (column 6)
    const expectedV = (i % 2) === 0;
    if (matrix[i]?.[6] === expectedV) matches++;
    total++;
  }

  // Consider timing patterns present if >70% match expected pattern
  return total > 0 && (matches / total) > 0.7;
}

/**
 * Get alignment pattern center positions for a given version
 */
function getAlignmentPatternPositions(version: number): number[] {
  if (version < 2) return [];

  const alignmentPatternTable: Record<number, number[]> = {
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
    11: [6, 30, 54],
    12: [6, 32, 58],
    13: [6, 34, 62],
    14: [6, 26, 46, 66],
    15: [6, 26, 48, 70],
    16: [6, 26, 50, 74],
    17: [6, 30, 54, 78],
    18: [6, 30, 56, 82],
    19: [6, 30, 58, 86],
    20: [6, 34, 62, 90],
    21: [6, 28, 50, 72, 94],
    22: [6, 26, 50, 74, 98],
    23: [6, 30, 54, 78, 102],
    24: [6, 28, 54, 80, 106],
    25: [6, 32, 58, 84, 110],
    26: [6, 30, 58, 86, 114],
    27: [6, 34, 62, 90, 118],
    28: [6, 26, 50, 74, 98, 122],
    29: [6, 30, 54, 78, 102, 126],
    30: [6, 26, 52, 78, 104, 130],
    31: [6, 30, 56, 82, 108, 134],
    32: [6, 34, 60, 86, 112, 138],
    33: [6, 30, 58, 86, 114, 142],
    34: [6, 34, 62, 90, 118, 146],
    35: [6, 30, 54, 78, 102, 126, 150],
    36: [6, 24, 50, 76, 102, 128, 154],
    37: [6, 28, 54, 80, 106, 132, 158],
    38: [6, 32, 58, 84, 110, 136, 162],
    39: [6, 26, 54, 82, 110, 138, 166],
    40: [6, 30, 58, 86, 114, 142, 170],
  };

  return alignmentPatternTable[version] || [];
}

/**
 * Calculate data capacity information
 */
function calculateDataCapacity(
  payload: string | null,
  version: number | null,
  eccLevel: ECCLevel | null
): QRAnalysisResult['dataCapacity'] {
  if (!payload || !version || !eccLevel || version < 1 || version > 40) {
    return null;
  }

  const capacity = DATA_CAPACITY_BYTE[version]?.[eccLevel];
  if (!capacity) return null;

  // Estimate bytes used (UTF-8)
  const encoder = new TextEncoder();
  const used = encoder.encode(payload).length;

  const rawPercentage = (used / capacity) * 100;
  const overflow = rawPercentage > 100;

  return {
    used,
    total: capacity,
    percentage: Math.min(Math.round(rawPercentage), 100), // Cap at 100 for display
    overflow,
  };
}

// ============================================
// FINDER PATTERN DETECTION
// ============================================

/**
 * Get mask function for a given mask pattern
 */
function getMaskFunction(maskPattern: number): (row: number, col: number) => boolean {
  switch (maskPattern) {
    case 0: return (i, j) => (i + j) % 2 === 0;
    case 1: return (i, _j) => i % 2 === 0;
    case 2: return (_i, j) => j % 3 === 0;
    case 3: return (i, j) => (i + j) % 3 === 0;
    case 4: return (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6: return (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7: return (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default: return () => false;
  }
}

/**
 * Calculate average brightness of an image for adaptive thresholding
 */
function calculateAverageBrightness(imageData: ImageData): number {
  const { width, height, data } = imageData;
  let totalBrightness = 0;
  const pixelCount = width * height;
  
  // Sample every 4th pixel for speed on large images
  const step = pixelCount > 100000 ? 4 : 1;
  let sampledCount = 0;
  
  for (let i = 0; i < pixelCount; i += step) {
    const idx = i * 4;
    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    totalBrightness += gray;
    sampledCount++;
  }
  
  return totalBrightness / sampledCount;
}

/**
 * Otsu's thresholding method for optimal binarization
 * Automatically finds the threshold that minimizes intra-class variance
 * 
 * For bimodal images (e.g., pure black and white QR codes), Otsu might return
 * extreme values like 0 or 255. In these cases, we fall back to finding the
 * midpoint between the two peaks.
 */
function otsuThreshold(imageData: ImageData): number {
  const { width, height, data } = imageData;
  const total = width * height;
  const histogram = new Array(256).fill(0);
  
  // Build histogram
  for (let i = 0; i < total; i++) {
    const idx = i * 4;
    const gray = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
    histogram[gray]++;
  }
  
  // Calculate sum of all pixel values
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  // Find optimal threshold using Otsu's method
  let sumB = 0;
  let wB = 0;
  let maxVariance = 0;
  let threshold = 128;
  
  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    
    const wF = total - wB;
    if (wF === 0) break;
    
    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }
  
  // FIX: For bimodal images (pure black & white), Otsu returns extreme values.
  // In this case, find the midpoint between the dark and light peaks.
  if (threshold < 20 || threshold > 235) {
    // Find the darkest and lightest significant peaks
    let darkPeak = -1;
    let lightPeak = -1;
    const minCount = total * 0.01; // At least 1% of pixels
    
    for (let i = 0; i < 128; i++) {
      if (histogram[i] > minCount) {
        darkPeak = i;
        break;
      }
    }
    
    for (let i = 255; i >= 128; i--) {
      if (histogram[i] > minCount) {
        lightPeak = i;
        break;
      }
    }
    
    if (darkPeak >= 0 && lightPeak >= 0) {
      // Use midpoint between peaks
      threshold = Math.round((darkPeak + lightPeak) / 2);
    } else {
      // Fallback to 128
      threshold = 128;
    }
  }
  
  return threshold;
}

/**
 * Create a binary image from ImageData using a threshold
 * Returns array where true = dark pixel
 */
function createBinaryImage(imageData: ImageData, threshold: number): boolean[] {
  const { width, height, data } = imageData;
  const binary = new Array<boolean>(width * height);
  
  for (let i = 0; i < binary.length; i++) {
    const idx = i * 4;
    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    binary[i] = gray < threshold; // true = dark
  }
  
  return binary;
}

/**
 * Check if a run ratio matches the 1:1:3:1:1 finder pattern ratio
 * Allows some tolerance for image distortion
 */
function checkFinderPatternRatio(runs: number[]): { valid: boolean; moduleSize: number } {
  if (runs.length !== 5) return { valid: false, moduleSize: 0 };
  
  const totalSize = runs[0] + runs[1] + runs[2] + runs[3] + runs[4];
  if (totalSize < 7) return { valid: false, moduleSize: 0 };
  
  const moduleSize = totalSize / 7;
  const tolerance = moduleSize * 0.7; // 70% tolerance for more leniency
  
  // Check ratios: 1:1:3:1:1
  const valid = 
    Math.abs(runs[0] - moduleSize) < tolerance &&
    Math.abs(runs[1] - moduleSize) < tolerance &&
    Math.abs(runs[2] - moduleSize * 3) < tolerance &&
    Math.abs(runs[3] - moduleSize) < tolerance &&
    Math.abs(runs[4] - moduleSize) < tolerance;
  
  if (valid) {
    debugLog(`checkFinderPatternRatio: VALID runs=[${runs.join(',')}] total=${totalSize} moduleSize=${moduleSize.toFixed(2)}`);
  }
  
  return { valid, moduleSize: valid ? moduleSize : 0 };
}

/**
 * Scan a single row or column for finder pattern candidates using binary image
 * 
 * FINDER PATTERN: 1:1:3:1:1 ratio of dark:light:dark:light:dark modules
 * We track runs of consecutive same-colored pixels and check for this ratio.
 */
function scanLineForFinderPatternsBinary(
  binary: boolean[],
  width: number,
  lineIndex: number,
  isHorizontal: boolean,
  length: number
): Array<{ center: number; moduleSize: number }> {
  const candidates: Array<{ center: number; moduleSize: number }> = [];
  const runs: number[] = [];
  // Track whether each run is dark (true) or light (false)
  // runColors[i] corresponds to runs[i]
  const runColors: boolean[] = [];
  let currentRunLength = 1;
  
  const getPixel = (pos: number): boolean => {
    const idx = isHorizontal 
      ? lineIndex * width + pos 
      : pos * width + lineIndex;
    return binary[idx] ?? false;
  };
  
  let currentRunIsDark = getPixel(0);
  
  // Helper to check pattern when we have enough runs
  const checkPattern = (endPos: number) => {
    if (runs.length < 5) return;
    
    const window = runs.slice(-5);
    const windowColors = runColors.slice(-5);
    const { valid, moduleSize } = checkFinderPatternRatio(window);
    
    if (valid && moduleSize > 0) {
      // Finder pattern must be: dark(1) - light(1) - dark(3) - light(1) - dark(1)
      // So first run of window must be dark
      const firstOfFiveIsDark = windowColors[0];
      
      if (firstOfFiveIsDark) {
        const total = window[0] + window[1] + window[2] + window[3] + window[4];
        const center = endPos - total / 2;
        candidates.push({ center, moduleSize });
        debugLog(`scanLine: Candidate at ${isHorizontal ? 'H' : 'V'} line=${lineIndex} center=${center.toFixed(1)} moduleSize=${moduleSize.toFixed(2)}`);
      } else {
        debugLog(`scanLine: Valid ratio but firstOfFive is LIGHT at ${isHorizontal ? 'H' : 'V'} line=${lineIndex} endPos=${endPos}`);
      }
    }
  };
  
  for (let pos = 1; pos < length; pos++) {
    const isDark = getPixel(pos);
    
    if (isDark === currentRunIsDark) {
      currentRunLength++;
    } else {
      // Transition: save completed run
      runs.push(currentRunLength);
      runColors.push(currentRunIsDark);
      
      // Check for finder pattern
      checkPattern(pos);
      
      currentRunLength = 1;
      currentRunIsDark = isDark;
    }
  }
  
  // FIX: Handle final run at end of scan line
  // This catches finder patterns that end at the image boundary
  runs.push(currentRunLength);
  runColors.push(currentRunIsDark);
  checkPattern(length);
  
  return candidates;
}

/**
 * Legacy scan function for backward compatibility
 */
function scanLineForFinderPatterns(
  imageData: ImageData,
  lineIndex: number,
  isHorizontal: boolean,
  threshold: number
): Array<{ center: number; moduleSize: number }> {
  const binary = createBinaryImage(imageData, threshold);
  const length = isHorizontal ? imageData.width : imageData.height;
  return scanLineForFinderPatternsBinary(binary, imageData.width, lineIndex, isHorizontal, length);
}

/**
 * Verify a finder pattern candidate by checking the actual 7x7 structure
 * Uses binary image for consistent checking
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
function verifyFinderPatternAt(
  binary: boolean[],
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  moduleSize: number
): boolean {
  const check = (mx: number, my: number, shouldBeDark: boolean): boolean => {
    const px = Math.round(centerX + mx * moduleSize);
    const py = Math.round(centerY + my * moduleSize);
    if (px < 0 || px >= width || py < 0 || py >= height) return false;
    const isDark = binary[py * width + px];
    return isDark === shouldBeDark;
  };
  
  // Check center (should be dark) - this is critical
  if (!check(0, 0, true)) {
    debugLog(`verifyFinderPattern: FAILED center check at (${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);
    return false;
  }
  
  // Check the 3x3 center core (all dark)
  // FIX: Reduce tolerance from 7/9 to 5/9 for blurry/compressed images
  let coreMatches = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (check(dx, dy, true)) coreMatches++;
    }
  }
  if (coreMatches < 5) {
    debugLog(`verifyFinderPattern: FAILED core check at (${centerX.toFixed(1)}, ${centerY.toFixed(1)}) coreMatches=${coreMatches}/9`);
    return false;
  }
  
  // Check 4 cardinal points at distance 2 (should be light - inner ring)
  // FIX: Reduce tolerance from 3/4 to 2/4 for more leniency
  let innerRingMatches = 0;
  if (check(0, -2, false)) innerRingMatches++;
  if (check(0, 2, false)) innerRingMatches++;
  if (check(-2, 0, false)) innerRingMatches++;
  if (check(2, 0, false)) innerRingMatches++;
  if (innerRingMatches < 2) {
    debugLog(`verifyFinderPattern: FAILED inner ring at (${centerX.toFixed(1)}, ${centerY.toFixed(1)}) innerRing=${innerRingMatches}/4`);
    return false;
  }
  
  // Check 4 cardinal points at distance 3 (should be dark - outer ring)
  // FIX: Reduce tolerance from 3/4 to 2/4
  let outerRingMatches = 0;
  if (check(0, -3, true)) outerRingMatches++;
  if (check(0, 3, true)) outerRingMatches++;
  if (check(-3, 0, true)) outerRingMatches++;
  if (check(3, 0, true)) outerRingMatches++;
  if (outerRingMatches < 2) {
    debugLog(`verifyFinderPattern: FAILED outer ring at (${centerX.toFixed(1)}, ${centerY.toFixed(1)}) outerRing=${outerRingMatches}/4`);
    return false;
  }
  
  debugLog(`verifyFinderPattern: PASSED at (${centerX.toFixed(1)}, ${centerY.toFixed(1)}) core=${coreMatches}/9 inner=${innerRingMatches}/4 outer=${outerRingMatches}/4`);
  return true;
}

/**
 * Legacy verify function for backward compatibility
 */
function verifyFinderPattern(
  imageData: ImageData,
  centerX: number,
  centerY: number,
  moduleSize: number,
  threshold: number
): boolean {
  const binary = createBinaryImage(imageData, threshold);
  return verifyFinderPatternAt(binary, imageData.width, imageData.height, centerX, centerY, moduleSize);
}

/**
 * Find finder patterns using a binary image
 */
function findFinderPatternsWithBinary(
  binary: boolean[],
  width: number,
  height: number
): FinderPattern[] {
  const horizontalCandidates: Array<{ x: number; y: number; moduleSize: number }> = [];
  const verticalCandidates: Array<{ x: number; y: number; moduleSize: number }> = [];
  
  // Scan every row and column for thorough detection
  // FIX: Cap step at 2 maximum to avoid missing small QR codes
  const step = Math.min(2, Math.max(1, Math.floor(Math.min(width, height) / 400)));
  
  debugLog(`findFinderPatternsWithBinary: image ${width}x${height}, step=${step}`);
  
  // Scan horizontal
  for (let y = 0; y < height; y += step) {
    const lineCandidates = scanLineForFinderPatternsBinary(binary, width, y, true, width);
    for (const c of lineCandidates) {
      horizontalCandidates.push({ x: c.center, y, moduleSize: c.moduleSize });
    }
  }
  
  // Scan vertical
  for (let x = 0; x < width; x += step) {
    const lineCandidates = scanLineForFinderPatternsBinary(binary, width, x, false, height);
    for (const c of lineCandidates) {
      verticalCandidates.push({ x, y: c.center, moduleSize: c.moduleSize });
    }
  }
  
  debugLog(`findFinderPatternsWithBinary: H candidates=${horizontalCandidates.length}, V candidates=${verticalCandidates.length}`);
  
  // Match horizontal and vertical candidates
  const patterns: FinderPattern[] = [];
  const usedH = new Set<number>();
  const usedV = new Set<number>();
  
  for (let hi = 0; hi < horizontalCandidates.length; hi++) {
    if (usedH.has(hi)) continue;
    const h = horizontalCandidates[hi];
    
    for (let vi = 0; vi < verticalCandidates.length; vi++) {
      if (usedV.has(vi)) continue;
      const v = verticalCandidates[vi];
      
      const dx = Math.abs(h.x - v.x);
      const dy = Math.abs(h.y - v.y);
      const avgModuleSize = (h.moduleSize + v.moduleSize) / 2;
      // FIX: Increase clustering threshold from *4 to *6 for distorted images
      const clusterThreshold = avgModuleSize * 6;
      
      if (dx < clusterThreshold && dy < clusterThreshold) {
        const centerX = (h.x + v.x) / 2;
        const centerY = (h.y + v.y) / 2;
        
        // Verify this is actually a finder pattern
        if (verifyFinderPatternAt(binary, width, height, centerX, centerY, avgModuleSize)) {
          patterns.push({
            centerX,
            centerY,
            moduleSize: avgModuleSize,
          });
          usedH.add(hi);
          usedV.add(vi);
          break;
        }
      }
    }
  }
  
  // If strict verification didn't find enough, try without verification
  if (patterns.length < 3) {
    const usedH2 = new Set<number>();
    const usedV2 = new Set<number>();
    
    for (let hi = 0; hi < horizontalCandidates.length; hi++) {
      if (usedH2.has(hi)) continue;
      const h = horizontalCandidates[hi];
      
      for (let vi = 0; vi < verticalCandidates.length; vi++) {
        if (usedV2.has(vi)) continue;
        const v = verticalCandidates[vi];
        
        const dx = Math.abs(h.x - v.x);
        const dy = Math.abs(h.y - v.y);
        const avgModuleSize = (h.moduleSize + v.moduleSize) / 2;
        // FIX: Increase clustering threshold from *5 to *7
        const clusterThreshold = avgModuleSize * 7;
        
        if (dx < clusterThreshold && dy < clusterThreshold) {
          const centerX = (h.x + v.x) / 2;
          const centerY = (h.y + v.y) / 2;
          
          // Check if this pattern is already found
          const isDup = patterns.some(p => {
            const dist = Math.sqrt((p.centerX - centerX) ** 2 + (p.centerY - centerY) ** 2);
            return dist < avgModuleSize * 5;
          });
          
          if (!isDup) {
            patterns.push({
              centerX,
              centerY,
              moduleSize: avgModuleSize,
            });
          }
          usedH2.add(hi);
          usedV2.add(vi);
          break;
        }
      }
    }
  }
  
  // Deduplicate patterns that are too close
  const unique: FinderPattern[] = [];
  for (const p of patterns) {
    let isDup = false;
    for (const e of unique) {
      const dist = Math.sqrt((p.centerX - e.centerX) ** 2 + (p.centerY - e.centerY) ** 2);
      if (dist < p.moduleSize * 5) {
        isDup = true;
        break;
      }
    }
    if (!isDup) unique.push(p);
  }
  
  debugLog(`findFinderPatternsWithBinary: returning ${unique.length} unique patterns`);
  for (const p of unique) {
    debugLog(`  Pattern: (${p.centerX.toFixed(1)}, ${p.centerY.toFixed(1)}) moduleSize=${p.moduleSize.toFixed(2)}`);
  }
  
  return unique;
}

/**
 * FALLBACK: Template-based finder pattern detection
 * Uses correlation with a simple finder pattern template to find candidates
 * This is more robust than run-length encoding for noisy/distorted images
 */
function findFinderPatternsWithTemplate(
  imageData: ImageData,
  threshold: number
): FinderPattern[] {
  const { width, height, data } = imageData;
  const candidates: FinderPattern[] = [];
  
  // Create grayscale image
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  }
  
  // Try different module sizes (3 to 15 pixels per module)
  const moduleSizes = [3, 4, 5, 6, 7, 8, 10, 12, 15];
  
  for (const moduleSize of moduleSizes) {
    const patternWidth = 7 * moduleSize; // Finder pattern is 7 modules wide
    
    if (patternWidth > width / 3 || patternWidth > height / 3) continue;
    
    // Create expected 1D pattern: 1-1-3-1-1 in modules
    // For each x position, compute expected darkness based on finder pattern structure
    const template: number[] = [];
    for (let m = 0; m < 7; m++) {
      // Finder pattern row at center: XXXOOOOXXX (dark-light-dark)
      // m=0,1: dark; m=2: dark; m=3: dark; m=4: dark; m=5,6: dark
      // Actually at center row: all dark except m=1 and m=5 (light ring)
      // Wait, let me think about this more carefully:
      // Finder pattern structure at center row (row 3 of 7):
      // X.XXX.X where X=dark, .=light
      // So m=0,2,3,4,6 are dark, m=1,5 are light
      const isDark = (m === 0 || m === 2 || m === 3 || m === 4 || m === 6);
      for (let p = 0; p < moduleSize; p++) {
        template.push(isDark ? 1 : -1);
      }
    }
    
    // Scan horizontally for template matches
    const horizontalMatches: Array<{ x: number; y: number; score: number }> = [];
    const verticalMatches: Array<{ x: number; y: number; score: number }> = [];
    
    // Scan step based on module size
    const scanStep = Math.max(1, Math.floor(moduleSize / 2));
    
    // Horizontal scan
    for (let y = patternWidth / 2; y < height - patternWidth / 2; y += scanStep) {
      for (let x = patternWidth / 2; x < width - patternWidth / 2; x += scanStep) {
        // Compute correlation
        let sum = 0;
        let count = 0;
        const startX = Math.floor(x - patternWidth / 2);
        
        for (let t = 0; t < template.length && startX + t < width; t++) {
          const px = startX + t;
          const grayVal = gray[Math.floor(y) * width + px];
          const normalized = grayVal < threshold ? 1 : -1;
          sum += normalized * template[t];
          count++;
        }
        
        if (count > 0) {
          const score = sum / count;
          if (score > 0.5) { // Threshold for good match
            horizontalMatches.push({ x, y, score });
          }
        }
      }
    }
    
    // Vertical scan (same template, applied vertically)
    for (let y = patternWidth / 2; y < height - patternWidth / 2; y += scanStep) {
      for (let x = patternWidth / 2; x < width - patternWidth / 2; x += scanStep) {
        let sum = 0;
        let count = 0;
        const startY = Math.floor(y - patternWidth / 2);
        
        for (let t = 0; t < template.length && startY + t < height; t++) {
          const py = startY + t;
          const grayVal = gray[py * width + Math.floor(x)];
          const normalized = grayVal < threshold ? 1 : -1;
          sum += normalized * template[t];
          count++;
        }
        
        if (count > 0) {
          const score = sum / count;
          if (score > 0.5) {
            verticalMatches.push({ x, y, score });
          }
        }
      }
    }
    
    // Intersect horizontal and vertical matches
    for (const h of horizontalMatches) {
      for (const v of verticalMatches) {
        const dist = Math.sqrt((h.x - v.x) ** 2 + (h.y - v.y) ** 2);
        if (dist < moduleSize * 3) {
          const centerX = (h.x + v.x) / 2;
          const centerY = (h.y + v.y) / 2;
          const combinedScore = (h.score + v.score) / 2;
          
          // Check if this candidate is far enough from existing ones
          let isDuplicate = false;
          for (const existing of candidates) {
            const d = Math.sqrt((existing.centerX - centerX) ** 2 + (existing.centerY - centerY) ** 2);
            if (d < moduleSize * 5) {
              isDuplicate = true;
              break;
            }
          }
          
          if (!isDuplicate && combinedScore > 0.4) {
            candidates.push({
              centerX,
              centerY,
              moduleSize,
            });
          }
        }
      }
    }
    
    // If we found 3+ candidates with this module size, stop
    if (candidates.length >= 3) break;
  }
  
  return candidates;
}

/**
 * Find all finder patterns in an image
 * Tries multiple thresholding strategies for robustness
 */
function findFinderPatterns(imageData: ImageData): FinderPattern[] {
  const { width, height } = imageData;
  
  debugLog(`findFinderPatterns: START image ${width}x${height}`);
  
  // Try Otsu's threshold first (usually best)
  const otsu = otsuThreshold(imageData);
  const avgBrightness = calculateAverageBrightness(imageData);
  
  debugLog(`findFinderPatterns: Otsu=${otsu}, avgBrightness=${avgBrightness.toFixed(1)}`);
  
  // Build list of thresholds to try
  const thresholds = [otsu];
  
  // Add average brightness if significantly different from Otsu
  if (Math.abs(otsu - avgBrightness) > 20) {
    thresholds.push(avgBrightness);
  }
  
  // Add some backup thresholds
  thresholds.push(128); // Fixed mid-gray
  thresholds.push(Math.round(otsu * 0.8)); // Darker threshold
  thresholds.push(Math.round(otsu * 1.2)); // Lighter threshold
  thresholds.push(Math.round(otsu * 0.6)); // Much darker threshold
  thresholds.push(Math.round(otsu * 1.4)); // Much lighter threshold
  
  // Remove duplicates and invalid values
  const uniqueThresholds = [...new Set(thresholds)].filter(t => t >= 10 && t <= 245);
  
  debugLog(`findFinderPatterns: trying thresholds [${uniqueThresholds.join(', ')}]`);
  
  // Track best result so far
  let bestPatterns: FinderPattern[] = [];
  
  // Try each threshold until we find 3 finder patterns
  for (const threshold of uniqueThresholds) {
    debugLog(`findFinderPatterns: trying threshold=${threshold}`);
    const binary = createBinaryImage(imageData, threshold);
    const patterns = findFinderPatternsWithBinary(binary, width, height);
    
    debugLog(`findFinderPatterns: threshold=${threshold} found ${patterns.length} patterns`);
    
    if (patterns.length >= 3) {
      debugLog(`findFinderPatterns: SUCCESS with threshold=${threshold}`);
      return patterns;
    }
    
    // Track best result in case we don't find 3
    if (patterns.length > bestPatterns.length) {
      bestPatterns = patterns;
    }
  }
  
  // FALLBACK: If run-length approach failed, try template correlation
  // This is more robust for noisy/compressed images
  debugLog(`findFinderPatterns: FALLBACK to template detection (best so far: ${bestPatterns.length})`);
  if (bestPatterns.length < 3) {
    for (const threshold of [otsu, avgBrightness, 128]) {
      debugLog(`findFinderPatterns: template detection with threshold=${threshold}`);
      const templatePatterns = findFinderPatternsWithTemplate(imageData, threshold);
      debugLog(`findFinderPatterns: template found ${templatePatterns.length} patterns`);
      if (templatePatterns.length >= 3) {
        debugLog(`findFinderPatterns: SUCCESS with template threshold=${threshold}`);
        return templatePatterns;
      }
      if (templatePatterns.length > bestPatterns.length) {
        bestPatterns = templatePatterns;
      }
    }
  }
  
  debugLog(`findFinderPatterns: FAILED - returning best=${bestPatterns.length} patterns`);
  // Return whatever we found (even if < 3)
  return bestPatterns;
}

/**
 * Locate the QR code from 3 finder patterns
 * Returns the corner locations or null if patterns can't be identified
 */
function locateQRCode(patterns: FinderPattern[]): { location: QRLocation; patterns: FinderPatternGroup } | null {
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
function calculateVersionFromPatterns(patterns: FinderPatternGroup): { version: number; moduleCount: number } {
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
function isStructuralModule(row: number, col: number, moduleCount: number, version: number): boolean {
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

/**
 * Get character count bit length based on mode and version
 */
function getCharCountBits(mode: number, version: number): number {
  if (version >= 1 && version <= 9) {
    switch (mode) {
      case QR_MODE.NUMERIC: return 10;
      case QR_MODE.ALPHANUMERIC: return 9;
      case QR_MODE.BYTE: return 8;
      case QR_MODE.KANJI: return 8;
      default: return 8;
    }
  } else if (version >= 10 && version <= 26) {
    switch (mode) {
      case QR_MODE.NUMERIC: return 12;
      case QR_MODE.ALPHANUMERIC: return 11;
      case QR_MODE.BYTE: return 16;
      case QR_MODE.KANJI: return 10;
      default: return 16;
    }
  } else {
    switch (mode) {
      case QR_MODE.NUMERIC: return 14;
      case QR_MODE.ALPHANUMERIC: return 13;
      case QR_MODE.BYTE: return 16;
      case QR_MODE.KANJI: return 12;
      default: return 16;
    }
  }
}

/**
 * Decode payload from module matrix using reverse of mapData algorithm.
 *
 * This walks the matrix in the same zig-zag order as qrcode.mjs:mapData,
 * skipping structural modules and un-applying the mask. It then parses
 * the resulting bit stream into segments according to the QR spec.
 */
function decodePayload(
  matrix: boolean[][],
  moduleCount: number,
  maskPattern: number,
  version: number,
  eccLevel: ECCLevel | null
): { payload: string; payloadBytes: Uint8Array; errorsCorrected: number | null } | null {
  const maskFunc = getMaskFunction(maskPattern);

  // Read data bits in zigzag pattern (reverse of mapData in qrcode.mjs)
  const dataBits: boolean[] = [];
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
          dataBits.push(bit);
        }
      }
    }

    col -= 2;
    upward = !upward;
  }

  // Convert bits to bytes (raw stream, used as a fallback for payloadBytes)
  const bytes: number[] = [];
  for (let i = 0; i + 7 < dataBits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      if (dataBits[i + b]) {
        byte |= 1 << (7 - b);
      }
    }
    bytes.push(byte);
  }

  if (bytes.length === 0) return null;

  // Apply Reed-Solomon error correction if ECC level is known
  let correctedBytes = bytes;
  let errorsCorrected: number | null = null;
  
  if (eccLevel) {
    const rsResult = applyRSCorrection(bytes, version, eccLevel);
    if (rsResult) {
      correctedBytes = rsResult.data;
      errorsCorrected = rsResult.errorsCorrected;
    }
    // If RS correction fails or cannot be applied, we keep errorsCorrected as null
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
  while (bitIndex + 4 <= correctedBits.length) {
    const mode = readBits(4);

    if (mode === QR_MODE.TERMINATOR) {
      break;
    }

    const charCountBits = getCharCountBits(mode, version);
    if (bitIndex + charCountBits > correctedBits.length) {
      break;
    }

    const charCount = readBits(charCountBits);

    switch (mode) {
      case QR_MODE.NUMERIC: {
        // Numeric mode: 3 digits = 10 bits, 2 digits = 7 bits, 1 digit = 4 bits
        let remaining = charCount;
        while (remaining >= 3) {
          const val = readBits(10);
          result += String(Math.floor(val / 100));
          result += String(Math.floor((val % 100) / 10));
          result += String(val % 10);
          remaining -= 3;
        }
        if (remaining === 2) {
          const val = readBits(7);
          result += String(Math.floor(val / 10));
          result += String(val % 10);
        } else if (remaining === 1) {
          const val = readBits(4);
          result += String(val);
        }
        break;
      }

      case QR_MODE.ALPHANUMERIC: {
        // Alphanumeric: 2 chars = 11 bits, 1 char = 6 bits
        let remaining = charCount;
        while (remaining >= 2) {
          const val = readBits(11);
          result += ALPHANUMERIC_CHARS[Math.floor(val / 45)] ?? '';
          result += ALPHANUMERIC_CHARS[val % 45] ?? '';
          remaining -= 2;
        }
        if (remaining === 1) {
          const val = readBits(6);
          result += ALPHANUMERIC_CHARS[val] ?? '';
        }
        break;
      }

      case QR_MODE.BYTE: {
        // Byte mode: 8 bits per byte; decode this segment as UTF-8 (or Latin-1 fallback)
        const segment: number[] = [];
        for (let i = 0; i < charCount; i++) {
          const byte = readBits(8);
          segment.push(byte);
        }
        payloadBytes.push(...segment);

        try {
          const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;
          if (decoder) {
            result += decoder.decode(new Uint8Array(segment));
          } else {
            for (const byte of segment) {
              result += String.fromCharCode(byte);
            }
          }
        } catch {
          // Fallback to Latin-1 if UTF-8 decoding fails
          for (const byte of segment) {
            result += String.fromCharCode(byte);
          }
        }
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
        // Unsupported or unknown mode (ECI, FNC1, etc.) – stop decoding further segments
        bitIndex = correctedBits.length;
        break;
      }
    }
  }

  const finalBytes = payloadBytes.length > 0 ? payloadBytes : bytes;

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
export function analyzeQRCode(
  source: HTMLCanvasElement | ImageData | { width: number; height: number; data: Uint8ClampedArray }
): QRAnalysisResult {
  // Clear debug log at start of analysis
  clearDebugLog();
  debugLog(`analyzeQRCode: START`);
  
  const warnings: string[] = [];
  
  // Get ImageData from source
  let imageData: ImageData;
  if (source instanceof HTMLCanvasElement) {
    const ctx = source.getContext('2d');
    if (!ctx) {
      const result = createErrorResult('canvas_error', 'Could not get canvas context');
      result.debugLog = getDebugLog();
      return result;
    }
    imageData = ctx.getImageData(0, 0, source.width, source.height);
    debugLog(`analyzeQRCode: Got ImageData from canvas ${source.width}x${source.height}`);
  } else {
    imageData = source as ImageData;
    debugLog(`analyzeQRCode: Using provided ImageData ${imageData.width}x${imageData.height}`);
  }
  
  // Find finder patterns using custom detection
  debugLog(`analyzeQRCode: Finding finder patterns...`);
  const finderPatterns = findFinderPatterns(imageData);
  
  debugLog(`analyzeQRCode: Found ${finderPatterns.length} finder patterns`);
  
  if (finderPatterns.length < 3) {
    debugLog(`analyzeQRCode: FAILED - not enough finder patterns`);
    const result = createErrorResult('no_qr_detected', 'No QR code detected in this image. Could not find the required finder patterns. Make sure the image contains a clear, well-lit QR code.');
    result.debugLog = getDebugLog();
    return result;
  }
  
  // Locate the QR code from finder patterns
  debugLog(`analyzeQRCode: Locating QR code...`);
  const qrLocation = locateQRCode(finderPatterns);
  
  if (!qrLocation) {
    debugLog(`analyzeQRCode: FAILED - could not locate QR code`);
    const result = createErrorResult('no_qr_detected', 'Could not locate QR code structure. The finder patterns do not form a valid QR code configuration.');
    result.debugLog = getDebugLog();
    return result;
  }
  
  const { location, patterns } = qrLocation;
  
  // Calculate version from finder pattern distances
  const { version, moduleCount } = calculateVersionFromPatterns(patterns);
  debugLog(`analyzeQRCode: Calculated version=${version}, moduleCount=${moduleCount}`);
  
  if (!moduleCount || !version) {
    warnings.push('Could not determine QR version from image');
  }
  
  // Extract module matrix
  debugLog(`analyzeQRCode: Extracting module matrix...`);
  const moduleMatrix = extractModuleMatrix(imageData, location, moduleCount);
  debugLog(`analyzeQRCode: Module matrix extracted: ${moduleMatrix ? 'success' : 'failed'}`);
  
  // Read format info
  let eccLevel: ECCLevel | null = null;
  let maskPattern: MaskPattern | null = null;
  
  if (moduleMatrix) {
    debugLog(`analyzeQRCode: Reading format info...`);
    const formatInfo = readFormatInfo(moduleMatrix);
    if (formatInfo) {
      eccLevel = formatInfo.eccLevel;
      maskPattern = formatInfo.maskPattern;
      debugLog(`analyzeQRCode: Format info: ECC=${eccLevel}, mask=${maskPattern}`);
    } else {
      debugLog(`analyzeQRCode: Could not decode format info`);
      warnings.push('Could not decode format information');
    }
  }
  
  // Decode payload using custom decoder
  let payload: string | null = null;
  let payloadBytes: Uint8Array | null = null;
  let errorsCorrected: number | null = null;
  
  if (moduleMatrix && maskPattern !== null) {
    debugLog(`analyzeQRCode: Decoding payload...`);
    const decoded = decodePayload(moduleMatrix, moduleCount, maskPattern, version, eccLevel);
    if (decoded) {
      payload = decoded.payload;
      payloadBytes = decoded.payloadBytes;
      errorsCorrected = decoded.errorsCorrected;
      debugLog(`analyzeQRCode: Payload decoded: ${payload?.substring(0, 50)}${(payload?.length ?? 0) > 50 ? '...' : ''}`);
      debugLog(`analyzeQRCode: Errors corrected: ${errorsCorrected}`);
    } else {
      debugLog(`analyzeQRCode: Could not decode payload`);
      warnings.push('Could not decode QR payload');
    }
  } else {
    debugLog(`analyzeQRCode: Cannot decode - matrix=${!!moduleMatrix}, mask=${maskPattern}`);
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
  
  debugLog(`analyzeQRCode: COMPLETE success=${payload !== null} confidence=${confidence}`);
  
  const debugLogStr = getDebugLog();
  
  return {
    success: payload !== null,
    error: payload === null ? 'Could not decode QR code payload' : undefined,
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
function calculateRegionOtsuThreshold(
  imageData: ImageData,
  location: QRLocation,
  transform: (col: number, row: number) => { x: number; y: number },
  moduleCount: number
): number {
  const { width, height, data } = imageData;
  const histogram = new Array(256).fill(0);
  let sampleCount = 0;
  
  // Sample pixels within the QR region to build histogram
  const step = Math.max(1, Math.floor(moduleCount / 10));
  for (let row = 0; row < moduleCount; row += step) {
    for (let col = 0; col < moduleCount; col += step) {
      const pt = transform(col, row);
      const px = Math.round(pt.x);
      const py = Math.round(pt.y);
      
      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = (py * width + px) * 4;
        const gray = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
        histogram[gray]++;
        sampleCount++;
      }
    }
  }
  
  if (sampleCount === 0) return 128;
  
  // Otsu's method
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];
  
  let sumB = 0, wB = 0;
  let maxVariance = 0, threshold = 128;
  
  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    
    const wF = sampleCount - wB;
    if (wF === 0) break;
    
    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }
  
  // FIX: For bimodal images (pure black & white), Otsu returns extreme values.
  // In this case, find the midpoint between the dark and light peaks.
  if (threshold < 20 || threshold > 235) {
    let darkPeak = -1;
    let lightPeak = -1;
    const minCount = sampleCount * 0.01; // At least 1% of samples
    
    for (let i = 0; i < 128; i++) {
      if (histogram[i] > minCount) {
        darkPeak = i;
        break;
      }
    }
    
    for (let i = 255; i >= 128; i--) {
      if (histogram[i] > minCount) {
        lightPeak = i;
        break;
      }
    }
    
    if (darkPeak >= 0 && lightPeak >= 0) {
      threshold = Math.round((darkPeak + lightPeak) / 2);
    } else {
      threshold = 128;
    }
  }
  
  return threshold;
}

/**
 * Sample a single pixel and return grayscale value
 */
function samplePixelGray(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): number | null {
  const px = Math.round(x);
  const py = Math.round(y);
  
  if (px < 0 || px >= width || py < 0 || py >= height) {
    return null;
  }
  
  const idx = (py * width + px) * 4;
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
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
function sampleModuleWithVoting(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  transform: (col: number, row: number) => { x: number; y: number },
  col: number,
  row: number,
  threshold: number
): boolean {
  // Sample 5 points within the module:
  // - Center (col, row) - transform adds 0.5 internally
  // - 4 corners offset by ±0.3 (within the module bounds)
  // The offset of 0.3 means we sample at ~20% and ~80% of the module
  const offsets = [
    { dc: 0, dr: 0 },       // center
    { dc: -0.3, dr: -0.3 }, // top-left region
    { dc: 0.3, dr: -0.3 },  // top-right region
    { dc: -0.3, dr: 0.3 },  // bottom-left region
    { dc: 0.3, dr: 0.3 },   // bottom-right region
  ];
  
  let darkCount = 0;
  let lightCount = 0;
  
  for (const { dc, dr } of offsets) {
    // Pass col+dc and row+dr to transform
    // Transform will add 0.5 to get: (col + dc + 0.5) / moduleCount
    const pt = transform(col + dc, row + dr);
    
    // Ensure the point coordinates are valid numbers
    if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) {
      continue;
    }
    
    const gray = samplePixelGray(data, width, height, pt.x, pt.y);
    
    if (gray !== null) {
      if (gray < threshold) {
        darkCount++;
      } else {
        lightCount++;
      }
    }
  }
  
  // If no valid samples, default to light
  if (darkCount + lightCount === 0) return false;
  
  // Majority voting: dark wins if strictly more dark samples
  return darkCount > lightCount;
}

/**
 * Validate that extracted matrix has proper finder patterns
 * Returns true if the matrix looks like a valid QR code
 */
function validateExtractedMatrix(matrix: boolean[][], moduleCount: number): boolean {
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
  // Outer ring corners should be dark
  const tlOuterDark = (
    (getModule(0, 0) ? 1 : 0) +
    (getModule(0, 6) ? 1 : 0) +
    (getModule(6, 0) ? 1 : 0) +
    (getModule(6, 6) ? 1 : 0)
  );
  debugLog(`validateExtractedMatrix: TL outer corners dark=${tlOuterDark}/4`);
  if (tlOuterDark < 3) {
    debugLog(`validateExtractedMatrix: FAILED - TL outer corners`);
    return false;
  }
  
  // Center 3x3 should be mostly dark
  let tlCenterDark = 0;
  for (let r = 2; r <= 4; r++) {
    for (let c = 2; c <= 4; c++) {
      if (getModule(r, c)) tlCenterDark++;
    }
  }
  debugLog(`validateExtractedMatrix: TL center dark=${tlCenterDark}/9`);
  if (tlCenterDark < 5) {
    debugLog(`validateExtractedMatrix: FAILED - TL center`);
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
  if (trOuterDark < 3) {
    debugLog(`validateExtractedMatrix: FAILED - TR outer corners`);
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
  if (blOuterDark < 3) {
    debugLog(`validateExtractedMatrix: FAILED - BL outer corners`);
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
  // Timing should be at least 60% correct
  if (timingTotal > 0 && timingRatio < 0.6) {
    debugLog(`validateExtractedMatrix: FAILED - timing pattern`);
    return false;
  }
  
  debugLog(`validateExtractedMatrix: PASSED`);
  return true;
}

/**
 * Extract the boolean module matrix from the image
 * Uses adaptive thresholding and multi-point sampling for robustness
 */
function extractModuleMatrix(
  imageData: ImageData,
  location: QRLocation,
  moduleCount: number
): boolean[][] | null {
  const { width, height, data } = imageData;
  
  debugLog(`extractModuleMatrix: moduleCount=${moduleCount}`);
  
  // Calculate perspective transform
  const transform = calculatePerspectiveTransform(location, moduleCount);
  if (!transform) {
    debugLog(`extractModuleMatrix: FAILED - could not create transform`);
    return null;
  }
  
  // Calculate optimal threshold for this QR region using Otsu's method
  const otsuThresh = calculateRegionOtsuThreshold(imageData, location, transform, moduleCount);
  debugLog(`extractModuleMatrix: region Otsu threshold=${otsuThresh}`);
  
  // Try multiple thresholds and use the one that produces valid finder patterns
  const thresholdsToTry = [
    otsuThresh,
    128,
    Math.round(otsuThresh * 0.8),
    Math.round(otsuThresh * 1.2),
    Math.round(otsuThresh * 0.6),
    Math.round(otsuThresh * 1.4),
  ].filter(t => t >= 20 && t <= 235);
  
  // Remove duplicates
  const uniqueThresholds = [...new Set(thresholdsToTry)];
  debugLog(`extractModuleMatrix: trying thresholds [${uniqueThresholds.join(', ')}]`);
  
  let bestMatrix: boolean[][] | null = null;
  
  for (const threshold of uniqueThresholds) {
    debugLog(`extractModuleMatrix: trying threshold=${threshold}`);
    const matrix: boolean[][] = [];
    
    for (let row = 0; row < moduleCount; row++) {
      matrix[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        // Use multi-point sampling with majority voting
        matrix[row][col] = sampleModuleWithVoting(
          data, width, height, transform, col, row, threshold
        );
      }
    }
    
    // Validate the extracted matrix
    const isValid = validateExtractedMatrix(matrix, moduleCount);
    debugLog(`extractModuleMatrix: threshold=${threshold} validation=${isValid ? 'PASSED' : 'FAILED'}`);
    
    if (isValid) {
      debugLog(`extractModuleMatrix: SUCCESS with threshold=${threshold}`);
      return matrix;
    }
    
    // Keep track of best matrix even if validation fails
    if (!bestMatrix) {
      bestMatrix = matrix;
    }
  }
  
  debugLog(`extractModuleMatrix: returning best matrix (validation failed)`);
  // Return best matrix even if validation failed (might still be usable)
  return bestMatrix;
}

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
function calculatePerspectiveTransform(
  location: QRLocation,
  moduleCount: number
): ((col: number, row: number) => { x: number; y: number }) | null {
  // The finder pattern centers are at module coordinate 3.5 from each edge
  const finderOffset = 3.5;
  
  // Distance between finder centers in modules
  const moduleSpan = moduleCount - 7; // e.g., for version 3 (29 modules): 29 - 7 = 22
  
  if (moduleSpan <= 0) {
    return null;
  }
  
  // Use finder centers directly as source quad points (don't extend!)
  // These are the most accurately detected positions
  const srcPoints = [
    location.topLeft,      // corresponds to module (3.5, 3.5) -> u=0, v=0
    location.topRight,     // corresponds to module (moduleCount-3.5, 3.5) -> u=1, v=0
    location.bottomRight,  // corresponds to module (moduleCount-3.5, moduleCount-3.5) -> u=1, v=1
    location.bottomLeft,   // corresponds to module (3.5, moduleCount-3.5) -> u=0, v=1
  ];
  
  return (col: number, row: number) => {
    // Map module coordinates to u,v relative to finder centers
    // For module center at (col, row), we sample at (col + 0.5, row + 0.5)
    // u = 0 at module 3.5, u = 1 at module (moduleCount - 3.5)
    const u = (col + 0.5 - finderOffset) / moduleSpan;
    const v = (row + 0.5 - finderOffset) / moduleSpan;
    
    // DO NOT CLAMP u,v - extrapolation is necessary and correct for edge modules
    // Module (0, 0) will have u ≈ -0.136, v ≈ -0.136 for version 3
    // Bilinear interpolation naturally handles this
    
    // Bilinear interpolation (works for both interpolation and extrapolation)
    // srcPoints[0] = topLeft (u=0, v=0)
    // srcPoints[1] = topRight (u=1, v=0)
    // srcPoints[2] = bottomRight (u=1, v=1)
    // srcPoints[3] = bottomLeft (u=0, v=1)
    const x =
      (1 - u) * (1 - v) * srcPoints[0].x +
      u * (1 - v) * srcPoints[1].x +
      u * v * srcPoints[2].x +
      (1 - u) * v * srcPoints[3].x;
    
    const y =
      (1 - u) * (1 - v) * srcPoints[0].y +
      u * (1 - v) * srcPoints[1].y +
      u * v * srcPoints[2].y +
      (1 - u) * v * srcPoints[3].y;
    
    return { x, y };
  };
}

// ============================================
// FORMAT INFO DECODING
// ============================================

interface FormatInfo {
  eccLevel: ECCLevel;
  maskPattern: MaskPattern;
}

/**
 * Read and decode format information from the module matrix
 */
function readFormatInfo(matrix: boolean[][]): FormatInfo | null {
  const moduleCount = matrix.length;
  if (moduleCount < 21) return null;
  
  // Try reading format info from two locations and use the better one
  const format1 = readFormatInfoFromTopLeft(matrix);
  const format2 = readFormatInfoFromSecondary(matrix);
  
  // Try to decode both
  const decoded1 = format1 !== null ? decodeFormatInfo(format1) : null;
  const decoded2 = format2 !== null ? decodeFormatInfo(format2) : null;
  
  // Return whichever decoded successfully, preferring the first
  return decoded1 || decoded2;
}

/**
 * Read 15-bit format info from around top-left finder pattern
 */
function readFormatInfoFromTopLeft(matrix: boolean[][]): number | null {
  let bits = 0;
  
  // Read from column 8, rows 0-5 (bits 0-5)
  for (let i = 0; i < 6; i++) {
    if (matrix[i]?.[8]) {
      bits |= (1 << i);
    }
  }
  
  // Skip row 6 (timing pattern), read rows 7-8 (bits 6-7)
  if (matrix[7]?.[8]) bits |= (1 << 6);
  if (matrix[8]?.[8]) bits |= (1 << 7);
  
  // Read from row 8, columns 7, 5, 4, 3, 2, 1, 0 (bits 8-14)
  // Bit 8 is at column 7
  if (matrix[8]?.[7]) bits |= (1 << 8);
  
  // Bits 9-14 are at columns 5, 4, 3, 2, 1, 0
  for (let i = 0; i < 6; i++) {
    if (matrix[8]?.[5 - i]) {
      bits |= (1 << (9 + i));
    }
  }
  
  return bits;
}

/**
 * Read 15-bit format info from secondary location (near bottom-left and top-right finders)
 */
function readFormatInfoFromSecondary(matrix: boolean[][]): number | null {
  const moduleCount = matrix.length;
  let bits = 0;
  
  // Bits 0-7 from row 8, columns (moduleCount-1) down to (moduleCount-8)
  for (let i = 0; i < 8; i++) {
    const col = moduleCount - 1 - i;
    if (matrix[8]?.[col]) {
      bits |= (1 << i);
    }
  }
  
  // Bits 8-14 from column 8, rows (moduleCount-7) up to (moduleCount-1)
  for (let i = 0; i < 7; i++) {
    const row = moduleCount - 7 + i;
    if (matrix[row]?.[8]) {
      bits |= (1 << (8 + i));
    }
  }
  
  return bits;
}

/**
 * Decode format info bits to extract ECC level and mask pattern
 */
function decodeFormatInfo(bits: number): FormatInfo | null {
  // XOR with format info mask
  const decoded = bits ^ FORMAT_INFO_MASK;
  
  // Extract mask pattern (bits 0-2) and ECC level (bits 3-4)
  const maskPattern = decoded & 0x07;
  const eccCode = (decoded >> 3) & 0x03;
  
  // Validate mask pattern (0-7)
  if (maskPattern < 0 || maskPattern > 7) {
    return null;
  }
  
  // Map ECC code to level
  const eccLevel = ECC_LEVEL_MAP[eccCode];
  if (!eccLevel) {
    return null;
  }
  
  return {
    eccLevel,
    maskPattern: maskPattern as MaskPattern,
  };
}

// ============================================
// ENCODING MODE DETECTION
// ============================================

/**
 * Detect encoding mode from the decoded payload
 */
function detectEncodingMode(payload: string): EncodingMode {
  if (!payload || payload.length === 0) {
    return 'unknown';
  }
  
  // Check if all numeric
  if (/^[0-9]+$/.test(payload)) {
    return 'numeric';
  }
  
  // Check if all alphanumeric (QR alphanumeric charset)
  // 0-9, A-Z, space, $, %, *, +, -, ., /, :
  if (/^[0-9A-Z $%*+\-./:]+$/.test(payload)) {
    return 'alphanumeric';
  }
  
  // Check for Kanji (Shift-JIS encoded Japanese)
  // This is a heuristic - look for characters in CJK ranges
  const hasCJK = /[\u3000-\u9FFF\uFF00-\uFFEF]/.test(payload);
  if (hasCJK) {
    return 'kanji';
  }
  
  // Check if it's valid ASCII/Latin-1 (byte mode)
  const hasHighBytes = /[^\x00-\xFF]/.test(payload);
  if (!hasHighBytes) {
    return 'byte';
  }
  
  // Mixed or unknown
  return 'byte';
}

// ============================================
// QUIET ZONE ESTIMATION
// ============================================

/**
 * Estimate the quiet zone (white border) around the QR code
 */
function estimateQuietZone(
  imageData: ImageData,
  location: QRLocation,
  moduleCount: number
): {
  top: number;
  right: number;
  bottom: number;
  left: number;
  adequate: boolean;
} | null {
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
function measureQuietZoneEdge(
  imageData: ImageData,
  corner1: { x: number; y: number },
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
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
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

function createErrorResult(errorType: AnalysisErrorType, error: string): QRAnalysisResult {
  return {
    success: false,
    error,
    errorType,
    payload: null,
    payloadBytes: null,
    version: null,
    moduleCount: null,
    eccLevel: null,
    maskPattern: null,
    encodingMode: null,
    quietZone: null,
    moduleMatrix: null,
    location: null,
    confidence: 'low',
    warnings: [],
    errorsCorrected: null,
    // Enhanced analysis fields
    contentType: null,
    detectedColors: null,
    estimatedModulePx: null,
    dataCapacity: null,
    structuralAnalysis: null,
    imageProperties: null,
    debugLog: null,
  };
}

function calculateConfidence(
  hasEcc: boolean,
  hasMask: boolean,
  hasMatrix: boolean,
  hasAdequateQuietZone: boolean
): 'high' | 'medium' | 'low' {
  const score = (hasEcc ? 1 : 0) + (hasMask ? 1 : 0) + (hasMatrix ? 1 : 0) + (hasAdequateQuietZone ? 1 : 0);
  
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

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
