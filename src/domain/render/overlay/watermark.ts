export type {
  WatermarkKind,
  WatermarkPosition,
  WatermarkBlend,
  WatermarkOptions,
  WatermarkResult,
} from "./watermark.types";
export { applyWatermarkBlendMode } from "./apply-watermark-blend-mode";
export { calculateWatermarkPositions } from "./calculate-watermark-positions";
export { renderTextWatermark } from "./render-text-watermark";
export { renderPatternWatermark } from "./render-pattern-watermark";
export { applyWatermark } from "./apply-watermark";
export { applyWatermarkCenterLogo } from "./apply-watermark-center-logo";

import { applyWatermark } from "./apply-watermark";
import { applyWatermarkCenterLogo } from "./apply-watermark-center-logo";
import { renderTextWatermark } from "./render-text-watermark";
import { renderPatternWatermark } from "./render-pattern-watermark";
import { calculateWatermarkPositions } from "./calculate-watermark-positions";
import { applyWatermarkBlendMode } from "./apply-watermark-blend-mode";

// Namespace export
export const Watermark = {
  applyWatermark,
  applyWatermarkCenterLogo,
  renderTextWatermark,
  renderPatternWatermark,
  calculateWatermarkPositions,
  applyWatermarkBlendMode,
};
