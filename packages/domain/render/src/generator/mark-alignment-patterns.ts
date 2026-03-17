import { getAlignmentPositionsCached } from "./pattern-helpers";
import { PATTERN_ALIGNMENT } from "./functional-pattern-flags.const";

export function markAlignmentPatterns(map: Uint8Array, mc: number, version: number): void {
  if (version < 2) return;
  const centers = getAlignmentPositionsCached(version, mc);
  for (const center of centers) {
    for (let dr = -2; dr <= 2; dr++) {
      const r = center.row + dr;
      if (r < 0 || r >= mc) continue;
      const rowBase = r * mc;
      for (let dc = -2; dc <= 2; dc++) {
        const c = center.col + dc;
        if (c >= 0 && c < mc) {
          map[rowBase + c] |= PATTERN_ALIGNMENT;
        }
      }
    }
  }
}
