import { qrDecoderLog } from "./qr-decoder-log";

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
export function deinterleaveDataCodewords(codewords: number[], rsBlocks: number[][]): number[] {
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

  qrDecoderLog.trace("deinterleave: De-interleaved data codewords", {
    numBlocks,
    blockSizes: blockSizes.join(","),
    inputLength: codewords.length,
    outputLength: result.length,
  });

  return result;
}
