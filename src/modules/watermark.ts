/**
 * Watermark Module
 * Re-exports watermark functionality from overlay module
 */

export {
  applyWatermark,
  applyCenterLogo,
  createTextWatermark,
  createPatternWatermark,
  getWatermarkPositions,
  applyBlendMode,
  Watermark,
  type WatermarkKind,
  type WatermarkPosition,
  type WatermarkBlend,
  type WatermarkOptions,
  type WatermarkResult,
} from './overlay';

export default {
  applyWatermark: async (...args: Parameters<typeof import('./overlay').applyWatermark>) => 
    (await import('./overlay')).applyWatermark(...args),
};
