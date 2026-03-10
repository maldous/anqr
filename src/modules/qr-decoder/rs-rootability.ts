/**
 * RS "rootability" diagnostics.
 *
 * This does NOT attempt to correct errors.
 * It reports whether each RS block produces a locator polynomial whose degree
 * matches the number of roots found by Chien search.
 *
 * If one mask makes blocks "rootable" (roots==degree) while others don't,
 * the failure is upstream (format/mask selection, traversal, or function-module skipping).
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

import { RS_BLOCKS } from './decode';
import type { ECCLevelChar } from './types';

// GF(256) for QR (primitive polynomial 0x11D)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
let GF_INIT = false;

function initGF(): void {
  if (GF_INIT) return;
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  GF_INIT = true;
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function gfInv(a: number): number {
  if (a === 0) return 0;
  return GF_EXP[255 - GF_LOG[a]];
}

function polyEvalAsc(poly: number[], x: number): number {
  // poly[0] + poly[1]x + poly[2]x^2 ...
  let y = 0;
  let p = 1;
  for (let i = 0; i < poly.length; i++) {
    y ^= gfMul(poly[i] ?? 0, p);
    p = gfMul(p, x);
  }
  return y;
}

function polyEvalHighToLow(coeffs: number[], x: number): number {
  // Horner: (((a0)x + a1)x + a2)... where coeffs are high->low degree
  let y = 0;
  for (let i = 0; i < coeffs.length; i++) {
    y = gfMul(y, x) ^ (coeffs[i] ?? 0);
  }
  return y;
}

function computeSyndromes(received: number[], eccCount: number): number[] {
  const synd: number[] = [];
  for (let i = 0; i < eccCount; i++) {
    const x = GF_EXP[i]; // generatorBase = 0 for QR
    synd.push(polyEvalHighToLow(received, x));
  }
  return synd;
}

function berlekampMassey(syndromes: number[]): { sigma: number[]; degree: number } {
  // Standard BM for RS (QR generatorBase=0).
  const C: number[] = [1];
  const B: number[] = [1];
  let L = 0;
  let m = 1;
  let b = 1;

  for (let n = 0; n < syndromes.length; n++) {
    // discrepancy d = S_n + sum_{i=1..L} C_i * S_{n-i}
    let d = syndromes[n] ?? 0;
    for (let i = 1; i <= L; i++) {
      d ^= gfMul(C[i] ?? 0, syndromes[n - i] ?? 0);
    }

    if (d === 0) {
      m++;
      continue;
    }

    const T = C.slice();
    const coef = gfMul(d, gfInv(b));

    // C = C - coef * x^m * B  (sub == add in GF(256))
    for (let i = 0; i < B.length; i++) {
      const idx = i + m;
      C[idx] = (C[idx] ?? 0) ^ gfMul(coef, B[i] ?? 0);
    }

    if (2 * L <= n) {
      L = n + 1 - L;
      b = d;
      // B = T
      B.length = 0;
      for (let i = 0; i < T.length; i++) B.push(T[i] ?? 0);
      m = 1;
    } else {
      m++;
    }
  }

  // Trim trailing zeros
  while (C.length > 1 && C[C.length - 1] === 0) C.pop();
  return { sigma: C, degree: L };
}

function chienRootCount(locator: number[]): number {
  // Find roots of sigma(x) over GF(256)
  let roots = 0;
  for (let i = 0; i < 255; i++) {
    const x = GF_EXP[i];
    if (polyEvalAsc(locator, x) === 0) roots++;
  }
  return roots;
}

export interface RSRootabilityBlockResult {
  blockIndex: number;
  dataCount: number;
  eccCount: number;
  syndromeNonZeroCount: number;
  bmDegree: number;
  chienRootsFound: number;
}

interface BlockLayout {
  blockDataSizes: number[];
  blockEccSizes: number[];
  numBlocks: number;
  maxData: number;
  maxEcc: number;
}

function expandBlockDefinitions(rsBlocks: number[][]): BlockLayout {
  const blockDataSizes: number[] = [];
  const blockTotalSizes: number[] = [];
  for (const g of rsBlocks) {
    const numBlocks = g[0];
    const total = g[1];
    const data = g[2];
    for (let i = 0; i < numBlocks; i++) {
      blockDataSizes.push(data);
      blockTotalSizes.push(total);
    }
  }
  const blockEccSizes = blockTotalSizes.map((t, i) => t - (blockDataSizes[i] ?? 0));
  return {
    blockDataSizes,
    blockEccSizes,
    numBlocks: blockDataSizes.length,
    maxData: Math.max(...blockDataSizes),
    maxEcc: Math.max(...blockEccSizes),
  };
}

function deinterleaveBlocks(codewords: number[], layout: BlockLayout): number[][] {
  const { blockDataSizes, blockEccSizes, numBlocks, maxData, maxEcc } = layout;
  const blocks: number[][] = Array.from({ length: numBlocks }, () => []);

  let idx = 0;
  for (let i = 0; i < maxData; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < (blockDataSizes[b] ?? 0)) {
        blocks[b]?.push(codewords[idx++] ?? 0);
      }
    }
  }

  for (let i = 0; i < maxEcc; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < (blockEccSizes[b] ?? 0)) {
        blocks[b]?.push(codewords[idx++] ?? 0);
      }
    }
  }

  return blocks;
}

export function rsRootabilityFor(
  codewords: number[],
  version: number,
  ecc: ECCLevelChar
): RSRootabilityBlockResult[] {
  initGF();

  const rsBlocks = RS_BLOCKS[ecc]?.[version - 1];
  if (!rsBlocks) return [];

  const layout = expandBlockDefinitions(rsBlocks);
  const blocks = deinterleaveBlocks(codewords, layout);

  const results: RSRootabilityBlockResult[] = [];
  for (let b = 0; b < layout.numBlocks; b++) {
    const dataCount = layout.blockDataSizes[b] ?? 0;
    const eccCount = layout.blockEccSizes[b] ?? 0;
    const received = blocks[b] ?? [];
    const syndromes = computeSyndromes(received, eccCount);
    const syndromeNonZeroCount = syndromes.filter((s) => s !== 0).length;
    const { sigma, degree } = berlekampMassey(syndromes);
    const rootsFound = degree === 0 ? 0 : chienRootCount(sigma);
    results.push({
      blockIndex: b,
      dataCount,
      eccCount,
      syndromeNonZeroCount,
      bmDegree: degree,
      chienRootsFound: rootsFound,
    });
  }

  return results;
}
