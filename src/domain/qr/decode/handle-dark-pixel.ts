/**
 * Handle a dark pixel during row scanning, advancing the state machine.
 * Returns the new state.
 */
export function handleDarkPixel(state: number, counts: number[]): number {
  if (state === 1 || state === 3) {
    // Was in white, transition to next dark
    state++;
  }
  counts[state]++;
  return state;
}
