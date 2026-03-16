import { PATTERN_TIMING } from "./functional-pattern-flags.const";

export function markTimingPatterns(map: Uint8Array, mc: number): void {
  for (let i = 8; i < mc - 8; i++) {
    map[6 * mc + i] |= PATTERN_TIMING;
    map[i * mc + 6] |= PATTERN_TIMING;
  }
}
