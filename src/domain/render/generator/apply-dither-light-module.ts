import { computeOverlayLightBlendParams } from './compute-overlay-light-blend-params';
import { computeDitherLightBlendParams } from './compute-dither-light-blend-params';
import { blendLightModuleColor } from './blend-light-module-color';
import type { DitherBlendFlags } from './dither-blend-flags';
import type { OverlayModeResult } from './render-modes.types';
import { computeLightBlend } from './compute-light-blend';

export function applyDitherLightModule(
  result: OverlayModeResult,
  flags: DitherBlendFlags,
  effectiveIntensity: number,
  ditherR: number,
  ditherG: number,
  ditherB: number,
  bgColor: string
): void {
  // "overlay" mode keeps unprotected functional light cells image-forward.
  // "dither" mode keeps them integrated but noticeably less pass-through.
  if (flags.isExtreme || flags.blendPresFunctionalOverlay) {
    const params = computeOverlayLightBlendParams(flags);
    const lightMix = computeLightBlend(effectiveIntensity, params.maxBlend);
    result.moduleColor = blendLightModuleColor(
      ditherR,
      ditherG,
      ditherB,
      params.whiteBase,
      params.whitePush,
      lightMix,
      bgColor,
      1
    );
    result.shouldDrawCell = true;
    return;
  }

  if (!flags.blendPresFunctionalDither) return;
  const params = computeDitherLightBlendParams(flags.isExtreme);
  const lightMix = computeLightBlend(effectiveIntensity, params.maxBlend);
  result.moduleColor = blendLightModuleColor(
    ditherR,
    ditherG,
    ditherB,
    params.whiteBase,
    params.whitePush,
    lightMix,
    bgColor,
    0.5
  );
  result.shouldDrawCell = true;
}
