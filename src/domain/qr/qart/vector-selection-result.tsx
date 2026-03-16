import type { BlockSelectionResult, EliminationResult } from "./elimination";
import type { FlattenedSelection } from "./scan-fallback";

export interface VectorSelectionResult {
  blockSelections: BlockSelectionResult[];
  flattenedSelections: FlattenedSelection[];
  totalSelected: number;
  elimination: EliminationResult;
}
