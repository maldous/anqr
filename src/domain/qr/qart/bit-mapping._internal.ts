import { createLogger } from '../../../infra/logging/logger';
import { QRErrorCorrectionLevel } from '../../../modules/qr-encoder/types';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../spec/qr-patterns';
import type { BitPixelMapping, RSBlockInfo, ECCLevel } from './bit-mapping.types';
import { pixelToIndex } from './pixel-to-index';

export const log = createLogger('QART');

export const BIT_PIXEL_MAP_CACHE_LIMIT = 48;

export const DATA_PIXEL_INDICES_CACHE_LIMIT = 24;

export const bitPixelMapCache = new Map<string, BitPixelMapping[]>();

export const dataPixelIndicesCache = new Map<number, number[]>();

export function updateLruCache<K, V>(cache: Map<K, V>, key: K, value: V, limit: number): void {
  cache.delete(key);
  cache.set(key, value);
  if (cache.size <= limit) return;
  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) {
    cache.delete(oldestKey);
  }
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

export function isQuietZoneSeparator(row: number, col: number, moduleCount: number): boolean {
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

export interface InterleavingEntry {
  rsBlockIndex: number;
  posInBlock: number;
  isData: boolean;
}

export function recordDataBitMapping(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  totalCodewords: number,
  interleavingMap: InterleavingEntry[],
  state: { bitIndex: number; byteIndex: number },
  mappings: BitPixelMapping[]
): void {
  if (isStructural(row, col, moduleCount, version)) return;
  if (state.byteIndex >= totalCodewords) return;

  const globalBitIndex = state.byteIndex * 8 + (7 - state.bitIndex);
  const interleaveInfo = interleavingMap[state.byteIndex];

  mappings.push({
    globalBitIndex,
    byteIndex: state.byteIndex,
    bitInByte: state.bitIndex,
    row,
    col,
    isData: interleaveInfo?.isData ?? false,
    rsBlockIndex: interleaveInfo?.rsBlockIndex ?? 0,
    posInBlock: interleaveInfo?.posInBlock ?? 0,
    pixelIndex: pixelToIndex(row, col, moduleCount),
  });

  state.bitIndex -= 1;
  if (state.bitIndex === -1) {
    state.byteIndex += 1;
    state.bitIndex = 7;
  }
}

export function buildInterleavingMap(rsBlockInfo: RSBlockInfo[]): InterleavingEntry[] {
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

export { eccToNumeric, isStructural };
