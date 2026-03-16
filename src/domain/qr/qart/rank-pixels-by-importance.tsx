/**
 * Rank pixels by their importance based on target image
 * Returns pixel indices sorted from most to least important
 *
 * @param targets Target pixel values (true = dark)
 * @param importance Importance weights (0-1)
 * @param moduleCount QR module count
 * @param dataPixels Set of pixel indices that are data (non-structural)
 * @returns Sorted pixel indices
 */
export function rankPixelsByImportance(
  _targets: boolean[][],
  importance: number[][],
  moduleCount: number,
  dataPixels: Set<number>
): number[] {
  if (dataPixels.size === 0) return [];
  const candidateCapacity = dataPixels.size;
  const candidateIndices = new Uint32Array(candidateCapacity);
  const candidateScores = new Float32Array(candidateCapacity);
  let candidateCount = 0;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const pixelIndex = row * moduleCount + col;

      // Only include data pixels
      if (!dataPixels.has(pixelIndex)) continue;

      candidateIndices[candidateCount] = pixelIndex;
      candidateScores[candidateCount] = importance[row]?.[col] ?? 0;
      candidateCount++;
    }
  }

  if (candidateCount === 0) return [];

  const rankOrder = Array.from<number>({ length: candidateCount });
  for (let i = 0; i < candidateCount; i++) {
    rankOrder[i] = i;
  }

  // Sort by importance (descending), preserving row-major tie order.
  rankOrder.sort((a, b) => candidateScores[b] - candidateScores[a]);

  const rankedPixels = Array.from<number>({ length: candidateCount });
  for (let i = 0; i < candidateCount; i++) {
    rankedPixels[i] = candidateIndices[rankOrder[i]];
  }
  return rankedPixels;
}
