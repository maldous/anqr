/**
 * @deprecated This module is deprecated.
 * - For color utilities: import from '../core'
 * - For animation patterns: import from '../animation'
 * 
 * This stub will be removed in a future version.
 */

// Re-export from correct locations for backward compatibility
import {
  hslToRgbTuple,
  rgbToHslTuple,
  rgbToGray,
  createSeededRandom,
} from '../core';

import {
  type AnimationEasing,
  applyEasing,
  applyPulsePattern,
  applyWavePattern,
  applyScanlinePattern,
  applyShimmerPattern,
  applyDriftPattern,
  applyColorCyclePattern,
} from '../animation';

export {
  hslToRgbTuple,
  rgbToHslTuple,
  rgbToGray,
  createSeededRandom,
};

export type { AnimationEasing };

export {
  applyEasing,
  applyPulsePattern,
  applyWavePattern,
  applyScanlinePattern,
  applyShimmerPattern,
  applyDriftPattern,
  applyColorCyclePattern,
};

// Re-export type for backward compatibility
export type AnimationPattern =
  | 'none'
  | 'pulse'
  | 'wave'
  | 'scanline'
  | 'shimmer'
  | 'drift'
  | 'color_cycle';

export const SharedUtils = {
  hslToRgbTuple,
  rgbToHslTuple,
  rgbToGray,
  createSeededRandom,
  applyEasing,
  applyPulsePattern,
  applyWavePattern,
  applyScanlinePattern,
  applyShimmerPattern,
  applyDriftPattern,
  applyColorCyclePattern,
};

export default SharedUtils;
