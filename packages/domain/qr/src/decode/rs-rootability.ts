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

import { createLogger } from "@/domain/logging";
import { expandBlockDefinitions, deinterleaveBlocks } from "./analyze-rootability-input";
import { berlekampMassey, chienRootCount, computeSyndromes } from "./compute-rootability";
import { getGFExp, initGF } from "./rs-rootability-gf";

const _log = createLogger("DECODER");

import { RS_BLOCKS } from "./decode";
import type { ECCLevelChar } from "../qr-decoder/types";

export type { RSRootabilityBlockResult } from "./rs-rootability.types";
import type { RSRootabilityBlockResult } from "./rs-rootability.types";

export function rsRootabilityFor(
  codewords: number[],
  version: number,
  ecc: ECCLevelChar,
): RSRootabilityBlockResult[] {
  initGF();
  const gfExp = getGFExp();

  const rsBlocks = RS_BLOCKS[ecc]?.[version - 1];
  if (!rsBlocks) return [];

  const layout = expandBlockDefinitions(rsBlocks);
  const blocks = deinterleaveBlocks(codewords, layout);

  const results: RSRootabilityBlockResult[] = [];
  for (let b = 0; b < layout.numBlocks; b++) {
    const dataCount = layout.blockDataSizes[b] ?? 0;
    const eccCount = layout.blockEccSizes[b] ?? 0;
    const received = blocks[b] ?? [];
    const syndromes = computeSyndromes(received, eccCount, gfExp);
    const syndromeNonZeroCount = syndromes.filter((s) => s !== 0).length;
    const { sigma, degree } = berlekampMassey(syndromes);
    const rootsFound = degree === 0 ? 0 : chienRootCount(sigma, gfExp);
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
