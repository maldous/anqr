import { applyWatermark } from './apply-watermark';
import { applyWatermarkCenterLogo } from './apply-watermark-center-logo';
import { renderTextWatermark } from './render-text-watermark';
import { renderPatternWatermark } from './render-pattern-watermark';
import { calculateWatermarkPositions } from './calculate-watermark-positions';
import { applyWatermarkBlendMode } from './apply-watermark-blend-mode';

// Namespace export
export const Watermark = {
  applyWatermark,
  applyWatermarkCenterLogo,
  renderTextWatermark,
  renderPatternWatermark,
  calculateWatermarkPositions,
  applyWatermarkBlendMode,
};
