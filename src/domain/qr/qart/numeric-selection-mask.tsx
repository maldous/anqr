import type { FlattenedSelection } from "./scan-fallback";

export type NumericSelectionMask = {
  entry: FlattenedSelection;
  groups: Int32Array;
  masks: Int32Array;
};
