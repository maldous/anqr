/**
 * Advance the vertical scan state machine for one pixel.
 * Returns the new state, or -1 to signal the scan should stop.
 */
export function advanceVerticalScanState(
  isDark: boolean,
  state: number,
  counts: number[],
  centerIdx: number,
  whiteIdx: number,
  outerIdx: number,
): number {
  if (state === centerIdx) {
    if (isDark) counts[centerIdx]++;
    else {
      counts[whiteIdx]++;
      return whiteIdx;
    }
  } else if (state === whiteIdx) {
    if (isDark) {
      counts[outerIdx]++;
      return outerIdx;
    } else {
      counts[whiteIdx]++;
    }
  } else if (state === outerIdx) {
    if (isDark) counts[outerIdx]++;
    else return -1;
  }
  return state;
}
