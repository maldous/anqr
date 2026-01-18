/**
 * @deprecated This module is deprecated.
 * - For color utilities: import from '../core'
 * - For animation patterns: import from '../animation'
 */

// Re-export from core for backward compatibility
export {
  rgbToGray,
  rgbToHslTuple,
  hslToRgbTuple,
  createSeededRandom,
} from '../core';

// Re-export animation patterns for backward compatibility
export {
  type AnimationEasing,
  type AnimationPattern,
  applyEasing,
  applyPulsePattern,
  applyWavePattern,
  applyScanlinePattern,
  applyShimmerPattern,
  applyDriftPattern,
  applyColorCyclePattern,
} from '../animation';

export { createSeededRandom as default } from '../core';
