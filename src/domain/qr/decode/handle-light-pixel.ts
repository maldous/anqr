import { isFinderPatternRatio } from './is-finder-pattern-ratio';
import type { ScanResult } from './scan-result';

/**
 * Handle a light pixel during row scanning, advancing the state machine.
 * If a complete pattern is found (state 4 → light), it is checked and
 * potentially pushed to results. Returns the new state.
 */
export function handleLightPixel(
  state: number,
  counts: number[],
  x: number,
  results: ScanResult[]
): number {
  if (state === 0 || state === 2 || state === 4) {
    // Was in dark, transition to next light
    if (state === 4) {
      // Check if we have a valid pattern
      if (isFinderPatternRatio(counts)) {
        const total = counts.reduce((a, b) => a + b, 0);
        const center = x - total / 2;
        results.push({
          center,
          moduleSize: total / 7,
        });
      }
      // Shift counts and continue looking
      counts[0] = counts[2];
      counts[1] = counts[3];
      counts[2] = counts[4];
      counts[3] = 1;
      counts[4] = 0;
      return 3;
    } else {
      state++;
      counts[state]++;
      return state;
    }
  } else {
    counts[state]++;
    return state;
  }
}
