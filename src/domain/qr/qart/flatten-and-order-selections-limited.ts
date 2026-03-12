import type { BlockEliminationResult, BlockSelectionResult, EliminationResult } from './elimination';
import type { FlattenedSelection } from './scan-fallback.types';
import { flattenAndOrderSelections } from './flatten-and-order-selections';

/**
 * Flatten and order selections, optionally limiting to the top-K by importance.
 * Uses a min-heap when limit is provided to avoid full sort on large sets.
 */
export function flattenAndOrderSelectionsLimited(
  blockSelections: BlockSelectionResult[],
  eliminationResult: EliminationResult,
  importance: number[][],
  moduleCount: number,
  limit?: number
): FlattenedSelection[] {
  if (!limit || limit <= 0) {
    return flattenAndOrderSelections(blockSelections, eliminationResult, importance, moduleCount);
  }

  const heap: FlattenedSelection[] = [];

  const heapSwap = (i: number, j: number) => {
    const tmp = heap[i];
    heap[i] = heap[j];
    heap[j] = tmp;
  };

  const heapBubbleUp = (index: number) => {
    let i = index;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent].importance <= heap[i].importance) break;
      heapSwap(parent, i);
      i = parent;
    }
  };

  const heapBubbleDown = (index: number) => {
    let i = index;
    const n = heap.length;
    while (true) {
      const left = i * 2 + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && heap[left].importance < heap[smallest].importance) smallest = left;
      if (right < n && heap[right].importance < heap[smallest].importance) smallest = right;
      if (smallest === i) break;
      heapSwap(i, smallest);
      i = smallest;
    }
  };

  const maybePush = (entry: FlattenedSelection) => {
    if (heap.length < limit) {
      heap.push(entry);
      heapBubbleUp(heap.length - 1);
      return;
    }
    if (entry.importance > heap[0].importance) {
      heap[0] = entry;
      heapBubbleDown(0);
    }
  };

  const blockResultMap = new Map<number, BlockEliminationResult>();
  for (const br of eliminationResult.blockResults) {
    blockResultMap.set(br.blockIndex, br);
  }

  for (const selection of blockSelections) {
    const { blockIndex, selectedVectorIndices } = selection;

    const blockResult = blockResultMap.get(blockIndex);
    if (!blockResult) continue;

    for (const vectorIndex of selectedVectorIndices) {
      const vector = blockResult.vectors[vectorIndex];
      if (!vector || vector.pivotPixel < 0) continue;

      const row = Math.floor(vector.pivotPixel / moduleCount);
      const col = vector.pivotPixel % moduleCount;
      const pixelImportance = importance[row]?.[col] ?? 0;

      maybePush({
        blockIndex,
        vectorIndex,
        importance: pixelImportance,
        vector,
      });
    }
  }

  heap.sort((a, b) => b.importance - a.importance);
  return heap;
}
