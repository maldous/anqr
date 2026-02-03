/**
 * QR-Art Reed-Solomon Basis
 *
 * This module builds RS basis vectors for controlling individual QR pixels.
 * Each basis vector represents setting one data bit to 1 and computing
 * the corresponding ECC bytes - a valid RS codeword.
 *
 * The key insight from Russ Cox's QArt:
 * - RS codes are linear: XOR of two valid codewords is also valid
 * - By building a basis of single-bit codewords, we can control pixels
 * - Gauss-Jordan elimination trades control between data and ECC bits
 */

import { createLogger } from '../../lib/logger';
import { gexp, qrPolynomial } from '../qr-encoder/math';
import { QRErrorCorrectionLevel } from '../qr-encoder/types';
import { type ECCLevel, getRSBlockInfo, type RSBlockInfo } from './bit-mapping';

const log = createLogger('QART');

/**
 * A single RS basis vector
 * Represents setting one bit to 1 and its effect on the codeword
 */
export interface RSBasisVector {
  /** Which data bit this vector controls (global index) */
  dataBitIndex: number;
  /** Which RS block this belongs to */
  rsBlockIndex: number;
  /** Position within the RS block (byte index) */
  posInBlock: number;
  /** Which bit within the byte (0-7, 7=MSB) */
  bitInByte: number;
  /** The complete block data (data + ECC) as a bit vector */
  blockBits: Uint8Array;
  /** Affected pixel indices (will be filled during mapping) */
  affectedPixels: number[];
  /** After elimination: which pixel this primarily controls (-1 if none) */
  pivotPixel: number;
}

/**
 * Complete RS basis for a version/ECC combination
 */
export interface RSBasis {
  version: number;
  ecc: ECCLevel;
  blocks: RSBlockInfo[];
  vectors: RSBasisVector[];
  totalDataBits: number;
  totalEccBits: number;
}

// Cache for computed bases (expensive to compute)
const basisCache = new Map<string, RSBasis>();

/**
 * Convert ECC level to numeric
 */
function _eccToNumeric(ecc: ECCLevel): number {
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
 * Compute ECC bytes for a data block
 * Uses polynomial division: data * x^eccCount mod generator
 *
 * @param dataBytes The data bytes
 * @param eccCount Number of ECC bytes to generate
 * @returns The ECC bytes
 */
export function computeECC(dataBytes: Uint8Array, eccCount: number): Uint8Array {
  const rsPoly = getErrorCorrectPolynomial(eccCount);
  const rawPoly = qrPolynomial(Array.from(dataBytes), rsPoly.getLength() - 1);
  const modPoly = rawPoly.mod(rsPoly);

  const ecdata = new Uint8Array(eccCount);
  for (let i = 0; i < eccCount; i++) {
    const modIndex = i + modPoly.getLength() - eccCount;
    ecdata[i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
  }

  return ecdata;
}

/**
 * Build basis vectors for a single RS block
 * Each vector has exactly one data bit set to 1, with corresponding ECC
 *
 * @param blockInfo The RS block info
 * @param rsBlockIndex Index of this block
 * @param globalBitOffset Starting global bit index for this block's data
 * @returns Array of basis vectors for this block
 */
export function buildBlockBasis(
  blockInfo: RSBlockInfo,
  rsBlockIndex: number,
  globalBitOffset: number
): RSBasisVector[] {
  const { dataCount, eccCount, totalCount } = blockInfo;
  const vectors: RSBasisVector[] = [];

  // For each data bit, create a basis vector
  for (let byteIdx = 0; byteIdx < dataCount; byteIdx++) {
    for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
      // Create data bytes with just this one bit set
      const dataBytes = new Uint8Array(dataCount);
      dataBytes[byteIdx] = 1 << bitIdx;

      // Compute ECC for this single-bit data
      const eccBytes = computeECC(dataBytes, eccCount);

      // Create the complete block bits (data + ECC)
      const blockBits = new Uint8Array(totalCount);
      blockBits.set(dataBytes, 0);
      blockBits.set(eccBytes, dataCount);

      const dataBitIndex = globalBitOffset + byteIdx * 8 + (7 - bitIdx);

      vectors.push({
        dataBitIndex,
        rsBlockIndex,
        posInBlock: byteIdx,
        bitInByte: bitIdx,
        blockBits,
        affectedPixels: [],
        pivotPixel: -1,
      });
    }
  }

  return vectors;
}

/**
 * Build the complete RS basis for a version/ECC combination
 * This creates one basis vector per data bit across all RS blocks
 *
 * @param version QR version (1-40)
 * @param ecc Error correction level
 * @returns Complete RS basis
 */
export function buildFullBasis(version: number, ecc: ECCLevel): RSBasis {
  const cacheKey = `${version}-${ecc}`;
  const cached = basisCache.get(cacheKey);
  if (cached) return cached;

  const blocks = getRSBlockInfo(version, ecc);
  const vectors: RSBasisVector[] = [];

  let globalBitOffset = 0;
  let totalDataBits = 0;
  let totalEccBits = 0;

  for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
    const block = blocks[blockIdx];
    const blockVectors = buildBlockBasis(block, blockIdx, globalBitOffset);
    vectors.push(...blockVectors);

    globalBitOffset += block.dataCount * 8;
    totalDataBits += block.dataCount * 8;
    totalEccBits += block.eccCount * 8;
  }

  const basis: RSBasis = {
    version,
    ecc,
    blocks,
    vectors,
    totalDataBits,
    totalEccBits,
  };

  log.debug('Built full RS basis', {
    version,
    ecc,
    numBlocks: blocks.length,
    numVectors: vectors.length,
    totalDataBits,
    totalEccBits,
  });

  basisCache.set(cacheKey, basis);
  return basis;
}

/**
 * Get cached basis or build new one
 */
export function getCachedBasis(version: number, ecc: ECCLevel): RSBasis {
  return buildFullBasis(version, ecc);
}

/**
 * Clear the basis cache
 */
export function clearBasisCache(): void {
  basisCache.clear();
}

/**
 * XOR two basis vectors together
 * Result is also a valid RS codeword (linearity property)
 *
 * @param a First vector
 * @param b Second vector (must be same block)
 * @returns New vector that is XOR of both
 */
export function xorBasisVectors(a: RSBasisVector, b: RSBasisVector): RSBasisVector {
  if (a.rsBlockIndex !== b.rsBlockIndex) {
    throw new Error('Cannot XOR vectors from different RS blocks');
  }

  const blockBits = new Uint8Array(a.blockBits.length);
  for (let i = 0; i < blockBits.length; i++) {
    blockBits[i] = a.blockBits[i] ^ b.blockBits[i];
  }

  return {
    dataBitIndex: -1, // Combined vector doesn't have single data bit
    rsBlockIndex: a.rsBlockIndex,
    posInBlock: -1,
    bitInByte: -1,
    blockBits,
    affectedPixels: [...new Set([...a.affectedPixels, ...b.affectedPixels])],
    pivotPixel: -1,
  };
}

/**
 * Convert a basis to a binary matrix for Gauss-Jordan elimination
 * Rows are vectors, columns are bit positions
 *
 * @param vectors Basis vectors (from same RS block)
 * @param totalBits Total bits in a block (data + ECC)
 * @returns Binary matrix as 2D array of booleans
 */
export function basisToMatrix(vectors: RSBasisVector[], totalBits: number): boolean[][] {
  const matrix: boolean[][] = [];

  for (const v of vectors) {
    const row: boolean[] = [];
    for (let byteIdx = 0; byteIdx < v.blockBits.length; byteIdx++) {
      for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
        row.push((v.blockBits[byteIdx] & (1 << bitIdx)) !== 0);
      }
    }
    // Pad or truncate to totalBits
    while (row.length < totalBits) row.push(false);
    matrix.push(row.slice(0, totalBits));
  }

  return matrix;
}

/**
 * Convert a binary matrix row back to block bytes
 */
export function matrixRowToBytes(row: boolean[], byteCount: number): Uint8Array {
  const bytes = new Uint8Array(byteCount);
  for (let byteIdx = 0; byteIdx < byteCount; byteIdx++) {
    let byte = 0;
    for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
      const rowIdx = byteIdx * 8 + bitIdx;
      if (rowIdx < row.length && row[rowIdx]) {
        byte |= 1 << (7 - bitIdx);
      }
    }
    bytes[byteIdx] = byte;
  }
  return bytes;
}
