import type { BlockSelectionResult } from "./elimination";
import type { FlattenedSelection } from "./scan-fallback";

export function buildBlockSelectionsFromFlattened(
  flattened: FlattenedSelection[],
  blockIndices: number[],
): BlockSelectionResult[] {
  const blockMap = new Map<number, number[]>();
  for (const idx of blockIndices) {
    blockMap.set(idx, []);
  }
  for (const entry of flattened) {
    const list = blockMap.get(entry.blockIndex);
    if (list) list.push(entry.vectorIndex);
  }
  return Array.from(blockMap.entries())
    .map(([blockIndex, selectedVectorIndices]) => ({ blockIndex, selectedVectorIndices }))
    .sort((a, b) => a.blockIndex - b.blockIndex);
}
