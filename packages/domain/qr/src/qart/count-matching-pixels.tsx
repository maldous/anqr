import { type BitPixelMapping } from "./bit-mapping";
import { acquireUint8Buffer, releaseUint8Buffer } from "./buffer-pool";
import type {
  EliminationResult,
  BlockSelectionResult,
  BlockEliminationResult,
} from "./elimination.types";
import { buildBlockBitToPixelTables } from "./build-block-bit-to-pixel-tables";
import { computeFlipParity } from "./compute-flip-parity";

/**
 * Count how many pixels match the target after applying selected vectors
 *
 * IMPORTANT: After Gauss-Jordan elimination, each vector's blockBits has been XORed
 * with other vectors and affects MULTIPLE pixels - not just the pivot pixel.
 * We must account for ALL pixels affected by each selected vector's blockBits.
 *
 * @param baseMatrix Base QR matrix
 * @param eliminationResult Full elimination result
 * @param blockSelections Per-block selection results
 * @param targets Target values
 * @param moduleCount Module count
 * @param dataPixels Set of data pixel indices
 * @param mappings Bit-to-pixel mappings (needed to find all affected pixels)
 * @returns Number of matching pixels
 */
export function countMatchingPixels(
  baseMatrix: boolean[][],
  eliminationResult: EliminationResult,
  blockSelections: BlockSelectionResult[],
  targets: boolean[][],
  moduleCount: number,
  dataPixels: Set<number>,
  mappings: BitPixelMapping[],
): { matching: number; total: number } {
  const maxPixelCount = moduleCount * moduleCount;
  const blockBitToPixelTables = buildBlockBitToPixelTables(mappings);

  // Track flip parity directly (odd = flipped, even = unchanged).
  const flipParity = acquireUint8Buffer(maxPixelCount);
  const dataPixelMask = acquireUint8Buffer(maxPixelCount);
  for (const pixelIdx of dataPixels) {
    if (pixelIdx >= 0 && pixelIdx < maxPixelCount) {
      dataPixelMask[pixelIdx] = 1;
    }
  }

  const blockResultByIndex: Array<BlockEliminationResult | undefined> = [];
  for (const blockResult of eliminationResult.blockResults) {
    blockResultByIndex[blockResult.blockIndex] = blockResult;
  }

  try {
    computeFlipParity(
      blockSelections,
      blockResultByIndex,
      blockBitToPixelTables,
      flipParity,
      maxPixelCount,
    );

    let matching = 0;
    let total = 0;

    for (let pixelIdx = 0; pixelIdx < maxPixelCount; pixelIdx++) {
      if (dataPixelMask[pixelIdx] === 0) continue;

      total++;
      const row = Math.floor(pixelIdx / moduleCount);
      const col = pixelIdx - row * moduleCount;

      let value = baseMatrix[row]?.[col] ?? false;
      if (flipParity[pixelIdx] === 1) {
        value = !value;
      }

      const target = targets[row]?.[col] ?? false;
      if (value === target) matching++;
    }

    return { matching, total };
  } finally {
    releaseUint8Buffer(flipParity);
    releaseUint8Buffer(dataPixelMask);
  }
}
