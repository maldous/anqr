import { PATTERN_FORMAT } from './functional-pattern-flags.const';

export function markFormatInfo(map: Uint8Array, mc: number): void {
  const row8 = 8 * mc;
  for (let c = 0; c <= 5; c++) map[row8 + c] |= PATTERN_FORMAT;
  map[row8 + 7] |= PATTERN_FORMAT;
  map[row8 + 8] |= PATTERN_FORMAT;
  for (let c = mc - 8; c < mc; c++) map[row8 + c] |= PATTERN_FORMAT;
  for (let r = 0; r <= 5; r++) map[r * mc + 8] |= PATTERN_FORMAT;
  map[7 * mc + 8] |= PATTERN_FORMAT;
  for (let r = mc - 7; r < mc; r++) map[r * mc + 8] |= PATTERN_FORMAT;
}
