/**
 * Temporal Dithering Module
 *
 * @deprecated Import from './dither-algorithms' instead:
 *   import { calculateTemporalOffset, applyTemporalNoiseToCanvas, ... } from './dither-algorithms';
 */

export type { TemporalDitherMode } from './dither-algorithms';
export {
  calculateTemporalOffset,
  applyTemporalNoiseToCanvas,
  generateTemporalSequence,
  isTemporalDitherActive,
} from './dither-algorithms';
