import type { BlockSelectionResult, EliminationResult } from "./elimination";
import { forEachFlattenedSelection } from "./for-each-flattened-selection";
import type { FlattenedSelection } from "./scan-fallback.types";

/**
 * Flatten block selections into an ordered list sorted by pixel importance.
 * This allows us to progressively apply the most important vectors first.
 *
 * @param blockSelections Per-block selection results
 * @param eliminationResult Full elimination result with vectors
 * @param importance 2D importance array from target image
 * @param moduleCount QR module count
 * @returns Flattened selections sorted by importance (highest first)
 */
export function flattenAndOrderSelections(
  blockSelections: BlockSelectionResult[],
  eliminationResult: EliminationResult,
  importance: number[][],
  moduleCount: number,
): FlattenedSelection[] {
  const flattened: FlattenedSelection[] = [];
  forEachFlattenedSelection(blockSelections, eliminationResult, importance, moduleCount, (entry) =>
    flattened.push(entry),
  );

  // Sort by importance (highest first) - we want to keep the most important pixels
  flattened.sort((a, b) => b.importance - a.importance);

  return flattened;
}
