import { PATTERN_FIXED_DARK } from './functional-pattern-flags.const';

export function markFixedDark(map: Uint8Array, mc: number): void {
  if (mc > 8) map[(mc - 8) * mc + 8] |= PATTERN_FIXED_DARK;
}
