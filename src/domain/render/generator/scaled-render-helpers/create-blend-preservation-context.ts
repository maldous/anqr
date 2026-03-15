import { getScaledPreservationBlendTarget } from './get-scaled-preservation-blend-target';
import { sampleScaledModuleOverlayColor } from './sample-scaled-module-overlay-color';
import type { BlendPreservationCtx, PatternBoostCtx, PixelColor } from '../scaled-render-types';

export function createBlendPreservationContext(bctx: PatternBoostCtx): BlendPreservationCtx {
  const blendChannelToward = (src: number, target: number, t: number): number =>
    Math.round(src + (target - src) * Math.max(0, Math.min(1, t)));

  const estimatePaperLuma = (sampled: PixelColor | null): number => {
    if (!sampled) return bctx.bgLuma;
    const sampledLuma = (0.299 * sampled.r + 0.587 * sampled.g + 0.114 * sampled.b) / 255;
    return (
      bctx.bgLuma * (1 - bctx.ditherPaperOverlayMix) + sampledLuma * bctx.ditherPaperOverlayMix
    );
  };

  return {
    ctx: bctx.ctx,
    size: bctx.size,
    marginPx: bctx.marginPx,
    effectiveModuleSize: bctx.effectiveModuleSize,
    subPixelSize: bctx.subPixelSize,
    scaledSize: bctx.scaledSize,
    moduleCount: bctx.moduleCount,
    finderStrengthN: bctx.finderStrengthN,
    blendPreservationMode: bctx.blendPreservationMode,
    isDitheredMode: bctx.isDitheredMode,
    qr: bctx.qr,
    colors: bctx.colors,
    getBlendTarget: (mRow, mCol, sRow, sCol) =>
      getScaledPreservationBlendTarget(
        bctx.qr,
        bctx.colors,
        bctx.matrix,
        bctx.scaledSize,
        bctx.scale,
        bctx.isDitheredMode,
        mRow,
        mCol,
        sRow,
        sCol
      ),
    sampleModuleColor: (row, col) =>
      sampleScaledModuleOverlayColor(bctx.colors, bctx.scaledSize, bctx.scale, row, col),
    estimatePaperLuma,
    blendChannelToward,
  };
}
