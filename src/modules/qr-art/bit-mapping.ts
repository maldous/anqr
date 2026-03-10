/**
 * QR-Art Bit-to-Pixel Mapping
 *
 * This module maps data stream bits to QR module (pixel) positions
 * by simulating the exact zigzag traversal pattern used in QR encoding.
 *
 * The mapping is essential for knowing which bits affect which pixels,
 * allowing precise control over the visual appearance via RS basis manipulation.
 */

import { createLogger } from '../../lib/logger';
import { getRSBlocks } from '../qr-encoder/rs-blocks';
import { QRErrorCorrectionLevel } from '../qr-encoder/types';
import { getMaskFunction } from '../qr-spec/masks';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../qr-spec/qr-patterns';

const log = createLogger('QART');
const BIT_PIXEL_MAP_CACHE_LIMIT = 48;
const DATA_PIXEL_INDICES_CACHE_LIMIT = 24;
const bitPixelMapCache = new Map<string, BitPixelMapping[]>();
const dataPixelIndicesCache = new Map<number, number[]>();

function updateLruCache<K, V>(cache: Map<K, V>, key: K, value: V, limit: number): void {
  cache.delete(key);
  cache.set(key, value);
  if (cache.size <= limit) return;
  const oldestKey = cache.keys().next().value as K | undefined;
  if (oldestKey !== undefined) {
    cache.delete(oldestKey);
  }
}

/**
 * Represents the mapping of a single bit to its pixel position
 */
export interface BitPixelMapping {
  /** Global bit index in the final interleaved data stream */
  globalBitIndex: number;
  /** Byte index in the final interleaved stream */
  byteIndex: number;
  /** Bit position within the byte (7 = MSB, 0 = LSB) */
  bitInByte: number;
  /** QR module row position */
  row: number;
  /** QR module column position */
  col: number;
  /** Whether this is a data byte (true) or ECC byte (false) */
  isData: boolean;
  /** Which RS block this byte belongs to */
  rsBlockIndex: number;
  /** Position of the byte within its RS block */
  posInBlock: number;
  /** Linear pixel index (row * moduleCount + col) */
  pixelIndex: number;
}

/**
 * Information about the RS block structure for a version/ECC combo
 */
export interface RSBlockInfo {
  /** Index of this RS block */
  blockIndex: number;
  /** Number of data bytes in this block */
  dataCount: number;
  /** Number of ECC bytes in this block */
  eccCount: number;
  /** Total bytes (data + ECC) */
  totalCount: number;
}

export type ECCLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Get module count for a QR version
 */
export function getModuleCount(version: number): number {
  return version * 4 + 17;
}

/**
 * Convert ECC level character to numeric value
 */
function eccToNumeric(ecc: ECCLevel): number {
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
 * Get RS block information for a version and ECC level
 */
export function getRSBlockInfo(version: number, ecc: ECCLevel): RSBlockInfo[] {
  const rsBlocks = getRSBlocks(version, eccToNumeric(ecc));
  return rsBlocks.map((block, index) => ({
    blockIndex: index,
    dataCount: block.dataCount,
    eccCount: block.totalCount - block.dataCount,
    totalCount: block.totalCount,
  }));
}

/**
 * Get total data capacity in bytes for a version/ECC
 */
export function getTotalDataBytes(version: number, ecc: ECCLevel): number {
  const blocks = getRSBlockInfo(version, ecc);
  return blocks.reduce((sum, b) => sum + b.dataCount, 0);
}

/**
 * Get total codewords (data + ECC) for a version/ECC
 */
export function getTotalCodewords(version: number, ecc: ECCLevel): number {
  const blocks = getRSBlockInfo(version, ecc);
  return blocks.reduce((sum, b) => sum + b.totalCount, 0);
}

function isQuietZoneSeparator(row: number, col: number, moduleCount: number): boolean {
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;
  return false;
}

/**
 * Check if a module is structural (not data/ECC)
 */
function isStructural(row: number, col: number, moduleCount: number, version: number): boolean {
  if (isFinderPattern(row, col, moduleCount)) return true;
  if (isTimingPattern(row, col, moduleCount)) return true;
  if (isAlignmentPattern(row, col, moduleCount, version)) return true;
  if (isFormatInfo(row, col, moduleCount)) return true;
  if (isVersionInfo(row, col, moduleCount, version)) return true;

  // Fixed dark module
  if (row === moduleCount - 8 && col === 8) return true;

  return isQuietZoneSeparator(row, col, moduleCount);
}

/**
 * Convert (row, col) to linear pixel index
 */
export function pixelToIndex(row: number, col: number, moduleCount: number): number {
  return row * moduleCount + col;
}

/**
 * Convert linear pixel index to (row, col)
 */
export function indexToPixel(index: number, moduleCount: number): { row: number; col: number } {
  return {
    row: Math.floor(index / moduleCount),
    col: index % moduleCount,
  };
}

interface InterleavingEntry {
  rsBlockIndex: number;
  posInBlock: number;
  isData: boolean;
}

function buildInterleavingMap(rsBlockInfo: RSBlockInfo[]): InterleavingEntry[] {
  const map: InterleavingEntry[] = [];
  const maxDataCount = Math.max(...rsBlockInfo.map((b) => b.dataCount));
  const maxEccCount = Math.max(...rsBlockInfo.map((b) => b.eccCount));

  for (let i = 0; i < maxDataCount; i++) {
    for (let blockIdx = 0; blockIdx < rsBlockInfo.length; blockIdx++) {
      if (i < rsBlockInfo[blockIdx].dataCount) {
        map.push({ rsBlockIndex: blockIdx, posInBlock: i, isData: true });
      }
    }
  }

  for (let i = 0; i < maxEccCount; i++) {
    for (let blockIdx = 0; blockIdx < rsBlockInfo.length; blockIdx++) {
      if (i < rsBlockInfo[blockIdx].eccCount) {
        map.push({
          rsBlockIndex: blockIdx,
          posInBlock: rsBlockInfo[blockIdx].dataCount + i,
          isData: false,
        });
      }
    }
  }

  return map;
}

/**
 * Build the complete bit-to-pixel mapping by simulating the zigzag traversal
 *
 * This replicates the exact traversal order from encoder.ts:mapData
 * The traversal:
 * - Starts from bottom-right, moves in 2-column pairs
 * - Alternates between moving up and down
 * - Skips column 6 (timing pattern)
 * - Only places bits in non-structural modules
 *
 * @param version QR version (1-40)
 * @param ecc Error correction level
 * @param maskPattern Mask pattern (0-7) - needed to know final pixel value
 */
export function buildBitPixelMap(
  version: number,
  ecc: ECCLevel,
  maskPattern: number
): BitPixelMapping[] {
  const cacheKey = `${version}:${ecc}:${maskPattern}`;
  const cached = bitPixelMapCache.get(cacheKey);
  if (cached) {
    updateLruCache(bitPixelMapCache, cacheKey, cached, BIT_PIXEL_MAP_CACHE_LIMIT);
    return cached;
  }

  const moduleCount = getModuleCount(version);
  const rsBlockInfo = getRSBlockInfo(version, ecc);
  const totalCodewords = getTotalCodewords(version, ecc);
  const _maskFunc = getMaskFunction(maskPattern);

  // Build interleaving map: which byte index in final stream maps to which block/position
  const interleavingMap = buildInterleavingMap(rsBlockInfo);

  // Now simulate the zigzag traversal
  const mappings: BitPixelMapping[] = [];
  let bitIndex = 7;
  let byteIndex = 0;
  let inc = -1; // -1 = moving up, +1 = moving down
  let row = moduleCount - 1;

  let col = moduleCount - 1;
  while (col > 0) {
    // Skip column 6 (timing pattern)
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;

        // Check if this is a structural module (skip it)
        if (!isStructural(row, currentCol, moduleCount, version)) {
          // This is a data/ECC bit position
          if (byteIndex < totalCodewords) {
            const globalBitIndex = byteIndex * 8 + (7 - bitIndex);
            const interleaveInfo = interleavingMap[byteIndex];

            mappings.push({
              globalBitIndex,
              byteIndex,
              bitInByte: bitIndex,
              row,
              col: currentCol,
              isData: interleaveInfo?.isData ?? false,
              rsBlockIndex: interleaveInfo?.rsBlockIndex ?? 0,
              posInBlock: interleaveInfo?.posInBlock ?? 0,
              pixelIndex: pixelToIndex(row, currentCol, moduleCount),
            });

            bitIndex -= 1;
            if (bitIndex === -1) {
              byteIndex += 1;
              bitIndex = 7;
            }
          }
        }
      }

      row += inc;

      if (row < 0 || moduleCount <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
    col -= 2;
  }

  log.debug('Built bit-pixel map', {
    version,
    ecc,
    maskPattern,
    moduleCount,
    totalBits: mappings.length,
    totalCodewords,
  });

  updateLruCache(bitPixelMapCache, cacheKey, mappings, BIT_PIXEL_MAP_CACHE_LIMIT);
  return mappings;
}

/**
 * Get all data pixel indices (non-structural modules)
 */
export function getDataPixelIndices(version: number): number[] {
  const cached = dataPixelIndicesCache.get(version);
  if (cached) {
    updateLruCache(dataPixelIndicesCache, version, cached, DATA_PIXEL_INDICES_CACHE_LIMIT);
    return cached;
  }

  const moduleCount = getModuleCount(version);
  const indices: number[] = [];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!isStructural(row, col, moduleCount, version)) {
        indices.push(pixelToIndex(row, col, moduleCount));
      }
    }
  }

  updateLruCache(dataPixelIndicesCache, version, indices, DATA_PIXEL_INDICES_CACHE_LIMIT);
  return indices;
}

/**
 * Build a map from pixel index to the bit that affects it
 */
export function buildPixelToBitMap(mappings: BitPixelMapping[]): Map<number, BitPixelMapping> {
  const map = new Map<number, BitPixelMapping>();
  for (const m of mappings) {
    map.set(m.pixelIndex, m);
  }
  return map;
}

/**
 * Build a map from global bit index to its mapping
 */
export function buildBitToMappingMap(mappings: BitPixelMapping[]): Map<number, BitPixelMapping> {
  const map = new Map<number, BitPixelMapping>();
  for (const m of mappings) {
    map.set(m.globalBitIndex, m);
  }
  return map;
}

export function clearBitMappingCache(): void {
  bitPixelMapCache.clear();
  dataPixelIndicesCache.clear();
}
