import { createLogger } from '../../../infra/logging/logger';
import { gexp, qrPolynomial } from '../encode/math';
import { QRMode } from '../../../modules/qr-encoder/types';
import { getLengthInBits } from '../encode/utils';
import { type ECCLevel, getRSBlockInfo, type RSBlockInfo } from './bit-mapping';
import type { RSBasis, RSBasisVector } from './rs-basis.types';
import { computeECC } from './compute-ecc';
import { MIN_ECC_HEADROOM_BYTES } from './min-ecc-headroom-bytes';

export const log = createLogger('QART');

// Cache for computed bases (expensive to compute)
const basisCache = new Map<string, RSBasis>();

export const BASIS_CACHE_LIMIT = 32;

export function updateBasisCacheLru(key: string, basis: RSBasis): void {
  basisCache.delete(key);
  basisCache.set(key, basis);
  if (basisCache.size <= BASIS_CACHE_LIMIT) return;
  const oldestKey = basisCache.keys().next().value;
  if (oldestKey !== undefined) {
    basisCache.delete(oldestKey);
  }
}

/**
 * Create the error correction polynomial for a given ECC length
 * This is the generator polynomial g(x) = (x-α^0)(x-α^1)...(x-α^(n-1))
 */
function getErrorCorrectPolynomial(eccCount: number) {
  let a = qrPolynomial([1], 0);
  for (let i = 0; i < eccCount; i++) {
    a = a.multiply(qrPolynomial([1, gexp(i)], 0));
  }
  return a;
}

/**
 * Simulate the QR interleaving pattern to determine the highest protected byte
 * index in each RS block.
 */
function simulateInterleavingProtection(
  rsBlockInfo: RSBlockInfo[],
  numBlocks: number,
  protectedByteCount: number
): number[] {
  const maxProtectedByteInBlock: number[] = new Array(numBlocks).fill(-1);
  const maxDataCount = Math.max(...rsBlockInfo.map((b) => b.dataCount));
  let interleavedByteIndex = 0;

  for (let bytePos = 0; bytePos < maxDataCount; bytePos++) {
    for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
      if (bytePos >= rsBlockInfo[blockIdx].dataCount) continue;

      if (
        interleavedByteIndex < protectedByteCount &&
        bytePos > maxProtectedByteInBlock[blockIdx]
      ) {
        maxProtectedByteInBlock[blockIdx] = bytePos;
      }
      interleavedByteIndex++;
      if (interleavedByteIndex >= protectedByteCount) break;
    }
    if (interleavedByteIndex >= protectedByteCount) break;
  }

  return maxProtectedByteInBlock;
}

/**
 * Create a single RS basis vector for one data bit.
 */
function createSingleBitBasisVector(
  blockInfo: RSBlockInfo,
  rsBlockIndex: number,
  globalBitOffset: number,
  byteIdx: number,
  bitIdx: number
): RSBasisVector {
  const { dataCount, eccCount, totalCount } = blockInfo;
  const dataBitIndex = globalBitOffset + byteIdx * 8 + (7 - bitIdx);

  const dataBytes = new Uint8Array(dataCount);
  dataBytes[byteIdx] = 1 << bitIdx;

  const eccBytes = computeECC(dataBytes, eccCount);

  const blockBits = new Uint8Array(totalCount);
  blockBits.set(dataBytes, 0);
  blockBits.set(eccBytes, dataCount);

  return {
    dataBitIndex,
    rsBlockIndex,
    posInBlock: byteIdx,
    bitInByte: bitIdx,
    blockBits,
    affectedPixels: [],
    pivotPixel: -1,
  };
}

export function getNumericBitsForDigits(digits: number): number {
  const fullGroups = Math.floor(digits / 3);
  const rem = digits % 3;
  return fullGroups * 10 + (rem === 1 ? 4 : rem === 2 ? 7 : 0);
}

export function getMaxNumericDigitsForBits(availableBits: number, version: number): number {
  if (availableBits <= 0) return 0;
  const numCharCountBits = getLengthInBits(QRMode.MODE_NUMBER, version);
  let low = 0;
  let high = 10000;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const needed = 4 + numCharCountBits + getNumericBitsForDigits(mid);
    if (needed <= availableBits) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low;
}

export interface VersionCapacityResult {
  totalDataBytes: number;
  actualSuffixLen: number;
  suffixCharCount: number;
  paddingBytes: number;
  suffixSafeBits: number;
  paddingBitsVal: number;
  controllableBits: number;
  controlPercent: number;
}

export function evaluateVersionCapacity(
  version: number,
  ecc: ECCLevel,
  dataLength: number,
  suffixMode: 'numeric' | 'byte'
): VersionCapacityResult | null {
  const blocks = getRSBlockInfo(version, ecc);
  const totalDataBytes = blocks.reduce((sum, b) => sum + b.dataCount, 0);
  const totalDataBits = totalDataBytes * 8;
  const totalEccBytes = blocks.reduce((sum, b) => sum + b.eccCount, 0);

  const eccHeadroom = Math.min(MIN_ECC_HEADROOM_BYTES, Math.floor(totalEccBytes / 4));
  const usableBits = (totalDataBytes - eccHeadroom) * 8;

  const byteCharCountBits = getLengthInBits(QRMode.MODE_8BIT_BYTE, version);
  const prefixLen = suffixMode === 'numeric' ? dataLength : dataLength + 1;
  const prefixBits = 4 + byteCharCountBits + prefixLen * 8;
  const terminatorBits = 4;

  let actualSuffixLen: number;
  let suffixCharCount: number;
  let bitsAfterAllData: number;

  if (suffixMode === 'numeric') {
    const availableForNumeric = usableBits - prefixBits - terminatorBits;
    if (availableForNumeric <= 0) return null;
    const suffixDigits = getMaxNumericDigitsForBits(availableForNumeric, version);
    if (suffixDigits <= 0) return null;
    const numericCharCountBits = getLengthInBits(QRMode.MODE_NUMBER, version);
    bitsAfterAllData =
      prefixBits + 4 + numericCharCountBits + getNumericBitsForDigits(suffixDigits);
    actualSuffixLen = suffixDigits;
    suffixCharCount = suffixDigits;
  } else {
    const fixedOverhead = prefixBits + terminatorBits;
    const availableForSuffix = Math.floor((usableBits - fixedOverhead) / 8);
    if (availableForSuffix <= 0) return null;
    suffixCharCount = availableForSuffix;
    actualSuffixLen = 1 + suffixCharCount;
    bitsAfterAllData = 4 + byteCharCountBits + (prefixLen + suffixCharCount) * 8;
  }

  const protectedBits = Math.ceil(prefixBits / 8) * 8;
  const suffixSafeBits = Math.max(0, Math.floor(bitsAfterAllData / 8) * 8 - protectedBits);
  const bitsAfterTerminator = bitsAfterAllData + Math.min(4, totalDataBits - bitsAfterAllData);
  const paddingStartByte = Math.ceil(bitsAfterTerminator / 8);
  const paddingBitsVal = Math.max(0, totalDataBits - paddingStartByte * 8);
  const paddingBytes = Math.floor(paddingBitsVal / 8);
  const controllableBits = suffixSafeBits + paddingBitsVal;
  const controlPercent = (controllableBits / totalDataBits) * 100;

  return {
    totalDataBytes,
    actualSuffixLen,
    suffixCharCount,
    paddingBytes,
    suffixSafeBits,
    paddingBitsVal,
    controllableBits,
    controlPercent,
  };
}

export { basisCache, getErrorCorrectPolynomial, simulateInterleavingProtection, createSingleBitBasisVector };
