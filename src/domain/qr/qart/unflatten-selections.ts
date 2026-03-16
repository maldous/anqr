import type { BlockSelectionResult } from "./elimination";
import type { FlattenedSelection } from "./scan-fallback.types";

/**
 * Convert flattened selections back to block selections format,
 * using only the first N entries.
 *
 * @param flattened Flattened and sorted selections
 * @param count Number of selections to include
 * @returns Block selections with only the specified count
 */
export function unflattenSelections(
  flattened: FlattenedSelection[],
  count: number,
): BlockSelectionResult[] {
  const blockMap = new Map<number, number[]>();

  // Take only the first `count` selections
  for (let i = 0; i < Math.min(count, flattened.length); i++) {
    const entry = flattened[i];
    const indices = blockMap.get(entry.blockIndex) || [];
    indices.push(entry.vectorIndex);
    blockMap.set(entry.blockIndex, indices);
  }

  // Convert to BlockSelectionResult array
  const results: BlockSelectionResult[] = [];
  for (const [blockIndex, selectedVectorIndices] of blockMap) {
    results.push({ blockIndex, selectedVectorIndices });
  }

  return results.sort((a, b) => a.blockIndex - b.blockIndex);
}
