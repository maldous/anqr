/**
 * Temporal Dithering Wrapper
 * Wrapper for temporal dithering from dither-algorithms module
 * @deprecated Use calculateTemporalOffset and applyTemporalNoiseToCanvas directly from dither-algorithms
 */

import {
  calculateTemporalOffset,
  applyTemporalNoiseToCanvas,
  type TemporalDitherMode,
} from '../dither-algorithms';

/**
 * Apply temporal dithering for animation frames
 * @deprecated Use calculateTemporalOffset and applyTemporalNoiseToCanvas directly from dither-algorithms
 */
export function applyTemporalDither(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  frameIndex: number,
  mode: 'off' | 'blue_noise' | 'flicker_safe',
  seed: number = 0
): HTMLCanvasElement {
  if (mode === 'off') return canvas as HTMLCanvasElement;

  const offset = calculateTemporalOffset(frameIndex, mode as TemporalDitherMode, seed);
  return applyTemporalNoiseToCanvas(canvas, offset, 0.02) as HTMLCanvasElement;
}
