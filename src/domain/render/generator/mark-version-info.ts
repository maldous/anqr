import { PATTERN_VERSION } from './functional-pattern-flags.const';

export function markVersionInfo(map: Uint8Array, mc: number, version: number): void {
  if (version < 7) return;
  for (let r = 0; r < 6; r++) {
    const rowBase = r * mc;
    for (let c = mc - 11; c < mc - 8; c++) {
      map[rowBase + c] |= PATTERN_VERSION;
    }
  }
  for (let r = mc - 11; r < mc - 8; r++) {
    const rowBase = r * mc;
    for (let c = 0; c < 6; c++) {
      map[rowBase + c] |= PATTERN_VERSION;
    }
  }
}
