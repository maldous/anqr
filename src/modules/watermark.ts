/**
 * Watermark Module
 * @deprecated Import from './overlay' instead
 *
 * Handles text and image watermarks with positioning and blending
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
} from './overlay/internal/watermark';

export default Watermark;
