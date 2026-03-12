import type { TemporalDitherMode } from './temporal.types';

/**
 * Check if temporal dithering would have any effect
 */
export function isTemporalDitherActive(mode: TemporalDitherMode): boolean {
  return mode === 'blue_noise' || mode === 'flicker_safe';
}
