import { getPatternPosition } from "../encode/utils";
import { drawSingleAlignmentPattern } from "./draw-single-alignment-pattern";

export function drawAlignmentPatterns(
  modules: (boolean | null)[][],
  version: number,
  _moduleCount: number,
): void {
  if (version < 2) return;
  const positions = getPatternPosition(version);
  for (const row of positions) {
    for (const col of positions) {
      if (modules[row][col] !== null) continue;
      drawSingleAlignmentPattern(modules, row, col);
    }
  }
}
