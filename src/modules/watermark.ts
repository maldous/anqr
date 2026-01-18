/**
 * Watermark Module
 * @deprecated Import from './overlay' instead
 *
 * Handles text and image watermarks with positioning and blending
 */

import {
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
} from './overlay/internal/watermark';

// Re-export everything
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
};

export default Watermark;
